const API_BASE_URL = 'http://localhost:8080/api';
let currentPage = 0;
let totalPages = 1;
let currentPurchaseId = null;

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

// Cargar resumen de compras
async function loadPurchaseSummary() {
    try {
        const userData = getAuthenticatedUser();
        if (!userData) return;

        // Obtener el total gastado
        const totalResponse = await fetch(`${API_BASE_URL}/compras/suma-total/usuario/${userData.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (totalResponse.ok) {
            const total = await totalResponse.text();
            document.getElementById('total-spent').textContent = `$${parseInt(total || '0').toLocaleString()}`;
        }

        // Obtener el conteo de compras
        const countResponse = await fetch(`${API_BASE_URL}/compras/usuario/${userData.id}/conteo`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (countResponse.ok) {
            const count = await countResponse.json(); // Devuelve solo un número
            document.getElementById('purchases-count').textContent = count || '0';
        }

        // Obtener método de pago más usado (simulado)
        document.getElementById('favorite-method').textContent = "Tarjeta";

    } catch (error) {
        handleApiError(error);
    }
}

// Inicializar gráfico de compras
function initPurchaseChart() {
    const ctx = document.getElementById('purchaseChart').getContext('2d');

    // Datos simulados para el gráfico
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYearData = [5000, 7000, 4500, 8000, 6000, 9000, 11000, 10000, 8500, 9500, 12000, 15000];
    const lastYearData = [4000, 6000, 3500, 7000, 5000, 8000, 9000, 8500, 7000, 8000, 10000, 12000];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Este año',
                    data: currentYearData,
                    borderColor: '#2a9d8f',
                    backgroundColor: 'rgba(42, 157, 143, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Año anterior',
                    data: lastYearData,
                    borderColor: '#dee2e6',
                    backgroundColor: 'rgba(222, 226, 230, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Cargar compras con paginación
async function loadPurchases(page = 0, size = 5) {
    try {
        showLoading();
        const userData = getAuthenticatedUser();
        if (!userData) return;

        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        let url = '';
        let isPaginated = false;

        // Si hay fechas, usa el endpoint con paginación
        if (dateFrom && dateTo) {
            url = `${API_BASE_URL}/compras/fechas/usuario/${userData.id}?inicio=${dateFrom}&fin=${dateTo}&page=${page}&size=${size}`;
            isPaginated = true;
        } else {
            // Si no, usa el endpoint directo que no tiene paginación
            url = `${API_BASE_URL}/compras/usuario/${userData.id}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar compras');

        const purchasesContainer = document.getElementById('purchases-container');
        purchasesContainer.innerHTML = '';

        const data = await response.json();
        const purchases = isPaginated ? data.content : data;

        // Solo actualiza paginación si la respuesta es paginada
        if (isPaginated) {
            currentPage = data.number;
            totalPages = data.totalPages;
            updatePaginationControls();
        } else {
            // Si no es paginación, oculta los controles (si es necesario)
            currentPage = 0;
            totalPages = 1;
            updatePaginationControls(); // opcional: podrías ocultarlos aquí también
        }

        if (purchases && purchases.length > 0) {
            purchases.forEach(purchase => {
                const purchaseDate = new Date(purchase.fechaCompra);
                const formattedDate = purchaseDate.toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });

                const purchaseItem = document.createElement('div');
                purchaseItem.className = 'purchase-item';
                purchaseItem.innerHTML = `
                    <div class="purchase-date">${formattedDate}</div>
                    <div class="purchase-content">
                        <div class="purchase-info">
                            <span class="purchase-method ${purchase.metodoPago}">${purchase.metodoPago}</span>
                            <h4 class="purchase-title">${purchase.paquete?.nombre || 'Paquete no disponible'}</h4>
                            <p class="purchase-description">${purchase.paquete?.descripcion?.substring(0, 100) || 'Sin descripción disponible'}...</p>
                            <span class="purchase-status completed">Completado</span>
                        </div>
                        <div class="purchase-price">$${purchase.paquete?.precio?.toLocaleString() || '0'}</div>
                    </div>
                    <div class="purchase-actions">
                        <button class="btn-details" data-purchase-id="${purchase.id}">Ver Detalles</button>
                    </div>
                `;
                purchasesContainer.appendChild(purchaseItem);

                purchaseItem.querySelector('.btn-details').addEventListener('click', () => {
                    showPurchaseDetails(purchase.id);
                });
            });
        } else {
            purchasesContainer.innerHTML = `
                <div class="no-purchases" style="text-align: center; padding: 2rem; grid-column: 1/-1;">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h4 style="color: var(--text-light);">No tienes compras registradas</h4>
                    <p>Visita nuestra sección de paquetes para comenzar a explorar</p>
                    <button class="btn-details" onclick="window.location.href='../paquetes/paquetes.html'" style="margin-top: 1rem;">Explorar Paquetes</button>
                </div>
            `;
        }

    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}


