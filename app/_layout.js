import { Tabs } from 'expo-router';

export default function Layout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Factura',
                }}
            />

            <Tabs.Screen
                name="admin"
                options={{
                    title: 'Precios',
                }}
            />

            <Tabs.Screen
                name="facturas"
                options={{
                    title: 'Guardadas',
                }}
            />
        </Tabs>
    );
}