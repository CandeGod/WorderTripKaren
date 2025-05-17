const API_BASE_URL = 'http://localhost:8080/api';

class UsuariosApp {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 10;
        this.sortDirection = 'asc';
        this.totalUsuarios = 0;
        this.usuariosData = [];
    }

    async init() {
        await this.loadUsuarios();
        this.setupEventListeners();
    }

    async loadUsuarios(page = this.currentPage, size = this.pageSize, sort = this.sortDirection, filtros = {}) {
        try {
            let url = `${API_BASE_URL}/usuarios?page=${page}&size=${size}&sort=${sort}`;

            if (filtros.busqueda) {
                url += `&nombre=${encodeURIComponent(filtros.busqueda)}`;
            }
            if (filtros.rol) {
                url += `&rol=${filtros.rol}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar usuarios');

            const data = await response.json();
            this.usuariosData = Array.isArray(data) ? data : data.content || [];
            this.totalUsuarios = data.totalElements || data.length;

            this.renderUsuariosTable();
            this.updatePagination();
            this.updateStats();
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error al cargar usuarios', 'danger');
        }
    }

    renderUsuariosTable() {
        const usuariosTableBody = document.getElementById('usuariosTableBody');
        usuariosTableBody.innerHTML = '';

        if (this.usuariosData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7" class="text-center">No se encontraron usuarios</td>`;
            usuariosTableBody.appendChild(row);
            return;
        }

        this.usuariosData.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${this.validateImageUrl(usuario.imagenPerfil)}" 
                         alt="${usuario.nombre}" 
                         class="img-thumbnail rounded-circle" 
                         style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td>${usuario.nombre}</td>
                <td>${usuario.correo}</td>
                <td>${usuario.sexo}</td>
                <td>
                    <span class="badge ${usuario.rol === 'ADMINISTRADOR' ? 'bg-primary' : 'bg-secondary'}">
                        ${usuario.rol === 'ADMINISTRADOR' ? 'ADMINISTRADOR' : 'USUARIO'}
                    </span>
                </td>
                <td>
                    ${usuario.reportes?.length || 0}
                    ${usuario.reportes?.length > 0 ?
                    `<button class="btn btn-sm btn-outline-info ms-2 ver-reportes" data-id="${usuario.id}">
                            <i class="bi bi-eye"></i> Ver
                        </button>` : ''
                }
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 editar-usuario" data-id="${usuario.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger eliminar-usuario" data-id="${usuario.id}" data-nombre="${usuario.nombre}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            usuariosTableBody.appendChild(row);
        });
    }

    validateImageUrl(url) {
        if (!url || !url.startsWith('http')) {
            return 'https://via.placeholder.com/150?text=Usuario';
        }
        return url;
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        const totalPages = Math.ceil(this.totalUsuarios / this.pageSize);

        if (totalPages <= 1) return;

        // Botón Anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 0 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadUsuarios();
            }
        });
        pagination.appendChild(prevLi);

        // Números de página
        for (let i = 0; i < totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            li.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = i;
                this.loadUsuarios();
            });
            pagination.appendChild(li);
        }

        // Botón Siguiente
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.currentPage === totalPages - 1 ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage < totalPages - 1) {
                this.currentPage++;
                this.loadUsuarios();
            }
        });
        pagination.appendChild(nextLi);
    }

    updateStats() {
        document.getElementById('totalUsuarios').textContent = this.totalUsuarios;

        const totalAdmins = this.usuariosData.filter(u => u.rol === 'ADMINISTRADOR').length;
        const totalUsers = this.usuariosData.filter(u => u.rol === 'USUARIO').length;

        document.getElementById('totalAdmins').textContent = totalAdmins;
        document.getElementById('totalUsers').textContent = totalUsers;
    }

    setupEventListeners() {
        // Vista previa de imagen en editar usuario
        document.getElementById('editImagenUsuario').addEventListener('input', (e) => {
            const imagenUrl = e.target.value;
            document.getElementById('editImagenPreview').src =
                imagenUrl && imagenUrl.startsWith('http') ?
                    imagenUrl :
                    'https://via.placeholder.com/150?text=Usuario';
        });

        // Formulario nuevo usuario
        document.getElementById('formNuevoUsuario').addEventListener('submit', async (e) => {
            e.preventDefault();

            const nuevoUsuario = {
                nombre: document.getElementById('nombreUsuario').value,
                correo: document.getElementById('correoUsuario').value,
                contrasena: document.getElementById('contrasenaUsuario').value,
                sexo: document.getElementById('sexoUsuario').value,
                rol: document.getElementById('rolUsuario').value,
                imagenPerfil: document.getElementById('imagenUsuario').value || null
            };

            try {
                const response = await fetch(`${API_BASE_URL}/usuarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(nuevoUsuario)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al crear usuario');
                }

                this.showAlert('Usuario creado exitosamente', 'success');

                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoUsuarioModal'));
                modal.hide();

                document.getElementById('formNuevoUsuario').reset();
                this.loadUsuarios();
            } catch (error) {
                console.error('Error:', error);
                this.showAlert(error.message || 'Error al crear usuario', 'danger');
            }
        });

        // Formulario editar usuario
        document.getElementById('formEditarUsuario').addEventListener('submit', async (e) => {
            e.preventDefault();

            const usuarioId = document.getElementById('editIdUsuario').value;
            const usuarioActualizado = {
                nombre: document.getElementById('editNombreUsuario').value,
                correo: document.getElementById('editCorreoUsuario').value,
                sexo: document.getElementById('editSexoUsuario').value,
                rol: document.getElementById('editRolUsuario').value,
                imagenPerfil: document.getElementById('editImagenUsuario').value || null
            };

            // Solo agregar contraseña si se proporcionó una nueva
            const nuevaContrasena = document.getElementById('editContrasenaUsuario').value;
            if (nuevaContrasena) {
                usuarioActualizado.contrasena = nuevaContrasena;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(usuarioActualizado)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al actualizar usuario');
                }

                this.showAlert('Usuario actualizado exitosamente', 'success');

                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editarUsuarioModal'));
                modal.hide();

                this.loadUsuarios();
            } catch (error) {
                console.error('Error:', error);
                this.showAlert(error.message || 'Error al actualizar usuario', 'danger');
            }
        });

        // Botones editar/eliminar/ver reportes (delegación de eventos)
        document.getElementById('usuariosTableBody').addEventListener('click', (e) => {
            if (e.target.closest('.editar-usuario')) {
                const button = e.target.closest('.editar-usuario');
                const usuarioId = button.getAttribute('data-id');
                this.openEditModal(usuarioId);
            }

            if (e.target.closest('.eliminar-usuario')) {
                const button = e.target.closest('.eliminar-usuario');
                const usuarioId = button.getAttribute('data-id');
                const usuarioNombre = button.getAttribute('data-nombre');
                this.openDeleteConfirmationModal(usuarioId, usuarioNombre);
            }

            if (e.target.closest('.ver-reportes')) {
                const button = e.target.closest('.ver-reportes');
                const usuarioId = button.getAttribute('data-id');
                this.openReportesModal(usuarioId);
            }
        });

        // Confirmar eliminación
        document.getElementById('confirmarEliminar').addEventListener('click', async () => {
            const usuarioId = document.getElementById('confirmarEliminar').getAttribute('data-id');

            try {
                const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar usuario');
                }

                this.showAlert('Usuario eliminado exitosamente', 'success');

                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarModal'));
                modal.hide();

                this.loadUsuarios();
            } catch (error) {
                console.error('Error:', error);
                this.showAlert(error.message || 'Error al eliminar usuario', 'danger');
            }
        });

        // Filtros
        document.getElementById('filtroUsuariosForm').addEventListener('submit', (e) => {
            e.preventDefault();

            const filtros = {
                busqueda: document.getElementById('busqueda').value.trim(),
                rol: document.getElementById('rol').value
            };

            this.sortDirection = document.getElementById('orden').value;
            this.currentPage = 0;
            this.loadUsuarios(this.currentPage, this.pageSize, this.sortDirection, filtros);
        });
    }

    async openEditModal(usuarioId) {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`);
            if (!response.ok) throw new Error('Error al cargar usuario');

            const usuario = await response.json();

            // Llenar formulario
            document.getElementById('editIdUsuario').value = usuario.id;
            document.getElementById('editNombreUsuario').value = usuario.nombre;
            document.getElementById('editCorreoUsuario').value = usuario.correo;
            document.getElementById('editSexoUsuario').value = usuario.sexo;
            document.getElementById('editRolUsuario').value = usuario.rol;
            document.getElementById('editImagenUsuario').value = usuario.imagenPerfil || '';

            // Actualizar vista previa
            document.getElementById('editImagenPreview').src =
                this.validateImageUrl(usuario.imagenPerfil);

            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('editarUsuarioModal'));
            modal.show();
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error al cargar datos del usuario', 'danger');
        }
    }

    async openReportesModal(usuarioId) {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes/usuario/${usuarioId}`);
        if (!response.ok) throw new Error('Error al cargar reportes');
        
        const data = await response.json();
        
        // Verificar la estructura de la respuesta
        console.log('Respuesta de reportes:', data);
        
        this.renderReportesModal(data);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('reportesUsuarioModal'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        this.showAlert('Error al cargar reportes del usuario', 'danger');
    }
}

    renderReportesModal(reportes) {
        const reportesContent = document.getElementById('reportesUsuarioContent');
        reportesContent.innerHTML = '';

        // Verificar si reportes es un array, si no, intentar extraer los reportes de la respuesta
        let reportesArray = Array.isArray(reportes) ? reportes : [];

        // Si no es array pero es un objeto con propiedad 'content' (paginación)
        if (!Array.isArray(reportes) && reportes.content) {
            reportesArray = reportes.content;
        }
        // Si no es array pero es un objeto con propiedad 'reportes'
        else if (!Array.isArray(reportes) && reportes.reportes) {
            reportesArray = reportes.reportes;
        }

        if (reportesArray.length === 0) {
            reportesContent.innerHTML = '<p class="text-center">Este usuario no tiene reportes</p>';
            return;
        }

        const reportesList = document.createElement('div');
        reportesList.className = 'list-group';

        reportesArray.forEach(reporte => {
            // Verificar si el reporte tiene fecha, si no, usar fecha actual
            const fechaReporte = reporte.fecha || new Date().toISOString();
            const fecha = new Date(fechaReporte).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const reporteItem = document.createElement('div');
            reporteItem.className = 'list-group-item';
            reporteItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${reporte.titulo || 'Reporte sin título'}</h5>
                <small>${fecha}</small>
            </div>
            <p class="mb-1">${reporte.descripcion || 'No hay descripción disponible'}</p>
        `;
            reportesList.appendChild(reporteItem);
        });

        reportesContent.appendChild(reportesList);
    }

    openDeleteConfirmationModal(usuarioId, usuarioNombre) {
        document.getElementById('nombreUsuarioEliminar').textContent = usuarioNombre;
        document.getElementById('confirmarEliminar').setAttribute('data-id', usuarioId);
        const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarModal'));
        modal.show();
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show fixed-top mx-auto mt-3`;
        alertDiv.style.maxWidth = '500px';
        alertDiv.style.zIndex = '1060';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 3000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const usuariosApp = new UsuariosApp();
    usuariosApp.init();
});