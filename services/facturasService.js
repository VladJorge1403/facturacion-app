import AsyncStorage from '@react-native-async-storage/async-storage';
import { hayInternet } from './networkService';
import { apiRequest } from './api';

const FACTURAS_KEY = 'facturas_app_factura';

export async function obtenerFacturas() {
  const online = await hayInternet();

  if (online) {
    try {
      const respuesta = await apiRequest('/facturas', {
        method: 'GET',
      });

      const facturas =
        typeof respuesta.body === 'string'
          ? JSON.parse(respuesta.body)
          : respuesta;

      const lista = Array.isArray(facturas) ? facturas : [];

      await AsyncStorage.setItem(FACTURAS_KEY, JSON.stringify(lista));

      return lista;
    } catch (error) {
      console.log('Error obteniendo facturas desde AWS:', error.message);
    }
  }

  const data = await AsyncStorage.getItem(FACTURAS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function guardarFactura(factura) {
  const online = await hayInternet();

  const facturaBase = {
    id: factura.id || Date.now().toString(),
    numeroRecibo: factura.numeroRecibo || null,
    cliente: factura.cliente || '',
    fecha: factura.fecha || {},
    filas: factura.filas || [],
    ajustes: factura.ajustes || {},
    total: factura.total || '0',
    pdfUrl: factura.pdfUrl || null,
    sincronizada: online,
    pendienteSincronizar: !online,
    actualizadaEn: new Date().toISOString(),
    creadaEn: factura.creadaEn || new Date().toISOString(),
  };

  if (online) {
    try {
      const respuesta = await apiRequest('/facturas', {
        method: 'POST',
        body: JSON.stringify(facturaBase),
      });

      const facturaGuardada =
        typeof respuesta.body === 'string'
          ? JSON.parse(respuesta.body)
          : respuesta;

      await guardarFacturaEnCache(facturaGuardada);

      return facturaGuardada;
    } catch (error) {
      console.log('Error guardando en AWS:', error.message);
    }
  }

  await guardarFacturaEnCache(facturaBase);

  return facturaBase;
}

export async function actualizarFactura(id, facturaActualizada) {
  const online = await hayInternet();

  const facturaBase = {
    ...facturaActualizada,
    id,
    actualizadaEn: new Date().toISOString(),
    sincronizada: online,
    pendienteSincronizar: !online,
  };

  if (online) {
    try {
      const respuesta = await apiRequest(`/facturas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(facturaBase),
      });

      const facturaAws =
        typeof respuesta.body === 'string'
          ? JSON.parse(respuesta.body)
          : respuesta;

      await guardarFacturaEnCache(facturaAws);

      return facturaAws;
    } catch (error) {
      console.log('Error actualizando en AWS:', error.message);
    }
  }

  await guardarFacturaEnCache(facturaBase);

  return facturaBase;
}

export async function eliminarFactura(id) {
  const online = await hayInternet();

  if (online) {
    try {
      await apiRequest(`/facturas/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.log('Error eliminando en AWS:', error.message);
    }
  }

  const facturas = await obtenerFacturasLocal();
  const nuevasFacturas = facturas.filter((factura) => factura.id !== id);

  await AsyncStorage.setItem(FACTURAS_KEY, JSON.stringify(nuevasFacturas));

  return true;
}

async function guardarFacturaEnCache(factura) {
  const facturasActuales = await obtenerFacturasLocal();

  const existe = facturasActuales.some((item) => item.id === factura.id);

  const nuevasFacturas = existe
    ? facturasActuales.map((item) =>
        item.id === factura.id ? factura : item
      )
    : [factura, ...facturasActuales];

  await AsyncStorage.setItem(FACTURAS_KEY, JSON.stringify(nuevasFacturas));
}

async function obtenerFacturasLocal() {
  const data = await AsyncStorage.getItem(FACTURAS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function sincronizarFacturasPendientes() {
  const online = await hayInternet();

  if (!online) return;

  const facturas = await obtenerFacturasLocal();
  const pendientes = facturas.filter((factura) => factura.pendienteSincronizar);

  for (const factura of pendientes) {
    try {
      await guardarFactura({
        ...factura,
        pendienteSincronizar: false,
        sincronizada: true,
      });
    } catch (error) {
      console.log('No se pudo sincronizar factura:', factura.id);
    }
  }
}