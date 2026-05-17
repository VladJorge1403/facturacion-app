import AsyncStorage from '@react-native-async-storage/async-storage';
import { hayInternet } from './networkService';
import { apiRequest } from './api';

const PRECIOS_KEY = 'precios_app_factura';

export async function obtenerPrecios() {
    const preciosGuardados = await AsyncStorage.getItem(PRECIOS_KEY);
    return preciosGuardados ? JSON.parse(preciosGuardados) : null;
}

export async function guardarPrecios(precios) {
    await AsyncStorage.setItem(PRECIOS_KEY, JSON.stringify(precios));

    const online = await hayInternet();

    if (online) {
        // Cuando AWS esté listo:
        // await apiRequest('/precios', {
        //   method: 'POST',
        //   body: JSON.stringify(precios),
        // });
    }

    return precios;
}