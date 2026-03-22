declare module 'expo-notifications' {
  export const AndroidImportance: {
    HIGH: number;
  };

  export const SchedulableTriggerInputTypes: {
    TIME_INTERVAL: string;
  };

  export function setNotificationHandler(handler: {
    handleNotification: () => Promise<{
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
      shouldShowBanner: boolean;
      shouldShowList: boolean;
    }>;
  }): void;

  export function setNotificationChannelAsync(
      channelId: string,
      channel: {
        name: string;
        importance: number;
        vibrationPattern?: number[];
        lightColor?: string;
        sound?: 'default' | null;
      }
  ): Promise<void>;

  export function getPermissionsAsync(): Promise<{ granted: boolean }>;

  export function requestPermissionsAsync(): Promise<{ granted: boolean }>;

  export function scheduleNotificationAsync(input: {
    content: {
      title: string;
      body: string;
      sound?: 'default' | null;
    };
    trigger: {
      type: string;
      seconds: number;
      channelId?: string;
    };
  }): Promise<string>;
}