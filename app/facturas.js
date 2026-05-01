import { View, Text, StyleSheet } from 'react-native';

export default function FacturasGuardadas() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Facturas guardadas</Text>
            <Text>Aquí aparecerán las facturas guardadas.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});