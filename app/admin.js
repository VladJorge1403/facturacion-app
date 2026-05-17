import { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Pressable,
    Alert,
} from 'react-native';

import { guardarPrecios, obtenerPrecios } from '../services/preciosService';

export default function AdminPrecios() {
    const [precios, setPrecios] = useState({
        vidrioClaro: '',
        vidrioBronce: '',
        vidrioReflectivo: '',
        vidrioTemplado: '',
        aluminioBlanco: '',
        aluminioNegro: '',
        ventana: '',
        vidrioFijo: '',
        vitrina: '',
        puerta: '',
        instalacion: '',
        transporte: '',
        ganancia: '',
    });

    useEffect(() => {
        cargarPrecios();
    }, []);

    const cargarPrecios = async () => {
        const preciosGuardados = await obtenerPrecios();

        if (preciosGuardados) {
            setPrecios(preciosGuardados);
        }
    };

    const cambiarPrecio = (campo, valor) => {
        setPrecios({
            ...precios,
            [campo]: valor,
        });
    };

    const guardar = async () => {
        try {
            await guardarPrecios(precios);
            Alert.alert('Listo', 'Precios guardados correctamente');
        } catch (error) {
            Alert.alert('Error', 'No se pudieron guardar los precios');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Administración de precios</Text>

            <Text style={styles.section}>Vidrios</Text>

            <TextInput
                style={styles.input}
                placeholder="Vidrio claro 5mm"
                keyboardType="numeric"
                value={precios.vidrioClaro}
                onChangeText={(text) => cambiarPrecio('vidrioClaro', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Vidrio bronce"
                keyboardType="numeric"
                value={precios.vidrioBronce}
                onChangeText={(text) => cambiarPrecio('vidrioBronce', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Vidrio reflectivo"
                keyboardType="numeric"
                value={precios.vidrioReflectivo}
                onChangeText={(text) => cambiarPrecio('vidrioReflectivo', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Vidrio templado"
                keyboardType="numeric"
                value={precios.vidrioTemplado}
                onChangeText={(text) => cambiarPrecio('vidrioTemplado', text)}
            />

            <Text style={styles.section}>Aluminio</Text>

            <TextInput
                style={styles.input}
                placeholder="Aluminio blanco"
                keyboardType="numeric"
                value={precios.aluminioBlanco}
                onChangeText={(text) => cambiarPrecio('aluminioBlanco', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Aluminio negro"
                keyboardType="numeric"
                value={precios.aluminioNegro}
                onChangeText={(text) => cambiarPrecio('aluminioNegro', text)}
            />

            <Text style={styles.section}>Productos</Text>

            <TextInput
                style={styles.input}
                placeholder="Ventana"
                keyboardType="numeric"
                value={precios.ventana}
                onChangeText={(text) => cambiarPrecio('ventana', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Vidrio fijo"
                keyboardType="numeric"
                value={precios.vidrioFijo}
                onChangeText={(text) => cambiarPrecio('vidrioFijo', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Vitrina"
                keyboardType="numeric"
                value={precios.vitrina}
                onChangeText={(text) => cambiarPrecio('vitrina', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Puerta"
                keyboardType="numeric"
                value={precios.puerta}
                onChangeText={(text) => cambiarPrecio('puerta', text)}
            />

            <Text style={styles.section}>Extras</Text>

            <TextInput
                style={styles.input}
                placeholder="Instalación"
                keyboardType="numeric"
                value={precios.instalacion}
                onChangeText={(text) => cambiarPrecio('instalacion', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Transporte"
                keyboardType="numeric"
                value={precios.transporte}
                onChangeText={(text) => cambiarPrecio('transporte', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Ganancia %"
                keyboardType="numeric"
                value={precios.ganancia}
                onChangeText={(text) => cambiarPrecio('ganancia', text)}
            />

            <Pressable style={styles.button} onPress={guardar}>
                <Text style={styles.buttonText}>Guardar precios</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#fff',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },

    section: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 8,
        color: '#0b376b',
    },

    input: {
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 6,
        padding: 10,
        marginBottom: 8,
    },

    button: {
        backgroundColor: '#0b376b',
        padding: 14,
        borderRadius: 8,
        marginTop: 20,
        marginBottom: 35,
    },

    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
});