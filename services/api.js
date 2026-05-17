const API_URL = 'https://m900d5on4h.execute-api.us-east-2.amazonaws.com/default';

export async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    const text = await response.text();

    console.log('STATUS AWS:', response.status);
    console.log('RESPUESTA AWS:', text);

    if (!response.ok) {
        throw new Error(text || 'Error en la petición');
    }

    return text ? JSON.parse(text) : null;
}
//https://m900d5on4h.execute-api.us-east-2.amazonaws.com/default/guardarFactura