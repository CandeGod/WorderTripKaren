const API_BASE_URL = 'http://localhost:8080/api';

export async function fetchEvents(page = 0, size = 6, sort = 'asc', siteId = null) {
    let url = `${API_BASE_URL}/eventos?page=${page}&size=${size}&sort=${sort}`;
    if (siteId) url += `&idSitio=${siteId}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al cargar eventos');
    return await response.json();
}

export async function fetchTouristSites() {
    const response = await fetch(`${API_BASE_URL}/sitios-turisticos`);
    if (!response.ok) throw new Error('Error al cargar sitios turísticos');
    return await response.json();
}

export async function fetchSiteDetails(id) {
    const response = await fetch(`${API_BASE_URL}/sitios-turisticos/${id}`);
    if (!response.ok) throw new Error('Error al cargar detalles del sitio');
    return await response.json();
}

export async function fetchHotelDetails(id) {
    if (!id) return null;
    const response = await fetch(`${API_BASE_URL}/hoteles/${id}`);
    if (!response.ok) throw new Error('Error al cargar detalles del hotel');
    return await response.json();
}