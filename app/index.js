import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    Alert,
    Platform,
} from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

import DescripcionModal from '../modals/DescripcionModalV2';
import {
    guardarFactura,
    actualizarFactura,
    obtenerFacturas,
} from '../services/facturasService';
import { generarPdfFactura, subirPdfFactura } from '../services/pdfService';

import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function FacturaScreen() {
    const [cliente, setCliente] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [filaSeleccionada, setFilaSeleccionada] = useState(null);
    const [numeroRecibo, setNumeroRecibo] = useState('0788');

    const [aplicarEnvio, setAplicarEnvio] = useState(false);
    const [envio, setEnvio] = useState('');

    const [aplicarInstalacion, setAplicarInstalacion] = useState(false);
    const [instalacion, setInstalacion] = useState('');

    const [aplicarDescuento, setAplicarDescuento] = useState(false);
    const [descuento, setDescuento] = useState('');

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [modoEdicion, setModoEdicion] = useState(false);
    const [facturaEditandoId, setFacturaEditandoId] = useState(null);

    const crearFilasVacias = () =>
        Array.from({ length: 14 }).map(() => ({
            cantidad: '',
            referencia: '',
            descripcion: '',
            precio: '',
            total: '',
            producto: null,
            extrasSeleccionados: [],
            medidas: null,
        }));

    const [filas, setFilas] = useState(crearFilasVacias());

    const [fecha, setFecha] = useState(new Date());
    const [mostrarCalendario, setMostrarCalendario] = useState(false);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = String(fecha.getFullYear());

    const subtotalProductos = filas.reduce((total, fila) => {
        return total + (parseFloat(fila.total) || 0);
    }, 0);

    const envioValor = aplicarEnvio ? parseFloat(envio) || 0 : 0;
    const instalacionValor = aplicarInstalacion ? parseFloat(instalacion) || 0 : 0;
    const descuentoValor = aplicarDescuento ? parseFloat(descuento) || 0 : 0;

    const totalConAjustes =
        subtotalProductos + envioValor + instalacionValor - descuentoValor;

    const totalGeneral = Math.round(totalConAjustes).toString();

    const obtenerLogoBase64 = async () => {
        const asset = Asset.fromModule(require('../assets/logo.png'));
        await asset.downloadAsync();

        if (Platform.OS === 'web') {
            return asset.uri;
        }

        const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        return `data:image/png;base64,${base64}`;
    };

    const abrirModal = (index) => {
        setFilaSeleccionada(index);
        setModalVisible(true);
    };

    const guardarDescripcion = (data) => {
        const nuevasFilas = [...filas];

        nuevasFilas[filaSeleccionada].cantidad = data.cantidad;
        nuevasFilas[filaSeleccionada].referencia = data.referencia;
        nuevasFilas[filaSeleccionada].descripcion = data.descripcion;
        nuevasFilas[filaSeleccionada].precio = data.precio;
        nuevasFilas[filaSeleccionada].total = data.total;
        nuevasFilas[filaSeleccionada].producto = data.producto;
        nuevasFilas[filaSeleccionada].extrasSeleccionados = data.extrasSeleccionados;
        nuevasFilas[filaSeleccionada].medidas = data.medidas;

        setFilas(nuevasFilas);
    };

    const cambiarFecha = (event, selectedDate) => {
        setMostrarCalendario(false);

        if (selectedDate) {
            setFecha(selectedDate);
        }
    };

    const limpiarFactura = () => {
        setCliente('');
        setFilas(crearFilasVacias());
        setFecha(new Date());

        setAplicarEnvio(false);
        setEnvio('');

        setAplicarInstalacion(false);
        setInstalacion('');

        setAplicarDescuento(false);
        setDescuento('');
    };

    const crearFacturaActual = () => ({
        id: facturaEditandoId || undefined,
        numeroRecibo,
        cliente,
        fecha: {
            dia,
            mes,
            anio,
        },
        filas,
        ajustes: {
            subtotalProductos: subtotalProductos.toFixed(2),
            envio: envioValor.toFixed(2),
            instalacion: instalacionValor.toFixed(2),
            descuento: descuentoValor.toFixed(2),
        },
        total: totalGeneral,
    });

    const mostrarToast = (mensaje) => {
        setToastMessage(mensaje);
        setToastVisible(true);

        setTimeout(() => {
            setToastVisible(false);
        }, 2500);
    };

    const guardarFacturaActual = async () => {
        try {
            let factura = crearFacturaActual();

            let pdfUrl = null;

            try {
                const logoBase64 = await obtenerLogoBase64();

                const resultadoPdf = await subirPdfFactura(factura, logoBase64);

                if (resultadoPdf?.subida) {
                    pdfUrl = resultadoPdf.pdfUrl;
                }
            } catch (errorPdf) {
                console.log('No se pudo subir PDF:', errorPdf.message);
            }

            factura = {
                ...factura,
                pdfUrl,
            };

            let facturaGuardada = null;

            if (modoEdicion && facturaEditandoId) {
                facturaGuardada = await actualizarFactura(
                    facturaEditandoId,
                    factura
                );

                mostrarToast('Factura actualizada correctamente');

                setModoEdicion(false);
                setFacturaEditandoId(null);

                await AsyncStorage.removeItem('modo_edicion_factura');
            } else {
                facturaGuardada = await guardarFactura(factura);

                if (pdfUrl) {
                    mostrarToast('Factura guardada con PDF en la nube');
                } else {
                    mostrarToast('Factura guardada, PDF pendiente de subir');
                }
            }

            if (facturaGuardada?.numeroRecibo) {
                setNumeroRecibo(
                    String(Number(facturaGuardada.numeroRecibo) + 1).padStart(4, '0')
                );
            }

        } catch (error) {
            console.log(error);
            mostrarToast('No se pudo guardar la factura');
        }
    };

    const descargarPdf = async () => {
        let ventanaPDF = null;

        try {
            if (Platform.OS === 'web') {
                ventanaPDF = window.open('', '_blank');

                if (!ventanaPDF) {
                    Alert.alert(
                        'Ventana bloqueada',
                        'Permite ventanas emergentes para descargar el PDF.'
                    );
                    return;
                }

                ventanaPDF.document.write('<p>Generando PDF...</p>');
            }

            const facturaActual = crearFacturaActual();
            const logoBase64 = await obtenerLogoBase64();

            const uri = await generarPdfFactura(facturaActual, logoBase64, ventanaPDF);

            if (uri) {
                const disponible = await Sharing.isAvailableAsync();

                if (disponible) {
                    await Sharing.shareAsync(uri);
                } else {
                    Alert.alert('PDF creado', uri);
                }
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'No se pudo generar el PDF');
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
                    .filter((fila) => fila.descripcion && fila.descripcion !== 'Tocar para agregar')
                    .map(
                        (fila, index) =>
                            `${index + 1}. Cant: ${fila.cantidad} | ${fila.descripcion} | Total: $${fila.total}`
                    )
                    .join('\n')}

Subtotal productos: $${subtotalProductos.toFixed(2)}
Envío: $${envioValor.toFixed(2)}
Instalación: $${instalacionValor.toFixed(2)}
Descuento: -$${descuentoValor.toFixed(2)}

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

    useFocusEffect(
        useCallback(() => {
            cargarFacturaParaEditar();
        }, [])
    );

    const cargarFacturaParaEditar = async () => {
        const idEditar = await AsyncStorage.getItem('factura_editar_id');
        const modoEdicionGuardado =
            await AsyncStorage.getItem('modo_edicion_factura');

        if (modoEdicionGuardado === 'true') {
            setModoEdicion(true);
        }
        if (!idEditar) return;

        const facturasGuardadas = await obtenerFacturas();
        const factura = facturasGuardadas.find((item) => item.id === idEditar);

        if (!factura) return;

        setFacturaEditandoId(factura.id);

        setNumeroRecibo(String(factura.numeroRecibo || ''));
        setCliente(factura.cliente || '');
        setFilas(factura.filas || crearFilasVacias());

        setAplicarEnvio(Number(factura.ajustes?.envio || 0) > 0);
        setEnvio(String(Number(factura.ajustes?.envio || 0) || ''));

        setAplicarInstalacion(Number(factura.ajustes?.instalacion || 0) > 0);
        setInstalacion(String(Number(factura.ajustes?.instalacion || 0) || ''));

        setAplicarDescuento(Number(factura.ajustes?.descuento || 0) > 0);
        setDescuento(String(Number(factura.ajustes?.descuento || 0) || ''));

        await AsyncStorage.removeItem('factura_editar_id');
    };

    return (
        <ScrollView style={styles.screen}>
            <View style={styles.pageLayout}>
                <View style={styles.leftColumn}>
                    <View style={styles.receipt}>
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

                        <View style={styles.clientRow}>
                            <Text style={styles.clientLabel}>CLIENTE</Text>

                            <TextInput
                                style={styles.clientInput}
                                value={cliente}
                                onChangeText={setCliente}
                            />
                        </View>

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

                        <View style={styles.bottom}>
                            <View style={styles.sonBox}>
                                <Text style={styles.son}>SON:</Text>
                            </View>

                            <View style={styles.totalBox}>
                                <Text style={styles.totalLabel}>TOTAL</Text>
                                <TextInput
                                    style={styles.finalTotal}
                                    value={`$${totalGeneral}`}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <DescripcionModal
                            visible={modalVisible}
                            onClose={() => setModalVisible(false)}
                            onSave={guardarDescripcion}
                            dataInicial={
                                filaSeleccionada !== null ? filas[filaSeleccionada] : null
                            }
                        />
                    </View>
                </View>

                <View style={styles.rightColumn}>
                    <View style={styles.ajustesBox}>
                        <Text style={styles.ajustesTitle}>Ajustes opcionales</Text>

                        <Pressable
                            style={styles.checkRow}
                            onPress={() => setAplicarEnvio(!aplicarEnvio)}
                        >
                            <Ionicons
                                name={aplicarEnvio ? 'checkbox' : 'square-outline'}
                                size={24}
                                color="#0b376b"
                            />
                            <Text style={styles.checkText}>Agregar envío</Text>
                        </Pressable>

                        {aplicarEnvio && (
                            <TextInput
                                style={styles.ajusteInput}
                                placeholder="Costo de envío"
                                keyboardType="numeric"
                                value={envio}
                                onChangeText={setEnvio}
                            />
                        )}

                        <Pressable
                            style={styles.checkRow}
                            onPress={() => setAplicarInstalacion(!aplicarInstalacion)}
                        >
                            <Ionicons
                                name={aplicarInstalacion ? 'checkbox' : 'square-outline'}
                                size={24}
                                color="#0b376b"
                            />
                            <Text style={styles.checkText}>Agregar instalación</Text>
                        </Pressable>

                        {aplicarInstalacion && (
                            <TextInput
                                style={styles.ajusteInput}
                                placeholder="Costo de instalación"
                                keyboardType="numeric"
                                value={instalacion}
                                onChangeText={setInstalacion}
                            />
                        )}

                        <Pressable
                            style={styles.checkRow}
                            onPress={() => setAplicarDescuento(!aplicarDescuento)}
                        >
                            <Ionicons
                                name={aplicarDescuento ? 'checkbox' : 'square-outline'}
                                size={24}
                                color="#0b376b"
                            />
                            <Text style={styles.checkText}>Aplicar descuento</Text>
                        </Pressable>

                        {aplicarDescuento && (
                            <TextInput
                                style={styles.ajusteInput}
                                placeholder="Descuento"
                                keyboardType="numeric"
                                value={descuento}
                                onChangeText={setDescuento}
                            />
                        )}

                        <View style={styles.resumenTotal}>
                            <Text style={styles.resumenText}>
                                Subtotal productos: ${subtotalProductos.toFixed(2)}
                            </Text>

                            <Text style={styles.resumenText}>
                                Envío: ${envioValor.toFixed(2)}
                            </Text>

                            <Text style={styles.resumenText}>
                                Instalación: ${instalacionValor.toFixed(2)}
                            </Text>

                            <Text style={styles.resumenText}>
                                Descuento: -${descuentoValor.toFixed(2)}
                            </Text>

                            <Text style={styles.totalFinal}>Total final: ${totalGeneral}</Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <Pressable
                            style={styles.saveInvoiceButton}
                            onPress={guardarFacturaActual}
                        >
                            <Text style={styles.saveInvoiceText}>Guardar factura</Text>
                        </Pressable>

                        <Pressable style={styles.pdfInvoiceButton} onPress={descargarPdf}>
                            <Text style={styles.pdfInvoiceText}>Descargar PDF</Text>
                        </Pressable>

                        <Pressable
                            style={styles.shareInvoiceButton}
                            onPress={compartirFactura}
                        >
                            <Text style={styles.shareInvoiceText}>Compartir factura</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
            {toastVisible && (
                <View style={styles.toast}>
                    <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#fff"
                    />

                    <Text style={styles.toastText}>
                        {toastMessage}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({

    toast: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: '#0b376b',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },

    toastText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    screen: {
        backgroundColor: '#ddd',
    },

    pageLayout: {
        width: '100%',
        maxWidth: 1100,
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 24,
        padding: 20,
        paddingBottom: 130,
        flexWrap: 'wrap',
    },

    leftColumn: {
        width: 430,
    },

    rightColumn: {
        width: 360,
        gap: 14,
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

    ajustesBox: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        gap: 10,
    },

    ajustesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0b376b',
        marginBottom: 6,
    },

    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    checkText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0b376b',
    },

    ajusteInput: {
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 8,
        padding: 10,
        fontSize: 15,
    },

    resumenTotal: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 10,
        gap: 4,
    },

    resumenText: {
        color: '#333',
        fontSize: 14,
    },

    totalFinal: {
        marginTop: 6,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#d85c42',
    },

    actions: {
        width: '100%',
        gap: 10,
    },

    saveInvoiceButton: {
        backgroundColor: '#0b376b',
        padding: 14,
        borderRadius: 8,
    },

    saveInvoiceText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },

    pdfInvoiceButton: {
        backgroundColor: '#1e7db8',
        padding: 14,
        borderRadius: 8,
    },

    pdfInvoiceText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },

    shareInvoiceButton: {
        backgroundColor: '#d85c42',
        padding: 14,
        borderRadius: 8,
    },

    shareInvoiceText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});