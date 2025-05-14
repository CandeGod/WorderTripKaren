import { API_BASE_URL } from '../shared/api.js';

document.addEventListener("DOMContentLoaded", function() {
    // Elementos del DOM
    const profileForm = document.getElementById('profileForm');
    const nameInput = document.getElementById('name');
    const genderInput = document.getElementById('gender');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const profileImage = document.getElementById('profileImage');
    const changeImageBtn = document.getElementById('changeImageBtn');
    const imageUpload = document.getElementById('imageUpload');
    const reportsList = document.getElementById('reportsList');
    const newReportBtn = document.getElementById('newReportBtn');
    const reportModal = document.getElementById('reportModal');
    const reportForm = document.getElementById('reportForm');
    const cancelReportBtn = document.getElementById('cancelReportBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    let userId = null;
    let originalUserData = null;
    let isEditing = false;

    // Inicializar la página
    initPage();

    // Función para inicializar la página
    async function initPage() {
        try {
            // Obtener datos del usuario del localStorage
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            if (!userData || !userData.id) {
                throw new Error('No se encontraron datos de usuario. Por favor inicia sesión.');
            }
            
            userId = userData.id;
            
            // Cargar datos del usuario
            await loadUserData(userId);
            
            // Cargar reportes del usuario
            await loadUserReports(userId);
            
            // Mostrar nombre de usuario en el encabezado
            document.getElementById('welcomeMessage').textContent = `Mi Perfil - ${userData.nombre.split(' ')[0]}`;
            
        } catch (error) {
            console.error('Error al inicializar la página:', error);
            alert(error.message);
            window.location.href = '../index.html';
        }
    }

    // Cargar datos del usuario
    async function loadUserData(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios/${id}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar los datos del usuario');
            }
            
            const userData = await response.json();
            originalUserData = { ...userData };
            
            // Mostrar datos en el formulario
            nameInput.value = userData.nombre;
            genderInput.value = userData.sexo;
            emailInput.value = userData.correo;
            passwordInput.value = userData.contrasena;
            
            // Mostrar imagen de perfil
            if (userData.imagenPerfil) {
                profileImage.src = userData.imagenPerfil;
            } else {
                profileImage.src = 'https://via.placeholder.com/150?text=Usuario';
            }
            
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            throw error;
        }
    }

    // Cargar reportes del usuario
    async function loadUserReports(userId, page = 0, size = 10) {
        try {
            reportsList.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Cargando reportes...</p>
                </div>
            `;
            
            const response = await fetch(`${API_BASE_URL}/reportes/usuario/${userId}?page=${page}&size=${size}&sort=asc`);
            
            if (!response.ok) {
                throw new Error('Error al cargar los reportes');
            }
            
            const reportsData = await response.json();
            displayReports(reportsData.content);
            
        } catch (error) {
            console.error('Error al cargar reportes:', error);
            reportsList.innerHTML = `
                <div class="error-message">
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    // Mostrar reportes en la lista
    function displayReports(reports) {
        if (reports.length === 0) {
            reportsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No tienes reportes registrados</p>
                </div>
            `;
            return;
        }
        
        reportsList.innerHTML = '';
        
        reports.forEach(report => {
            const reportCard = document.createElement('div');
            reportCard.className = 'report-card';
            reportCard.innerHTML = `
                <div class="report-header">
                    <h4 class="report-title">${report.titulo}</h4>
                    <span class="report-date">${new Date(report.fecha).toLocaleDateString()}</span>
                </div>
                <p class="report-description">${report.descripcion}</p>
            `;
            
            reportsList.appendChild(reportCard);
        });
    }

    // Manejar envío del formulario de perfil
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando...';
            
            const updatedData = {
                nombre: nameInput.value,
                sexo: genderInput.value,
                correo: emailInput.value,
                contrasena: passwordInput.value,
                rol: originalUserData.rol
            };
            
            const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
            
            if (!response.ok) {
                throw new Error('Error al actualizar los datos');
            }
            
            // Actualizar datos en localStorage
            const updatedUser = await response.json();
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            
            // Recargar datos para asegurar consistencia
            await loadUserData(userId);
            
            alert('Datos actualizados correctamente');
            
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            alert(`Error al actualizar: ${error.message}`);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar cambios';
        }
    });

    // Cancelar edición
    cancelBtn.addEventListener('click', function() {
        if (originalUserData) {
            nameInput.value = originalUserData.nombre;
            genderInput.value = originalUserData.sexo;
            emailInput.value = originalUserData.correo;
            passwordInput.value = originalUserData.contrasena;
        }
    });

    // Mostrar/ocultar contraseña
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    // Cambiar imagen de perfil
    changeImageBtn.addEventListener('click', function() {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', async function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                profileImage.src = event.target.result;
                // Aquí podrías agregar lógica para subir la imagen al servidor
            };
            
            reader.readAsDataURL(file);
        }
    });

    // Nuevo reporte
    newReportBtn.addEventListener('click', function() {
        reportModal.style.display = 'block';
    });

    // Enviar nuevo reporte
    reportForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const title = document.getElementById('reportTitle').value;
            const description = document.getElementById('reportDescription').value;
            
            const response = await fetch(`${API_BASE_URL}/reportes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    titulo: title,
                    descripcion: description,
                    idUsuario: userId,
                    fecha: new Date().toISOString().split('T')[0]
                })
            });
            
            if (!response.ok) {
                throw new Error('Error al enviar el reporte');
            }
            
            // Cerrar modal y recargar reportes
            reportModal.style.display = 'none';
            reportForm.reset();
            await loadUserReports(userId);
            
            alert('Reporte enviado correctamente');
            
        } catch (error) {
            console.error('Error al enviar reporte:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Cancelar nuevo reporte
    cancelReportBtn.addEventListener('click', function() {
        reportModal.style.display = 'none';
        reportForm.reset();
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === reportModal) {
            reportModal.style.display = 'none';
            reportForm.reset();
        }
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('userData');
        window.location.href = '../index.html';
    });
});