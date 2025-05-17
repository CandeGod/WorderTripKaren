import { handleApiError } from '../../../js/shared/utils.js';

// Función para verificar autenticación
function checkAuth() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || userData.rol !== 'ADMINISTRADOR') {
        window.location.href = '../../index.html';
        return null;
    }
    return userData;
}

// Mostrar información del administrador
function displayAdminInfo(userData) {
    document.getElementById('admin-name').textContent = userData.nombre || 'Administrador';
    document.getElementById('admin-email').textContent = userData.correo || 'admin@wondertrip.com';
    
    const adminAvatar = document.getElementById('admin-avatar');
    adminAvatar.src = userData.imagenPerfil || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80';
}

// Configurar logout
function setupLogout() {
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        window.location.href = '../../index.html';
    });
}

// Cargar reportes pendientes para notificaciones
async function loadPendingReports() {
    try {
        const response = await fetch('http://localhost:8080/api/reportes?page=0&size=1', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('notification-count').textContent = data.totalElements || '0';
        }
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    const userData = checkAuth();
    if (!userData) return;
    
    // Configurar UI de administrador
    displayAdminInfo(userData);
    setupLogout();
    loadPendingReports();
    
    // Inicializar la aplicación de hoteles
    const hotelesApp = new HotelesApp();
    hotelesApp.init();
});

const API_BASE_URL = 'http://localhost:8080/api';

