import { initEvents } from './events.js';
import { initSites } from './sites.js';
import { initModal } from './modal.js';

document.addEventListener("DOMContentLoaded", function() {
    // Mostrar nombre de usuario
    const userData = JSON.parse(localStorage.getItem('userData'));
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (userData && userData.nombre) {
        welcomeMessage.textContent = `Bienvenido, ${userData.nombre.split(' ')[0]}`;
    } else {
        welcomeMessage.textContent = 'Bienvenido, Viajero';
    }
    
    // Configurar logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userData');
        window.location.href = '../index.html';
    });

    // Manejar navegación del sidebar
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = e.target.getAttribute('href');
            
            // Si el enlace comienza con '#', es una sección interna
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = href.substring(1);
                
                // Ocultar todas las secciones
                document.querySelectorAll('.section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Mostrar la sección seleccionada
                if (target) {
                    document.getElementById(target).style.display = 'block';
                }
            }
            // Los enlaces a packages.html y purchases.html se manejarán normalmente
        });
    });
    
    // Inicializar módulos
    initEvents();
    initSites();
    initModal();
});