import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { guardarPrecios, obtenerPrecios } from '../services/preciosService';

const PRIMARY = '#1479B8';
const TEXT = '#18384F';
const MUTED = '#6F8CA3';
const BG = '#F4F7FB';

export default function EditarProducto() {
  const { id } = useLocalSearchParams();

  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precioBase, setPrecioBase] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [extras, setExtras] = useState([]);

  useEffect(() => {
    cargarProducto();
  }, []);

  const cargarProducto = async () => {
    const data = await obtenerPrecios();
    const lista = Array.isArray(data) ? data : [];

    const producto = lista.find((item) => item.id === id);

    if (!producto) {
      Alert.alert('Error', 'No se encontró el producto.');
      router.back();
      return;
    }

    setProductos(lista);
    setNombre(producto.nombre || '');
    setPrecioBase(String(producto.precioBase || ''));
    setDescripcion(producto.descripcion || '');
    setExtras(producto.costosAdicionales || []);
  };

  const agregarExtra = () => {
    setExtras([
      ...extras,
      {
        id: Date.now().toString(),
        nombre: '',
        precio: '',
      },
    ]);
  };

  const cambiarExtra = (extraId, campo, valor) => {
    setExtras(
      extras.map((extra) =>
        extra.id === extraId ? { ...extra, [campo]: valor } : extra
      )
    );
  };

  const eliminarExtra = (extraId) => {
    setExtras(extras.filter((extra) => extra.id !== extraId));
  };

  const guardarCambios = async () => {
    if (!nombre.trim() || !precioBase.trim()) {
      Alert.alert('Campos requeridos', 'Debes escribir nombre y precio base.');
      return;
    }

    const productoActualizado = {
      id,
      nombre: nombre.trim(),
      precioBase: Number(precioBase),
      descripcion: descripcion.trim(),
      costosAdicionales: extras
        .filter((extra) => extra.nombre.trim() && String(extra.precio).trim())
        .map((extra) => ({
          id: extra.id,
          nombre: extra.nombre.trim(),
          precio: Number(extra.precio),
        })),
    };

    const nuevaLista = productos.map((item) =>
      item.id === id ? productoActualizado : item
    );

    await guardarPrecios(nuevaLista);

    Alert.alert('Listo', 'Producto actualizado correctamente');
    router.back();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={34} color={TEXT} />
          </Pressable>

          <Text style={styles.title}>Editar producto</Text>

          <View style={{ width: 34 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>
            Nombre <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.topRow}>
            <TextInput
              style={styles.nameInput}
              placeholder="Nombre del producto"
              value={nombre}
              onChangeText={setNombre}
            />

            <View style={styles.priceBox}>
              <TextInput
                style={styles.priceInput}
                placeholder="$0.00"
                keyboardType="numeric"
                value={precioBase}
                onChangeText={setPrecioBase}
              />

              <Ionicons name="add" size={22} color={TEXT} />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.optionalHeader}>
            <View style={styles.iconBox}>
              <View style={styles.circle} />
            </View>

            <Text style={styles.optionalTitle}>Costos opcionales</Text>
          </View>

          {extras.map((extra) => (
            <View key={extra.id} style={styles.extraBox}>
              <TextInput
                style={styles.extraName}
                placeholder="Nombre del costo"
                value={extra.nombre}
                onChangeText={(text) =>
                  cambiarExtra(extra.id, 'nombre', text)
                }
              />

              <TextInput
                style={styles.extraPrice}
                placeholder="$0.00"
                keyboardType="numeric"
                value={String(extra.precio)}
                onChangeText={(text) =>
                  cambiarExtra(extra.id, 'precio', text)
                }
              />

              <Pressable onPress={() => eliminarExtra(extra.id)}>
                <Ionicons name="close" size={22} color={MUTED} />
              </Pressable>
            </View>
          ))}

          <Pressable style={styles.addOptionalButton} onPress={agregarExtra}>
            <Ionicons name="add" size={24} color={TEXT} />

            <Text style={styles.addOptionalText}>
              Agregar costo opcional
            </Text>
          </Pressable>

          <Text style={styles.descriptionLabel}>Descripción</Text>

          <TextInput
            style={styles.description}
            placeholder="Descripción del producto"
            placeholderTextColor="#AAB7C4"
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>

        <Pressable style={styles.saveButton} onPress={guardarCambios}>
          <Text style={styles.saveText}>Actualizar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 150,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },

  label: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 12,
  },

  required: {
    color: '#E04F5F',
  },

  topRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },

  nameInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#D6E0EA',
    borderRadius: 9,
    paddingHorizontal: 14,
    fontSize: 18,
    color: TEXT,
    backgroundColor: '#fff',
  },

  priceBox: {
    width: 125,
    height: 56,
    borderWidth: 1,
    borderColor: '#D6E0EA',
    borderRadius: 9,
    backgroundColor: '#F3F5F8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  priceInput: {
    flex: 1,
    fontSize: 19,
    color: TEXT,
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8EF',
    marginBottom: 22,
  },

  optionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  iconBox: {
    width: 31,
    height: 31,
    borderRadius: 6,
    backgroundColor: '#EEF3F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: MUTED,
  },

  optionalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
  },

  extraBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  extraName: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#D6E0EA',
    borderRadius: 9,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },

  extraPrice: {
    width: 90,
    height: 48,
    borderWidth: 1,
    borderColor: '#D6E0EA',
    borderRadius: 9,
    paddingHorizontal: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },

  addOptionalButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F2F5FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 24,
  },

  addOptionalText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginLeft: 8,
  },

  descriptionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 12,
  },

  description: {
    height: 135,
    borderWidth: 1,
    borderColor: '#D6E0EA',
    borderRadius: 9,
    padding: 14,
    fontSize: 18,
    color: TEXT,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },

  footer: {
    position: 'absolute',
    bottom: 75,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },

  cancelButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#E0E6ED',
    backgroundColor: '#fff',
  },

  cancelText: {
    textAlign: 'center',
    fontSize: 18,
    color: MUTED,
    fontWeight: '700',
  },

  saveButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 15,
  },

  saveText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
});