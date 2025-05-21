const API_BASE_URL = 'http://localhost:8080/api';

// Variables globales
let currentPage = 0;
const pageSize = 8;
let allTours = [];
let filteredTours = [];

// Función para manejar errores de API
function handleApiError(error) {
    console.error('API Error:', error);
    showNotification(`Error: ${error.message || 'Ocurrió un error al procesar la solicitud'}`, 'error');
}

// Mostrar información del usuario
function displayUserInfo(userData) {
    document.getElementById('user-name').textContent = userData.nombre || 'Usuario';

    const userAvatar = document.getElementById('user-avatar');
    if (userData.imagenPerfil) {
        userAvatar.src = userData.imagenPerfil;
    }
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

// Mostrar modal de carga
function showLoading() {
    document.getElementById('loading-modal').style.display = 'flex';
}

// Ocultar modal de carga
function hideLoading() {
    document.getElementById('loading-modal').style.display = 'none';
}

// Cargar tours con paginación
async function loadTours(page = 0, size = pageSize, sort = 'asc') {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/tours?page=${page}&size=${size}&sort=${sort}`);
        
        if (!response.ok) throw new Error('Error al cargar tours');
        
        const data = await response.json();
        allTours = data.content;
        filteredTours = [...allTours];
        
        // Mostrar el primer tour como destacado
        if (allTours.length > 0) {
            displayFeaturedTour(allTours[0]);
        }
        
        displayTours(allTours);
        updatePaginationControls(page, data.totalPages);
        
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Mostrar tour destacado
function displayFeaturedTour(tour) {
    const featuredTourSection = document.getElementById('featured-tour');
    featuredTourSection.style.backgroundImage = `url(${tour.imagenPortada})`;
    
    document.getElementById('featured-tour-title').textContent = tour.nombre;
    document.getElementById('featured-tour-description').textContent = tour.descripcion;
    document.getElementById('featured-tour-duration').textContent = tour.duracion;
    document.getElementById('featured-tour-price').textContent = tour.precio;
    
    // Configurar botón de reserva
    const featuredTourBtn = document.getElementById('featured-tour-btn');
    featuredTourBtn.onclick = () => {
        prepareReservationModal(tour);
    };
}

// Mostrar lista de tours
function displayTours(tours) {
    const toursList = document.getElementById('tours-list');
    toursList.innerHTML = '';
    
    if (tours.length === 0) {
        toursList.innerHTML = `
            <div class="no-tours" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <i class="fas fa-route" style="font-size: 2rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-light);">No se encontraron tours que coincidan con tus criterios</p>
            </div>
        `;
        return;
    }
    
    tours.forEach(tour => {
        const tourCard = document.createElement('div');
        tourCard.className = 'tour-card';
        tourCard.innerHTML = `
            <div class="tour-image" style="background-image: url(${tour.imagenPortada})">
                <span class="tour-badge">${tour.duracion} hrs</span>
            </div>
            <div class="tour-content">
                <h3 class="tour-title">${tour.nombre}</h3>
                <p class="tour-description">${tour.descripcion}</p>
                
                <div class="tour-meta-list">
                    <div class="tour-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${tour.duracion} horas</span>
                    </div>
                    <div class="tour-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Sitio ${tour.idSitio}</span>
                    </div>
                </div>
                
                <div class="tour-price">$${tour.precio}</div>
                
                <div class="tour-actions">
                    <button class="btn-tour-detail" data-tour-id="${tour.idTour}">
                        <i class="fas fa-info-circle"></i> Detalles
                    </button>
                    <button class="btn-tour-book" data-tour-id="${tour.idTour}">
                        <i class="fas fa-calendar-check"></i> Reservar
                    </button>
                </div>
            </div>
        `;
        
        toursList.appendChild(tourCard);
    });
    
    // Configurar eventos para los botones
    document.querySelectorAll('.btn-tour-detail').forEach(btn => {
        btn.addEventListener('click', function() {
            const tourId = this.getAttribute('data-tour-id');
            showTourDetails(tourId);
        });
    });
    
    document.querySelectorAll('.btn-tour-book').forEach(btn => {
        btn.addEventListener('click', function() {
            const tourId = this.getAttribute('data-tour-id');
            const tour = allTours.find(t => t.idTour == tourId);
            if (tour) prepareReservationModal(tour);
        });
    });
}

// Actualizar controles de paginación
function updatePaginationControls(currentPage, totalPages) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');
    
    pageIndicator.textContent = `Página ${currentPage + 1} de ${totalPages}`;
    
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage + 1 >= totalPages;
    
    // Configurar eventos de paginación
    prevBtn.onclick = () => {
        if (currentPage > 0) {
            loadTours(currentPage - 1);
        }
    };
    
    nextBtn.onclick = () => {
        if (currentPage + 1 < totalPages) {
            loadTours(currentPage + 1);
        }
    };
}

// Filtrar tours
function filterTours() {
    const searchTerm = document.getElementById('tour-search').value.toLowerCase();
    const durationFilter = document.getElementById('duration-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    
    filteredTours = allTours.filter(tour => {
        // Filtrar por búsqueda
        const matchesSearch = tour.nombre.toLowerCase().includes(searchTerm) || 
                             tour.descripcion.toLowerCase().includes(searchTerm);
        
        // Filtrar por duración
        let matchesDuration = true;
        if (durationFilter !== 'all') {
            const [min, max] = durationFilter.split('-').map(Number);
            if (durationFilter === '7+') {
                matchesDuration = tour.duracion >= 7;
            } else {
                matchesDuration = tour.duracion >= min && tour.duracion <= max;
            }
        }
        
        // Filtrar por precio
        let matchesPrice = true;
        if (priceFilter !== 'all') {
            const [min, max] = priceFilter.split('-').map(Number);
            if (priceFilter === '1001+') {
                matchesPrice = tour.precio >= 1001;
            } else {
                matchesPrice = tour.precio >= min && tour.precio <= max;
            }
        }
        
        return matchesSearch && matchesDuration && matchesPrice;
    });
    
    displayTours(filteredTours);
    document.getElementById('page-indicator').textContent = `Mostrando ${filteredTours.length} resultados`;
}

// Preparar modal de reserva
function prepareReservationModal(tour) {
    const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
    
    document.getElementById('reservationModalTitle').textContent = `Reservar: ${tour.nombre}`;
    document.getElementById('summary-tour-name').textContent = tour.nombre;
    document.getElementById('summary-unit-price').textContent = `$${tour.precio}`;
    
    // Configurar fecha mínima (hoy)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reservation-date').min = today;
    
    // Actualizar precio total cuando cambia el número de personas
    document.getElementById('participants').addEventListener('change', function() {
        const participants = parseInt(this.value);
        const unitPrice = tour.precio;
        const totalPrice = participants * unitPrice;
        
        document.getElementById('summary-participants').textContent = participants;
        document.getElementById('summary-total-price').textContent = `$${totalPrice}`;
    });
    
    // Configurar botón de confirmación
    document.getElementById('confirm-reservation').onclick = async () => {
        await makeReservation(tour);
        modal.hide();
    };
    
    // Mostrar modal
    modal.show();
}

// Realizar reserva
async function makeReservation(tour) {
    try {
        const userData = getAuthenticatedUser();
        if (!userData) return;
        
        const reservationDate = document.getElementById('reservation-date').value;
        const participants = parseInt(document.getElementById('participants').value);
        const paymentMethod = document.getElementById('payment-method').value;
        
        if (!reservationDate) {
            showNotification('Por favor selecciona una fecha', 'error');
            return;
        }
        
        // Aquí iría la lógica para crear la reserva en el backend
        // Por ahora simulamos que fue exitoso
        showNotification(`Reserva confirmada para el tour ${tour.nombre}`, 'success');
        
    } catch (error) {
        handleApiError(error);
    }
}

// Mostrar detalles del tour (simulado)
function showTourDetails(tourId) {
    const tour = allTours.find(t => t.idTour == tourId);
    if (!tour) return;
    
    // Aquí podrías implementar un modal o página de detalles más completa
    showNotification(`Detalles del tour: ${tour.nombre}`, 'info');
}

// Configurar eventos de filtros
function setupFilters() {
    document.getElementById('apply-filters').addEventListener('click', filterTours);
    
    // Aplicar filtros al presionar Enter en la búsqueda
    document.getElementById('tour-search').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filterTours();
        }
    });
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

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const userData = getAuthenticatedUser();
        if (!userData) return;

        // Mostrar información del usuario
        displayUserInfo(userData);
        
        setupFilters();
        setupLogout();
        
        // Cargar tours
        await loadTours(currentPage);

    } catch (error) {
        console.error("Error inicial:", error);
        window.location.href = '../../index.html';
    }
});