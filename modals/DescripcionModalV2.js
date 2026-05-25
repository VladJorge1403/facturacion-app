import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { obtenerPrecios } from '../services/preciosService';

const PRIMARY = '#0B3D75';
const TEXT = '#10263D';
const MUTED = '#6F8CA3';
const BG = '#F4F7FB';
const BORDER = '#C9D6E2';

export default function DescripcionModalV2({
  visible,
  onClose,
  onSave,
  dataInicial,
}) {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);

  const [arriba, setArriba] = useState('');
  const [derecha, setDerecha] = useState('');
  const [izquierda, setIzquierda] = useState('');
  const [abajo, setAbajo] = useState('');
  const [descuadrada, setDescuadrada] = useState(false);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    if (visible) {
      cargarProductos();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    if (dataInicial?.producto) {
      setProductoSeleccionado(dataInicial.producto);
      setExtrasSeleccionados(dataInicial.extrasSeleccionados || []);
      setCantidad(Number(dataInicial.cantidad || 1));

      if (dataInicial.medidas) {
        setArriba(dataInicial.medidas.arriba || '');
        setDerecha(dataInicial.medidas.derecha || '');
        setIzquierda(dataInicial.medidas.izquierda || '');
        setAbajo(dataInicial.medidas.abajo || '');
        setDescuadrada(dataInicial.medidas.descuadrada || false);
      }
    } else {
      limpiar();
    }
  }, [visible, dataInicial]);

  const cargarProductos = async () => {
    const data = await obtenerPrecios();
    setProductos(Array.isArray(data) ? data : []);
  };

  const limpiar = () => {
    setProductoSeleccionado(null);
    setExtrasSeleccionados([]);
    setArriba('');
    setDerecha('');
    setIzquierda('');
    setAbajo('');
    setDescuadrada(false);
    setCantidad(1);
  };

  const seleccionarProducto = (item) => {
    setProductoSeleccionado(item);
    setExtrasSeleccionados([]);
  };

  const toggleExtra = (extra) => {
    const existe = extrasSeleccionados.some((item) => item.id === extra.id);

    if (existe) {
      setExtrasSeleccionados(
        extrasSeleccionados.filter((item) => item.id !== extra.id)
      );
    } else {
      setExtrasSeleccionados([...extrasSeleccionados, extra]);
    }
  };

  const cambiarCantidad = (valor) => {
    const nuevaCantidad = cantidad + valor;
    if (nuevaCantidad < 1) return;
    setCantidad(nuevaCantidad);
  };

  const calcularTotal = () => {
    if (!productoSeleccionado) return 0;

    const ancho = Number(arriba || 0);
    const alto = Number(derecha || 0);
    const precioBase = Number(productoSeleccionado.precioBase || 0);

    const totalExtras = extrasSeleccionados.reduce((total, extra) => {
      return total + Number(extra.precio || 0);
    }, 0);

    const area = ancho * alto;
    const subtotal = area * precioBase + totalExtras;

    return Math.round(subtotal * cantidad);
  };

  const guardar = () => {
    if (!productoSeleccionado) {
      Alert.alert('Falta producto', 'Selecciona un producto.');
      return;
    }

    if (!arriba || !derecha) {
      Alert.alert('Faltan medidas', 'Ancho y alto son obligatorios.');
      return;
    }

    const medidaIzquierda = descuadrada && izquierda ? izquierda : derecha;
    const medidaAbajo = descuadrada && abajo ? abajo : arriba;

    const extrasTexto = extrasSeleccionados
      .map((extra) => extra.nombre)
      .join(', ');

    const descripcion =
      `${productoSeleccionado.nombre} de ${arriba}cm x ${derecha}cm` +
      `${descuadrada ? `, medidas descuadradas: izquierda ${medidaIzquierda}cm, abajo ${medidaAbajo}cm` : ''}` +
      `${extrasTexto ? `, extras: ${extrasTexto}` : ''}`;

    const total = calcularTotal();

    onSave({
      cantidad: String(cantidad),
      referencia: productoSeleccionado.nombre,
      descripcion,
      precio: Number(productoSeleccionado.precioBase || 0).toFixed(2),
      total: total.toFixed(2),
      producto: productoSeleccionado,
      extrasSeleccionados,
      medidas: {
        arriba,
        derecha,
        izquierda: medidaIzquierda,
        abajo: medidaAbajo,
        descuadrada,
      },
    });

    limpiar();
    onClose();
  };

  const cerrar = () => {
    limpiar();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Descripción del producto</Text>

            <Text style={styles.label}>Producto</Text>

            {productos.length === 0 ? (
              <Text style={styles.emptyProducts}>
                No hay productos en costos fijos
              </Text>
            ) : (
              <View style={styles.chips}>
                {productos.map((item) => (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.chip,
                      productoSeleccionado?.id === item.id && styles.chipActive,
                    ]}
                    onPress={() => seleccionarProducto(item)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        productoSeleccionado?.id === item.id && styles.chipTextActive,
                      ]}
                    >
                      {item.nombre}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {productoSeleccionado?.costosAdicionales?.length > 0 && (
              <>
                <Text style={styles.label}>Opcionales</Text>

                <View style={styles.chips}>
                  {productoSeleccionado.costosAdicionales.map((extra) => {
                    const activo = extrasSeleccionados.some(
                      (item) => item.id === extra.id
                    );

                    return (
                      <Pressable
                        key={extra.id}
                        style={[styles.chip, activo && styles.chipActive]}
                        onPress={() => toggleExtra(extra)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            activo && styles.chipTextActive,
                          ]}
                        >
                          {extra.nombre} +${Number(extra.precio || 0).toFixed(2)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={styles.label}>Medidas</Text>

            <View style={styles.measureCard}>
              <View style={styles.topMeasure}>
                <Text style={styles.measureLabel}>Ancho *</Text>
                <TextInput
                  style={styles.measureInput}
                  placeholder="cm"
                  keyboardType="numeric"
                  value={arriba}
                  onChangeText={setArriba}
                />
              </View>

              <View style={styles.middleRow}>
                <View style={styles.sideMeasure}>
                  <Text style={styles.measureLabel}>Izquierda</Text>
                  <TextInput
                    style={[
                      styles.measureInput,
                      !descuadrada && styles.disabledInput,
                    ]}
                    placeholder="cm"
                    keyboardType="numeric"
                    value={descuadrada ? izquierda : derecha}
                    onChangeText={setIzquierda}
                    editable={descuadrada}
                  />
                </View>

                <View style={styles.productBox}>
                  <View style={styles.productGlass}>
                    <Ionicons name="arrow-forward" size={42} color={PRIMARY} />
                  </View>
                </View>

                <View style={styles.sideMeasure}>
                  <Text style={styles.measureLabel}>Alto *</Text>
                  <TextInput
                    style={styles.measureInput}
                    placeholder="cm"
                    keyboardType="numeric"
                    value={derecha}
                    onChangeText={setDerecha}
                  />
                </View>
              </View>

              <View style={styles.bottomMeasure}>
                <Text style={styles.measureLabel}>Abajo</Text>
                <TextInput
                  style={[
                    styles.measureInput,
                    !descuadrada && styles.disabledInput,
                  ]}
                  placeholder="cm"
                  keyboardType="numeric"
                  value={descuadrada ? abajo : arriba}
                  onChangeText={setAbajo}
                  editable={descuadrada}
                />
              </View>
            </View>

            <Pressable
              style={styles.checkRow}
              onPress={() => setDescuadrada(!descuadrada)}
            >
              <View style={[styles.checkbox, descuadrada && styles.checkboxActive]}>
                {descuadrada && (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
              </View>

              <Text style={styles.checkText}>Viene descuadrada</Text>
            </Pressable>

            <Text style={styles.label}>Cantidad</Text>

            <View style={styles.quantityRow}>
              <Pressable
                style={styles.qtyButton}
                onPress={() => cambiarCantidad(-1)}
              >
                <Text style={styles.qtyText}>-</Text>
              </Pressable>

              <View style={styles.qtyCenter}>
                <Text style={styles.qtyNumber}>{cantidad}</Text>
              </View>

              <Pressable
                style={styles.qtyButton}
                onPress={() => cambiarCantidad(1)}
              >
                <Text style={styles.qtyText}>+</Text>
              </Pressable>
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total calculado</Text>
              <Text style={styles.totalText}>${calcularTotal().toFixed(2)}</Text>
            </View>

            <View style={styles.buttons}>
              <Pressable style={styles.cancelButton} onPress={cerrar}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable style={styles.saveButton} onPress={guardar}>
                <Text style={styles.saveText}>Guardar</Text>
              </Pressable>
            </View>
          </ScrollView>
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
    padding: 16,
  },

  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    maxHeight: '92%',
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 20,
  },

  label: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT,
    marginTop: 14,
    marginBottom: 8,
  },

  emptyProducts: {
    color: MUTED,
    fontSize: 15,
    marginBottom: 10,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 13,
    backgroundColor: '#fff',
  },

  chipActive: {
    backgroundColor: PRIMARY,
  },

  chipText: {
    color: TEXT,
    fontWeight: '700',
  },

  chipTextActive: {
    color: '#fff',
  },

  measureCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FAFCFE',
  },

  topMeasure: {
    alignItems: 'center',
    marginBottom: 8,
  },

  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },

  sideMeasure: {
    width: 90,
    alignItems: 'center',
  },

  bottomMeasure: {
    alignItems: 'center',
    marginTop: 8,
  },

  measureLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 5,
  },

  measureInput: {
    width: 86,
    height: 45,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 9,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#fff',
  },

  disabledInput: {
    backgroundColor: '#EEF3F8',
    color: MUTED,
  },

  productBox: {
    width: 120,
    height: 150,
    borderWidth: 2,
    borderColor: '#222',
    padding: 6,
    backgroundColor: '#fff',
  },

  productGlass: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#9BA8B3',
    backgroundColor: '#EAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: PRIMARY,
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxActive: {
    backgroundColor: PRIMARY,
  },

  checkText: {
    color: TEXT,
    fontWeight: '700',
    fontSize: 16,
  },

  quantityRow: {
    flexDirection: 'row',
    width: 210,
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: 'hidden',
  },

  qtyButton: {
    width: 65,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  qtyCenter: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: BORDER,
  },

  qtyText: {
    fontSize: 28,
    color: PRIMARY,
    fontWeight: '800',
  },

  qtyNumber: {
    fontSize: 20,
    color: TEXT,
    fontWeight: '800',
  },

  totalBox: {
    backgroundColor: BG,
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },

  totalLabel: {
    color: MUTED,
    fontWeight: '700',
  },

  totalText: {
    color: PRIMARY,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },

  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#777',
    paddingVertical: 14,
    borderRadius: 10,
  },

  saveButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
  },

  cancelText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 16,
  },

  saveText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 16,
  },
});