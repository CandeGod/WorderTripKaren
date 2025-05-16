export function toggleForms() {
    const container = document.getElementById("container");
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");

    if (registerBtn && loginBtn) {
        registerBtn.addEventListener("click", () => {
            container.classList.add("right-panel-active");
        });

        loginBtn.addEventListener("click", () => {
            container.classList.remove("right-panel-active");
        });
    }
}

export function handleApiError(error, elementId = 'error-message') {
    const errorElement = document.getElementById(elementId);
    if (!errorElement) {
        console.error('Error:', error.message || error);
        return;
    }
    
    if (error.message) {
        errorElement.textContent = error.message;
    } else if (error.errors) {
        errorElement.textContent = Object.values(error.errors).join(', ');
    } else {
        errorElement.textContent = "Ha ocurrido un error. Por favor intenta nuevamente.";
    }
}