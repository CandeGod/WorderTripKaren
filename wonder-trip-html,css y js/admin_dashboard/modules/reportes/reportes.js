import { handleApiError } from '../../../js/shared/utils.js';

document.addEventListener('DOMContentLoaded', function () {
    const reportesApp = new ReportesApp();
    reportesApp.init();
});

class ReportesApp {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 10;
        this.searchQuery = '';
        this.usuarios = [];
        this.sortBy = 'fecha';
        this.direction = 'desc';
    }

    async init() {
        await this.loadUsuarios();
        this.setupEventListeners();
        this.loadReportes();
    }

    async loadUsuarios() {
        try {
            const response = await fetch('http://localhost:8080/api/usuarios?page=0&size=100&sort=asc');
            if (!response.ok) throw new Error('Error al cargar usuarios');
            const data = await response.json();
            this.usuarios = Array.isArray(data) ? data : data.content || [];
            this.populateUsuarioFilter();
        } catch (error) {
            handleApiError(error);
        }
    }

    setupEventListeners() {
        // Búsqueda
        document.getElementById('buscar-reporte').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.debouncedSearch();
        });

        // Filtro por usuario
        document.getElementById('filtro-usuario').addEventListener('change', (e) => {
            this.currentPage = 0;
            this.loadReportes();
        });

        // Ordenación
        document.getElementById('ordenar-por').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.currentPage = 0;
            this.loadReportes();
        });

        document.getElementById('direccion-orden').addEventListener('change', (e) => {
            this.direction = e.target.value;
            this.currentPage = 0;
            this.loadReportes();
        });

        // Paginación
        document.addEventListener('click', (e) => {
            if (e.target.id === 'pagina-anterior') {
                if (this.currentPage > 0) {
                    this.currentPage--;
                    this.loadReportes();
                }
            } else if (e.target.id === 'pagina-siguiente') {
                this.currentPage++;
                this.loadReportes();
            }
        });
    }

    debouncedSearch = this.debounce(() => {
        this.currentPage = 0;
        this.loadReportes();
    }, 300);

    debounce(func, wait) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    async loadReportes() {
        const reportesList = document.getElementById('reportes-list');
        reportesList.innerHTML = '<div class="loading">Cargando reportes...</div>';

        try {
            const usuarioId = document.getElementById('filtro-usuario').value;
            let url;

            if (usuarioId) {
                url = `http://localhost:8080/api/reportes/usuario/${usuarioId}?page=${this.currentPage}&size=${this.pageSize}`;
            } else {
                url = `http://localhost:8080/api/reportes?page=${this.currentPage}&size=${this.pageSize}&sort=${this.sortBy},${this.direction}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar reportes');

            const data = await response.json();
            const reportes = Array.isArray(data) ? data : data.content || [];

            // Obtener información de usuarios para los reportes
            await this.enriquecerReportesConUsuarios(reportes);

            this.displayReportes(reportes);
            this.updatePaginationInfo(data.totalElements || reportes.length);
        } catch (error) {
            handleApiError(error);
            reportesList.innerHTML = `<div class="error">Error al cargar reportes: ${error.message}</div>`;
        }
    }

    async enriquecerReportesConUsuarios(reportes) {
        // Crear un array de IDs de usuarios únicos
        const usuariosIds = [...new Set(reportes.map(r => r.idUsuario))];

        // Obtener información de todos los usuarios necesarios
        const usuariosMap = new Map();

        for (const id of usuariosIds) {
            try {
                const response = await fetch(`http://localhost:8080/api/usuarios/${id}`);
                if (response.ok) {
                    const usuario = await response.json();
                    usuariosMap.set(id, usuario);
                }
            } catch (error) {
                console.error(`Error al cargar usuario ${id}:`, error);
            }
        }

        // Asignar la información de usuario a cada reporte
        reportes.forEach(reporte => {
            if (usuariosMap.has(reporte.idUsuario)) {
                reporte.usuario = usuariosMap.get(reporte.idUsuario);
            }
        });
    }

    displayReportes(reportes) {
        const reportesList = document.getElementById('reportes-list');

        if (reportes.length === 0) {
            reportesList.innerHTML = '<div class="loading">No se encontraron reportes</div>';
            return;
        }

        reportesList.innerHTML = '';

        reportes.forEach(reporte => {
            const reporteCard = document.createElement('div');
            reporteCard.className = 'reporte-card';

            const fechaReporte = new Date(reporte.fecha);
            const fechaFormateada = fechaReporte.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Verificar si tenemos información del usuario
            const usuarioInfo = reporte.usuario
                ? `
                <div class="reporte-usuario">
                    <div class="usuario-imagen" style="background-image: url('${reporte.usuario.imagenPerfil || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'}')">
                        ${!reporte.usuario.imagenPerfil ? '<i class="fas fa-user"></i>' : ''}
                    </div>
                    <div class="usuario-info">
                        <p class="usuario-nombre">${reporte.usuario.nombre}</p>
                        <p class="usuario-email">${reporte.usuario.correo}</p>
                    </div>
                </div>
              `
                : `
                <div class="reporte-usuario">
                    <div class="usuario-imagen">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="usuario-info">
                        <p class="usuario-nombre">ID Usuario: ${reporte.idUsuario}</p>
                        <p class="usuario-email">Cargando información...</p>
                    </div>
                </div>
              `;

            reporteCard.innerHTML = `
            <div class="reporte-header">
                <div class="reporte-id">#${reporte.idReporte}</div>
                <div class="reporte-fecha">${fechaFormateada}</div>
            </div>
            
            <div class="reporte-body">
                <div class="reporte-info">
                    <h3 class="reporte-titulo">${reporte.titulo}</h3>
                    <p class="reporte-descripcion">${reporte.descripcion}</p>
                </div>
                
                ${usuarioInfo}
            </div>
            
            <div class="reporte-actions">
                <button class="btn-detalles" data-id="${reporte.idReporte}">
                    <i class="fas fa-eye"></i> Ver detalles
                </button>
            </div>
        `;

            reportesList.appendChild(reporteCard);
        });

        // Agregar event listeners a los botones de detalles
        document.querySelectorAll('.btn-detalles').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.verDetallesReporte(id);
            });
        });
    }

    updatePaginationInfo(totalElements) {
        const totalPages = Math.ceil(totalElements / this.pageSize);
        const paginationInfo = document.getElementById('pagination-info');

        paginationInfo.innerHTML = `
            Página ${this.currentPage + 1} de ${totalPages} | 
            Total: ${totalElements} reportes
        `;

        document.getElementById('pagina-anterior').disabled = this.currentPage === 0;
        document.getElementById('pagina-siguiente').disabled = this.currentPage >= totalPages - 1;
    }

    populateUsuarioFilter() {
        const select = document.getElementById('filtro-usuario');
        select.innerHTML = '<option value="">Todos los usuarios</option>';

        this.usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = `${usuario.nombre} (${usuario.correo})`;
            select.appendChild(option);
        });
    }

    async verDetallesReporte(id) {
        try {
            // Primero obtenemos el reporte específico
            const response = await fetch(`http://localhost:8080/api/reportes/${id}`);
            if (!response.ok) throw new Error('Error al cargar el reporte');

            const reporte = await response.json();

            // Luego obtenemos la información del usuario
            if (reporte.idUsuario) {
                const userResponse = await fetch(`http://localhost:8080/api/usuarios/${reporte.idUsuario}`);
                if (userResponse.ok) {
                    const usuario = await userResponse.json();
                    reporte.usuario = usuario;
                }
            }

            this.mostrarDetallesModal(reporte);
        } catch (error) {
            handleApiError(error);
        }
    }

    mostrarDetallesModal(reporte) {
        const modal = document.getElementById('detalles-modal');
        const modalContent = document.getElementById('detalles-content');

        const fechaReporte = new Date(reporte.fecha);
        const fechaFormateada = fechaReporte.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Sección de usuario
        let usuarioSection = '';
        if (reporte.usuario) {
            usuarioSection = `
            <div class="detalles-section">
                <div class="section-header">
                    <i class="fas fa-user"></i>
                    <h4>Usuario</h4>
                </div>
                <div class="section-body">
                    <p><strong>Nombre:</strong> ${reporte.usuario.nombre}</p>
                    <p><strong>Email:</strong> ${reporte.usuario.correo}</p>
                    <p><strong>Rol:</strong> ${reporte.usuario.rol}</p>
                </div>
            </div>
        `;
        } else if (reporte.idUsuario) {
            usuarioSection = `
            <div class="detalles-section">
                <div class="section-header">
                    <i class="fas fa-user"></i>
                    <h4>Usuario</h4>
                </div>
                <div class="section-body">
                    <p><strong>ID Usuario:</strong> ${reporte.idUsuario}</p>
                    <p>Cargando información del usuario...</p>
                </div>
            </div>
        `;

            // Intentar cargar la información del usuario si no está disponible
            this.cargarUsuarioParaModal(reporte.idUsuario, modalContent);
        }

        let html = `
        <div class="modal-header">
            <h3>Detalles del Reporte</h3>
            <div class="reporte-id">#${reporte.idReporte}</div>
        </div>
        
        <div class="detalles-grid">
            <div class="detalles-section">
                <div class="section-header">
                    <i class="fas fa-info-circle"></i>
                    <h4>Información del Reporte</h4>
                </div>
                <div class="section-body">
                    <p><strong>Título:</strong> ${reporte.titulo}</p>
                    <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                    <p><strong>Descripción:</strong></p>
                    <div class="reporte-descripcion-detalle">${reporte.descripcion}</div>
                </div>
            </div>
            
            ${usuarioSection}
        </div>
    `;

        modalContent.innerHTML = html;
        modal.style.display = 'flex';
    }

    async cargarUsuarioParaModal(userId, modalContent) {
        try {
            const response = await fetch(`http://localhost:8080/api/usuarios/${userId}`);
            if (response.ok) {
                const usuario = await response.json();

                // Actualizar la sección de usuario en el modal
                const usuarioSection = modalContent.querySelector('.detalles-section');
                if (usuarioSection) {
                    usuarioSection.querySelector('.section-body').innerHTML = `
                    <p><strong>Nombre:</strong> ${usuario.nombre}</p>
                    <p><strong>Email:</strong> ${usuario.correo}</p>
                    <p><strong>Rol:</strong> ${usuario.rol}</p>
                `;
                }
            }
        } catch (error) {
            console.error('Error al cargar usuario:', error);
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
}