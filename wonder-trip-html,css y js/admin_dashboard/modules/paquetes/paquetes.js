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
    
    // Inicializar la aplicación de paquetes
    const paquetesApp = new PaquetesApp();
    paquetesApp.init();
});

class PaquetesApp {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 10;
        this.searchQuery = '';
        this.sitiosTuristicos = [];
        this.selectedSitios = new Set();
    }

    async init() {
        await this.loadSitiosTuristicos();
        this.setupEventListeners();
        this.loadPaquetes();
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
        } catch (error) {
            handleApiError(error);
        }
    }

    setupEventListeners() {
        // Botón nuevo paquete
        document.getElementById('nuevo-paquete-btn').addEventListener('click', () => {
            this.openPaqueteModal();
        });

        // Búsqueda
        document.getElementById('buscar-paquete').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.debouncedSearch();
        });

        // Formulario paquete
        document.getElementById('paquete-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePaquete();
        });

        // Botones modales
        document.getElementById('cancelar-paquete').addEventListener('click', () => {
            this.closeModal('paquete-modal');
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal('paquete-modal');
        });

        // Confirmación
        document.getElementById('confirm-cancel').addEventListener('click', () => {
            this.closeModal('confirm-modal');
        });
    }

    debouncedSearch = this.debounce(() => {
        this.loadPaquetes();
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

    async loadPaquetes() {
        const paquetesList = document.getElementById('paquetes-list');
        paquetesList.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
        
        try {
            let paquetes = [];

            if (this.searchQuery && !isNaN(this.searchQuery)) {
                // Buscar por ID
                const response = await fetch(`http://localhost:8080/api/paquetes/${this.searchQuery}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    }
                });
                if (response.ok) {
                    const paquete = await response.json();
                    paquetes = [paquete]; // Mostrar en arreglo
                }
            } else {
                // Cargar todos los paquetes
                const response = await fetch('http://localhost:8080/api/paquetes', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    }
                });
                if (!response.ok) throw new Error('Error al cargar paquetes');
                paquetes = await response.json();
            }

            this.displayPaquetes(paquetes);
        } catch (error) {
            handleApiError(error);
            paquetesList.innerHTML = `<div class="alert alert-danger">Error al cargar paquetes: ${error.message}</div>`;
        }
    }

    displayPaquetes(paquetes) {
        const paquetesList = document.getElementById('paquetes-list');
        
        if (paquetes.length === 0) {
            paquetesList.innerHTML = '<div class="text-center py-3">No se encontraron paquetes</div>';
            return;
        }

        paquetesList.innerHTML = '';
        
        paquetes.forEach(paquete => {
            const paqueteCard = document.createElement('div');
            paqueteCard.className = 'paquete-card';
            paqueteCard.innerHTML = `
                <div class="paquete-imagen">
                    <i class="fas fa-suitcase fa-3x"></i>
                </div>
                <div class="paquete-body">
                    <h3 class="paquete-titulo">${paquete.nombre}</h3>
                    <p class="paquete-descripcion">${paquete.descripcion}</p>
                    <div class="paquete-precio">$${paquete.precio.toLocaleString()}</div>
                    <div class="paquete-actions">
                        <button class="btn-icon edit" data-id="${paquete.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" data-id="${paquete.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            paquetesList.appendChild(paqueteCard);
        });

        // Agregar event listeners a los botones
        document.querySelectorAll('.btn-icon.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.editPaquete(id);
            });
        });

        document.querySelectorAll('.btn-icon.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.confirmDelete(id);
            });
        });
    }

    openPaqueteModal(paquete = null) {
        const modal = document.getElementById('paquete-modal');
        const form = document.getElementById('paquete-form');
        
        if (paquete) {
            document.getElementById('modal-title').textContent = 'Editar Paquete';
            document.getElementById('paquete-id').value = paquete.id;
            document.getElementById('paquete-nombre').value = paquete.nombre;
            document.getElementById('paquete-descripcion').value = paquete.descripcion;
            document.getElementById('paquete-precio').value = paquete.precio;
            
            // Cargar sitios incluidos
            this.selectedSitios = new Set(paquete.sitiosIncluidos || []);
        } else {
            document.getElementById('modal-title').textContent = 'Nuevo Paquete';
            form.reset();
            this.selectedSitios = new Set();
        }
        
        this.populateSitiosDisponibles();
        modal.style.display = 'flex';
    }

    populateSitiosDisponibles() {
        const container = document.getElementById('sitios-disponibles');
        container.innerHTML = '';
        
        this.sitiosTuristicos.forEach(sitio => {
            const sitioItem = document.createElement('div');
            sitioItem.className = 'sitio-item';
            
            const checkboxId = `sitio-${sitio.id}`;
            const isChecked = this.selectedSitios.has(sitio.id);
            
            sitioItem.innerHTML = `
                <input type="checkbox" id="${checkboxId}" ${isChecked ? 'checked' : ''}>
                <label for="${checkboxId}">${sitio.nombre}</label>
            `;
            
            const checkbox = sitioItem.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedSitios.add(sitio.id);
                } else {
                    this.selectedSitios.delete(sitio.id);
                }
            });
            
            container.appendChild(sitioItem);
        });
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    async savePaquete() {
        const form = document.getElementById('paquete-form');
        const id = document.getElementById('paquete-id').value;
        const isNew = !id;
        
        const paqueteData = {
            nombre: document.getElementById('paquete-nombre').value,
            descripcion: document.getElementById('paquete-descripcion').value,
            precio: parseFloat(document.getElementById('paquete-precio').value)
        };

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            };

            let response;
            
            if (isNew) {
                response = await fetch('http://localhost:8080/api/paquetes', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(paqueteData)
                });
            } else {
                response = await fetch(`http://localhost:8080/api/paquetes/${id}`, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify(paqueteData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar el paquete');
            }

            const savedPaquete = await response.json();

            // Asociar sitios al paquete
            for (const sitioId of this.selectedSitios) {
                await fetch('http://localhost:8080/api/paquetes/agregar-sitio', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        paqueteId: savedPaquete.id,
                        sitioId: sitioId
                    })
                });
            }

            this.closeModal('paquete-modal');
            this.loadPaquetes();
        } catch (error) {
            handleApiError(error);
        }
    }

    async editPaquete(id) {
        try {
            const response = await fetch(`http://localhost:8080/api/paquetes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar el paquete');
            
            const paquete = await response.json();
            this.openPaqueteModal(paquete);
        } catch (error) {
            handleApiError(error);
        }
    }

    confirmDelete(id) {
        const modal = document.getElementById('confirm-modal');
        modal.style.display = 'flex';
        
        document.getElementById('confirm-ok').onclick = () => {
            this.deletePaquete(id);
            modal.style.display = 'none';
        };
    }

    async deletePaquete(id) {
        try {
            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            };

            const response = await fetch(`http://localhost:8080/api/paquetes/${id}`, {
                method: 'DELETE',
                headers: headers
            });

            if (!response.ok) throw new Error('Error al eliminar el paquete');
            
            this.loadPaquetes();
        } catch (error) {
            handleApiError(error);
        }
    }
}