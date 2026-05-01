import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function DescripcionModal({ visible, onClose, onSave }) {
    const [producto, setProducto] = useState('');
    const [tipo, setTipo] = useState('');
    const [vidrio, setVidrio] = useState('');
    const [color, setColor] = useState('');
    const [ancho, setAncho] = useState('');
    const [alto, setAlto] = useState('');
    const [cantidad, setCantidad] = useState('1');

    const tiposPorProducto = {
        Ventana: ['Corrediza', 'Francesa', 'Proyectable'],
        'Vidrio fijo': ['Claro fijo', 'Decorativo', 'Templado'],
        Vitrina: ['Mostrador', 'Pared', 'Exhibidor'],
        Puerta: ['Baño', 'Jardín', 'Envisagrada', 'Corrediza'],
    };

    const guardar = () => {
        

        const descripcion =
            `${producto} ${tipo} con aluminio color ${color}, vidrio ${vidrio}, ${ancho} x ${alto} m`;

        const calcularPrecio = () => {
            const anchoNum = parseFloat(ancho);
            const altoNum = parseFloat(alto);
            const cantidadNum = parseInt(cantidad) || 1;

            if (isNaN(anchoNum) || isNaN(altoNum)) {
                return 0;
            }

            const area = anchoNum * altoNum;
            let precioUnitario = 0;

            // Ejemplos de lógica por medidas
            if (area <= 0.75) {
                precioUnitario = 30;
            } else if (area <= 1.6) {
                precioUnitario = 75;
            } else if (area <= 2.5) {
                precioUnitario = 110;
            } else {
                precioUnitario = area * 55;
            }

            // Ajustes por tipo de vidrio
            if (vidrio === 'Bronce') {
                precioUnitario += 10;
            }

            if (vidrio === 'Reflectivo') {
                precioUnitario += 15;
            }

            if (vidrio === 'Templado') {
                precioUnitario += 25;
            }

            // Ajuste por aluminio negro
            if (color === 'Negro') {
                precioUnitario += 10;
            }

            return precioUnitario * cantidadNum;
        };
        
        const precioCalculado = calcularPrecio();

        onSave({
            descripcion,
            producto,
            tipo,
            vidrio,
            color,
            ancho,
            alto,
            cantidad,
            precio: precioCalculado.toFixed(2),
            total: precioCalculado.toFixed(2),
        });

        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>

                    <Text style={styles.title}>Descripción del producto</Text>

                    <Text style={styles.label}>Producto</Text>
                    <View style={styles.options}>
                        {['Ventana', 'Vidrio fijo', 'Vitrina', 'Puerta'].map((item) => (
                            <Pressable
                                key={item}
                                style={[styles.option, producto === item && styles.selected]}
                                onPress={() => {
                                    setProducto(item);
                                    setTipo('');
                                }}
                            >
                                <Text style={styles.optionText}>{item}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {producto !== '' && (
                        <>
                            <Text style={styles.label}>Tipo</Text>
                            <View style={styles.options}>
                                {tiposPorProducto[producto].map((item) => (
                                    <Pressable
                                        key={item}
                                        style={[styles.option, tipo === item && styles.selected]}
                                        onPress={() => setTipo(item)}
                                    >
                                        <Text style={styles.optionText}>{item}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </>
                    )}

                    <Text style={styles.label}>Tipo de vidrio</Text>
                    <View style={styles.options}>
                        {['Claro 5mm', 'Bronce', 'Reflectivo', 'Templado'].map((item) => (
                            <Pressable
                                key={item}
                                style={[styles.option, vidrio === item && styles.selected]}
                                onPress={() => setVidrio(item)}
                            >
                                <Text style={styles.optionText}>{item}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text style={styles.label}>Color de aluminio</Text>
                    <View style={styles.options}>
                        {['Blanco', 'Negro'].map((item) => (
                            <Pressable
                                key={item}
                                style={[styles.option, color === item && styles.selected]}
                                onPress={() => setColor(item)}
                            >
                                <Text style={styles.optionText}>{item}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text style={styles.label}>Medidas</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ancho"
                            keyboardType="numeric"
                            value={ancho}
                            onChangeText={setAncho}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Alto"
                            keyboardType="numeric"
                            value={alto}
                            onChangeText={setAlto}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Cant."
                            keyboardType="numeric"
                            value={cantidad}
                            onChangeText={setCantidad}
                        />
                    </View>

                    <View style={styles.buttons}>
                        <Pressable style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </Pressable>

                        <Pressable style={styles.saveButton} onPress={guardar}>
                            <Text style={styles.buttonText}>Guardar</Text>
                        </Pressable>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#00000088',
        justifyContent: 'center',
        padding: 15,
    },

    modal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },

    label: {
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },

    options: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },

    option: {
        borderWidth: 1,
        borderColor: '#0b376b',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginBottom: 5,
    },

    selected: {
        backgroundColor: '#0b376b',
    },

    optionText: {
        color: '#111',
        fontWeight: 'bold',
    },

    row: {
        flexDirection: 'row',
        gap: 8,
    },

    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 6,
        padding: 8,
    },

    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 18,
    },

    cancelButton: {
        backgroundColor: '#777',
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderRadius: 6,
    },

    saveButton: {
        backgroundColor: '#0b376b',
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderRadius: 6,
    },

    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});