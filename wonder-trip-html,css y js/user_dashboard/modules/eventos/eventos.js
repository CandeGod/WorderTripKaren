const API_BASE_URL = 'http://localhost:8080/api';
let currentEventId = null;

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
        window.location.href = '../../../index.html';
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

// Cargar eventos
async function loadEvents(filter = 'all', searchQuery = '') {
    try {
        showLoading();
        
        let url = `${API_BASE_URL}/eventos?page=0&size=20`;
        
        // Aplicar filtros
        if (filter === 'upcoming') {
            const today = new Date().toISOString().split('T')[0];
            url += `&fechaInicio=${today}&sort=fechaInicio,asc`;
        } else if (filter === 'past') {
            const today = new Date().toISOString().split('T')[0];
            url += `&fechaFin=${today}&sort=fechaFin,desc`;
        } else {
            url += '&sort=fechaInicio,desc';
        }
        
        // Aplicar búsqueda
        if (searchQuery) {
            url += `&titulo=${encodeURIComponent(searchQuery)}`;
        }
        
        const response = await fetch(url, {
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
                eventCard.className = 'event-card';
                eventCard.innerHTML = `
                    <img src="${event.imagenCartel || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}" alt="${event.titulo}" class="event-image">
                    <div class="event-body">
                        <h3 class="event-title">${event.titulo}</h3>
                        <p class="event-description">${event.descripcion}</p>
                        <div class="event-dates">
                            <span class="event-date"><i class="fas fa-calendar-day"></i> ${new Date(event.fechaInicio).toLocaleDateString('es-MX')}</span>
                            ${event.fechaFin ? `<span class="event-date"><i class="fas fa-calendar-check"></i> ${new Date(event.fechaFin).toLocaleDateString('es-MX')}</span>` : ''}
                        </div>
                    </div>
                    <div class="event-footer">
                        <span class="event-price">Gratis</span>
                        <button class="event-button" data-event-id="${event.idEvento}">Ver Detalles</button>
                    </div>
                `;
                eventsContainer.appendChild(eventCard);
                
                // Agregar evento al botón
                eventCard.querySelector('.event-button').addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEventDetails(event.idEvento);
                });
                
                // Agregar evento a la tarjeta completa
                eventCard.addEventListener('click', () => {
                    showEventDetails(event.idEvento);
                });
            });
        } else {
            eventsContainer.innerHTML = `
                <div class="no-events" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-light);">No se encontraron eventos</h3>
                    <p>Intenta con otros filtros o busca algo diferente</p>
                </div>
            `;
        }
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Mostrar detalles del evento
async function showEventDetails(eventId) {
    try {
        showLoading();
        currentEventId = eventId;
        
        const response = await fetch(`${API_BASE_URL}/eventos/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar detalles del evento');
        
        const event = await response.json();
        
        // Obtener información del sitio si está disponible
        let siteInfo = null;
        if (event.idSitio) {
            const siteResponse = await fetch(`${API_BASE_URL}/sitios-turisticos/${event.idSitio}`);
            if (siteResponse.ok) {
                siteInfo = await siteResponse.json();
            }
        }
        
        // Configurar el modal
        document.getElementById('eventModalTitle').textContent = event.titulo;
        
        const modalBody = document.getElementById('eventModalBody');
        modalBody.innerHTML = `
            <div class="event-modal-content">
                <img src="${event.imagenCartel || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}" alt="${event.titulo}" class="event-modal-image">
                
                <div class="event-modal-info">
                    <div class="event-info-group">
                        <h5><i class="fas fa-calendar-day"></i> Fecha de Inicio</h5>
                        <p>${new Date(event.fechaInicio).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    
                    ${event.fechaFin ? `
                    <div class="event-info-group">
                        <h5><i class="fas fa-calendar-check"></i> Fecha de Fin</h5>
                        <p>${new Date(event.fechaFin).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    ` : ''}
                    
                    ${siteInfo ? `
                    <div class="event-info-group">
                        <h5><i class="fas fa-map-marker-alt"></i> Ubicación</h5>
                        <p>${siteInfo.nombre}<br><small>${siteInfo.ubicacion}</small></p>
                    </div>
                    ` : ''}
                    
                    <div class="event-info-group">
                        <h5><i class="fas fa-tag"></i> Tipo de Evento</h5>
                        <p>Cultural</p>
                    </div>
                </div>
                
                <div class="event-modal-description">
                    <h5><i class="fas fa-align-left"></i> Descripción</h5>
                    <p>${event.descripcion}</p>
                </div>
            </div>
        `;
        
        // Mostrar el modal
        const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
        eventModal.show();
        
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Configurar búsqueda y filtros
function setupSearchAndFilters() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const filterSelect = document.getElementById('filter-select');
    
    // Buscar al hacer clic en el botón
    searchBtn.addEventListener('click', () => {
        loadEvents(filterSelect.value, searchInput.value);
    });
    
    // Buscar al presionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadEvents(filterSelect.value, searchInput.value);
        }
    });
    
    // Cambiar filtro
    filterSelect.addEventListener('change', () => {
        loadEvents(filterSelect.value, searchInput.value);
    });
}

// Configurar botón de reserva en el modal
function setupBookingButton() {
    document.getElementById('bookEventBtn').addEventListener('click', () => {
        showNotification('Redirigiendo a la página de reservas...');
        // Aquí podrías redirigir a una página de reservas o mostrar otro modal
        setTimeout(() => {
            window.location.href = `../paquetes/paquetes.html?eventId=${currentEventId}`;
        }, 1500);
    });
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
        setupSearchAndFilters();
        setupBookingButton();
        
        // Cargar eventos iniciales
        await loadEvents();

    } catch (error) {
        console.error("Error inicial:", error);
        window.location.href = '../../../index.html';
    }
});