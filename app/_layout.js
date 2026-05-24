import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const PRIMARY = '#1479B8';
const MUTED = '#6F8CA3';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          height: 60,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          textAlign: 'center',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Generar factura',
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text-outline" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: 'Costos fijos',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="database" size={30} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="facturas"
        options={{
          title: 'Cotizaciones',
          tabBarIcon: ({ color }) => (
            <Feather name="bookmark" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}