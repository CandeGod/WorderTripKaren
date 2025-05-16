import { handleApiError } from '../../../js/shared/utils.js';



document.addEventListener('DOMContentLoaded', function() {
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
            const response = await fetch('http://localhost:8080/api/sitios-turisticos');
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
        eventosList.innerHTML = '<div class="loading">Cargando eventos...</div>';
        
        try {
            const url = new URL('http://localhost:8080/api/eventos');
            url.searchParams.append('page', this.currentPage);
            url.searchParams.append('size', this.pageSize);
            url.searchParams.append('sort', this.sortOrder);
            
            if (this.searchQuery) {
                url.searchParams.append('search', this.searchQuery);
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar eventos');
            
            const data = await response.json();
            this.displayEventos(data.content);
            this.setupPagination(data.totalPages, this.currentPage);
        } catch (error) {
            handleApiError(error);
            eventosList.innerHTML = `<div class="error">Error al cargar eventos: ${error.message}</div>`;
        }
    }

    displayEventos(eventos) {
        const eventosList = document.getElementById('eventos-list');
        
        if (eventos.length === 0) {
            eventosList.innerHTML = '<div class="loading">No se encontraron eventos</div>';
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
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '&laquo;';
        prevButton.disabled = currentPage === 0;
        prevButton.addEventListener('click', () => {
            if (currentPage > 0) {
                this.currentPage--;
                this.loadEventos();
            }
        });
        pagination.appendChild(prevButton);
        
        // Números de página
        for (let i = 0; i < totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i + 1;
            if (i === currentPage) {
                pageButton.className = 'active';
            }
            pageButton.addEventListener('click', () => {
                this.currentPage = i;
                this.loadEventos();
            });
            pagination.appendChild(pageButton);
        }
        
        // Botón Siguiente
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.disabled = currentPage === totalPages - 1;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                this.currentPage++;
                this.loadEventos();
            }
        });
        pagination.appendChild(nextButton);
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
            const userData = JSON.parse(localStorage.getItem('userData'));
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.token || ''}`
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
            const response = await fetch(`http://localhost:8080/api/eventos/${id}`);
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
            const userData = JSON.parse(localStorage.getItem('userData'));
            const headers = {
                'Authorization': `Bearer ${userData.token || ''}`
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