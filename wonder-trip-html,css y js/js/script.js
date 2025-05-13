document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("container");
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    // Alternar entre formularios
    registerBtn.addEventListener("click", () => {
        container.classList.add("right-panel-active");
    });

    loginBtn.addEventListener("click", () => {
        container.classList.remove("right-panel-active");
    });

    // Manejar el formulario de login (código original)
    loginForm.addEventListener("submit", function (event) {
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
                else throw new Error("Credenciales incorrectas o rol no autorizado");
            })
            .then(data => {
                if (data.rol === "ADMINISTRADOR") {
                    window.location.href = "../html/admin_dashboard.html";
                } else {
                    window.location.href = '/html/user_dashboard.html';
                }
            })
            .catch(error => {
                document.getElementById("errorMessage").textContent = error.message;
            });
    });

    // Manejar el formulario de registro (nuevo código para el endpoint)
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value;
        const gender = document.getElementById("registerGender").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const image = document.getElementById("image").value

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
                        throw new Error(err.message || 'Error en el registro');
                    });
                }
                return response.json();
            })
            .then(data => {
                // Registro exitoso - mostrar mensaje y cambiar a formulario de login
                alert("¡Registro exitoso! Por favor inicia sesión.");
                container.classList.remove("right-panel-active");
                registerForm.reset();
            })
            .catch(error => {
                // Mostrar mensaje de error
                const errorMessage = document.getElementById("registerErrorMessage");
                if (error.message) {
                    errorMessage.textContent = error.message;
                } else if (error.errors) {
                    // Si el backend devuelve múltiples errores
                    errorMessage.textContent = Object.values(error.errors).join(', ');
                } else {
                    errorMessage.textContent = "Error al registrar. Por favor intenta nuevamente.";
                }
            });
    });
});