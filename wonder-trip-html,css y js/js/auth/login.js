import { handleApiError, toggleForms } from '../shared/utils.js';

document.addEventListener("DOMContentLoaded", function() {
    // Inicializar el toggle de formularios
    toggleForms();
    
    const loginForm = document.getElementById("loginForm");
    
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        fetch("http://localhost:8080/api/usuarios/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo: email,
                contrasena: password,
                rol: role
            })
        })
        .then(response => {
            if (response.ok) return response.json();
            throw new Error("Credenciales incorrectas o rol no autorizado");
        })
        .then(data => {
            localStorage.setItem('userData', JSON.stringify(data));
            
            if (data.rol === "ADMINISTRADOR") {
                window.location.href = "admin_dashboard/index.html";
            } else {
                window.location.href = 'user_dashboard/user.html';
            }
        })
        .catch(error => {
            handleApiError(error, "errorMessage");
        });
    });
});