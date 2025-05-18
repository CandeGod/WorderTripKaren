const API_BASE_URL = 'http://localhost:8080/api';

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

// Cargar datos del perfil
async function loadProfileData() {
    try {
        showLoading();
        const userData = getAuthenticatedUser();
        if (!userData) return;

        // Obtener datos del usuario
        const response = await fetch(`${API_BASE_URL}/usuarios/${userData.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar datos del perfil');
        
        const profileData = await response.json();
        
        // Mostrar datos en el perfil
        displayProfileData(profileData);
        
        // Cargar datos adicionales
        await Promise.all([
            loadPurchaseSummary(userData.id),
            loadUserReports(userData.id),
            loadUserPurchases(userData.id)
        ]);
        
        // Inicializar gráfico
        initTravelChart();
        
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

// Mostrar datos del perfil
function displayProfileData(user) {
    document.getElementById('profile-name').textContent = user.nombre;
    document.getElementById('profile-email').textContent = user.correo;
    document.getElementById('user-name').textContent = user.nombre;
    document.getElementById('user-avatar').src = user.imagenPerfil || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d';
    document.getElementById('profile-avatar-img').src = user.imagenPerfil || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d';
    
    // Detalles del perfil
    document.getElementById('detail-name').textContent = user.nombre;
    document.getElementById('detail-email').textContent = user.correo;
    document.getElementById('detail-gender').textContent = user.sexo || 'No especificado';
    document.getElementById('detail-role').textContent = user.rol === 'USUARIO' ? 'Usuario' : user.rol;
    
    // Fecha de ingreso (simulada)
    const joinDate = new Date();
    document.getElementById('member-since').textContent = joinDate.getFullYear();
    document.getElementById('join-date').textContent = joinDate.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long'
    });
}

// Cargar resumen de compras
async function loadPurchaseSummary(userId) {
    try {
        // Obtener total gastado
        const totalResponse = await fetch(`${API_BASE_URL}/compras/suma-total/usuario/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (totalResponse.ok) {
            const total = await totalResponse.text();
            document.getElementById('total-spent').textContent = `$${parseInt(total || '0').toLocaleString()}`;
        }
        
        // Obtener conteo de compras
        const countResponse = await fetch(`${API_BASE_URL}/compras/usuario/${userId}/conteo`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (countResponse.ok) {
            const count = await countResponse.text();
            document.getElementById('purchases-count').textContent = count || '0';
            document.getElementById('trips-count').textContent = count || '0';
        }
        
    } catch (error) {
        console.error('Error al cargar resumen de compras:', error);
    }
}

// Función para cargar compras del usuario
async function loadUserPurchases(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/compras/usuario/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar compras del usuario');
        
        const purchasesData = await response.json();
        displayRecentPurchases(purchasesData || []);
        
    } catch (error) {
        console.error('Error al cargar compras:', error);
    }
}

// Mostrar compras recientes
function displayRecentPurchases(purchases) {
    const purchasesList = document.getElementById('purchases-list');
    purchasesList.innerHTML = '';
    
    if (purchases.length === 0) {
        purchasesList.innerHTML = `
            <div class="no-purchases" style="text-align: center; padding: 2rem;">
                <i class="fas fa-shopping-bag" style="font-size: 2rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-light);">No tienes compras recientes</p>
            </div>
        `;
        return;
    }
    
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
            <div class="purchase-info">
                <h5>${purchase.paquete?.nombre || 'Paquete no disponible'}</h5>
                <p>${purchase.metodoPago} • ${formattedDate}</p>
            </div>
            <div class="purchase-price">$${purchase.paquete?.precio?.toLocaleString() || '0'}</div>
        `;
        purchasesList.appendChild(purchaseItem);
    });
}

// Cargar reportes del usuario con paginación
async function loadUserReports(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes/usuario/${userId}?page=0&size=11&sort=asc`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar reportes');
        
        const reportsData = await response.json();
        displayUserReports(reportsData.content || []);
        
    } catch (error) {
        console.error('Error al cargar reportes:', error);
    }
}

