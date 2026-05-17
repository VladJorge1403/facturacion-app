import { apiRequest } from './api';

export async function guardarFactura(factura) {
    return await apiRequest('/facturas', {
        method: 'POST',
        body: JSON.stringify(factura),
    });
}

export async function obtenerFacturas() {
    return await apiRequest('/facturas');
}