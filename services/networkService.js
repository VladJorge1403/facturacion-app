import NetInfo from '@react-native-community/netinfo';

export async function hayInternet() {
    const estado = await NetInfo.fetch();
    return estado.isConnected && estado.isInternetReachable !== false;
}