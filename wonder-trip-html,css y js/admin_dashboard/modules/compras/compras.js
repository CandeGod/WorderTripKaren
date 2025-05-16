import { handleApiError } from '../../../js/shared/utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const comprasApp = new ComprasApp();
    comprasApp.init();
});

class ComprasApp {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 10;
        this.searchQuery = '';
        this.usuarios = [];
        this.sortBy = 'fechaCompra';
        this.direction = 'desc';
    }

    async init() {
        await this.loadUsuarios();
        this.setupEventListeners();
        this.loadCompras();
        this.setupDatePickers();
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
        document.getElementById('buscar-compra').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.debouncedSearch();
        });

        // Filtro por usuario
        document.getElementById('filtro-usuario').addEventListener('change', (e) => {
            this.currentPage = 0;
            this.loadCompras();
        });

        // Filtro por rango de fechas
        document.getElementById('aplicar-fechas').addEventListener('click', () => {
            this.currentPage = 0;
            this.loadComprasByDateRange();
        });

        // Resetear filtro de fechas
        document.getElementById('resetear-fechas').addEventListener('click', () => {
            document.getElementById('fecha-inicio').value = '';
            document.getElementById('fecha-fin').value = '';
            this.currentPage = 0;
            this.loadCompras();
        });

        // Ordenación
        document.getElementById('ordenar-por').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.currentPage = 0;
            this.loadCompras();
        });

        document.getElementById('direccion-orden').addEventListener('change', (e) => {
            this.direction = e.target.value;
            this.currentPage = 0;
            this.loadCompras();
        });

        // Paginación
        document.addEventListener('click', (e) => {
            if (e.target.id === 'pagina-anterior') {
                if (this.currentPage > 0) {
                    this.currentPage--;
                    this.loadCompras();
                }
            } else if (e.target.id === 'pagina-siguiente') {
                this.currentPage++;
                this.loadCompras();
            }
        });
    }

    setupDatePickers() {
        // Configuración básica de los datepickers
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-inicio').max = today;
        document.getElementById('fecha-fin').max = today;
        
        document.getElementById('fecha-inicio').addEventListener('change', (e) => {
            document.getElementById('fecha-fin').min = e.target.value;
        });
    }

    debouncedSearch = this.debounce(() => {
        this.currentPage = 0;
        this.loadCompras();
    }, 300);

    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    async loadCompras() {
        const comprasList = document.getElementById('compras-list');
        comprasList.innerHTML = '<div class="loading">Cargando compras...</div>';
        
        try {
            const usuarioId = document.getElementById('filtro-usuario').value;
            let url;
            
            if (usuarioId) {
                url = `http://localhost:8080/api/compras/usuario/${usuarioId}?page=${this.currentPage}&size=${this.pageSize}`;
            } else {
                url = `http://localhost:8080/api/compras?page=${this.currentPage}&size=${this.pageSize}&sortBy=${this.sortBy}&direction=${this.direction}`;
            }

            if (this.searchQuery && !isNaN(this.searchQuery)) {
                // Si es un número, buscar por ID de compra
                try {
                    const response = await fetch(`http://localhost:8080/api/compras/${this.searchQuery}`);
                    if (!response.ok) throw new Error('Compra no encontrada');
                    
                    const compra = await response.json();
                    this.displayCompras([compra]);
                    return;
                } catch (error) {
                    // Si falla, continuar con la búsqueda normal
                    console.warn('Búsqueda por ID fallida, intentando búsqueda general');
                }
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar compras');
            
            const data = await response.json();
            const compras = Array.isArray(data) ? data : data.content || [];
            this.displayCompras(compras);
            this.updatePaginationInfo(data.totalElements || compras.length);
        } catch (error) {
            handleApiError(error);
            comprasList.innerHTML = `<div class="error">Error al cargar compras: ${error.message}</div>`;
        }
    }

    async loadComprasByDateRange() {
        const fechaInicio = document.getElementById('fecha-inicio').value;
        const fechaFin = document.getElementById('fecha-fin').value;
        
        if (!fechaInicio || !fechaFin) {
            alert('Por favor seleccione ambas fechas');
            return;
        }
        
        const comprasList = document.getElementById('compras-list');
        comprasList.innerHTML = '<div class="loading">Cargando compras...</div>';
        
        try {
            const url = `http://localhost:8080/api/compras/fechas?inicio=${fechaInicio}&fin=${fechaFin}&page=${this.currentPage}&size=${this.pageSize}&sortBy=${this.sortBy}&direction=${this.direction}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar compras por rango de fechas');
            
            const data = await response.json();
            const compras = Array.isArray(data) ? data : data.content || [];
            this.displayCompras(compras);
            this.updatePaginationInfo(data.totalElements || compras.length);
        } catch (error) {
            handleApiError(error);
            comprasList.innerHTML = `<div class="error">Error al cargar compras: ${error.message}</div>`;
        }
    }

    displayCompras(compras) {
        const comprasList = document.getElementById('compras-list');
        
        if (compras.length === 0) {
            comprasList.innerHTML = '<div class="loading">No se encontraron compras</div>';
            return;
        }

        comprasList.innerHTML = '';
        
        compras.forEach(compra => {
            const compraCard = document.createElement('div');
            compraCard.className = 'compra-card';
            
            const fechaCompra = new Date(compra.fechaCompra);
            const fechaFormateada = fechaCompra.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            compraCard.innerHTML = `
                <div class="compra-header">
                    <div class="compra-id">#${compra.id}</div>
                    <div class="compra-fecha">${fechaFormateada}</div>
                </div>
                
                <div class="compra-body">
                    <div class="compra-info">
                        <div class="compra-paquete">
                            <i class="fas fa-suitcase"></i>
                            <h3>${compra.paquete?.nombre || 'Paquete no disponible'}</h3>
                        </div>
                        <div class="compra-metodo">
                            <i class="fas fa-credit-card"></i>
                            <span>${compra.metodoPago || 'Método no especificado'}</span>
                        </div>
                    </div>
                    
                    <div class="compra-usuario">
                        <div class="usuario-imagen" style="background-image: url('${compra.usuario?.imagenPerfil || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'}')">
                            ${!compra.usuario?.imagenPerfil ? '<i class="fas fa-user"></i>' : ''}
                        </div>
                        <div class="usuario-info">
                            <p class="usuario-nombre">${compra.usuario?.nombre || 'Usuario no disponible'}</p>
                            <p class="usuario-email">${compra.usuario?.correo || ''}</p>
                        </div>
                    </div>
                    
                    <div class="compra-precio">
                        $${compra.paquete?.precio?.toLocaleString() || '0'}
                    </div>
                </div>
                
                <div class="compra-actions">
                    <button class="btn-detalles" data-id="${compra.id}">
                        <i class="fas fa-eye"></i> Ver detalles
                    </button>
                </div>
            `;
            
            comprasList.appendChild(compraCard);
        });

        // Agregar event listeners a los botones de detalles
        document.querySelectorAll('.btn-detalles').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.verDetallesCompra(id);
            });
        });
    }

    updatePaginationInfo(totalElements) {
        const totalPages = Math.ceil(totalElements / this.pageSize);
        const paginationInfo = document.getElementById('pagination-info');
        
        paginationInfo.innerHTML = `
            Página ${this.currentPage + 1} de ${totalPages} | 
            Total: ${totalElements} compras
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

    async verDetallesCompra(id) {
        try {
            const response = await fetch(`http://localhost:8080/api/compras/${id}`);
            if (!response.ok) throw new Error('Error al cargar detalles de compra');
            
            const compra = await response.json();
            this.mostrarDetallesModal(compra);
        } catch (error) {
            handleApiError(error);
        }
    }

    mostrarDetallesModal(compra) {
        const modal = document.getElementById('detalles-modal');
        const modalContent = document.getElementById('detalles-content');
        
        const fechaCompra = new Date(compra.fechaCompra);
        const fechaFormateada = fechaCompra.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let html = `
            <div class="modal-header">
                <h3>Detalles de Compra</h3>
                <div class="compra-id">#${compra.id}</div>
            </div>
            
            <div class="detalles-grid">
                <div class="detalles-section">
                    <div class="section-header">
                        <i class="fas fa-calendar-alt"></i>
                        <h4>Información de Compra</h4>
                    </div>
                    <div class="section-body">
                        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                        <p><strong>Método de pago:</strong> ${compra.metodoPago || 'No especificado'}</p>
                        <p><strong>Total:</strong> $${compra.paquete?.precio?.toLocaleString() || '0'}</p>
                    </div>
                </div>
                
                <div class="detalles-section">
                    <div class="section-header">
                        <i class="fas fa-suitcase"></i>
                        <h4>Paquete Adquirido</h4>
                    </div>
                    <div class="section-body">
        `;
        
        if (compra.paquete) {
            html += `
                <p><strong>Nombre:</strong> ${compra.paquete.nombre}</p>
                <p><strong>Descripción:</strong> ${compra.paquete.descripcion}</p>
                <p><strong>Precio:</strong> $${compra.paquete.precio?.toLocaleString() || '0'}</p>
            `;
        } else {
            html += '<p>Información del paquete no disponible</p>';
        }
        
        html += `
                    </div>
                </div>
                
                <div class="detalles-section">
                    <div class="section-header">
                        <i class="fas fa-user"></i>
                        <h4>Usuario</h4>
                    </div>
                    <div class="section-body">
        `;
        
        if (compra.usuario) {
            html += `
                <p><strong>Nombre:</strong> ${compra.usuario.nombre}</p>
                <p><strong>Email:</strong> ${compra.usuario.correo}</p>
                <p><strong>Rol:</strong> ${compra.usuario.rol}</p>
            `;
        } else {
            html += '<p>Información del usuario no disponible</p>';
        }
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        modalContent.innerHTML = html;
        modal.style.display = 'flex';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
}