import { Alert, PermissionsAndroid, Platform, Vibration } from 'react-native';

type ReminderResult = { ok: true } | { ok: false; reason: string };

export async function requestReminderPermission(): Promise<ReminderResult> {
  if (Platform.OS !== 'android') {
    // iOS local alert fallback doesn't require runtime permission in this implementation.
    return { ok: true };
  }

  if (Platform.Version < 33) {
    return { ok: true };
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    {
      title: 'Autoriser les rappels',
      message: "L'application a besoin de la permission de notifications pour te rappeler tes habitudes.",
      buttonPositive: 'Autoriser',
      buttonNegative: 'Refuser',
    }
  );

  if (result !== PermissionsAndroid.RESULTS.GRANTED) {
    return { ok: false, reason: 'permission_denied' };
  }

  return { ok: true };
}

export async function scheduleHabitReminder(habitTitle: string, delaySeconds = 10): Promise<ReminderResult> {
  const permission = await requestReminderPermission();

  if (!permission.ok) {
    return permission;
  }

  setTimeout(() => {
    Vibration.vibrate(450);
    Alert.alert('Rappel habitude', `Il est temps de: ${habitTitle}`);
  }, Math.max(1, delaySeconds) * 1000);

  return { ok: true };
}
