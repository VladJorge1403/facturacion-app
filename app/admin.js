import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';

export default function AdminPrecios() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Administración de precios</Text>

            <Text style={styles.section}>Vidrios</Text>
            <TextInput style={styles.input} placeholder="Vidrio claro 5mm" keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Vidrio bronce" keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Vidrio reflectivo" keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Vidrio templado" keyboardType="numeric" />

            <Text style={styles.section}>Aluminio</Text>
            <TextInput style={styles.input} placeholder="Aluminio blanco" keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Aluminio negro" keyboardType="numeric" />

            <Text style={styles.section}>Productos</Text>
            <TextInput style={styles.input} placeholder="Ventana" keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Vidrio fijo" keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Vitrina" keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Puerta" keyboardType="numeric" />

            <Text style={styles.section}>Mano de obra / extras</Text>
            <TextInput style={styles.input} placeholder="Instalación" keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Transporte" keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Ganancia %" keyboardType="numeric" />
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
});