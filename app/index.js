import { View, Text, TextInput, StyleSheet, ScrollView, Image, Pressable, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import DescripcionModal from '../modals/modal';

import { guardarFactura } from '../services/facturasService';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

import AsyncStorage from '@react-native-async-storage/async-storage';


export default function FacturaScreen() {

    const [cliente, setCliente] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [filaSeleccionada, setFilaSeleccionada] = useState(null);

    const [numeroRecibo, setNumeroRecibo] = useState('0788');

    const [filas, setFilas] = useState(
        Array.from({ length: 14 }).map(() => ({
            cantidad: '',
            referencia: '',
            descripcion: '',
            precio: '',
            total: '',
        }))
    );

    const abrirModal = (index) => {
        setFilaSeleccionada(index);
        setModalVisible(true);
    };

    const guardarDescripcion = (data) => {
        const nuevasFilas = [...filas];

        nuevasFilas[filaSeleccionada].cantidad = data.cantidad;
        nuevasFilas[filaSeleccionada].descripcion = data.descripcion;
        nuevasFilas[filaSeleccionada].precio = data.precio;
        nuevasFilas[filaSeleccionada].total = data.total;

        setFilas(nuevasFilas);
    };

    const [fecha, setFecha] = useState(new Date());
    const [mostrarCalendario, setMostrarCalendario] = useState(false);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = String(fecha.getFullYear());

    const cambiarFecha = (event, selectedDate) => {
        setMostrarCalendario(false);

        if (selectedDate) {
            setFecha(selectedDate);
        }
    };

    const totalGeneral = filas
        .reduce((total, fila) => {
            const valor = parseFloat(fila.total) || 0;
            return total + valor;
        }, 0)
        .toFixed(2);


    const guardarFacturaActual = async () => {
        try {

            const factura = {
                cliente,
                fecha: {
                    dia,
                    mes,
                    anio,
                },
                filas,
                total: totalGeneral,
            };

            const facturaGuardada = await guardarFactura(factura);

            setNumeroRecibo(
                String(facturaGuardada.numeroRecibo + 1).padStart(4, '0')
            );

            Alert.alert('Listo', 'Factura guardada correctamente');

            setTimeout(() => {
                setCliente('');

                setFilas(
                    Array.from({ length: 14 }).map(() => ({
                        cantidad: '',
                        referencia: '',
                        descripcion: '',
                        precio: '',
                        total: '',
                    }))
                );

                setFecha(new Date());

            }, 60000);
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la factura');
        }
    };

    const compartirFactura = async () => {
        try {
            const contenido = `
                FACTURA

                Cliente: ${cliente}

                Fecha: ${dia}/${mes}/${anio}

                Productos:
                ${filas
                    .filter((fila) => fila.descripcion)
                    .map(
                        (fila, index) =>
                            `${index + 1}. Cant: ${fila.cantidad} | ${fila.descripcion} | Total: $${fila.total}`
                    )
                    .join('\n')}

                TOTAL: $${totalGeneral}
                `;

            const file = new File(Paths.cache, `factura-${Date.now()}.txt`);
            file.create();
            file.write(contenido);

            const disponible = await Sharing.isAvailableAsync();

            if (!disponible) {
                Alert.alert('Aviso', 'Compartir no está disponible');
                return;
            }

            await Sharing.shareAsync(file.uri);
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'No se pudo compartir la factura');
        }
    };

    return (
        <ScrollView style={styles.screen}>
            <View style={styles.receipt}>

                {/* ENCABEZADO */}
                <View style={styles.top}>
                    <View style={styles.leftHeader}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />

                        <Text style={styles.address}>
                            Calle Antigua a{'\n'}Zacatecoluca San Marcos
                        </Text>
                    </View>

                    <View style={styles.rightHeader}>
                        <Text style={styles.recibo}>RECIBO</Text>
                        <TextInput
                            style={styles.numero}
                            value={numeroRecibo}
                            onChangeText={setNumeroRecibo}
                            keyboardType="numeric"
                        />

                        <Text style={styles.fechaTitle}>FECHA</Text>

                        <Pressable onPress={() => setMostrarCalendario(true)}>
                            <View style={styles.dateRow}>
                                <View style={styles.dateBox}>
                                    <Text style={styles.dateLabel}>DIA</Text>
                                    <Text style={styles.dateText}>{dia}</Text>
                                </View>

                                <View style={styles.dateBox}>
                                    <Text style={styles.dateLabel}>MES</Text>
                                    <Text style={styles.dateText}>{mes}</Text>
                                </View>

                                <View style={styles.dateBox}>
                                    <Text style={styles.dateLabel}>AÑO</Text>
                                    <Text style={styles.dateText}>{anio}</Text>
                                </View>
                            </View>
                        </Pressable>

                        {mostrarCalendario && (
                            <DateTimePicker
                                value={fecha}
                                mode="date"
                                display="default"
                                onChange={cambiarFecha}
                            />
                        )}

                        <Text style={styles.phone}>Tel.: 2213-0460</Text>
                        <Text style={styles.phone}>7406-8290</Text>
                        <Text style={styles.phone}>Cel.: 7629-5889</Text>
                    </View>
                </View>

                {/* CLIENTE */}
                <View style={styles.clientRow}>
                    <Text style={styles.clientLabel}>CLIENTE</Text>
                    <TextInput style={styles.clientInput}
                        value={cliente}
                        onChangeText={setCliente} />
                </View>

                {/* TABLA */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, styles.cant]}>CANT</Text>
                        <Text style={[styles.th, styles.ref]}>REFERENCIA</Text>
                        <Text style={[styles.th, styles.desc]}>DESCRIPCIÓN</Text>
                        <Text style={[styles.th, styles.price]}>PRECIO</Text>
                        <Text style={[styles.th, styles.total]}>TOTAL</Text>
                    </View>

                    {filas.map((fila, index) => (
                        <View style={styles.tableRow} key={index}>
                            <TextInput
                                style={[styles.td, styles.cant]}
                                value={fila.cantidad}
                                onChangeText={(text) => {
                                    const nuevasFilas = [...filas];
                                    nuevasFilas[index].cantidad = text;
                                    setFilas(nuevasFilas);
                                }}
                            />

                            <TextInput
                                style={[styles.td, styles.ref]}
                                value={fila.referencia}
                                onChangeText={(text) => {
                                    const nuevasFilas = [...filas];
                                    nuevasFilas[index].referencia = text;
                                    setFilas(nuevasFilas);
                                }}
                            />

                            <Pressable
                                style={[styles.td, styles.desc]}
                                onPress={() => abrirModal(index)}
                            >
                                <Text style={styles.descText}>
                                    {fila.descripcion || 'Tocar para agregar'}
                                </Text>
                            </Pressable>

                            <TextInput
                                style={[styles.td, styles.price]}
                                value={fila.precio}
                                keyboardType="numeric"
                                onChangeText={(text) => {
                                    const nuevasFilas = [...filas];
                                    nuevasFilas[index].precio = text;
                                    setFilas(nuevasFilas);
                                }}
                            />

                            <TextInput
                                style={[styles.td, styles.total]}
                                value={fila.total}
                                keyboardType="numeric"
                                onChangeText={(text) => {
                                    const nuevasFilas = [...filas];
                                    nuevasFilas[index].total = text;
                                    setFilas(nuevasFilas);
                                }}
                            />
                        </View>


                    ))}
                </View>

                {/* TOTAL FINAL */}
                <View style={styles.bottom}>
                    <View style={styles.sonBox}>
                        <Text style={styles.son}>SON:</Text>
                    </View>

                    <View style={styles.totalBox}>
                        <Text style={styles.totalLabel}>TOTAL</Text>
                        <TextInput style={styles.finalTotal} value={`$${totalGeneral}`} editable={false} />
                    </View>
                </View>

                <DescripcionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={guardarDescripcion}
                />

            </View>
            <View style={styles.actions}>
                <Pressable
                    style={styles.saveInvoiceButton}
                    onPress={guardarFacturaActual}
                >
                    <Text style={styles.saveInvoiceText}>
                        Guardar factura
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.shareInvoiceButton}
                    onPress={compartirFactura}
                >
                    <Text style={styles.shareInvoiceText}>
                        Compartir factura
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#ddd',
    },

    descText: {
        fontSize: 9,
        lineHeight: 12,
    },

    receipt: {
        width: 430,
        minHeight: 680,
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginTop: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: '#cfcfcf',
        elevation: 3,
    },

    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    leftHeader: {
        width: '62%',
    },

    logo: {
        width: 290,
        height: 125,
        alignSelf: 'flex-start',
        marginLeft: -8,
    },

    address: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },

    rightHeader: {
        width: '35%',
        alignItems: 'center',
    },

    recibo: {
        backgroundColor: '#0b376b',
        width: 110,
        height: 28,
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        paddingTop: 4,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },

    numero: {
        borderWidth: 1,
        borderColor: '#0b376b',
        borderTopWidth: 0,
        width: 110,
        height: 42,
        textAlign: 'center',
        fontSize: 28,
        color: '#d85c42',
        fontWeight: 'bold',
        paddingTop: 2,
    },

    fechaTitle: {
        marginTop: 8,
        marginBottom: 2,
        fontWeight: 'bold',
        color: '#0b376b',
        fontSize: 13,
        letterSpacing: 1,
    },

    dateRow: {
        flexDirection: 'row',
    },

    dateBox: {
        borderWidth: 1,
        borderColor: '#0b376b',
        width: 38,
        backgroundColor: '#f7f7f7',
    },

    dateLabel: {
        fontSize: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#0b376b',
        color: '#fff',
        paddingVertical: 1,
    },

    dateText: {
        height: 28,
        textAlign: 'center',
        fontSize: 14,
        paddingTop: 5,
    },

    dateInput: {
        height: 28,
        textAlign: 'center',
        padding: 0,
    },

    phone: {
        fontSize: 12,
        color: '#d85c42',
        fontWeight: 'bold',
    },

    clientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 6,
        marginTop: 8,
        height: 34,
    },

    clientLabel: {
        paddingHorizontal: 8,
        color: '#0b376b',
        fontWeight: 'bold',
        fontSize: 12,
    },

    clientInput: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },

    table: {
        marginTop: 8,
        borderLeftWidth: 1,
        borderTopWidth: 1,
    },

    tableHeader: {
        flexDirection: 'row',
        height: 26,
    },

    tableRow: {
        flexDirection: 'row',
        minHeight: 34,
    },

    th: {
        borderRightWidth: 1,
        borderBottomWidth: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#0b376b',
        fontSize: 10,
        paddingTop: 5,
    },

    td: {
        borderRightWidth: 1,
        borderBottomWidth: 1,
        padding: 3,
        fontSize: 10,
    },

    cant: {
        width: 45,
    },

    ref: {
        width: 70,
    },

    desc: {
        width: 190,
    },

    price: {
        width: 46.5,
    },

    total: {
        width: 46.5,
    },

    bottom: {
        flexDirection: 'row',
        marginTop: 0,
        height: 34,
    },

    sonBox: {
        flex: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        justifyContent: 'center',
        paddingLeft: 5,
    },

    son: {
        color: '#0b376b',
        fontWeight: 'bold',
    },

    totalBox: {
        flexDirection: 'row',
        borderWidth: 1,
        borderTopWidth: 0,
    },

    totalLabel: {
        width: 70,
        textAlign: 'center',
        paddingTop: 7,
        fontWeight: 'bold',
        color: '#0b376b',
        fontSize: 14,
    },

    finalTotal: {
        width: 90,
        fontSize: 12,
        padding: 2,
    },

    saveInvoiceButton: {
        backgroundColor: '#0b376b',
        padding: 14,
        borderRadius: 8,
        marginTop: 18,
        marginBottom: 35,
    },

    saveInvoiceText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },

    shareInvoiceButton: {
        backgroundColor: '#d85c42',
        padding: 14,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 35,
    },

    shareInvoiceText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },

    actions: {
        width: 430,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 30,
        gap: 10,
    },
});