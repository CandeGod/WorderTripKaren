export function initModal() {
    const detailsModal = document.getElementById('detailsModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.querySelector('.close-modal');
    
    closeModal.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });
    
    document.addEventListener('showModal', (e) => {
        displaySitioDetails(e.detail.sitio, e.detail.eventos, e.detail.hotel);
    });
    
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
}