import { View, Text, TextInput, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import DescripcionModal from '../modals/modal';


export default function FacturaScreen() {

    const [modalVisible, setModalVisible] = useState(false);
    const [filaSeleccionada, setFilaSeleccionada] = useState(null);
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
                        <Text style={styles.numero}>0783</Text>

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
                    <TextInput style={styles.clientInput} />
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
                        <TextInput style={styles.finalTotal} />
                    </View>
                </View>

                <DescripcionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={guardarDescripcion}
                />

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
    },

    receipt: {
        width: 430,
        minHeight: 680,
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginTop: 20,
        padding: 14,
    },

    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    leftHeader: {
        width: '62%',
    },

    logo: {
        width: 250,
        height: 105,
        alignSelf: 'flex-start',
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
        borderWidth: 1,
        width: 95,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0b376b',
    },

    numero: {
        borderWidth: 1,
        borderTopWidth: 0,
        width: 95,
        textAlign: 'center',
        fontSize: 25,
        color: '#d85c42',
    },

    fechaTitle: {
        marginTop: 6,
        fontWeight: 'bold',
        color: '#0b376b',
    },

    dateRow: {
        flexDirection: 'row',
    },

    dateBox: {
        borderWidth: 1,
        width: 38,
    },

    dateLabel: {
        fontSize: 11,
        textAlign: 'center',
        fontWeight: 'bold',
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
        height: 32,
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
        width: 60,
    },

    total: {
        width: 60,
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
        fontSize: 18,
    },

    finalTotal: {
        width: 90,
        fontSize: 18,
        padding: 2,
    },
});