// Mostrar reportes del usuario
function displayUserReports(reports) {
    const reportsList = document.getElementById('reports-list');
    reportsList.innerHTML = '';
    
    if (reports.length === 0) {
        reportsList.innerHTML = `
            <div class="no-reports" style="text-align: center; padding: 2rem;">
                <i class="fas fa-flag" style="font-size: 2rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-light);">No has realizado ningún reporte</p>
                <button class="btn btn-primary mt-2" id="btn-new-report">
                    <i class="fas fa-plus"></i> Crear Reporte
                </button>
            </div>
        `;
        
        // Configurar botón para nuevo reporte
        document.getElementById('btn-new-report')?.addEventListener('click', () => {
            showNewReportModal();
        });
        return;
    }
    
    // Agregar botón para nuevo reporte
    const newReportBtn = document.createElement('button');
    newReportBtn.className = 'btn btn-primary mb-3';
    newReportBtn.id = 'btn-new-report';
    newReportBtn.innerHTML = '<i class="fas fa-plus"></i> Crear Reporte';
    newReportBtn.addEventListener('click', () => {
        showNewReportModal();
    });
    reportsList.appendChild(newReportBtn);
    
    reports.forEach(report => {
        const reportDate = new Date(report.fecha);
        const formattedDate = reportDate.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.innerHTML = `
            <div>
                <h5 class="report-title"><i class="fas fa-exclamation-circle"></i> ${report.titulo}</h5>
                <p class="report-description">${report.descripcion}</p>
                <p class="report-date">${formattedDate}</p>
            </div>
        `;
        reportsList.appendChild(reportItem);
    });
}

// Mostrar modal para nuevo reporte
function showNewReportModal() {
    const userData = getAuthenticatedUser();
    if (!userData) return;
    
    const modalHTML = `
        <div class="modal fade" id="newReportModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Nuevo Reporte</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="report-form">
                            <div class="form-group mb-3">
                                <label for="report-title" class="form-label">Título</label>
                                <input type="text" class="form-control" id="report-title" required>
                            </div>
                            <div class="form-group mb-3">
                                <label for="report-description" class="form-label">Descripción</label>
                                <textarea class="form-control" id="report-description" rows="3" required></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="submit-report-btn">Enviar Reporte</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('newReportModal'));
    
    // Configurar evento para enviar reporte
    document.getElementById('submit-report-btn').addEventListener('click', async () => {
        const title = document.getElementById('report-title').value;
        const description = document.getElementById('report-description').value;
        
        if (!title || !description) {
            showNotification('Por favor completa todos los campos', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/reportes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({
                    titulo: title,
                    descripcion: description,
                    fecha: new Date().toISOString().split('T')[0],
                    idUsuario: userData.id
                })
            });
            
            if (!response.ok) throw new Error('Error al enviar el reporte');
            
            showNotification('Reporte enviado correctamente');
            modal.hide();
            
            // Recargar reportes
            await loadUserReports(userData.id);
            
        } catch (error) {
            handleApiError(error);
        } finally {
            // Eliminar el modal del DOM después de cerrarse
            modal._element.addEventListener('hidden.bs.modal', () => {
                document.getElementById('newReportModal').remove();
            });
        }
    });
    
    // Mostrar modal
    modal.show();
}

// Mostrar modal para cambio de contraseña
function showChangePasswordModal() {
    const modalHTML = `
        <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Cambiar Contraseña</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="password-form">
                            <div class="form-group mb-3">
                                <label for="current-password" class="form-label">Contraseña Actual</label>
                                <input type="password" class="form-control" id="current-password" required>
                            </div>
                            <div class="form-group mb-3">
                                <label for="new-password" class="form-label">Nueva Contraseña</label>
                                <input type="password" class="form-control" id="new-password" required>
                            </div>
                            <div class="form-group mb-3">
                                <label for="confirm-password" class="form-label">Confirmar Nueva Contraseña</label>
                                <input type="password" class="form-control" id="confirm-password" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="submit-password-btn">Cambiar Contraseña</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    
    // Configurar evento para cambiar contraseña
    document.getElementById('submit-password-btn').addEventListener('click', async () => {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('Por favor completa todos los campos', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('Las contraseñas nuevas no coinciden', 'error');
            return;
        }
        
        try {
            const userData = getAuthenticatedUser();
            if (!userData) return;
            
            // Aquí iría la lógica para cambiar la contraseña en el backend
            // Por ahora simulamos que fue exitoso
            showNotification('Contraseña cambiada correctamente');
            modal.hide();
            
        } catch (error) {
            handleApiError(error);
        } finally {
            // Eliminar el modal del DOM después de cerrarse
            modal._element.addEventListener('hidden.bs.modal', () => {
                document.getElementById('changePasswordModal').remove();
            });
        }
    });
    
    // Mostrar modal
    modal.show();
}

