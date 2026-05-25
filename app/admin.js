import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';

import { obtenerPrecios, guardarPrecios } from '../services/preciosService';

const PRIMARY = '#1479B8';
const TEXT = '#18384F';
const MUTED = '#6F8CA3';
const BG = '#F4F7FB';
const DANGER = '#E04F5F';

export default function AdminPrecios() {
  const [productos, setProductos] = useState([]);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const { width } = useWindowDimensions();
  const cardWidth = width >= 700 ? '31%' : '100%';

  const cargarProductos = async () => {
    const data = await obtenerPrecios();
    setProductos(Array.isArray(data) ? data : []);
  };

  useFocusEffect(
    useCallback(() => {
      cargarProductos();
    }, [])
  );

  const calcularExtras = (item) => {
    const extras = item.costosAdicionales || [];

    return extras.reduce((total, extra) => {
      return total + Number(extra.precio || 0);
    }, 0);
  };

  const calcularPrecioTotal = (item) => {
    const base = Number(item.precioBase || 0);
    const extras = calcularExtras(item);

    return base + extras;
  };

  const abrirModalEliminar = (id) => {
    setProductoAEliminar(id);
    setModalEliminar(true);
  };

  const cancelarEliminar = () => {
    setProductoAEliminar(null);
    setModalEliminar(false);
  };

  const confirmarEliminar = async () => {
    const nuevaLista = productos.filter(
      (item) => item.id !== productoAEliminar
    );

    await guardarPrecios(nuevaLista);

    setProductos(nuevaLista);
    setProductoAEliminar(null);
    setModalEliminar(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Feather name="menu" size={32} color={TEXT} />

          <Text style={styles.title}>Precios fijos</Text>

          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/nuevo-producto')}
          >
            <Ionicons name="add" size={36} color="#fff" />
          </Pressable>
        </View>

        <Pressable
          style={styles.moreButton}
          onPress={() => router.push('/nuevo-producto')}
        >
          <Text style={styles.moreText}>Agregar más precios</Text>
          <Ionicons name="add" size={28} color={PRIMARY} />
        </Pressable>

        <View style={styles.grid}>
          {productos.map((item) => (
            <View key={item.id} style={[styles.card, { width: cardWidth }]}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>

                <View style={styles.cardActions}>
                  <Pressable
                    style={styles.iconButton}
                    onPress={() =>
                      router.push(`/editar-producto?id=${item.id}`)
                    }
                  >
                    <Feather name="edit-2" size={21} color={PRIMARY} />
                  </Pressable>

                  <Pressable
                    style={styles.iconButton}
                    onPress={() => abrirModalEliminar(item.id)}
                  >
                    <Feather name="trash-2" size={21} color={DANGER} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.line} />

              <Text style={styles.price}>
                ${calcularPrecioTotal(item).toFixed(2)}
              </Text>

              <View style={styles.summary}>
                <Text style={styles.summaryText}>
                  Base: ${Number(item.precioBase || 0).toFixed(2)}
                </Text>

                <Text style={styles.summaryText}>
                  Extras: +${calcularExtras(item).toFixed(2)}
                </Text>
              </View>

              {item.costosAdicionales?.length > 0 && (
                <View style={styles.extraContainer}>
                  {item.costosAdicionales.map((extra) => (
                    <View key={extra.id} style={styles.extraRow}>
                      <Text style={styles.extraName}>{extra.nombre}</Text>

                      <Text style={styles.extraPrice}>
                        +${Number(extra.precio || 0).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {!!item.descripcion && (
                <Text style={styles.description}>{item.descripcion}</Text>
              )}
            </View>
          ))}
        </View>

        {productos.length === 0 && (
          <Text style={styles.emptyText}>Aún no hay precios guardados</Text>
        )}
      </ScrollView>

      <Modal
        visible={modalEliminar}
        transparent
        animationType="fade"
        onRequestClose={cancelarEliminar}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIcon}>
              <Feather name="trash-2" size={34} color={DANGER} />
            </View>

            <Text style={styles.modalTitle}>Eliminar producto</Text>

            <Text style={styles.modalText}>
              ¿Seguro que deseas eliminar este producto?
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={cancelarEliminar}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.modalDelete}
                onPress={confirmarEliminar}
              >
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
  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 110,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: TEXT,
  },

  addButton: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  moreButton: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 8,
    marginBottom: 34,
  },

  moreText: {
    fontSize: 20,
    color: MUTED,
    marginRight: 10,
    fontWeight: '600',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 22,
    overflow: 'hidden',
    paddingBottom: 18,
  },

  cardTop: {
    minHeight: 88,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  cardTitle: {
    flex: 1,
    fontSize: 23,
    color: TEXT,
    fontWeight: '500',
    marginRight: 10,
  },

  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },

  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F2F5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  line: {
    height: 1,
    backgroundColor: '#9CB5C8',
  },

  price: {
    paddingHorizontal: 18,
    paddingTop: 14,
    fontSize: 42,
    color: TEXT,
    fontWeight: '400',
  },

  summary: {
    paddingHorizontal: 18,
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  summaryText: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '600',
  },

  extraContainer: {
    paddingHorizontal: 18,
    marginTop: 12,
  },

  extraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  extraName: {
    color: MUTED,
    fontSize: 15,
  },

  extraPrice: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '700',
  },

  description: {
    paddingHorizontal: 18,
    marginTop: 14,
    color: MUTED,
    fontSize: 15,
    lineHeight: 22,
  },

  emptyText: {
    textAlign: 'center',
    color: MUTED,
    fontSize: 18,
    marginTop: 30,
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