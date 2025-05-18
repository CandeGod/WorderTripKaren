const API_BASE_URL = 'http://localhost:8080/api';
let currentPage = 0;
let totalPages = 1;
let currentHotelId = null;

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
    document.getElementById('logout-btn').addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        window.location.href = '../../index.html';
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

// Cargar hoteles con paginación
async function loadHotels(page = 0, size = 12) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/hoteles?page=${page}&size=${size}&sort=asc`);
        
        if (!response.ok) throw new Error('Error al cargar hoteles');
        
        const data = await response.json();
        displayHotels(data.content);
        updatePaginationControls(page, data.totalPages);
        
        // Mostrar los primeros 3 hoteles como destacados
        if (data.content.length > 0) {
            displayFeaturedHotels(data.content.slice(0, 3));
        }
        
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Mostrar hoteles destacados
function displayFeaturedHotels(hotels) {
    const featuredContainer = document.getElementById('featured-hotels-container');
    featuredContainer.innerHTML = '';
    
    hotels.forEach(hotel => {
        const featuredCard = document.createElement('div');
        featuredCard.className = 'featured-hotel-card';
        featuredCard.innerHTML = `
            <div class="featured-hotel-image" style="background-image: url(${hotel.imagenPrincipal || 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'})">
                <span class="featured-hotel-badge">Destacado</span>
            </div>
            <div class="featured-hotel-content">
                <h3 class="featured-hotel-title">${hotel.nombre}</h3>
                <p class="featured-hotel-location">
                    <i class="fas fa-map-marker-alt"></i> ${hotel.direccion}
                </p>
                <div class="featured-hotel-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <span>(4.8)</span>
                </div>
                <div class="featured-hotel-price">$${Math.floor(Math.random() * 2000) + 1000} <span>/ noche</span></div>
                <div class="featured-hotel-actions">
                    <button class="btn-details" data-hotel-id="${hotel.id}">Ver Detalles</button>
                    <button class="btn-book" data-hotel-id="${hotel.id}">Reservar</button>
                </div>
            </div>
        `;
        
        featuredContainer.appendChild(featuredCard);
        
        // Configurar eventos para los botones
        featuredCard.querySelector('.btn-details').addEventListener('click', () => {
            showHotelDetails(hotel.id);
        });
        
        featuredCard.querySelector('.btn-book').addEventListener('click', () => {
            prepareBookingModal(hotel);
        });
    });
}

// Mostrar todos los hoteles
function displayHotels(hotels) {
    const hotelsGrid = document.getElementById('hotels-grid');
    hotelsGrid.innerHTML = '';
    
    if (hotels.length === 0) {
        hotelsGrid.innerHTML = `
            <div class="no-hotels" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <i class="fas fa-hotel" style="font-size: 2rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-light);">No se encontraron hoteles que coincidan con tus criterios</p>
            </div>
        `;
        return;
    }
    
    hotels.forEach(hotel => {
        const hotelCard = document.createElement('div');
        hotelCard.className = 'hotel-card';
        hotelCard.innerHTML = `
            <div class="hotel-image" style="background-image: url(${hotel.imagenPrincipal || 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'})"></div>
            <div class="hotel-content">
                <h3 class="hotel-title">${hotel.nombre}</h3>
                <p class="hotel-location">
                    <i class="fas fa-map-marker-alt"></i> ${hotel.direccion}
                </p>
                <p class="hotel-description">${hotel.descripcion || 'Descripción no disponible'}</p>
                <div class="hotel-meta">
                    <div class="hotel-rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                        <span>4.5</span>
                    </div>
                    <div class="hotel-price">$${Math.floor(Math.random() * 2000) + 800}</div>
                </div>
                <div class="hotel-actions">
                    <button class="btn-hotel-detail" data-hotel-id="${hotel.id}">Detalles</button>
                </div>
            </div>
        `;
        
        hotelsGrid.appendChild(hotelCard);
        
        // Configurar evento para el botón de detalles
        hotelCard.querySelector('.btn-hotel-detail').addEventListener('click', () => {
            showHotelDetails(hotel.id);
        });
    });
}

// Mostrar detalles del hotel
async function showHotelDetails(hotelId) {
    try {
        showLoading();
        currentHotelId = hotelId;
        
        const response = await fetch(`${API_BASE_URL}/hoteles/${hotelId}`);
        if (!response.ok) throw new Error('Error al cargar detalles del hotel');
        
        const hotel = await response.json();
        
        // Configurar el modal
        document.getElementById('hotelModalTitle').textContent = hotel.nombre;
        
        const modalBody = document.getElementById('hotelModalBody');
        modalBody.innerHTML = `
            <div class="hotel-modal-header" style="background-image: url(${hotel.imagenPrincipal || 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'})">
                <div class="hotel-modal-overlay"></div>
                <h2 class="hotel-modal-title">${hotel.nombre}</h2>
                <p class="hotel-modal-location">
                    <i class="fas fa-map-marker-alt"></i> ${hotel.direccion}
                </p>
                <div class="hotel-modal-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                    <span>4.5 (128 reseñas)</span>
                </div>
            </div>
            <div class="hotel-modal-body">
                <div class="hotel-modal-description">
                    <h4>Descripción</h4>
                    <p>${hotel.descripcion || 'Descripción no disponible'}</p>
                    <p>Disfruta de una experiencia única en este magnífico hotel ubicado en el corazón de la ciudad. Con instalaciones de primera clase y un servicio excepcional, tu estancia será inolvidable.</p>
                </div>
                
                <div class="hotel-modal-amenities">
                    <h4>Servicios y Amenidades</h4>
                    <div class="amenities-grid">
                        <div class="amenity-item">
                            <i class="fas fa-wifi"></i>
                            <span>Wi-Fi gratis</span>
                        </div>
                        <div class="amenity-item">
                            <i class="fas fa-swimming-pool"></i>
                            <span>Alberca</span>
                        </div>
                        <div class="amenity-item">
                            <i class="fas fa-utensils"></i>
                            <span>Restaurante</span>
                        </div>
                        <div class="amenity-item">
                            <i class="fas fa-spa"></i>
                            <span>Spa</span>
                        </div>
                        <div class="amenity-item">
                            <i class="fas fa-dumbbell"></i>
                            <span>Gimnasio</span>
                        </div>
                        <div class="amenity-item">
                            <i class="fas fa-parking"></i>
                            <span>Estacionamiento</span>
                        </div>
                        <div class="amenity-item">
                            <i class="fas fa-concierge-bell"></i>
                            <span>Servicio a la habitación</span>
                        </div>
                        <div class="amenity-item">
                            <i class="fas fa-cocktail"></i>
                            <span>Bar</span>
                        </div>
                    </div>
                </div>
                
                <div class="hotel-modal-gallery">
                    <h4>Galería</h4>
                    <div class="gallery-grid">
                        <div class="gallery-item" style="background-image: url('https://images.unsplash.com/photo-1566073771259-6a8506099945')"></div>
                        <div class="gallery-item" style="background-image: url('https://images.unsplash.com/photo-1564501049412-61c2a3083791')"></div>
                        <div class="gallery-item" style="background-image: url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b')"></div>
                        <div class="gallery-item" style="background-image: url('https://images.unsplash.com/photo-1566073771259-6a8506099945')"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Mostrar el modal
        const hotelModal = new bootstrap.Modal(document.getElementById('hotelModal'));
        hotelModal.show();
        
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Preparar modal de reserva
function prepareBookingModal(hotel) {
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    
    document.getElementById('bookingModalTitle').textContent = `Reservar: ${hotel.nombre}`;
    document.getElementById('summary-room-type').textContent = 'Habitación Estándar';
    document.getElementById('summary-night-price').textContent = `$${Math.floor(Math.random() * 2000) + 800}`;
    
    // Configurar fechas mínimas
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('check-in-date').min = today;
    document.getElementById('check-out-date').min = today;
    
    // Actualizar precio total cuando cambian las fechas
    document.getElementById('check-in-date').addEventListener('change', updateBookingSummary);
    document.getElementById('check-out-date').addEventListener('change', updateBookingSummary);
    document.getElementById('room-type').addEventListener('change', updateBookingSummary);
    
    // Configurar botón de confirmación
    document.getElementById('confirm-booking').onclick = async () => {
        await makeReservation(hotel);
        modal.hide();
    };
    
    // Mostrar modal
    modal.show();
    updateBookingSummary();
}