// Inicializar gráfico de viajes
function initTravelChart() {
    const ctx = document.getElementById('travelChart').getContext('2d');
    
    // Datos simulados para el gráfico
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Playas', 'Montañas', 'Ciudades', 'Aventura'],
            datasets: [{
                data: [45, 25, 20, 10],
                backgroundColor: [
                    '#2a9d8f',
                    '#264653',
                    '#e9c46a',
                    '#e76f51'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            },
            cutout: '70%'
        }
    });
    
    // Actualizar preferencia basada en el gráfico (simulado)
    document.getElementById('preference').textContent = "Playas";
    document.getElementById('visited-places').textContent = "8";
}

// Configurar pestañas
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover clase active de todos los tabs y contenidos
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Agregar clase active al tab clickeado
            tab.classList.add('active');
            
            // Mostrar el contenido correspondiente
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Configurar modal de edición de perfil
function setupEditModal() {
    const editBtn = document.querySelector('.btn-edit-profile');
    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    const userData = getAuthenticatedUser();
    
    editBtn.addEventListener('click', async () => {
        try {
            // Obtener datos actuales del usuario
            const response = await fetch(`${API_BASE_URL}/usuarios/${userData.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            
            if (!response.ok) throw new Error('Error al cargar datos del usuario');
            
            const currentUserData = await response.json();
            
            // Llenar el formulario con los datos actuales
            document.getElementById('edit-name').value = currentUserData.nombre;
            document.getElementById('edit-email').value = currentUserData.correo;
            document.getElementById('edit-gender').value = currentUserData.sexo || 'Otro';
            
            // Guardar contraseña actual para usarla en la actualización
            document.getElementById('profile-form').dataset.currentPassword = currentUserData.contrasena;
            
            modal.show();
        } catch (error) {
            handleApiError(error);
        }
    });
    
    // Configurar botón de guardar
    document.getElementById('save-profile-btn').addEventListener('click', async () => {
        try {
            const userData = getAuthenticatedUser();
            if (!userData) return;
            
            const form = document.getElementById('profile-form');
            const currentPassword = form.dataset.currentPassword;
            
            const updatedData = {
                nombre: document.getElementById('edit-name').value,
                correo: document.getElementById('edit-email').value,
                sexo: document.getElementById('edit-gender').value,
                contrasena: currentPassword,
                rol: "USUARIO",
                imagenPerfil: userData.imagenPerfil || "string"
            };
            
            const response = await fetch(`${API_BASE_URL}/usuarios/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(updatedData)
            });
            
            if (!response.ok) throw new Error('Error al actualizar el perfil');
            
            const updatedUser = await response.json();
            
            // Actualizar datos en localStorage
            const storedUserData = JSON.parse(localStorage.getItem('userData'));
            storedUserData.nombre = updatedData.nombre;
            storedUserData.correo = updatedData.correo;
            storedUserData.sexo = updatedData.sexo;
            localStorage.setItem('userData', JSON.stringify(storedUserData));
            
            // Actualizar la UI
            displayProfileData(updatedUser);
            
            showNotification('Perfil actualizado correctamente');
            modal.hide();
            
        } catch (error) {
            handleApiError(error);
        }
    });
}

// Configurar botón de cambio de contraseña
function setupChangePasswordButton() {
    document.querySelector('.btn-change-password').addEventListener('click', function(e) {
        e.preventDefault();
        showChangePasswordModal();
    });
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

        setupTabs();
        setupEditModal();
        setupChangePasswordButton(); // Configurar el botón de cambio de contraseña
        setupLogout();
        
        // Cargar datos del perfil
        await loadProfileData();

    } catch (error) {
        console.error("Error inicial:", error);
        window.location.href = '../../index.html';
    }
});