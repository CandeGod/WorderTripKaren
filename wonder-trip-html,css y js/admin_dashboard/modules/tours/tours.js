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
    
    // Inicializar la aplicación de tours
    const toursApp = new ToursApp();
    toursApp.init();
});

const API_BASE_URL = 'http://localhost:8080/api';

class ToursApp {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 10;
        this.sortDirection = 'asc';
        this.totalTours = 0;
        this.toursData = [];
        this.sitiosData = [];
    }

    async init() {
        await this.loadSitiosTuristicos();
        await this.loadTours();
        this.setupEventListeners();
    }

    async loadSitiosTuristicos() {
        try {
            const response = await fetch(`${API_BASE_URL}/sitios-turisticos`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar sitios turísticos');
            
            this.sitiosData = await response.json();
            this.populateSitiosSelect(document.getElementById('sitio'), this.sitiosData);
            this.populateSitiosSelect(document.getElementById('editSitio'), this.sitiosData);
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error al cargar sitios turísticos', 'danger');
        }
    }

    populateSitiosSelect(selectElement, sitios) {
        selectElement.innerHTML = '<option value="">Seleccionar sitio...</option>';
        sitios.forEach(sitio => {
            const option = document.createElement('option');
            option.value = sitio.id;
            option.textContent = sitio.nombre;
            selectElement.appendChild(option);
        });
    }

    async loadTours(page = this.currentPage, size = this.pageSize, sort = this.sortDirection, filtros = {}) {
        try {
            let url = `${API_BASE_URL}/tours?page=${page}&size=${size}&sort=${sort}`;
            
            if (filtros.busqueda) {
                url += `&nombre=${encodeURIComponent(filtros.busqueda)}`;
            }
            if (filtros.duracion) {
                const [min, max] = filtros.duracion.split('-');
                url += `&duracionMin=${min || 1}&duracionMax=${max || 24}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar tours');
            
            const data = await response.json();
            this.toursData = data.content || data;
            this.totalTours = data.totalElements || data.length;
            
            this.renderToursTable();
            this.updatePagination();
            this.updateStats();
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error al cargar tours', 'danger');
        }
    }

    renderToursTable() {
        const toursTableBody = document.getElementById('toursTableBody');
        toursTableBody.innerHTML = '';
        
        if (this.toursData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7" class="text-center">No se encontraron tours</td>`;
            toursTableBody.appendChild(row);
            return;
        }

        this.toursData.forEach(tour => {
            const sitio = this.sitiosData.find(s => s.id === tour.idSitio) || {};
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${this.validateImageUrl(tour.imagenPortada)}" alt="${tour.nombre}" class="img-thumbnail" style="width: 100px; height: 60px; object-fit: cover;"></td>
                <td>${tour.nombre}</td>
                <td>${tour.descripcion.substring(0, 50)}${tour.descripcion.length > 50 ? '...' : ''}</td>
                <td>${tour.duracion}</td>
                <td>$${tour.precio.toFixed(2)}</td>
                <td>${sitio.nombre || 'No asignado'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 editar-tour" data-id="${tour.idTour}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger eliminar-tour" data-id="${tour.idTour}" data-nombre="${tour.nombre}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            toursTableBody.appendChild(row);
        });
    }

    validateImageUrl(url) {
        if (!url || !url.startsWith('http')) {
            return 'https://via.placeholder.com/100x60?text=Tour';
        }
        return url;
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        const totalPages = Math.ceil(this.totalTours / this.pageSize);
        
        if (totalPages <= 1) return;
        
        // Botón Anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 0 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadTours();
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
                this.loadTours();
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
                this.loadTours();
            }
        });
        pagination.appendChild(nextLi);
    }

    updateStats() {
        document.getElementById('totalTours').textContent = this.totalTours;
        
        if (this.toursData.length > 0) {
            const totalPrecio = this.toursData.reduce((sum, tour) => sum + tour.precio, 0);
            const promedioPrecio = totalPrecio / this.toursData.length;
            document.getElementById('precioPromedio').textContent = `$${promedioPrecio.toFixed(2)}`;
            
            const totalDuracion = this.toursData.reduce((sum, tour) => sum + tour.duracion, 0);
            const promedioDuracion = totalDuracion / this.toursData.length;
            document.getElementById('duracionPromedio').textContent = `${promedioDuracion.toFixed(1)} hrs`;
        } else {
            document.getElementById('precioPromedio').textContent = '$0';
            document.getElementById('duracionPromedio').textContent = '0 hrs';
        }
    }

    setupEventListeners() {
        // Vista previa de imagen en nuevo tour
        document.getElementById('imagenPortada').addEventListener('input', (e) => {
            const imagenUrl = e.target.value;
            document.getElementById('imagenPreview').src = 
                imagenUrl && imagenUrl.startsWith('http') ? 
                imagenUrl : 
                'https://via.placeholder.com/300x200?text=Preview';
        });
        
        // Vista previa de imagen en editar tour
        document.getElementById('editImagenPortada').addEventListener('input', (e) => {
            const imagenUrl = e.target.value;
            document.getElementById('editImagenPreview').src = 
                imagenUrl && imagenUrl.startsWith('http') ? 
                imagenUrl : 
                'https://via.placeholder.com/300x200?text=Preview';
        });
        
        // Formulario nuevo tour
        document.getElementById('formNuevoTour').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nuevoTour = {
                nombre: document.getElementById('nombre').value,
                descripcion: document.getElementById('descripcion').value,
                duracion: parseInt(document.getElementById('duracion').value),
                precio: parseFloat(document.getElementById('precio').value),
                idSitio: parseInt(document.getElementById('sitio').value),
                imagenPortada: document.getElementById('imagenPortada').value
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/tours`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(nuevoTour)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al crear tour');
                }
                
                this.showAlert('Tour creado exitosamente', 'success');
                
                // Cerrar modal usando Bootstrap JS nativo
                const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoTourModal'));
                modal.hide();
                
                document.getElementById('formNuevoTour').reset();
                this.loadTours();
            } catch (error) {
                console.error('Error:', error);
                this.showAlert(error.message || 'Error al crear tour', 'danger');
            }
        });
        
        // Formulario editar tour
        document.getElementById('formEditarTour').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const tourId = document.getElementById('editIdTour').value;
            const tourActualizado = {
                nombre: document.getElementById('editNombre').value,
                descripcion: document.getElementById('editDescripcion').value,
                duracion: parseInt(document.getElementById('editDuracion').value),
                precio: parseFloat(document.getElementById('editPrecio').value),
                idSitio: parseInt(document.getElementById('editSitio').value),
                imagenPortada: document.getElementById('editImagenPortada').value
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(tourActualizado)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al actualizar tour');
                }
                
                this.showAlert('Tour actualizado exitosamente', 'success');
                
                // Cerrar modal usando Bootstrap JS nativo
                const modal = bootstrap.Modal.getInstance(document.getElementById('editarTourModal'));
                modal.hide();
                
                this.loadTours();
            } catch (error) {
                console.error('Error:', error);
                this.showAlert(error.message || 'Error al actualizar tour', 'danger');
            }
        });
        
        // Botones editar/eliminar tour (delegación de eventos)
        document.getElementById('toursTableBody').addEventListener('click', (e) => {
            if (e.target.closest('.editar-tour')) {
                const button = e.target.closest('.editar-tour');
                const tourId = button.getAttribute('data-id');
                this.openEditModal(tourId);
            }
            
            if (e.target.closest('.eliminar-tour')) {
                const button = e.target.closest('.eliminar-tour');
                const tourId = button.getAttribute('data-id');
                const tourNombre = button.getAttribute('data-nombre');
                this.openDeleteConfirmationModal(tourId, tourNombre);
            }
        });
        
        // Confirmar eliminación
        document.getElementById('confirmarEliminar').addEventListener('click', async () => {
            const tourId = document.getElementById('confirmarEliminar').getAttribute('data-id');
            
            try {
                const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar tour');
                }
                
                this.showAlert('Tour eliminado exitosamente', 'success');
                
                // Cerrar modal usando Bootstrap JS nativo
                const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarModal'));
                modal.hide();
                
                this.loadTours();
            } catch (error) {
                console.error('Error:', error);
                this.showAlert(error.message || 'Error al eliminar tour', 'danger');
            }
        });
        
        // Filtros
        document.getElementById('filtroToursForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const filtros = {
                busqueda: document.getElementById('busqueda').value.trim(),
                duracion: document.getElementById('duracion').value
            };
            
            // Actualizar orden si cambió
            const nuevoOrden = document.getElementById('orden').value;
            if (nuevoOrden.includes('precio')) {
                this.sortDirection = nuevoOrden.includes('asc') ? 'asc' : 'desc';
            } else {
                this.sortDirection = nuevoOrden;
            }
            
            this.currentPage = 0;
            this.loadTours(this.currentPage, this.pageSize, this.sortDirection, filtros);
        });
    }

    async openEditModal(tourId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar tour');
            
            const tour = await response.json();
            
            // Llenar formulario
            document.getElementById('editIdTour').value = tour.idTour;
            document.getElementById('editNombre').value = tour.nombre;
            document.getElementById('editDescripcion').value = tour.descripcion;
            document.getElementById('editDuracion').value = tour.duracion;
            document.getElementById('editPrecio').value = tour.precio;
            document.getElementById('editImagenPortada').value = tour.imagenPortada;
            document.getElementById('editSitio').value = tour.idSitio;
            
            // Actualizar vista previa
            document.getElementById('editImagenPreview').src = 
                this.validateImageUrl(tour.imagenPortada);
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('editarTourModal'));
            modal.show();
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error al cargar datos del tour', 'danger');
        }
    }

    openDeleteConfirmationModal(tourId, tourNombre) {
        document.getElementById('nombreTourEliminar').textContent = tourNombre;
        document.getElementById('confirmarEliminar').setAttribute('data-id', tourId);
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