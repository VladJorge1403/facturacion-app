import { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    TextInput,
    Modal,
    useWindowDimensions,
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { obtenerFacturas, eliminarFactura } from '../services/facturasService';

const PRIMARY = '#1479B8';
const TEXT = '#18384F';
const MUTED = '#6F8CA3';
const BG = '#F4F7FB';
const DANGER = '#E04F5F';

export default function FacturasGuardadas() {
    const [facturas, setFacturas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [modalEliminar, setModalEliminar] = useState(false);
    const [facturaEliminar, setFacturaEliminar] = useState(null);

    const { height } = useWindowDimensions();

    useFocusEffect(
        useCallback(() => {
            cargarFacturas();
        }, [])
    );

    const { width } = useWindowDimensions();

    const columnas = width >= 900 ? 3 : width >= 650 ? 2 : 1;

    const cargarFacturas = async () => {
        const data = await obtenerFacturas();
        setFacturas(Array.isArray(data) ? data : []);
    };

    const editarFactura = async (factura) => {
        await AsyncStorage.setItem('factura_editar_id', factura.id);
        router.push('/');
    };

    const abrirEliminar = (factura) => {
        setFacturaEliminar(factura);
        setModalEliminar(true);
    };

    const confirmarEliminar = async () => {
        if (!facturaEliminar) return;

        await eliminarFactura(facturaEliminar.id);
        setModalEliminar(false);
        setFacturaEliminar(null);
        cargarFacturas();
    };

    const facturasFiltradas = facturas.filter((factura) => {
        const cliente = factura.cliente?.toLowerCase() || '';
        const numero = String(factura.numeroRecibo || '');

        return (
            cliente.includes(busqueda.toLowerCase()) ||
            numero.includes(busqueda)
        );
    });

    const contarProductos = (factura) =>
        factura.filas?.filter((f) => f.descripcion && f.descripcion !== 'Tocar para agregar').length || 0;

    const renderFactura = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.numero}>
                        #{item.numeroRecibo || '---'}
                    </Text>

                    <Text style={styles.fecha}>
                        {item.fecha?.dia}/{item.fecha?.mes}/{item.fecha?.anio}
                    </Text>
                </View>

                <Text style={styles.total}>
                    ${item.total || 0}
                </Text>
            </View>

            <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                    <Ionicons
                        name="person-outline"
                        size={16}
                        color={MUTED}
                    />

                    <Text style={styles.cliente}>
                        {item.cliente || 'Sin cliente'}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons
                        name="cube-outline"
                        size={16}
                        color={MUTED}
                    />

                    <Text style={styles.productos}>
                        {contarProductos(item)} productos
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                <Pressable
                    style={styles.editButton}
                    onPress={() => editarFactura(item)}
                >
                    <Feather
                        name="edit-2"
                        size={15}
                        color="#fff"
                    />

                    <Text style={styles.editText}>
                        Editar
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.deleteButton}
                    onPress={() => abrirEliminar(item)}
                >
                    <Feather
                        name="trash-2"
                        size={15}
                        color="#fff"
                    />

                    <Text style={styles.deleteText}>
                        Eliminar
                    </Text>
                </Pressable>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cotizaciones guardadas</Text>

            <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color={MUTED} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar cliente o recibo..."
                    value={busqueda}
                    onChangeText={setBusqueda}
                />
            </View>

            <FlatList
                key={columnas}

                data={facturasFiltradas}
                keyExtractor={(item) => item.id}
                renderItem={renderFactura}
                numColumns={columnas}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Ionicons name="document-text-outline" size={70} color="#C7D3DD" />
                        <Text style={styles.emptyTitle}>No hay cotizaciones</Text>
                        <Text style={styles.emptyText}>Cuando guardes una factura aparecerá aquí.</Text>
                    </View>
                }
            />

            <Modal visible={modalEliminar} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalIcon}>
                            <Feather name="trash-2" size={34} color={DANGER} />
                        </View>

                        <Text style={styles.modalTitle}>Eliminar cotización</Text>

                        <Text style={styles.modalText}>
                            ¿Seguro que deseas eliminar el recibo #{facturaEliminar?.numeroRecibo || '---'}?
                        </Text>

                        <View style={styles.modalActions}>
                            <Pressable
                                style={styles.modalCancel}
                                onPress={() => setModalEliminar(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </Pressable>

                            <Pressable style={styles.modalDelete} onPress={confirmarEliminar}>
                                <Text style={styles.modalDeleteText}>Eliminar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
        paddingHorizontal: 18,
        paddingTop: 55,
    },

    title: {
        fontSize: 30,
        fontWeight: '800',
        color: TEXT,
        marginBottom: 22,
    },

    searchBox: {
        height: 56,
        backgroundColor: '#fff',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 20,
    },

    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: TEXT,
    },

    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        margin: 8,
        maxWidth: '100%',
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },


    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    numero: {
        fontSize: 18,
        fontWeight: '800',
        color: TEXT,
    },

    fecha: {
        color: MUTED,
        marginTop: 3,
        fontSize: 13,
    },

    total: {
        fontSize: 24,
        fontWeight: '900',
        color: PRIMARY,
    },


    divider: {
        height: 1,
        backgroundColor: '#E5EDF3',
        marginVertical: 10,
    },

    infoBox: {
        gap: 8,
        marginBottom: 16,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    cliente: {
        marginLeft: 8,
        color: TEXT,
        fontWeight: '600',
        fontSize: 14,
    },

    productos: {
        marginLeft: 8,
        color: MUTED,
        fontSize: 13,
    },

    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },

    editButton: {
        flex: 1,
        backgroundColor: PRIMARY,
        borderRadius: 10,
        height: 38,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    editText: {
        color: '#fff',
        fontWeight: '700',
        marginLeft: 6,
    },

    actionButton: {
        flex: 1,
        height: 38,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D8E3EC',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },


    actionText: {
        marginLeft: 6,
        color: PRIMARY,
        fontWeight: '700',
    },

    deleteButton: {
        flex: 1,
        backgroundColor: DANGER,
        borderRadius: 10,
        height: 38,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    deleteText: {
        color: '#fff',
        fontWeight: '700',
        marginLeft: 6,
    },

    emptyBox: {
        alignItems: 'center',
        marginTop: 90,
    },

    emptyTitle: {
        marginTop: 16,
        fontSize: 22,
        fontWeight: '800',
        color: TEXT,
    },

    emptyText: {
        marginTop: 8,
        color: MUTED,
        textAlign: 'center',
        fontSize: 15,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(12, 26, 38, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    modalBox: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
    },

    modalIcon: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#FCEEEF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    modalTitle: {
        fontSize: 23,
        fontWeight: '800',
        color: TEXT,
        marginBottom: 8,
    },

    modalText: {
        fontSize: 16,
        color: MUTED,
        textAlign: 'center',
        marginBottom: 24,
    },

    modalActions: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },

    modalCancel: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D6E0EA',
        borderRadius: 12,
        paddingVertical: 14,
    },

    modalCancelText: {
        color: MUTED,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },

    modalDelete: {
        flex: 1,
        backgroundColor: DANGER,
        borderRadius: 12,
        paddingVertical: 14,
    },

    modalDeleteText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
});