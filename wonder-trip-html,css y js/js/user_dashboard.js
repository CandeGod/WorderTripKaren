document.addEventListener("DOMContentLoaded", function() {
    // Elementos del DOM
    const eventosContainer = document.getElementById('eventosContainer');
    const sitiosContainer = document.getElementById('sitiosContainer');
    const eventosPagination = document.getElementById('eventosPagination');
    const detailsModal = document.getElementById('detailsModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.querySelector('.close-modal');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Variables de estado
    let currentEventPage = 0;
    const eventsPerPage = 6;
    
    // Cargar datos iniciales
    loadEventos();
    loadSitiosTuristicos();
    
    // Event Listeners
    closeModal.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });
    
    logoutBtn.addEventListener('click', () => {
        // Limpiar localStorage o sessionStorage si es necesario
        window.location.href = '../html/index.html';
    });
    
    // Funciones para cargar datos
    async function loadEventos(page = 0) {
        try {
            const response = await fetch(`http://localhost:8080/api/eventos?page=${page}&size=${eventsPerPage}&sort=asc`);
            const data = await response.json();
            
            if (!response.ok) throw new Error('Error al cargar eventos');
            
            displayEventos(data.content);
            setupPagination(data.totalPages, page);
            currentEventPage = page;
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    async function loadSitiosTuristicos() {
        try {
            const response = await fetch('http://localhost:8080/api/sitios-turisticos');
            const data = await response.json();
            
            if (!response.ok) throw new Error('Error al cargar sitios turísticos');
            
            displaySitiosTuristicos(data);
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    async function loadSitioDetails(id) {
        try {
            const [sitioResponse, eventosResponse] = await Promise.all([
                fetch(`http://localhost:8080/api/sitios-turisticos/${id}`),
                fetch(`http://localhost:8080/api/eventos?size=3&idSitio=${id}`)
            ]);
            
            const sitio = await sitioResponse.json();
            const eventos = await eventosResponse.json();
            
            if (!sitioResponse.ok || !eventosResponse.ok) throw new Error('Error al cargar detalles');
            
            // Obtener detalles del hotel si existe
            let hotel = null;
            if (sitio.hotelId) {
                const hotelResponse = await fetch(`http://localhost:8080/api/hoteles/${sitio.hotelId}`);
                hotel = await hotelResponse.json();
            }
            
            displaySitioDetails(sitio, eventos.content, hotel);
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    // Funciones para mostrar datos
    function displayEventos(eventos) {
    eventosContainer.innerHTML = '';
    
    if (eventos.length === 0) {
        eventosContainer.innerHTML = '<p>No hay eventos próximos</p>';
        return;
    }
    
    eventos.forEach(evento => {
        const eventoCard = document.createElement('div');
        eventoCard.className = 'card';
        eventoCard.innerHTML = `
            <div class="card-img" style="background-image: url('${evento.imagenCartel || 'https://source.unsplash.com/random/400x300/?event'}')">
            </div>
            <div class="card-body">
                <h4 class="card-title">${evento.titulo}</h4>
                <p class="card-text">${evento.descripcion}</p>
                <div class="card-date">
                    <i class="far fa-calendar-alt"></i>
                    ${new Date(evento.fechaInicio).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                    })}
                </div>
                <span class="card-badge">Evento</span>
            </div>
        `;
        
        eventoCard.addEventListener('click', () => {
            loadSitioDetails(evento.idSitio);
        });
        
        eventosContainer.appendChild(eventoCard);
    });
}
    
    function displaySitiosTuristicos(sitios) {
    sitiosContainer.innerHTML = '';
    
    sitios.forEach(sitio => {
        const sitioCard = document.createElement('div');
        sitioCard.className = 'card';
        sitioCard.innerHTML = `
            <div class="card-img" style="background-image: url('${sitio.imagenPrincipal || 'https://source.unsplash.com/random/400x300/?travel'}')">
            </div>
            <div class="card-body">
                <h4 class="card-title">${sitio.nombre}</h4>
                <p class="card-text">${sitio.descripcion}</p>
                <div class="card-date">
                    <i class="fas fa-map-marker-alt"></i>
                    ${sitio.ubicacion}
                </div>
                <span class="card-badge">Destino</span>
            </div>
        `;
        
        sitioCard.addEventListener('click', () => {
            loadSitioDetails(sitio.id);
        });
        
        sitiosContainer.appendChild(sitioCard);
    });
}
    
    function displaySitioDetails(sitio, eventos, hotel) {
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3 class="modal-title">${sitio.nombre}</h3>
            <p class="modal-subtitle"><i class="fas fa-map-marker-alt"></i> ${sitio.ubicacion}</p>
        </div>
        <div class="modal-body">
            <div class="modal-img" style="background-image: url('${sitio.imagenPrincipal || 'https://source.unsplash.com/random/600x400/?travel'}')"></div>
            <div class="modal-info">
                <div class="modal-description">
                    <h4>Descripción</h4>
                    <p>${sitio.descripcion}</p>
                </div>
                
                ${eventos.length > 0 ? `
                <div class="modal-details">
                    <h4>Próximos Eventos</h4>
                    <ul>
                        ${eventos.map(evento => `
                            <li>
                                <i class="far fa-calendar-alt"></i>
                                <div>
                                    <strong>${evento.titulo}</strong><br>
                                    ${new Date(evento.fechaInicio).toLocaleDateString('es-ES', { 
                                        day: 'numeric', 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${hotel ? `
                <div class="hotel-section">
                    <h4>Hotel Recomendado</h4>
                    <div class="modal-details">
                        <h5>${hotel.nombre}</h5>
                        <p><i class="fas fa-map-marker-alt"></i> ${hotel.direccion}</p>
                        <p>${hotel.descripcion}</p>
                        ${hotel.imagenPrincipal ? `<img src="${hotel.imagenPrincipal}" alt="${hotel.nombre}" style="max-width: 100%; margin-top: 10px;">` : ''}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    detailsModal.style.display = 'block';
}
    
    function setupPagination(totalPages, currentPage) {
        eventosPagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Botón Anterior
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '&laquo;';
        prevButton.disabled = currentPage === 0;
        prevButton.addEventListener('click', () => {
            if (currentPage > 0) loadEventos(currentPage - 1);
        });
        eventosPagination.appendChild(prevButton);
        
        // Números de página
        for (let i = 0; i < totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i + 1;
            if (i === currentPage) {
                pageButton.className = 'active';
            }
            pageButton.addEventListener('click', () => {
                loadEventos(i);
            });
            eventosPagination.appendChild(pageButton);
        }
        
        // Botón Siguiente
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.disabled = currentPage === totalPages - 1;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages - 1) loadEventos(currentPage + 1);
        });
        eventosPagination.appendChild(nextButton);
    }
    
    // Mostrar nombre de usuario (puedes adaptar esto según tu sistema de autenticación)
    const userEmail = localStorage.getItem('userEmail') || 'Viajero';
    document.getElementById('welcomeMessage').textContent = `Bienvenido, ${userEmail.split('@')[0]}`;
});