import { handleApiError } from '../js/shared/utils.js';

document.addEventListener('DOMContentLoaded', function() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        if (!userData || userData.rol !== 'ADMINISTRADOR') {
            window.location.href = '../index.html';
            return;
        }
        
        displayAdminInfo(userData);
        setupLogout();
        loadDashboardStats();
        loadRecentActivity();
    } catch (error) {
        console.error("Error inicial:", error);
        window.location.href = '../index.html';
    }
});

function displayAdminInfo(userData) {
    const adminName = document.getElementById('admin-name');
    const adminEmail = document.getElementById('admin-email');
    const adminAvatar = document.querySelector('.admin-avatar');
    
    adminName.textContent = userData.nombre || 'Administrador';
    adminEmail.textContent = userData.correo || 'admin@wondertrip.com';
    
    if (userData.imagenPerfil) {
        adminAvatar.src = userData.imagenPerfil;
    } else {
        adminAvatar.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80';
    }
}

function setupLogout() {
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('userData');
        window.location.href = '../index.html';
    });
}

async function loadDashboardStats() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) throw new Error("No autenticado");

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token || ''}`
        };

        // Usando los endpoints especificados
        const [usersResponse, eventsResponse, reportsResponse, salesResponse] = await Promise.all([
            fetch('http://localhost:8080/api/usuarios?page=0&size=10&sort=asc', { headers }),
            fetch('http://localhost:8080/api/eventos?page=0&size=1&sort=asc', { headers }),
            fetch('http://localhost:8080/api/reportes?page=0&size=10&sort=asc', { headers }),
            fetch('http://localhost:8080/api/compras/suma-total', { headers })
        ]);

        if (!usersResponse.ok) throw new Error('Error al cargar usuarios');
        if (!eventsResponse.ok) throw new Error('Error al cargar eventos');
        if (!reportsResponse.ok) throw new Error('Error al cargar reportes');
        if (!salesResponse.ok) throw new Error('Error al cargar ventas');

        const users = await usersResponse.json();
        const events = await eventsResponse.json();
        const reports = await reportsResponse.json();
        const totalSales = await salesResponse.text(); // Asumiendo que devuelve solo el número

        // Actualizar UI con datos reales
        document.getElementById('total-users').textContent = users.totalElements || users.length || 0;
        document.getElementById('total-events').textContent = events.totalElements || 0;
        document.getElementById('total-reports').textContent = reports.totalElements || 0;
        document.getElementById('total-sales').textContent = totalSales || '0';

    } catch (error) {
        handleApiError(error);
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '<div class="loading">Cargando actividad reciente...</div>';
    
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userData')).token || ''}`
        };

        // Usando solo endpoints válidos
        const [eventsResponse, reportsResponse] = await Promise.all([
            fetch('http://localhost:8080/api/eventos?sort=fechaInicio,desc&size=3', { headers }),
            fetch('http://localhost:8080/api/reportes?sort=fecha,desc&size=3', { headers })
        ]);
        
        if (!eventsResponse.ok || !reportsResponse.ok) {
            throw new Error('Error al cargar actividad reciente');
        }
        
        const events = await eventsResponse.json();
        const reports = await reportsResponse.json();
        
        activityList.innerHTML = '';
        
        // Combinar actividad solo de eventos y reportes
        const allActivity = [
            ...events.content.map(event => ({
                type: 'event',
                title: event.titulo,
                date: event.fechaInicio,
                icon: 'fa-calendar-alt'
            })),
            ...reports.content.map(report => ({
                type: 'report',
                title: report.titulo,
                date: report.fecha,
                icon: 'fa-flag'
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        if (allActivity.length === 0) {
            activityList.innerHTML = '<div class="no-activity">No hay actividad reciente</div>';
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
        activityList.innerHTML = `<div class="error">Error al cargar actividad: ${error.message}</div>`;
    }
}

function getActivityTitle(type) {
    switch(type) {
        case 'event': return 'Nuevo evento:';
        case 'report': return 'Nuevo reporte:';
        default: return 'Actividad:';
    }
}