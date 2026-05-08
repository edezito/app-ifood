import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';

// Configurar handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Registrar token push
export async function registrarPushToken(usuarioId) {
  if (!Device.isDevice) {
    console.log('Notificações push só funcionam em dispositivo físico');
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada');
      return;
    }

    const projectId = 'ea301521-ec82-4f06-9a1e-022fb38a61f6';
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    console.log('📱 Token Push:', token);

    const { error } = await supabase
      .from('push_tokens')
      .upsert({
        usuario_id: usuarioId,
        token: token,
        plataforma: Platform.OS,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Erro ao salvar token:', error);
    } else {
      console.log('✅ Token push salvo!');
    }
  } catch (error) {
    console.error('Erro ao registrar push:', error);
  }
}

// Versão simplificada do setup - apenas retorna sem fazer nada
export function setupNotificationListeners() {
  console.log('Notificações inicializadas');
}