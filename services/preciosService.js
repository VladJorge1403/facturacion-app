import AsyncStorage from '@react-native-async-storage/async-storage';
import { hayInternet } from './networkService';
import { apiRequest } from './api';

const PRECIOS_KEY = 'precios_app_factura';

export async function obtenerPrecios() {
  const online = await hayInternet();

  if (online) {
    try {
      const respuesta = await apiRequest('/precios', {
        method: 'GET',
      });

      const precios =
        typeof respuesta.body === 'string'
          ? JSON.parse(respuesta.body)
          : respuesta;

      const lista = Array.isArray(precios) ? precios : [];

      await AsyncStorage.setItem(PRECIOS_KEY, JSON.stringify(lista));

      return lista;
    } catch (error) {
      console.log('Error obteniendo precios desde AWS:', error.message);
    }
  }

  return await obtenerPreciosLocal();
}

export async function guardarPrecios(precios) {
  const lista = Array.isArray(precios) ? precios : [];

  await AsyncStorage.setItem(PRECIOS_KEY, JSON.stringify(lista));

  const online = await hayInternet();

  if (online) {
    try {
      await apiRequest('/precios', {
        method: 'POST',
        body: JSON.stringify(lista),
      });
    } catch (error) {
      console.log('Error guardando precios en AWS:', error.message);
    }
  }

  return lista;
}

export async function guardarProducto(producto) {
  const preciosActuales = await obtenerPreciosLocal();

  const productoBase = {
    id: producto.id || Date.now().toString(),
    nombre: producto.nombre || '',
    precioBase: Number(producto.precioBase || 0),
    descripcion: producto.descripcion || '',
    costosAdicionales: producto.costosAdicionales || [],
    creadaEn: producto.creadaEn || new Date().toISOString(),
    actualizadaEn: new Date().toISOString(),
  };

  const existe = preciosActuales.some((item) => item.id === productoBase.id);

  const nuevaLista = existe
    ? preciosActuales.map((item) =>
        item.id === productoBase.id ? productoBase : item
      )
    : [productoBase, ...preciosActuales];

  await guardarPrecios(nuevaLista);

  return productoBase;
}

export async function eliminarProducto(id) {
  const preciosActuales = await obtenerPreciosLocal();
  const nuevaLista = preciosActuales.filter((item) => item.id !== id);

  await guardarPrecios(nuevaLista);

  return true;
}

async function obtenerPreciosLocal() {
  const data = await AsyncStorage.getItem(PRECIOS_KEY);
  return data ? JSON.parse(data) : [];
}