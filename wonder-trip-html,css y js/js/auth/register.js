import { handleApiError, toggleForms } from '../shared/utils.js';

document.addEventListener("DOMContentLoaded", function() {
    // Inicializar el toggle de formularios
    toggleForms();
    
    const registerForm = document.getElementById("registerForm");
    
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value;
        const gender = document.getElementById("registerGender").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const image = document.getElementById("image").value;

        fetch("http://localhost:8080/api/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                nombre: name,
                sexo: gender,
                correo: email,
                contrasena: password,
                rol: "USUARIO",
                imagenPerfil: image
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw err;
                });
            }
            return response.json();
        })
        .then(() => {
            alert("¡Registro exitoso! Por favor inicia sesión.");
            document.getElementById("container").classList.remove("right-panel-active");
            registerForm.reset();
        })
        .catch(error => {
            handleApiError(error, "registerErrorMessage");
        });
    });
});