// Actualizar resumen de reserva
function updateBookingSummary() {
    const checkInDate = document.getElementById('check-in-date').value;
    const checkOutDate = document.getElementById('check-out-date').value;
    const roomType = document.getElementById('room-type').value;
    const nightPrice = parseInt(document.getElementById('summary-night-price').textContent.replace('$', ''));
    
    if (checkInDate && checkOutDate) {
        const nights = calculateNights(checkInDate, checkOutDate);
        document.getElementById('summary-nights').textContent = nights;
        
        let roomTypeText = 'Habitación Estándar';
        let finalPrice = nightPrice * nights;
        
        if (roomType === 'deluxe') {
            roomTypeText = 'Habitación Deluxe';
            finalPrice = (nightPrice + 500) * nights;
        } else if (roomType === 'suite') {
            roomTypeText = 'Suite';
            finalPrice = (nightPrice + 1000) * nights;
        }
        
        document.getElementById('summary-room-type').textContent = roomTypeText;
        document.getElementById('summary-total-price').textContent = `$${finalPrice}`;
    }
}

// Calcular noches entre dos fechas
function calculateNights(checkIn, checkOut) {
    const oneDay = 24 * 60 * 60 * 1000; // horas*minutos*segundos*milisegundos
    const firstDate = new Date(checkIn);
    const secondDate = new Date(checkOut);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

// Realizar reserva
async function makeReservation(hotel) {
    try {
        const userData = getAuthenticatedUser();
        if (!userData) return;
        
        const checkInDate = document.getElementById('check-in-date').value;
        const checkOutDate = document.getElementById('check-out-date').value;
        const guests = document.getElementById('guests').value;
        const roomType = document.getElementById('room-type').value;
        
        if (!checkInDate || !checkOutDate) {
            showNotification('Por favor selecciona fechas de entrada y salida', 'error');
            return;
        }
        
        // Simular reserva exitosa
        showNotification(`¡Reserva confirmada en ${hotel.nombre}! Recibirás un correo con los detalles.`, 'success');
        
    } catch (error) {
        handleApiError(error);
    }
}

// Actualizar controles de paginación
function updatePaginationControls(currentPage, totalPages) {
    document.getElementById('page-indicator').textContent = `Página ${currentPage + 1} de ${totalPages}`;
    
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage + 1 >= totalPages;
    
    // Configurar eventos de paginación
    prevBtn.onclick = () => {
        if (currentPage > 0) {
            loadHotels(currentPage - 1);
        }
    };
    
    nextBtn.onclick = () => {
        if (currentPage + 1 < totalPages) {
            loadHotels(currentPage + 1);
        }
    };
}

// Configurar eventos de búsqueda y filtros
function setupSearchAndFilters() {
    document.getElementById('search-btn').addEventListener('click', () => {
        // Implementar búsqueda si es necesario
        showNotification('Búsqueda aplicada', 'info');
    });
    
    document.getElementById('apply-filters').addEventListener('click', () => {
        // Implementar filtros si es necesario
        showNotification('Filtros aplicados', 'info');
    });
    
    // Búsqueda al presionar Enter
    document.getElementById('hotel-search').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('search-btn').click();
        }
    });
}

// Configurar botón de reserva en el modal de detalles
function setupModalBookingButton() {
    document.getElementById('book-hotel-btn').addEventListener('click', async () => {
        try {
            if (!currentHotelId) return;
            
            const response = await fetch(`${API_BASE_URL}/hoteles/${currentHotelId}`);
            if (!response.ok) throw new Error('Error al cargar hotel para reserva');
            
            const hotel = await response.json();
            
            // Cerrar modal de detalles y abrir modal de reserva
            const hotelModal = bootstrap.Modal.getInstance(document.getElementById('hotelModal'));
            hotelModal.hide();
            
            prepareBookingModal(hotel);
            
        } catch (error) {
            handleApiError(error);
        }
    });
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async function () {
    try {
        const userData = getAuthenticatedUser();
        if (!userData) return;

        displayUserInfo(userData);
        setupLogout();
        setupSearchAndFilters();
        setupModalBookingButton();
        
        // Cargar hoteles iniciales
        await loadHotels(currentPage);

    } catch (error) {
        console.error("Error inicial:", error);
        window.location.href = '../../index.html';
    }
});