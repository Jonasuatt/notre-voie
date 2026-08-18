import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { authAPI } from '../api/api';

// Enregistre le token Expo Push si l'utilisateur est connecté et sur un
// vrai appareil (jamais en simulateur/web) — alimente les fils Notification
// "quotidien"/"flash" côté serveur, cf. cahier des charges §3.4.
export async function registerPushToken() {
  try {
    if (!Device.isDevice) return null;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return null;

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    await authAPI.updateMe({ pushToken: token }).catch(() => {});
    return token;
  } catch (err) {
    return null;
  }
}
