import { fetchUserPurchases } from '../shared/api.js';

document.addEventListener("DOMContentLoaded", async function() {
    const purchasesContainer = document.getElementById('purchasesContainer');
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Mostrar nombre de usuario
    if (userData && userData.nombre) {
        document.getElementById('welcomeMessage').textContent = `Mis Compras - ${userData.nombre.split(' ')[0]}`;
    }
    
    if (!userData || !userData.id) {
        purchasesContainer.innerHTML = `
            <div class="error-message">
                <p>Debes iniciar sesión para ver tus compras</p>
                <a href="../index.html" class="login-link">Iniciar sesión</a>
            </div>
        `;
        return;
    }
    
    try {
        purchasesContainer.innerHTML = '<div class="loading">Cargando tus compras...</div>';
        const purchases = await fetchUserPurchases(userData.id);
        
        if (purchases.length === 0) {
            purchasesContainer.innerHTML = `
                <div class="no-purchases">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Aún no tienes compras registradas</p>
                    <a href="packages.html" class="btn">Explorar paquetes</a>
                </div>
            `;
            return;
        }
        
        displayPurchases(purchases);
    } catch (error) {
        console.error('Error:', error);
        purchasesContainer.innerHTML = `
            <div class="error-message">
                <p>${error.message}</p>
                <button onclick="window.location.reload()">Reintentar</button>
            </div>
        `;
    }
});

function displayPurchases(purchases) {
    const purchasesContainer = document.getElementById('purchasesContainer');
    purchasesContainer.innerHTML = '';
    
    purchases.forEach(purchase => {
        const purchaseCard = document.createElement('div');
        purchaseCard.className = 'purchase-card';
        purchaseCard.innerHTML = `
            <div class="purchase-info">
                <h4>${purchase.paquete.nombre}</h4>
                <p class="purchase-date">
                    <i class="far fa-calendar-alt"></i>
                    ${new Date(purchase.fechaCompra).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </p>
                <p class="purchase-description">${purchase.paquete.descripcion}</p>
            </div>
            <div class="purchase-meta">
                <span class="purchase-price">$${purchase.paquete.precio.toLocaleString('es-MX')}</span>
                <span class="payment-method ${purchase.metodoPago.toLowerCase()}">
                    ${formatPaymentMethod(purchase.metodoPago)}
                </span>
            </div>
        `;
        purchasesContainer.appendChild(purchaseCard);
    });
}

function formatPaymentMethod(method) {
    const methods = {
        'TARJETA': 'Tarjeta',
        'TRANSFERENCIA': 'Transferencia',
        'EFECTIVO': 'Efectivo'
    };
    return methods[method] || method;
}