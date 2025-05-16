import { handleApiError } from '../../../js/shared/utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const sitiosApp = new SitiosTuristicosApp();
    sitiosApp.init();
});

class SitiosTuristicosApp {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 10;
        this.searchQuery = '';
        this.hoteles = []; // Para asociar hoteles a sitios
    }

    async init() {
        await this.loadHoteles(); // Cargamos hoteles para el select
        this.setupEventListeners();
        this.loadSitiosTuristicos();
    }

    async loadHoteles() {
        try {
            const response = await fetch('http://localhost:8080/api/hoteles?page=0&size=100&sort=asc');
            if (!response.ok) throw new Error('Error al cargar hoteles');
            const data = await response.json();
            this.hoteles = Array.isArray(data) ? data : data.content || [];
        } catch (error) {
            handleApiError(error);
        }
    }

    setupEventListeners() {
        // Botón nuevo sitio
        document.getElementById('nuevo-sitio-btn').addEventListener('click', () => {
            this.openSitioModal();
        });

        // Búsqueda
        document.getElementById('buscar-sitio').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.debouncedSearch();
        });

        // Formulario sitio
        document.getElementById('sitio-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSitio();
        });

        // Botones modales
        document.getElementById('cancelar-sitio').addEventListener('click', () => {
            this.closeModal('sitio-modal');
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal('sitio-modal');
        });

        // Confirmación
        document.getElementById('confirm-cancel').addEventListener('click', () => {
            this.closeModal('confirm-modal');
        });
    }

    debouncedSearch = this.debounce(() => {
        this.loadSitiosTuristicos();
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

   async loadSitiosTuristicos() {
    const sitiosList = document.getElementById('sitios-list');
    sitiosList.innerHTML = '<div class="loading">Cargando sitios turísticos...</div>';

    try {
        let url = 'http://localhost:8080/api/sitios-turisticos';

        if (this.searchQuery) {
            url += `/${encodeURIComponent(this.searchQuery)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar sitios turísticos');

        const data = await response.json();

        // ✅ Si la respuesta es un objeto individual, conviértelo en array
        const sitios = Array.isArray(data) ? data : [data];

        this.displaySitios(sitios);
    } catch (error) {
        handleApiError(error);
        sitiosList.innerHTML = `<div class="error">Error al cargar sitios: ${error.message}</div>`;
    }
}


    displaySitios(sitios) {
        const sitiosList = document.getElementById('sitios-list');
        
        if (sitios.length === 0) {
            sitiosList.innerHTML = '<div class="loading">No se encontraron sitios turísticos</div>';
            return;
        }

        sitiosList.innerHTML = '';
        
        sitios.forEach(sitio => {
            const sitioCard = document.createElement('div');
            sitioCard.className = 'sitio-card';
            sitioCard.innerHTML = `
                <div class="sitio-imagen" style="background-image: url('${sitio.imagenPrincipal || 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6'}')">
                    ${!sitio.imagenPrincipal ? '<i class="fas fa-camera fa-3x"></i>' : ''}
                </div>
                <div class="sitio-body">
                    <h3 class="sitio-titulo">${sitio.nombre}</h3>
                    <p class="sitio-descripcion">${sitio.descripcion}</p>
                    <p class="sitio-ubicacion"><i class="fas fa-map-marker-alt"></i> ${sitio.ubicacion}</p>
                    <div class="sitio-actions">
                        <button class="btn-icon edit" data-id="${sitio.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" data-id="${sitio.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            sitiosList.appendChild(sitioCard);
        });

        // Agregar event listeners a los botones
        document.querySelectorAll('.btn-icon.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.editSitio(id);
            });
        });

        document.querySelectorAll('.btn-icon.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.confirmDelete(id);
            });
        });
    }

    openSitioModal(sitio = null) {
        const modal = document.getElementById('sitio-modal');
        const form = document.getElementById('sitio-form');
        
        if (sitio) {
            document.getElementById('modal-title').textContent = 'Editar Sitio Turístico';
            document.getElementById('sitio-id').value = sitio.id;
            document.getElementById('sitio-nombre').value = sitio.nombre;
            document.getElementById('sitio-descripcion').value = sitio.descripcion;
            document.getElementById('sitio-ubicacion').value = sitio.ubicacion;
            document.getElementById('sitio-imagen').value = sitio.imagenPrincipal;
            document.getElementById('sitio-hotel').value = sitio.hotelId || '';
        } else {
            document.getElementById('modal-title').textContent = 'Nuevo Sitio Turístico';
            form.reset();
        }
        
        this.populateHotelSelect();
        modal.style.display = 'flex';
    }

    populateHotelSelect() {
        const select = document.getElementById('sitio-hotel');
        select.innerHTML = '<option value="">Seleccione un hotel</option>';
        
        this.hoteles.forEach(hotel => {
            const option = document.createElement('option');
            option.value = hotel.id;
            option.textContent = hotel.nombre;
            select.appendChild(option);
        });
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    async saveSitio() {
        const form = document.getElementById('sitio-form');
        const id = document.getElementById('sitio-id').value;
        const isNew = !id;
        
        const sitioData = {
            nombre: document.getElementById('sitio-nombre').value,
            descripcion: document.getElementById('sitio-descripcion').value,
            ubicacion: document.getElementById('sitio-ubicacion').value,
            imagenPrincipal: document.getElementById('sitio-imagen').value,
            hotelId: document.getElementById('sitio-hotel').value || null
        };

        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.token || ''}`
            };

            let response;
            
            if (isNew) {
                response = await fetch('http://localhost:8080/api/sitios-turisticos', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(sitioData)
                });
            } else {
                response = await fetch(`http://localhost:8080/api/sitios-turisticos/${id}`, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify(sitioData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar el sitio turístico');
            }

            this.closeModal('sitio-modal');
            this.loadSitiosTuristicos();
        } catch (error) {
            handleApiError(error);
        }
    }

    async editSitio(id) {
        try {
            const response = await fetch(`http://localhost:8080/api/sitios-turisticos/${id}`);
            if (!response.ok) throw new Error('Error al cargar el sitio turístico');
            
            const sitio = await response.json();
            this.openSitioModal(sitio);
        } catch (error) {
            handleApiError(error);
        }
    }

    confirmDelete(id) {
        const modal = document.getElementById('confirm-modal');
        modal.style.display = 'flex';
        
        document.getElementById('confirm-ok').onclick = () => {
            this.deleteSitio(id);
            modal.style.display = 'none';
        };
    }

    /*async deleteSitio(id) {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const headers = {
                'Authorization': `Bearer ${userData.token || ''}`
            };

            const response = await fetch(`http://localhost:8080/api/sitios-turisticos/${id}`, {
                method: 'DELETE',
                headers: headers
            });

            if (!response.ok) throw new Error('Error al eliminar el sitio turístico');
            
            this.loadSitiosTuristicos();
        } catch (error) {
            handleApiError(error);
        }
    }*/
}