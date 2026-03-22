import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

type ReminderResult = { ok: true } | { ok: false; reason: string };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let channelInitialized = false;

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android' || channelInitialized) {
    return;
  }

  await Notifications.setNotificationChannelAsync('habit-reminders', {
    name: 'Rappels habitudes',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 200, 250],
    lightColor: '#3B82F6',
    sound: 'default',
  });

  channelInitialized = true;
}

export async function requestReminderPermission(): Promise<ReminderResult> {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.granted) {
    return { ok: true };
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();

  if (!requestedPermission.granted) {
    return { ok: false, reason: 'permission_denied' };
  }

  return { ok: true };
}

export async function scheduleHabitReminder(habitTitle: string, delaySeconds = 10): Promise<ReminderResult> {
  const permission = await requestReminderPermission();

  if (!permission.ok) {
    return permission;
  }

  await ensureAndroidChannel();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rappel habitude',
      body: `Il est temps de : ${habitTitle}`,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySeconds),
      channelId: Platform.OS === 'android' ? 'habit-reminders' : undefined,
    },
  });

  return { ok: true };
}
