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
    
    // Inicializar módulos
    initEvents();
    initSites();
    initModal();
});