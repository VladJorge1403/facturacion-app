import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PRIMARY = '#1479B8';
const MUTED = '#6F8CA3';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: MUTED,

        tabBarStyle: {
          height: 88,
          paddingTop: 8,
          paddingBottom: 28,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 12,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Generar factura',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: 'Costos fijos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="database" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="facturas"
        options={{
          title: 'Cotizaciones',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="nuevo-producto"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="editar-producto"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}