const API_BASE_URL = 'http://localhost:8080/api';
let currentSiteId = null;
let currentPage = 0;
const itemsPerPage = 15; // Mostrar 9 sitios por página

// Función para manejar errores de API
function handleApiError(error) {
    console.error('API Error:', error);
    showNotification(`Error: ${error.message || 'Ocurrió un error al procesar la solicitud'}`, 'error');
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para obtener el usuario autenticado
function getAuthenticatedUser() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || userData.rol !== 'USUARIO') {
        window.location.href = '../../index.html';
        return null;
    }
    return userData;
}

// Mostrar información del usuario
function displayUserInfo(userData) {
    document.getElementById('user-name').textContent = userData.nombre || 'Usuario';
    
    const userAvatar = document.getElementById('user-avatar');
    if (userData.imagenPerfil) {
        userAvatar.src = userData.imagenPerfil;
    }
}

// Configurar logout
function setupLogout() {
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        window.location.href = '../../../index.html';
    });
}

// Cargar sitios turísticos paginados
async function loadSites(page = 0) {
    try {
        showLoading();
        currentPage = page;
        
        const url = `${API_BASE_URL}/sitios-turisticos/paginado?page=${page}&size=${itemsPerPage}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar sitios turísticos');
        
        const sitesData = await response.json();
        const sitesContainer = document.getElementById('sites-container');
        sitesContainer.innerHTML = '';

        if (sitesData.content && sitesData.content.length > 0) {
            for (const site of sitesData.content) {
                // Obtener hotel asociado si está disponible
                let hotelInfo = null;
                if (site.hotelId) {
                    try {
                        const hotelResponse = await fetch(`${API_BASE_URL}/hoteles/${site.hotelId}`);
                        if (hotelResponse.ok) {
                            hotelInfo = await hotelResponse.json();
                        }
                    } catch (error) {
                        console.error('Error al cargar hotel:', error);
                    }
                }
                
                // Obtener tours asociados si están disponibles
                let toursInfo = [];
                try {
                    const toursResponse = await fetch(`${API_BASE_URL}/tours?page=0&size=3&idSitio=${site.id}`);
                    if (toursResponse.ok) {
                        const toursData = await toursResponse.json();
                        toursInfo = toursData.content || [];
                    }
                } catch (error) {
                    console.error('Error al cargar tours:', error);
                }
                
                const siteCard = document.createElement('div');
                siteCard.className = 'site-card';
                siteCard.innerHTML = `
                    ${hotelInfo ? `<span class="site-badge">Hotel disponible</span>` : ''}
                    <img src="${site.imagenPrincipal || 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6'}" alt="${site.nombre}" class="site-image">
                    <div class="site-body">
                        <h3 class="site-title">${site.nombre}</h3>
                        <p class="site-description">${site.descripcion}</p>
                        <div class="site-location">
                            <i class="fas fa-map-marker-alt"></i> ${site.ubicacion}
                        </div>
                    </div>
                    <div class="site-footer">
                        <span class="site-price">${toursInfo.length} Tours disponibles</span>
                        <button class="site-button" data-site-id="${site.id}">Ver Detalles</button>
                    </div>
                `;
                sitesContainer.appendChild(siteCard);
                
                // Agregar evento al botón
                siteCard.querySelector('.site-button').addEventListener('click', (e) => {
                    e.stopPropagation();
                    showSiteDetails(site.id);
                });
                
                // Agregar evento a la tarjeta completa
                siteCard.addEventListener('click', () => {
                    showSiteDetails(site.id);
                });
            }
            
            // Configurar paginación
            setupPagination(sitesData.totalPages, page);
        } else {
            sitesContainer.innerHTML = `
                <div class="no-sites" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-light);">No se encontraron sitios</h3>
                </div>
            `;
            
            // Limpiar paginación si no hay resultados
            document.getElementById('pagination').innerHTML = '';
        }
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Configurar paginación
function setupPagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    // Botón Anterior
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 0 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 0) {
            loadSites(currentPage - 1);
        }
    });
    pagination.appendChild(prevLi);
    
    // Números de página
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
        pageLi.addEventListener('click', (e) => {
            e.preventDefault();
            loadSites(i);
        });
        pagination.appendChild(pageLi);
    }
    
    // Botón Siguiente
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages - 1) {
            loadSites(currentPage + 1);
        }
    });
    pagination.appendChild(nextLi);
}

// Mostrar detalles del sitio
async function showSiteDetails(siteId) {
    try {
        showLoading();
        currentSiteId = siteId;
        
        const response = await fetch(`${API_BASE_URL}/sitios-turisticos/${siteId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar detalles del sitio');
        
        const site = await response.json();
        
        // Obtener hotel asociado si está disponible
        let hotelInfo = null;
        if (site.hotelId) {
            const hotelResponse = await fetch(`${API_BASE_URL}/hoteles/${site.hotelId}`);
            if (hotelResponse.ok) {
                hotelInfo = await hotelResponse.json();
            }
        }
        
        // Obtener tours asociados si están disponibles
        let toursInfo = [];
        const toursResponse = await fetch(`${API_BASE_URL}/tours?page=0&size=10&idSitio=${site.id}`);
        if (toursResponse.ok) {
            const toursData = await toursResponse.json();
            toursInfo = toursData.content || [];
        }
        
        // Configurar el modal
        document.getElementById('siteModalTitle').textContent = site.nombre;
        
        const modalBody = document.getElementById('siteModalBody');
        modalBody.innerHTML = `
            <div class="site-modal-content">
                <img src="${site.imagenPrincipal || 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6'}" alt="${site.nombre}" class="site-modal-image">
                
                <div class="site-modal-info">
                    <div class="site-info-group">
                        <h5><i class="fas fa-map-marker-alt"></i> Ubicación</h5>
                        <p>${site.ubicacion}</p>
                    </div>
                    
                    ${hotelInfo ? `
                    <div class="site-info-group">
                        <h5><i class="fas fa-hotel"></i> Hotel Recomendado</h5>
                        <p>${hotelInfo.nombre}<br><small>${hotelInfo.direccion}</small></p>
                    </div>
                    ` : ''}
                </div>
                
                <div class="site-modal-description">
                    <h5><i class="fas fa-align-left"></i> Descripción</h5>
                    <p>${site.descripcion}</p>
                </div>
                
                ${toursInfo.length > 0 ? `
                <div class="site-tours">
                    <h5><i class="fas fa-route"></i> Tours Disponibles</h5>
                    ${toursInfo.map(tour => `
                        <div class="tour-item">
                            <img src="${tour.imagenPortada || 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6'}" alt="${tour.nombre}" class="tour-image">
                            <div class="tour-info">
                                <h6>${tour.nombre}</h6>
                                <p>Duración: ${tour.duracion} horas</p>
                            </div>
                            <div class="tour-price">$${tour.precio}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
        
        // Mostrar el modal
        const siteModal = new bootstrap.Modal(document.getElementById('siteModal'));
        siteModal.show();
        
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Mostrar modal de carga
function showLoading() {
    document.getElementById('loading-modal').style.display = 'flex';
}

// Ocultar modal de carga
function hideLoading() {
    document.getElementById('loading-modal').style.display = 'none';
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const userData = getAuthenticatedUser();
        if (!userData) return;

        displayUserInfo(userData);
        setupLogout();
        
        // Cargar sitios iniciales (primera página)
        await loadSites(0);

    } catch (error) {
        console.error("Error inicial:", error);
        window.location.href = '../../index.html';
    }
});