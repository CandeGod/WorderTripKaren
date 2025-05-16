import { handleApiError } from '../../../js/shared/utils.js';

document.addEventListener('DOMContentLoaded', function () {
    const usuariosApp = new UsuariosApp();
    usuariosApp.init();
});

class UsuariosApp {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 10;
        this.searchQuery = '';
        this.totalPages = 1;
    }

    init() {
        this.setupEventListeners();
        this.loadUsuarios();
    }

    setupEventListeners() {
        // Botón nuevo usuario
        document.getElementById('nuevo-usuario-btn').addEventListener('click', () => {
            this.openUsuarioModal();
        });

        // Búsqueda
        document.getElementById('buscar-usuario').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.debouncedSearch();
        });

        // Botones modales
        document.getElementById('cancelar-usuario').addEventListener('click', () => {
            this.closeModal('usuario-modal');
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal('usuario-modal');
        });

        // Event delegation para botones dinámicos
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-reportes')) {
                const userId = e.target.closest('.btn-reportes').getAttribute('data-id');
                this.verReportesUsuario(userId);
            }

            if (e.target.closest('.btn-compras')) {
                const userId = e.target.closest('.btn-compras').getAttribute('data-id');
                this.verComprasUsuario(userId);
            }

            if (e.target.closest('.btn-edit')) {
                const userId = e.target.closest('.btn-edit').getAttribute('data-id');
                this.editUsuario(userId);
            }
        });

        // Paginación
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadUsuarios();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (this.currentPage < this.totalPages - 1) {
                this.currentPage++;
                this.loadUsuarios();
            }
        });
    }

    debouncedSearch = this.debounce(() => {
        this.currentPage = 0; // Resetear a primera página al buscar
        this.loadUsuarios();
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

    async loadUsuarios() {
        const usuariosList = document.getElementById('usuarios-list');
        usuariosList.innerHTML = '<div class="loading">Cargando usuarios...</div>';

        try {
            let url = `http://localhost:8080/api/usuarios?page=${this.currentPage}&size=${this.pageSize}&sort=asc`;

            if (this.searchQuery) {
                if (!isNaN(this.searchQuery)) {
                    // Si es un número, buscar por ID
                    const response = await fetch(`http://localhost:8080/api/usuarios/${this.searchQuery}`);
                    if (!response.ok) throw new Error('Usuario no encontrado');

                    const usuario = await response.json();
                    this.displayUsuarios([usuario]);
                    this.totalPages = 1;
                    this.updatePagination();
                    return;
                } else {
                    // Búsqueda por texto
                    url += `&search=${encodeURIComponent(this.searchQuery)}`;
                }
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar usuarios');

            const data = await response.json();
            const usuarios = Array.isArray(data) ? data : data.content || [];
            this.totalPages = Array.isArray(data) ? 1 : data.totalPages || 1;

            this.displayUsuarios(usuarios);
            this.updatePagination();
        } catch (error) {
            handleApiError(error);
            usuariosList.innerHTML = `<div class="error">Error al cargar usuarios: ${error.message}</div>`;
        }
    }

    displayUsuarios(usuarios) {
        const usuariosList = document.getElementById('usuarios-list');

        if (usuarios.length === 0) {
            usuariosList.innerHTML = '<div class="loading">No se encontraron usuarios</div>';
            return;
        }

        usuariosList.innerHTML = '';

        usuarios.forEach(usuario => {
            const usuarioCard = document.createElement('div');
            usuarioCard.className = 'usuario-card';
            usuarioCard.innerHTML = `
                <div class="usuario-header">
                    <div class="usuario-imagen" style="background-image: url('${usuario.imagenPerfil || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'}')">
                        ${!usuario.imagenPerfil ? '<i class="fas fa-user fa-2x"></i>' : ''}
                    </div>
                    <div class="usuario-info">
                        <h3 class="usuario-nombre">${usuario.nombre}</h3>
                        <p class="usuario-email">${usuario.correo}</p>
                        <span class="usuario-rol ${usuario.rol.toLowerCase()}">${usuario.rol}</span>
                    </div>
                </div>
                <div class="usuario-detalles">
                    <p><i class="fas fa-venus-mars"></i> ${usuario.sexo || 'No especificado'}</p>
                    <p><i class="fas fa-clipboard-list"></i> Reportes: ${usuario.reportes?.length || 0}</p>
                </div>
                <div class="usuario-actions">
                    <button class="btn-icon btn-edit" data-id="${usuario.id}" title="Editar usuario">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-reportes" data-id="${usuario.id}" title="Ver reportes">
                        <i class="fas fa-exclamation-circle"></i>
                    </button>
                    <button class="btn-icon btn-compras" data-id="${usuario.id}" title="Ver compras">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                </div>
            `;

            usuariosList.appendChild(usuarioCard);
        });
    }

    updatePagination() {
        const paginationInfo = document.getElementById('pagination-info');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        paginationInfo.textContent = `Página ${this.currentPage + 1} de ${this.totalPages}`;

        prevBtn.disabled = this.currentPage === 0;
        nextBtn.disabled = this.currentPage === this.totalPages - 1;
    }

    async verReportesUsuario(userId) {
    try {
        const response = await fetch(`http://localhost:8080/api/reportes/usuario/${userId}?page=0&size=10&sort=asc`);
        if (!response.ok) throw new Error('Error al cargar reportes');
        
        const reportes = await response.json();
        // Asegurarnos de que reportes es un array
        const reportesArray = Array.isArray(reportes) ? reportes : (reportes.content || []);
        this.mostrarReportesModal(reportesArray, userId);
    } catch (error) {
        handleApiError(error);
    }
}


    mostrarReportesModal(reportes, userId) {
        const modal = document.getElementById('reportes-modal');
        const modalContent = document.getElementById('reportes-content');

        let html = `<h3>Reportes del usuario ID: ${userId}</h3>`;

        if (!reportes || reportes.length === 0) {
            html += '<p>El usuario no tiene reportes.</p>';
        } else {
            html += '<div class="reportes-list">';
            reportes.forEach(reporte => {
                html += `
                    <div class="reporte-item">
                        <h4>${reporte.titulo}</h4>
                        <p>${reporte.descripcion}</p>
                        <small>Fecha: ${new Date(reporte.fecha).toLocaleDateString()}</small>
                    </div>
                `;
            });
            html += '</div>';
        }

        modalContent.innerHTML = html;
        modal.style.display = 'flex';
    }

    async verComprasUsuario(userId) {
        try {
            const response = await fetch(`http://localhost:8080/api/compras/usuario/${userId}`);
            if (!response.ok) throw new Error('Error al cargar compras');

            const compras = await response.json();
            this.mostrarComprasModal(compras, userId);
        } catch (error) {
            handleApiError(error);
        }
    }

    mostrarComprasModal(compras, userId) {
        const modal = document.getElementById('compras-modal');
        const modalContent = document.getElementById('compras-content');

        let html = `<h3>Compras del usuario ID: ${userId}</h3>`;

        if (!compras || compras.length === 0) {
            html += '<p>El usuario no tiene compras registradas.</p>';
        } else {
            // Calcular total gastado
            const total = compras.reduce((sum, compra) => sum + (compra.paquete?.precio || 0), 0);

            html += `
                <div class="compras-summary">
                    <p>Total gastado: <strong>$${total.toLocaleString()}</strong></p>
                    <p>Número de compras: <strong>${compras.length}</strong></p>
                </div>
                <div class="compras-list">
            `;

            compras.forEach(compra => {
                html += `
                    <div class="compra-item">
                        <h4>${compra.paquete?.nombre || 'Paquete no disponible'}</h4>
                        <p>$${compra.paquete?.precio?.toLocaleString() || '0'}</p>
                        <p>Método de pago: ${compra.metodoPago || 'No especificado'}</p>
                        <small>Fecha: ${new Date(compra.fechaCompra).toLocaleDateString()}</small>
                    </div>
                `;
            });
            html += '</div>';
        }

        modalContent.innerHTML = html;
        modal.style.display = 'flex';
    }

    openUsuarioModal(usuario = null) {
        const modal = document.getElementById('usuario-modal');
        const form = document.getElementById('usuario-form');

        if (usuario) {
            document.getElementById('modal-title').textContent = 'Editar Usuario';
            document.getElementById('usuario-id').value = usuario.id;
            document.getElementById('usuario-nombre').value = usuario.nombre;
            document.getElementById('usuario-email').value = usuario.correo;
            document.getElementById('usuario-sexo').value = usuario.sexo || '';
            document.getElementById('usuario-rol').value = usuario.rol || 'USUARIO';
            document.getElementById('usuario-imagen').value = usuario.imagenPerfil || '';
        } else {
            document.getElementById('modal-title').textContent = 'Nuevo Usuario';
            form.reset();
        }

        modal.style.display = 'flex';
    }

    async editUsuario(id) {
        try {
            const response = await fetch(`http://localhost:8080/api/usuarios/${id}`);
            if (!response.ok) throw new Error('Error al cargar el usuario');

            const usuario = await response.json();
            this.openUsuarioModal(usuario);
        } catch (error) {
            handleApiError(error);
        }
    }

    async saveUsuario() {
    const form = document.getElementById('usuario-form');
    const id = document.getElementById('usuario-id').value;
    const isNew = !id;
    
    // Construir objeto exactamente como lo espera el backend
    const usuarioData = {
        nombre: document.getElementById('usuario-nombre').value,
        sexo: document.getElementById('usuario-sexo').value,
        correo: document.getElementById('usuario-email').value,
        contrasena: document.getElementById('usuario-password').value,
        rol: document.getElementById('usuario-rol').value,
        imagenPerfil: document.getElementById('usuario-imagen').value || null
    };

    try {
        // Verificar que tenemos token de autenticación
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No se encontró token de autenticación');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`
        };

        let url, method;
        
        if (isNew) {
            // Validar campos requeridos para nuevo usuario
            if (!usuarioData.nombre || !usuarioData.correo || !usuarioData.contrasena) {
                throw new Error('Nombre, correo y contraseña son requeridos');
            }
            
            url = 'http://localhost:8080/api/usuarios';
            method = 'POST';
        } else {
            url = `http://localhost:8080/api/usuarios/${id}`;
            method = 'PUT';
            
            // Para actualización, si la contraseña está vacía, no la enviamos
            if (!usuarioData.contrasena) {
                delete usuarioData.contrasena;
            }
        }

        console.log('Enviando datos:', { url, method, usuarioData }); // Para depuración

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: JSON.stringify(usuarioData)
        });

        console.log('Respuesta recibida:', response); // Para depuración

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error detallado:', errorData); // Para depuración
            throw new Error(errorData.message || `Error al ${isNew ? 'crear' : 'actualizar'} el usuario`);
        }

        const responseData = await response.json();
        console.log('Datos recibidos:', responseData); // Para depuración

        this.closeModal('usuario-modal');
        this.loadUsuarios();
        
        // Mostrar mensaje de éxito con más información
        alert(`Usuario ${isNew ? 'creado' : 'actualizado'} correctamente con ID: ${responseData.id}`);
    } catch (error) {
        console.error('Error completo:', error); // Para depuración
        alert(`Error: ${error.message}\n\nVerifica la consola para más detalles`);
    }
}


    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
}