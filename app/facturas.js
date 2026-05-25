import { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Alert,
} from 'react-native';

import { obtenerFacturas } from '../services/facturasService';

export default function FacturasGuardadas() {
    const [facturas, setFacturas] = useState([]);

    useEffect(() => {
        cargarFacturas();
    }, []);

    const cargarFacturas = async () => {
        const data = await obtenerFacturas();
        setFacturas(data);
    };

    const verFactura = (factura) => {
        Alert.alert(
            `Factura #${factura.numeroRecibo || '---'}`,
            `Cliente: ${factura.cliente}\nTotal: $${factura.total}`
        );
    };

    const renderFactura = ({ item }) => (
        <Pressable
            style={styles.card}
            onPress={() => verFactura(item)}
        >
            <View style={styles.cardTop}>
                <Text style={styles.numero}>
                    RECIBO #{item.numeroRecibo || '---'}
                </Text>

                <Text style={styles.total}>
                    ${item.total}
                </Text>
            </View>

            <Text style={styles.cliente}>
                {item.cliente || 'Sin cliente'}
            </Text>

            <Text style={styles.fecha}>
                {item.fecha?.dia}/{item.fecha?.mes}/{item.fecha?.anio}
            </Text>

            <Text style={styles.productos}>
                Productos: {
                    item.filas?.filter(f => f.descripcion).length || 0
                }
            </Text>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Facturas guardadas
            </Text>

            <FlatList
                data={facturas}
                keyExtractor={(item) => item.id}
                renderItem={renderFactura}
                contentContainerStyle={{
                    paddingBottom: 30,
                }}
                ListEmptyComponent={
                    <Text style={styles.empty}>
                        No hay facturas guardadas
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f2f2f2',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#0b376b',
    },

    card: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 3,
    },

    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    numero: {
        fontWeight: 'bold',
        color: '#0b376b',
        fontSize: 16,
    },

    total: {
        fontWeight: 'bold',
        color: '#d85c42',
        fontSize: 16,
    },

    cliente: {
        fontSize: 15,
        marginBottom: 4,
    },

    fecha: {
        color: '#666',
        marginBottom: 4,
    },

    productos: {
        color: '#444',
    },

    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: '#777',
    },
});