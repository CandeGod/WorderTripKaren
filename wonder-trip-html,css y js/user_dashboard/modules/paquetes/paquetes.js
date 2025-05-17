const API_BASE_URL = 'http://localhost:8080/api';
let currentPackageId = null;
let currentPackagePrice = 0;

// Variables de paginación
let currentPage = 0;
const pageSize = 15;
let totalPages = 1;

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
        window.location.href = '../../index.html';
    });
}

// Cargar paquetes
async function loadPackages(filter = 'all', searchQuery = '', page = 0) {
    try {
        showLoading();
        
        let url = `${API_BASE_URL}/paquetes/paginado?page=${page}&size=${pageSize}`;
        
        // Aplicar filtros
        if (filter === 'price-asc') {
            url += '&sort=precio,asc';
        } else if (filter === 'price-desc') {
            url += '&sort=precio,desc';
        }
        
        // Aplicar búsqueda
        if (searchQuery) {
           let  url2 = `${API_BASE_URL}/paquetes/${id}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar paquetes');
        
        const packagesData = await response.json();
        const packagesContainer = document.getElementById('packages-container');
        packagesContainer.innerHTML = '';

        // Actualizar información de paginación
        totalPages = packagesData.totalPages || 1;
        currentPage = packagesData.number;
        updatePaginationControls();

        if (packagesData.content && packagesData.content.length > 0) {
            for (const pkg of packagesData.content) {
                const packageCard = document.createElement('div');
                packageCard.className = 'package-card';
                
                // Obtener sitios asociados si están disponibles
                let sitesInfo = [];
                try {
                    const sitesResponse = await fetch(`${API_BASE_URL}/paquetes/${pkg.id}/con-sitios`);
                    if (sitesResponse.ok) {
                        const sitesData = await sitesResponse.json();
                        sitesInfo = sitesData.sitios || [];
                    }
                } catch (error) {
                    console.error('Error al cargar sitios:', error);
                }
                
                packageCard.innerHTML = `
                    <span class="package-badge">${sitesInfo.length} Destinos</span>
                    <img src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd" alt="${pkg.nombre}" class="package-image">
                    <div class="package-body">
                        <h3 class="package-title">${pkg.nombre}</h3>
                        <p class="package-description">${pkg.descripcion}</p>
                        <div class="package-duration">
                            <i class="fas fa-clock"></i> ${Math.floor(Math.random() * 7) + 3} Días / ${Math.floor(Math.random() * 6) + 2} Noches
                        </div>
                    </div>
                    <div class="package-footer">
                        <span class="package-price">$${pkg.precio.toLocaleString()}</span>
                        <button class="package-button" data-package-id="${pkg.id}">Reservar</button>
                    </div>
                `;
                packagesContainer.appendChild(packageCard);
                
                // Agregar evento al botón
                packageCard.querySelector('.package-button').addEventListener('click', (e) => {
                    e.stopPropagation();
                    showPackageDetails(pkg.id);
                });
                
                // Agregar evento a la tarjeta completa
                packageCard.addEventListener('click', () => {
                    showPackageDetails(pkg.id);
                });
            }
        } else {
            packagesContainer.innerHTML = `
                <div class="no-packages" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-suitcase-rolling" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-light);">No se encontraron paquetes</h3>
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

// Función para actualizar los controles de paginación
function updatePaginationControls() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Actualizar estado de los botones
    prevButton.disabled = currentPage <= 0;
    nextButton.disabled = currentPage >= totalPages - 1;
    
    // Actualizar información de página
    pageInfo.textContent = `Página ${currentPage + 1} de ${totalPages}`;
}

// Función para configurar los eventos de paginación
function setupPagination() {
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 0) {
            const searchInput = document.getElementById('search-input');
            const filterSelect = document.getElementById('filter-select');
            loadPackages(filterSelect.value, searchInput.value, currentPage - 1);
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            const searchInput = document.getElementById('search-input');
            const filterSelect = document.getElementById('filter-select');
            loadPackages(filterSelect.value, searchInput.value, currentPage + 1);
        }
    });
}

