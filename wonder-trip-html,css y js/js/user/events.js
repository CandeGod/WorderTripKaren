import { fetchEvents } from '../shared/api.js';

export function initEvents() {
    const eventosContainer = document.getElementById('eventosContainer');
    const eventosPagination = document.getElementById('eventosPagination');
    
    let currentEventPage = 0;
    const eventsPerPage = 6;
    
    loadEventos();
    
    async function loadEventos(page = 0) {
        try {
            const data = await fetchEvents(page, eventsPerPage);
            displayEventos(data.content);
            setupPagination(data.totalPages, page);
            currentEventPage = page;
        } catch (error) {
            console.error('Error:', error);
            eventosContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
        }
    }
    
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
                const event = new CustomEvent('showSiteDetails', { detail: evento.idSitio });
                document.dispatchEvent(event);
            });
            
            eventosContainer.appendChild(eventoCard);
        });
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
}