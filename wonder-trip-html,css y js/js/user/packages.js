import { fetchPackages, fetchPackageDetails, createPurchase, fetchSiteDetails  } from '../shared/api.js';
import { initModal } from './modal.js';

document.addEventListener("DOMContentLoaded", function() {
    const packagesContainer = document.getElementById('packagesContainer');
    const packageModal = document.getElementById('packageModal');
    const packageModalContent = document.getElementById('packageModalContent');
    const paymentForm = document.getElementById('paymentForm');
    const confirmPurchaseBtn = document.getElementById('confirmPurchase');
    const logoutBtn = document.getElementById('logoutBtn');
    
    let currentPackage = null;
    
    // Mostrar nombre de usuario
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.nombre) {
        document.getElementById('welcomeMessage').textContent = `Mis Compras - ${userData.nombre.split(' ')[0]}`;
    }
    
    // Configurar logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userData');
        window.location.href = '../index.html';
    });
    
    // Cargar paquetes iniciales
    loadPackages();
    
    async function loadPackages() {
        try {
            const packages = await fetchPackages(true); // Con sitios incluidos
            displayPackages(packages);
        } catch (error) {
            console.error('Error:', error);
            packagesContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
        }
    }
    
    function displayPackages(packages) {
        packagesContainer.innerHTML = '';
        
        packages.forEach(pkg => {
            const packageCard = document.createElement('div');
            packageCard.className = 'package-card';
            packageCard.innerHTML = `
                <div class="package-header">
                    <h4>${pkg.nombre}</h4>
                    <div class="package-price">$${pkg.precio.toLocaleString()}</div>
                </div>
                <div class="package-body">
                    <p>${pkg.descripcion}</p>
                    <div class="package-sites">
                        ${pkg.sitios.map(site => `
                            <span class="site-badge">${site.nombre}</span>
                        `).join('')}
                    </div>
                    <button class="purchase-btn" data-package-id="${pkg.id}">Ver Detalles</button>
                </div>
            `;
            
            packageCard.querySelector('.purchase-btn').addEventListener('click', () => {
                showPackageModal(pkg.id);
            });
            
            packagesContainer.appendChild(packageCard);
        });
    }
    
    async function showPackageModal(packageId) {
    try {
        const pkg = await fetchPackageDetails(packageId);
        currentPackage = pkg;
        
        // Obtener detalles completos de cada sitio turístico
        const sitesWithDetails = await Promise.all(
            pkg.sitios.map(async site => {
                const siteDetails = await fetchSiteDetails(site.id);
                return {
                    ...site,
                    imagenPrincipal: siteDetails.imagenPrincipal || 'https://via.placeholder.com/300x200?text=Sitio+Turistico'
                };
            })
        );
        
        packageModalContent.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${pkg.nombre}</h3>
                <p class="modal-subtitle">$${pkg.precio.toLocaleString()} MXN</p>
            </div>
            <div class="modal-body">
                <div class="modal-description">
                    <h4>Descripción del Paquete</h4>
                    <p>${pkg.descripcion}</p>
                    <div class="package-features">
                        <div class="feature">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Duración: ${pkg.duracion || '7'} días</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-users"></i>
                            <span>Máx. personas: ${pkg.maxPersonas || '4'}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-details">
                    <h4>Sitios Turísticos Incluidos</h4>
                    <div class="sites-container">
                        ${sitesWithDetails.map(site => `
                            <div class="site-card">
                                <img src="${site.imagenPrincipal}" alt="${site.nombre}" class="site-image">
                                <div class="site-info">
                                    <h5>${site.nombre}</h5>
                                    <p>${site.descripcion.substring(0, 100)}...</p>
                                    <small><i class="fas fa-map-marker-alt"></i> ${site.ubicacion}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
            </div>
        `;
        
        // Mover el botón de confirmación al payment-form
        const confirmBtn = document.getElementById('confirmPurchase');
        document.getElementById('paymentForm').appendChild(confirmBtn);
        
        packageModal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar detalles del paquete: ' + error.message);
    }
}
    
    // Confirmar compra
    confirmPurchaseBtn.addEventListener('click', async () => {
    try {
        // 1. Verificar que tenemos el paquete actual
        if (!currentPackage || !currentPackage.id) {
            throw new Error('No se ha seleccionado ningún paquete válido');
        }

        // 2. Obtener datos del usuario
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.id) {
            alert('Por favor inicia sesión para realizar una compra');
            return;
        }

        // 3. Preparar datos de la compra
        const today = new Date();
        const purchaseData = {
            fechaCompra: today.toISOString().split('T')[0], // Formato YYYY-MM-DD
            metodoPago: document.getElementById('paymentMethod').value.toUpperCase(),
            paqueteId: parseInt(currentPackage.id), // Asegurar que es número
            usuarioId: parseInt(userData.id) // Asegurar que es número
        };

        console.log('Datos de compra a enviar:', purchaseData); // Para depuración

        // 4. Validar datos antes de enviar
        if (isNaN(purchaseData.paqueteId)) {
            throw new Error('ID de paquete no válido');
        }
        if (isNaN(purchaseData.usuarioId)) {
            throw new Error('ID de usuario no válido');
        }

        // 5. Enviar la compra
        const result = await createPurchase(purchaseData);
        
        // 6. Éxito
        alert('¡Compra realizada con éxito!');
        packageModal.style.display = 'none';
        window.location.href = 'purchases.html';
        
    } catch (error) {
        console.error('Error en la compra:', error);
        alert(`Error al realizar la compra: ${error.message}`);
    }
});
    
    // Cerrar modal
    document.querySelector('.close-modal').addEventListener('click', () => {
        packageModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === packageModal) {
            packageModal.style.display = 'none';
        }
    });
});