// Mostrar detalles del paquete
async function showPackageDetails(packageId) {
    try {
        showLoading();
        currentPackageId = packageId;
        
        const response = await fetch(`${API_BASE_URL}/paquetes/${packageId}/con-sitios`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar detalles del paquete');
        
        const packageData = await response.json();
        currentPackagePrice = packageData.precio || 0;
        
        // Configurar el modal
        document.getElementById('packageModalTitle').textContent = packageData.nombre;
        
        const modalBody = document.getElementById('packageModalBody');
        modalBody.innerHTML = `
            <div class="package-modal-content">
                <img src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd" alt="${packageData.nombre}" class="package-modal-image">
                
                <div class="package-modal-info">
                    <div class="package-info-group">
                        <h5><i class="fas fa-tag"></i> Precio</h5>
                        <p>$${packageData.precio.toLocaleString()}</p>
                    </div>
                    
                    <div class="package-info-group">
                        <h5><i class="fas fa-clock"></i> Duración</h5>
                        <p>${Math.floor(Math.random() * 7) + 3} Días / ${Math.floor(Math.random() * 6) + 2} Noches</p>
                    </div>
                </div>
                
                <div class="package-modal-description">
                    <h5><i class="fas fa-align-left"></i> Descripción</h5>
                    <p>${packageData.descripcion}</p>
                </div>
                
                ${packageData.sitios && packageData.sitios.length > 0 ? `
                <div class="package-sites">
                    <h5><i class="fas fa-map-marked-alt"></i> Sitios Incluidos</h5>
                    ${packageData.sitios.map(site => `
                        <div class="site-item">
                            <img src="${site.imagenPrincipal || 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6'}" alt="${site.nombre}" class="site-image">
                            <div class="site-info">
                                <h6>${site.nombre}</h6>
                                <p>${site.ubicacion}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
        
        // Actualizar el monto en el modal de pago
        document.getElementById('payment-amount').textContent = `$${packageData.precio.toLocaleString()}`;
        
        // Mostrar el modal
        const packageModal = new bootstrap.Modal(document.getElementById('packageModal'));
        packageModal.show();
        
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
        loadPackages(filterSelect.value, searchInput.value, 0);
    });
    
    // Buscar al presionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadPackages(filterSelect.value, searchInput.value, 0);
        }
    });
    
    // Cambiar filtro
    filterSelect.addEventListener('change', () => {
        loadPackages(filterSelect.value, searchInput.value, 0);
    });
}

// Configurar modal de pago
function setupPaymentModal() {
    const paymentMethod = document.getElementById('payment-method');
    const cardDetails = document.getElementById('card-details');
    
    paymentMethod.addEventListener('change', (e) => {
        if (e.target.value === 'TARJETA') {
            cardDetails.style.display = 'block';
        } else {
            cardDetails.style.display = 'none';
        }
    });
    
    // Confirmar pago
    document.getElementById('confirm-payment').addEventListener('click', async () => {
        try {
            showLoading();
            const userData = getAuthenticatedUser();
            if (!userData) return;
            
            const paymentMethod = document.getElementById('payment-method').value;
            if (!paymentMethod) {
                throw new Error('Seleccione un método de pago');
            }
            
            const today = new Date().toISOString().split('T')[0];
            const paymentData = {
                fechaCompra: today,
                metodoPago: paymentMethod,
                paqueteId: currentPackageId,
                usuarioId: userData.id
            };
            
            const response = await fetch(`${API_BASE_URL}/compras`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al procesar el pago');
            }
            
            const paymentResult = await response.json();
            
            // Cerrar modales
            const packageModal = bootstrap.Modal.getInstance(document.getElementById('packageModal'));
            packageModal.hide();
            
            const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
            paymentModal.hide();
            
            // Mostrar confirmación
            showNotification('¡Reserva completada con éxito!');
            
            // Redirigir a compras
            setTimeout(() => {
                window.location.href = '../compras/compras.html';
            }, 2000);
            
        } catch (error) {
            handleApiError(error);
        } finally {
            hideLoading();
        }
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
        setupPaymentModal();
        setupPagination();
        
        // Cargar paquetes iniciales
        await loadPackages();

    } catch (error) {
        console.error("Error inicial:", error);
        window.location.href = '../../index.html';
    }
});