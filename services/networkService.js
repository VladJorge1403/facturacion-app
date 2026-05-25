import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export async function hayInternet() {
  try {
    if (Platform.OS === 'web') {
      return navigator.onLine;
    }

    const estado = await NetInfo.fetch();

    return (
      estado.isConnected === true &&
      estado.isInternetReachable !== false
    );
  } catch (error) {
    console.log('Error verificando internet:', error.message);
    return false;
  }
}