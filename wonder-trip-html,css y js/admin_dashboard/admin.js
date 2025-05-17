const API_BASE_URL = 'http://localhost:8080/api';

// Función para manejar errores de API
function handleApiError(error) {
    console.error('API Error:', error);
    alert(`Error: ${error.message || 'Ocurrió un error al procesar la solicitud'}`);
}

// Función para obtener el usuario autenticado
function getAuthenticatedUser() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || userData.rol !== 'ADMINISTRADOR') {
        window.location.href = '../index.html';
        return null;
    }
    return userData;
}

// Mostrar información del administrador
function displayAdminInfo(userData) {
    document.getElementById('admin-name').textContent = userData.nombre || 'Administrador';
    document.getElementById('admin-email').textContent = userData.correo || 'admin@wondertrip.com';
    
    const adminAvatar = document.getElementById('admin-avatar');
    adminAvatar.src = userData.imagenPerfil || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80';
}

// Configurar logout
function setupLogout() {
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        window.location.href = '../index.html';
    });
}

// Cargar estadísticas del dashboard
async function loadDashboardStats() {
    try {
        const userData = getAuthenticatedUser();
        if (!userData) return;

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        };

        // Obtener datos de varios endpoints en paralelo
        const [usersResponse, eventsResponse, reportsResponse, salesResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/usuarios?page=0&size=1`, { headers }),
            fetch(`${API_BASE_URL}/eventos?page=0&size=1`, { headers }),
            fetch(`${API_BASE_URL}/reportes?page=0&size=1`, { headers }),
            fetch(`${API_BASE_URL}/compras/suma-total`, { headers })
        ]);

        if (!usersResponse.ok) throw new Error('Error al cargar usuarios');
        if (!eventsResponse.ok) throw new Error('Error al cargar eventos');
        if (!reportsResponse.ok) throw new Error('Error al cargar reportes');
        if (!salesResponse.ok) throw new Error('Error al cargar ventas');

        // Procesar respuestas
        const usersData = await usersResponse.json();
        const eventsData = await eventsResponse.json();
        const reportsData = await reportsResponse.json();
        const totalSales = await salesResponse.text();

        // Actualizar UI
        document.getElementById('total-users').textContent = usersData.totalElements || '0';
        document.getElementById('total-events').textContent = eventsData.totalElements || '0';
        document.getElementById('total-reports').textContent = reportsData.totalElements || '0';
        document.getElementById('total-sales').textContent = `$${parseInt(totalSales || '0').toLocaleString()}`;

        // Actualizar notificaciones (reportes pendientes)
        document.getElementById('notification-count').textContent = reportsData.totalElements || '0';

    } catch (error) {
        handleApiError(error);
    }
}

// Cargar ventas recientes
async function loadRecentSales() {
    try {
        const response = await fetch(`${API_BASE_URL}/compras?page=0&size=5&sortBy=fechaCompra&direction=desc`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar ventas recientes');

        const salesData = await response.json();
        const tableBody = document.querySelector('#recent-sales tbody');
        tableBody.innerHTML = '';

        if (salesData.content && salesData.content.length > 0) {
            salesData.content.forEach(sale => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sale.paquete?.nombre || 'N/A'}</td>
                    <td>${sale.usuario?.nombre || 'N/A'}</td>
                    <td>${new Date(sale.fechaCompra).toLocaleDateString('es-MX')}</td>
                    <td>$${sale.paquete?.precio?.toLocaleString() || '0'}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No hay ventas recientes</td></tr>';
        }
    } catch (error) {
        handleApiError(error);
    }
}

// Cargar próximos eventos
async function loadUpcomingEvents() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${API_BASE_URL}/eventos?fechaInicio=${today}&size=3&sort=fechaInicio,asc`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar eventos próximos');

        const eventsData = await response.json();
        const eventsList = document.getElementById('upcoming-events');
        eventsList.innerHTML = '';

        if (eventsData.content && eventsData.content.length > 0) {
            eventsData.content.forEach(event => {
                const eventItem = document.createElement('a');
                eventItem.className = 'list-group-item list-group-item-action';
                eventItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${event.titulo}</h6>
                        <small>${new Date(event.fechaInicio).toLocaleDateString('es-MX')}</small>
                    </div>
                    <p class="mb-1 small text-muted">${event.descripcion.substring(0, 50)}...</p>
                `;
                eventsList.appendChild(eventItem);
            });
        } else {
            eventsList.innerHTML = '<div class="text-center py-2">No hay eventos próximos</div>';
        }
    } catch (error) {
        handleApiError(error);
    }
}

// Cargar actividad reciente
async function loadRecentActivity() {
    try {
        const activityList = document.getElementById('activity-list');
        activityList.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';

        const [eventsResponse, reportsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/eventos?page=0&size=3&sort=fechaInicio,desc`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            }),
            fetch(`${API_BASE_URL}/reportes?page=0&size=3&sort=fecha,desc`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            })
        ]);

        if (!eventsResponse.ok || !reportsResponse.ok) {
            throw new Error('Error al cargar actividad reciente');
        }

        const eventsData = await eventsResponse.json();
        const reportsData = await reportsResponse.json();

        activityList.innerHTML = '';

        // Combinar y ordenar actividad
        const allActivity = [
            ...(eventsData.content || []).map(event => ({
                type: 'event',
                title: event.titulo,
                date: event.fechaInicio,
                icon: 'fa-calendar-alt'
            })),
            ...(reportsData.content || []).map(report => ({
                type: 'report',
                title: report.titulo,
                date: report.fecha,
                icon: 'fa-flag'
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        if (allActivity.length === 0) {
            activityList.innerHTML = '<div class="text-center py-3">No hay actividad reciente</div>';
            return;
        }

        allActivity.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p><strong>${getActivityTitle(activity.type)}</strong> ${activity.title}</p>
                    <small>${new Date(activity.date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}</small>
                </div>
            `;
            activityList.appendChild(activityItem);
        });

    } catch (error) {
        activityList.innerHTML = `<div class="alert alert-danger">Error al cargar actividad: ${error.message}</div>`;
    }
}

function getActivityTitle(type) {
    switch(type) {
        case 'event': return 'Nuevo evento:';
        case 'report': return 'Nuevo reporte:';
        default: return 'Actividad:';
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const userData = getAuthenticatedUser();
        if (!userData) return;

        displayAdminInfo(userData);
        setupLogout();

        // Cargar todos los datos del dashboard
        await Promise.all([
            loadDashboardStats(),
            loadRecentSales(),
            loadUpcomingEvents(),
            loadRecentActivity()
        ]);

    } catch (error) {
        console.error("Error inicial:", error);
        window.location.href = '../index.html';
    }
});