import AsyncStorage from '@react-native-async-storage/async-storage';
import { hayInternet } from './networkService';
import { apiRequest } from './api';

const FACTURAS_KEY = 'facturas_app_factura';

export async function obtenerFacturas() {
    const data = await AsyncStorage.getItem(FACTURAS_KEY);
    return data ? JSON.parse(data) : [];
}

export const eliminarFactura = async (id) => {
  const facturas = await obtenerFacturas();
  const nuevasFacturas = facturas.filter((factura) => factura.id !== id);
  await AsyncStorage.setItem(FACTURAS_KEY, JSON.stringify(nuevasFacturas));
};

export async function guardarFactura(factura) {
    const online = await hayInternet();

    if (online) {
        try {
            const respuesta = await apiRequest('/guardarFactura', {
                method: 'POST',
                body: JSON.stringify(factura),
            });

            const facturaGuardada =
                typeof respuesta.body === 'string'
                    ? JSON.parse(respuesta.body)
                    : respuesta;

            const facturasActuales = await obtenerFacturas();

            await AsyncStorage.setItem(
                FACTURAS_KEY,
                JSON.stringify([facturaGuardada, ...facturasActuales])
            );

            return facturaGuardada;
        } catch (error) {
            console.log('Error AWS:', error.message);
        }
    }

    const facturasActuales = await obtenerFacturas();

    const facturaLocal = {
        id: Date.now().toString(),
        numeroRecibo: null,
        fechaGuardado: new Date().toISOString(),
        sincronizada: false,
        pendienteSincronizar: true,
        ...factura,
    };

    await AsyncStorage.setItem(
        FACTURAS_KEY,
        JSON.stringify([facturaLocal, ...facturasActuales])
    );

    

    return facturaLocal;
}