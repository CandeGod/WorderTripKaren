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
    
    // Inicializar la aplicación de eventos
    const eventosApp = new EventosApp();
    eventosApp.init();
});

class EventosApp {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 10;
        this.sortOrder = 'asc';
        this.searchQuery = '';
        this.sitiosTuristicos = [];
    }

    async init() {
        await this.loadSitiosTuristicos();
        this.setupEventListeners();
        this.loadEventos();
    }

    async loadSitiosTuristicos() {
        try {
            const response = await fetch('http://localhost:8080/api/sitios-turisticos', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar sitios turísticos');
            this.sitiosTuristicos = await response.json();
            this.populateSitiosDropdown();
        } catch (error) {
            handleApiError(error);
        }
    }

    populateSitiosDropdown() {
        const select = document.getElementById('evento-sitio');
        select.innerHTML = '<option value="">Seleccione un sitio</option>';
        
        this.sitiosTuristicos.forEach(sitio => {
            const option = document.createElement('option');
            option.value = sitio.id;
            option.textContent = sitio.nombre;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        // Botón nuevo evento
        document.getElementById('nuevo-evento-btn').addEventListener('click', () => {
            this.openEventoModal();
        });

        // Filtros
        document.getElementById('filtro-orden').addEventListener('change', (e) => {
            this.sortOrder = e.target.value;
            this.loadEventos();
        });

        document.getElementById('buscar-evento').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.debouncedSearch();
        });

        // Formulario evento
        document.getElementById('evento-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvento();
        });

        // Botones modales
        document.getElementById('cancelar-evento').addEventListener('click', () => {
            this.closeModal('evento-modal');
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal('evento-modal');
        });

        // Confirmación
        document.getElementById('confirm-cancel').addEventListener('click', () => {
            this.closeModal('confirm-modal');
        });
    }

    debouncedSearch = this.debounce(() => {
        this.loadEventos();
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

    async loadEventos() {
        const eventosList = document.getElementById('eventos-list');
        eventosList.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
        
        try {
            const url = new URL('http://localhost:8080/api/eventos');
            url.searchParams.append('page', this.currentPage);
            url.searchParams.append('size', this.pageSize);
            url.searchParams.append('sort', this.sortOrder);
            
            if (this.searchQuery) {
                url.searchParams.append('search', this.searchQuery);
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar eventos');
            
            const data = await response.json();
            this.displayEventos(data.content);
            this.setupPagination(data.totalPages, this.currentPage);
        } catch (error) {
            handleApiError(error);
            eventosList.innerHTML = `<div class="alert alert-danger">Error al cargar eventos: ${error.message}</div>`;
        }
    }

    displayEventos(eventos) {
        const eventosList = document.getElementById('eventos-list');
        
        if (eventos.length === 0) {
            eventosList.innerHTML = '<div class="text-center py-3">No se encontraron eventos</div>';
            return;
        }

        eventosList.innerHTML = '';
        
        eventos.forEach(evento => {
            const eventoCard = document.createElement('div');
            eventoCard.className = 'evento-card';
            eventoCard.innerHTML = `
                <div class="evento-imagen" style="background-image: url('${evento.imagenCartel || 'https://via.placeholder.com/300x180?text=Evento'}')"></div>
                <div class="evento-body">
                    <h3 class="evento-titulo">${evento.titulo}</h3>
                    <p class="evento-descripcion">${evento.descripcion}</p>
                    <div class="evento-fechas">
                        <span><i class="far fa-calendar-alt"></i> ${new Date(evento.fechaInicio).toLocaleDateString()}</span>
                        <span><i class="far fa-calendar-alt"></i> ${new Date(evento.fechaFin).toLocaleDateString()}</span>
                    </div>
                    <div class="evento-actions">
                        <button class="btn-icon edit" data-id="${evento.idEvento}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" data-id="${evento.idEvento}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            eventosList.appendChild(eventoCard);
        });

        // Agregar event listeners a los botones
        document.querySelectorAll('.btn-icon.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.editEvento(id);
            });
        });

        document.querySelectorAll('.btn-icon.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.confirmDelete(id);
            });
        });
    }

    setupPagination(totalPages, currentPage) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Botón Anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 0 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 0) {
                this.currentPage--;
                this.loadEventos();
            }
        });
        pagination.appendChild(prevLi);
        
        // Números de página
        for (let i = 0; i < totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            li.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = i;
                this.loadEventos();
            });
            pagination.appendChild(li);
        }
        
        // Botón Siguiente
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages - 1) {
                this.currentPage++;
                this.loadEventos();
            }
        });
        pagination.appendChild(nextLi);
    }

    openEventoModal(evento = null) {
        const modal = document.getElementById('evento-modal');
        const form = document.getElementById('evento-form');
        
        if (evento) {
            document.getElementById('modal-title').textContent = 'Editar Evento';
            document.getElementById('evento-id').value = evento.idEvento;
            document.getElementById('evento-titulo').value = evento.titulo;
            document.getElementById('evento-descripcion').value = evento.descripcion;
            document.getElementById('evento-fecha-inicio').value = evento.fechaInicio;
            document.getElementById('evento-fecha-fin').value = evento.fechaFin;
            document.getElementById('evento-imagen').value = evento.imagenCartel;
            document.getElementById('evento-sitio').value = evento.idSitio;
        } else {
            document.getElementById('modal-title').textContent = 'Nuevo Evento';
            form.reset();
        }
        
        modal.style.display = 'flex';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    async saveEvento() {
        const form = document.getElementById('evento-form');
        const id = document.getElementById('evento-id').value;
        const isNew = !id;
        
        const eventoData = {
            titulo: document.getElementById('evento-titulo').value,
            descripcion: document.getElementById('evento-descripcion').value,
            fechaInicio: document.getElementById('evento-fecha-inicio').value,
            fechaFin: document.getElementById('evento-fecha-fin').value,
            imagenCartel: document.getElementById('evento-imagen').value,
            idSitio: parseInt(document.getElementById('evento-sitio').value)
        };

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            };

            let response;
            
            if (isNew) {
                response = await fetch('http://localhost:8080/api/eventos', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(eventoData)
                });
            } else {
                response = await fetch(`http://localhost:8080/api/eventos/${id}`, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify(eventoData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar el evento');
            }

            this.closeModal('evento-modal');
            this.loadEventos();
        } catch (error) {
            handleApiError(error);
        }
    }

    async editEvento(id) {
        try {
            const response = await fetch(`http://localhost:8080/api/eventos/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar el evento');
            
            const evento = await response.json();
            this.openEventoModal(evento);
        } catch (error) {
            handleApiError(error);
        }
    }

    confirmDelete(id) {
        const modal = document.getElementById('confirm-modal');
        modal.style.display = 'flex';
        
        document.getElementById('confirm-ok').onclick = () => {
            this.deleteEvento(id);
            modal.style.display = 'none';
        };
    }

    async deleteEvento(id) {
        try {
            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            };

            const response = await fetch(`http://localhost:8080/api/eventos/${id}`, {
                method: 'DELETE',
                headers: headers
            });

            if (!response.ok) throw new Error('Error al eliminar el evento');
            
            this.loadEventos();
        } catch (error) {
            handleApiError(error);
        }
    }
}