class HotelesApp {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 10;
        this.sortDirection = 'asc';
        this.totalHoteles = 0;
        this.hotelesData = [];
    }

    async init() {
        await this.loadHoteles();
        this.setupEventListeners();
    }

    async loadHoteles(page = this.currentPage, size = this.pageSize, sort = this.sortDirection, filtros = {}) {
        try {
            let url = `${API_BASE_URL}/hoteles?page=${page}&size=${size}&sort=${sort}`;
            
            if (filtros.busqueda) {
                url += `&nombre=${encodeURIComponent(filtros.busqueda)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar hoteles');
            
            const data = await response.json();
            this.hotelesData = data.content || data;
            this.totalHoteles = data.totalElements || data.length;
            
            this.renderHotelesTable();
            this.updatePagination();
            this.updateStats();
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error al cargar hoteles', 'danger');
        }
    }

    renderHotelesTable() {
        const hotelesTableBody = document.getElementById('hotelesTableBody');
        hotelesTableBody.innerHTML = '';
        
        if (this.hotelesData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" class="text-center">No se encontraron hoteles</td>`;
            hotelesTableBody.appendChild(row);
            return;
        }

        this.hotelesData.forEach(hotel => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${this.validateImageUrl(hotel.imagenPrincipal)}" 
                         alt="${hotel.nombre}" 
                         class="img-thumbnail" 
                         style="width: 100px; height: 60px; object-fit: cover;">
                </td>
                <td>${hotel.nombre}</td>
                <td>${hotel.direccion}</td>
                <td>${hotel.descripcion.substring(0, 50)}${hotel.descripcion.length > 50 ? '...' : ''}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 editar-hotel" data-id="${hotel.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger eliminar-hotel" data-id="${hotel.id}" data-nombre="${hotel.nombre}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            hotelesTableBody.appendChild(row);
        });
    }

    validateImageUrl(url) {
        if (!url || !url.startsWith('http')) {
            return 'https://via.placeholder.com/100x60?text=Hotel';
        }
        return url;
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        const totalPages = Math.ceil(this.totalHoteles / this.pageSize);
        
        if (totalPages <= 1) return;
        
        // Botón Anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 0 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadHoteles();
            }
        });
        pagination.appendChild(prevLi);
        
        // Números de página
        for (let i = 0; i < totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            li.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = i;
                this.loadHoteles();
            });
            pagination.appendChild(li);
        }
        
        // Botón Siguiente
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.currentPage === totalPages - 1 ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage < totalPages - 1) {
                this.currentPage++;
                this.loadHoteles();
            }
        });
        pagination.appendChild(nextLi);
    }

    updateStats() {
        document.getElementById('totalHoteles').textContent = this.totalHoteles;
    }

    setupEventListeners() {
        // Vista previa de imagen en nuevo hotel
        document.getElementById('imagenHotel').addEventListener('input', (e) => {
            const imagenUrl = e.target.value;
            document.getElementById('imagenPreview').src = 
                imagenUrl && imagenUrl.startsWith('http') ? 
                imagenUrl : 
                'https://via.placeholder.com/300x200?text=Preview';
        });
        
        // Vista previa de imagen en editar hotel
        document.getElementById('editImagenHotel').addEventListener('input', (e) => {
            const imagenUrl = e.target.value;
            document.getElementById('editImagenPreview').src = 
                imagenUrl && imagenUrl.startsWith('http') ? 
                imagenUrl : 
                'https://via.placeholder.com/300x200?text=Preview';
        });
        
        // Formulario nuevo hotel
        document.getElementById('formNuevoHotel').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nuevoHotel = {
                nombre: document.getElementById('nombreHotel').value,
                direccion: document.getElementById('direccionHotel').value,
                descripcion: document.getElementById('descripcionHotel').value,
                imagenPrincipal: document.getElementById('imagenHotel').value
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/hoteles`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(nuevoHotel)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al crear hotel');
                }
                
                this.showAlert('Hotel creado exitosamente', 'success');
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoHotelModal'));
                modal.hide();
                
                document.getElementById('formNuevoHotel').reset();
                this.loadHoteles();
            } catch (error) {
                console.error('Error:', error);
                this.showAlert(error.message || 'Error al crear hotel', 'danger');
            }
        });
        
        // Formulario editar hotel
        document.getElementById('formEditarHotel').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const hotelId = document.getElementById('editIdHotel').value;
            const hotelActualizado = {
                nombre: document.getElementById('editNombreHotel').value,
                direccion: document.getElementById('editDireccionHotel').value,
                descripcion: document.getElementById('editDescripcionHotel').value,
                imagenPrincipal: document.getElementById('editImagenHotel').value
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/hoteles/${hotelId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(hotelActualizado)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al actualizar hotel');
                }
                
                this.showAlert('Hotel actualizado exitosamente', 'success');
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editarHotelModal'));
                modal.hide();
                
                this.loadHoteles();
            } catch (error) {
                console.error('Error:', error);
                this.showAlert(error.message || 'Error al actualizar hotel', 'danger');
            }
        });
        
        // Botones editar/eliminar hotel (delegación de eventos)
        document.getElementById('hotelesTableBody').addEventListener('click', (e) => {
            if (e.target.closest('.editar-hotel')) {
                const button = e.target.closest('.editar-hotel');
                const hotelId = button.getAttribute('data-id');
                this.openEditModal(hotelId);
            }
            
            if (e.target.closest('.eliminar-hotel')) {
                const button = e.target.closest('.eliminar-hotel');
                const hotelId = button.getAttribute('data-id');
                const hotelNombre = button.getAttribute('data-nombre');
                this.openDeleteConfirmationModal(hotelId, hotelNombre);
            }
        });
        
        // Confirmar eliminación
        document.getElementById('confirmarEliminar').addEventListener('click', async () => {
            const hotelId = document.getElementById('confirmarEliminar').getAttribute('data-id');
            
            try {
                const response = await fetch(`${API_BASE_URL}/hoteles/${hotelId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar hotel');
                }
                
                this.showAlert('Hotel eliminado exitosamente', 'success');
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarModal'));
                modal.hide();
                
                this.loadHoteles();
            } catch (error) {
                console.error('Error:', error);
                this.showAlert(error.message || 'Error al eliminar hotel', 'danger');
            }
        });
        
        // Filtros
        document.getElementById('filtroHotelesForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const filtros = {
                busqueda: document.getElementById('busqueda').value.trim()
            };
            
            this.sortDirection = document.getElementById('orden').value;
            this.currentPage = 0;
            this.loadHoteles(this.currentPage, this.pageSize, this.sortDirection, filtros);
        });
    }

    async openEditModal(hotelId) {
        try {
            const response = await fetch(`${API_BASE_URL}/hoteles/${hotelId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar hotel');
            
            const hotel = await response.json();
            
            // Llenar formulario
            document.getElementById('editIdHotel').value = hotel.id;
            document.getElementById('editNombreHotel').value = hotel.nombre;
            document.getElementById('editDireccionHotel').value = hotel.direccion;
            document.getElementById('editDescripcionHotel').value = hotel.descripcion;
            document.getElementById('editImagenHotel').value = hotel.imagenPrincipal;
            
            // Actualizar vista previa
            document.getElementById('editImagenPreview').src = 
                this.validateImageUrl(hotel.imagenPrincipal);
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('editarHotelModal'));
            modal.show();
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error al cargar datos del hotel', 'danger');
        }
    }

    openDeleteConfirmationModal(hotelId, hotelNombre) {
        document.getElementById('nombreHotelEliminar').textContent = hotelNombre;
        document.getElementById('confirmarEliminar').setAttribute('data-id', hotelId);
        const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarModal'));
        modal.show();
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show fixed-top mx-auto mt-3`;
        alertDiv.style.maxWidth = '500px';
        alertDiv.style.zIndex = '1060';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 3000);
    }
}