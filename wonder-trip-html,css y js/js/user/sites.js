import { 
    fetchTouristSites,
    fetchSiteDetails,
    fetchEvents,
    fetchHotelDetails
} from '../shared/api.js';

export function initSites() {
    const sitiosContainer = document.getElementById('sitiosContainer');
    
    loadSitiosTuristicos();
    
    document.addEventListener('showSiteDetails', (e) => {
        loadSitioDetails(e.detail);
    });
    
    async function loadSitiosTuristicos() {
        try {
            const sitios = await fetchTouristSites();
            displaySitiosTuristicos(sitios);
        } catch (error) {
            console.error('Error:', error);
            sitiosContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
        }
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
                const event = new CustomEvent('showSiteDetails', { detail: sitio.id });
                document.dispatchEvent(event);
            });
            
            sitiosContainer.appendChild(sitioCard);
        });
    }
    
    async function loadSitioDetails(id) {
        try {
            const [sitio, eventosResponse] = await Promise.all([
                fetchSiteDetails(id),
                fetchEvents(0, 3, 'asc', id)
            ]);
            
            const eventos = eventosResponse.content;
            const hotel = await fetchHotelDetails(sitio.hotelId);
            
            const event = new CustomEvent('showModal', { 
                detail: { sitio, eventos, hotel } 
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Error:', error);
        }
    }
}