// Actualizar controles de paginación
function updatePaginationControls() {
    document.getElementById('page-indicator').textContent = `${currentPage + 1}/${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 0;
    document.getElementById('next-page').disabled = currentPage + 1 >= totalPages;
}

// Mostrar detalles de compra
async function showPurchaseDetails(purchaseId) {
    try {
        showLoading();
        currentPurchaseId = purchaseId;

        const response = await fetch(`${API_BASE_URL}/compras/${purchaseId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar detalles de la compra');

        const purchase = await response.json();

        // Configurar el modal
        document.getElementById('purchaseModalTitle').textContent = `Compra #${purchase.id}`;

        const modalBody = document.getElementById('purchaseModalBody');
        modalBody.innerHTML = `
            <div class="purchase-modal-content">
                <div class="purchase-modal-header">
                    <span class="purchase-modal-id">ID: ${purchase.id}</span>
                    <span class="purchase-modal-method ${purchase.metodoPago}">${purchase.metodoPago}</span>
                </div>
                
                <div class="purchase-modal-body">
                    <div class="purchase-modal-package">
                        <img src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd" alt="${purchase.paquete?.nombre}" class="package-modal-image">
                        <div class="package-modal-info">
                            <h4>${purchase.paquete?.nombre || 'Paquete no disponible'}</h4>
                            <p>${purchase.paquete?.descripcion || 'Sin descripción disponible'}</p>
                            <div class="package-modal-price">$${purchase.paquete?.precio?.toLocaleString() || '0'}</div>
                        </div>
                    </div>
                    
                    <div class="purchase-modal-details">
                        <div class="detail-group">
                            <h5><i class="fas fa-calendar-day"></i> Fecha de Compra</h5>
                            <p>${new Date(purchase.fechaCompra).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        
                        <div class="detail-group">
                            <h5><i class="fas fa-user"></i> Comprador</h5>
                            <p>${purchase.usuario?.nombre || 'Usuario no disponible'}</p>
                        </div>
                        
                        <div class="detail-group">
                            <h5><i class="fas fa-envelope"></i> Correo Electrónico</h5>
                            <p>${purchase.usuario?.correo || 'No disponible'}</p>
                        </div>
                        
                        <div class="detail-group">
                            <h5><i class="fas fa-info-circle"></i> Estado</h5>
                            <p><span class="purchase-status completed">Completado</span></p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Mostrar el modal
        const purchaseModal = new bootstrap.Modal(document.getElementById('purchaseModal'));
        purchaseModal.show();

    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Configurar filtro por fechas
function setupDateFilter() {
    document.getElementById('filter-btn').addEventListener('click', () => {
        loadPurchases(0);
    });
}

// Configurar paginación
function setupPagination() {
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 0) {
            loadPurchases(currentPage - 1);
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage + 1 < totalPages) {
            loadPurchases(currentPage + 1);
        }
    });
}

// Configurar botones del modal
function setupModalButtons() {
    document.getElementById('download-receipt-btn').addEventListener('click', () => {
        showNotification('Generando recibo... Pronto estará disponible para descargar');
    });

    document.getElementById('cancel-purchase-btn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
            showNotification('Solicitud de cancelación enviada. Nos pondremos en contacto contigo pronto.');
            const modal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
            modal.hide();
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
document.addEventListener('DOMContentLoaded', async function () {
    try {
        const userData = getAuthenticatedUser();
        if (!userData) return;

        displayUserInfo(userData);
        setupLogout();
        setupDateFilter();
        setupPagination();
        setupModalButtons();

        // Cargar datos iniciales
        await Promise.all([
            loadPurchaseSummary(),
            loadPurchases()
        ]);

        // Inicializar gráfico
        initPurchaseChart();

    } catch (error) {
        console.error("Error inicial:", error);
        window.location.href = '../../index.html';
    }
});