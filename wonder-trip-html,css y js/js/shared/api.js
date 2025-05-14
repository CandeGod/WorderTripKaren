// Exporta la constante API_BASE_URL primero
export const API_BASE_URL = 'http://localhost:8080/api';

// Función auxiliar para manejar errores de API
const handleApiResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorText;
        } catch (e) {
            errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
    }
    return response.json();
};

// Funciones para usuarios
export const fetchUserById = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`);
    return handleApiResponse(response);
};

export const updateUser = async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });
    return handleApiResponse(response);
};

// Funciones para reportes
export const fetchUserReports = async (userId, page = 0, size = 10) => {
    const response = await fetch(
        `${API_BASE_URL}/reportes/usuario/${userId}?page=${page}&size=${size}&sort=asc`
    );
    return handleApiResponse(response);
};

// Funciones para eventos
export async function fetchEvents(page = 0, size = 6, sort = 'asc', siteId = null) {
    let url = `${API_BASE_URL}/eventos?page=${page}&size=${size}&sort=${sort}`;
    if (siteId) url += `&idSitio=${siteId}`;
    const response = await fetch(url);
    return handleApiResponse(response);
}

// Funciones para sitios turísticos
export async function fetchTouristSites() {
    const response = await fetch(`${API_BASE_URL}/sitios-turisticos`);
    return handleApiResponse(response);
}

export async function fetchSiteDetails(id) {
    const response = await fetch(`${API_BASE_URL}/sitios-turisticos/${id}`);
    return handleApiResponse(response);
}

// Funciones para hoteles
export async function fetchHotelDetails(id) {
    if (!id) return null;
    const response = await fetch(`${API_BASE_URL}/hoteles/${id}`);
    return handleApiResponse(response);
}

// Funciones para paquetes
export async function fetchPackages(withSites = false) {
    const endpoint = withSites ? '/paquetes/con-sitios' : '/paquetes';
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return handleApiResponse(response);
}

export async function fetchPackageDetails(id) {
    const response = await fetch(`${API_BASE_URL}/paquetes/${id}/con-sitios`);
    return handleApiResponse(response);
}

// Funciones para compras
export async function createPurchase(purchaseData) {
    if (!purchaseData.paqueteId || !purchaseData.usuarioId) {
        throw new Error('Faltan datos obligatorios para la compra');
    }

    const response = await fetch(`${API_BASE_URL}/compras`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            fechaCompra: purchaseData.fechaCompra,
            metodoPago: purchaseData.metodoPago,
            paqueteId: purchaseData.paqueteId,
            usuarioId: purchaseData.usuarioId
        })
    });
    return handleApiResponse(response);
}

export async function fetchUserPurchases(userId) {
    const response = await fetch(`${API_BASE_URL}/compras/${userId}/compras`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
    });
    return handleApiResponse(response);
}