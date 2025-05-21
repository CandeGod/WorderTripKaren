const API_BASE_URL = 'http://localhost:8080/api';

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
        window.location.href = '../index.html';
        return null;
    }
    return userData;
}

// Mostrar información del usuario
function displayUserInfo(userData) {
    document.getElementById('user-name').textContent = userData.nombre || 'Usuario';
    document.getElementById('welcome-name').textContent = userData.nombre || 'Usuario';
    
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

// Cargar eventos destacados
async function loadFeaturedEvents() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/eventos?page=0&size=5&sort=fechaInicio,asc`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar eventos');
        
        const eventsData = await response.json();
        const eventsContainer = document.getElementById('events-container');
        eventsContainer.innerHTML = '';

        if (eventsData.content && eventsData.content.length > 0) {
            eventsData.content.forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.className = 'swiper-slide';
                eventCard.innerHTML = `
                    <div class="event-card">
                        <img src="${event.imagenCartel || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}" alt="${event.titulo}" class="event-image">
                        <div class="event-content">
                            <h4 class="event-title">${event.titulo}</h4>
                            <p class="event-description">${event.descripcion.substring(0, 100)}...</p>
                            <div class="event-dates">
                                <span><i class="fas fa-calendar-day"></i> ${new Date(event.fechaInicio).toLocaleDateString('es-MX')}</span>
                                ${event.fechaFin ? `<span><i class="fas fa-calendar-check"></i> ${new Date(event.fechaFin).toLocaleDateString('es-MX')}</span>` : ''}
                            </div>
                            <a href="modules/eventos/eventos.html" class="event-button">Ver Detalles</a>
                        </div>
                    </div>
                `;
                eventsContainer.appendChild(eventCard);
            });

            // Inicializar Swiper para eventos
            new Swiper('.events-swiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                    640: {
                        slidesPerView: 2,
                    },
                    992: {
                        slidesPerView: 3,
                    },
                }
            });
        } else {
            eventsContainer.innerHTML = '<div class="col-12 text-center py-4"><p>No hay eventos disponibles</p></div>';
        }
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Cargar paquetes recomendados
async function loadRecommendedPackages() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/paquetes`, {  // Eliminé los parámetros de paginación
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar paquetes');
        
        const packagesData = await response.json();
        const packagesContainer = document.getElementById('packages-container');
        packagesContainer.innerHTML = '';

        // Cambio aquí - ya no usamos content porque no es paginado
        if (packagesData && packagesData.length > 0) {
            // Mostrar solo los primeros 4 paquetes
            packagesData.slice(0, 4).forEach(pkg => {
                const packageCard = document.createElement('div');
                packageCard.className = 'package-card';
                packageCard.innerHTML = `
                    <img src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd" alt="${pkg.nombre}" class="package-image">
                    <div class="package-body">
                        <h4 class="package-title">${pkg.nombre}</h4>
                        <p class="package-description">${pkg.descripcion.substring(0, 80)}...</p>
                    </div>
                    <div class="package-footer">
                        <span class="package-price">$${pkg.precio.toLocaleString()}</span>
                        <button class="package-button" onclick="window.location.href='modules/paquetes/paquetes.html'">Reservar</button>
                    </div>
                `;
                packagesContainer.appendChild(packageCard);
            });
        } else {
            packagesContainer.innerHTML = '<div class="col-12 text-center py-4"><p>No hay paquetes disponibles</p></div>';
        }
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Cargar compras recientes del usuario
async function loadRecentPurchases() {
    try {
        showLoading();
        const userData = getAuthenticatedUser();
        if (!userData) return;

        const response = await fetch(`${API_BASE_URL}/compras/usuario/${userData.id}`, {  // Eliminé parámetros de paginación
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar compras');
        
        const purchasesData = await response.json();
        const purchasesContainer = document.getElementById('purchases-container');
        purchasesContainer.innerHTML = '';

        // Cambio aquí - asumimos que es un array directo
        if (purchasesData && purchasesData.length > 0) {
            // Ordenar por fecha más reciente y tomar las primeras 3
            purchasesData
                .sort((a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra))
                .slice(0, 3)
                .forEach(purchase => {
                    const purchaseItem = document.createElement('div');
                    purchaseItem.className = 'purchase-item';
                    purchaseItem.innerHTML = `
                        <div class="purchase-info">
                            <h5 class="purchase-title">${purchase.paquete?.nombre || 'Paquete no disponible'}</h5>
                            <p class="purchase-date"><i class="far fa-calendar-alt"></i> ${new Date(purchase.fechaCompra).toLocaleDateString('es-MX')}</p>
                        </div>
                        <div class="purchase-details">
                            <span class="purchase-price">$${purchase.paquete?.precio?.toLocaleString() || '0'}</span>
                            <span class="purchase-status">Completado</span>
                        </div>
                    `;
                    purchasesContainer.appendChild(purchaseItem);
                });
        } else {
            purchasesContainer.innerHTML = '<div class="text-center py-4"><p>No tienes compras recientes</p></div>';
        }
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Cargar sitios turísticos populares
async function loadPopularSites() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/sitios-turisticos`, {  // Eliminé parámetros de paginación
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar sitios turísticos');
        
        const sitesData = await response.json();
        const sitesContainer = document.getElementById('sites-container');
        sitesContainer.innerHTML = '';

        // Cambio aquí - ya no usamos content
        if (sitesData && sitesData.length > 0) {
            // Mostrar solo los primeros 5 sitios
            sitesData.slice(0, 5).forEach(site => {
                const siteCard = document.createElement('div');
                siteCard.className = 'swiper-slide';
                siteCard.innerHTML = `
                    <div class="site-card">
                        <img src="${site.imagenPrincipal || 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6'}" alt="${site.nombre}" class="site-image">
                        <div class="site-content">
                            <h4 class="site-title">${site.nombre}</h4>
                            <p class="site-location"><i class="fas fa-map-marker-alt"></i> ${site.ubicacion}</p>
                            <button class="site-button" onclick="window.location.href='modules/sitios/sitios.html'">Ver Detalles</button>
                        </div>
                    </div>
                `;
                sitesContainer.appendChild(siteCard);
            });

            // Inicializar Swiper para sitios
            new Swiper('.sites-swiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    640: {
                        slidesPerView: 2,
                    },
                    992: {
                        slidesPerView: 3,
                    },
                }
            });
        } else {
            sitesContainer.innerHTML = '<div class="col-12 text-center py-4"><p>No hay sitios disponibles</p></div>';
        }
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

        // Cargar todos los datos del dashboard
        await Promise.all([
            loadFeaturedEvents(),
            loadRecommendedPackages(),
            loadRecentPurchases(),
            loadPopularSites()
        ]);

    } catch (error) {
        console.error("Error inicial:", error);
        window.location.href = '../index.html';
    }
});