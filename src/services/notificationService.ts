import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface ReminderConfig {
  enabled: boolean;
  time: string; // HH:mm (e.g. "08:30" or "21:00")
  title: string;
  body: string;
}

const STORAGE_KEY_REMINDER = 'imta_reminder_config';

const INSPIRATIONAL_QUOTES = [
  'حان وقت وردك اليومي.. «جمال الكلم يحيي القلوب وروائع الحكم تنير العقول» ✨',
  'دقائق معدودة مع كتاب إمتاع القارئ تصنع يوماً مباركاً 📖',
  'لا تقطع سلسلة قراءتك اليومية! استأنف تدبرك الآن 🌿',
  'درر وفوائد بانتظارك في صفحات إمتاع القارئ 📜',
  'استراحة فكرية مباركة مع روائع الأدب والحكمة 🌸',
];

export const getDefaultReminderConfig = (): ReminderConfig => ({
  enabled: true,
  time: '20:30',
  title: 'تذكير الورد القرائي 📖',
  body: 'حان وقت وردك اليومي من كتاب إمتاع القارئ',
});

export const getReminderConfig = (): ReminderConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REMINDER);
    if (!raw) return getDefaultReminderConfig();
    return { ...getDefaultReminderConfig(), ...JSON.parse(raw) };
  } catch {
    return getDefaultReminderConfig();
  }
};

export const saveReminderConfig = async (config: ReminderConfig): Promise<boolean> => {
  localStorage.setItem(STORAGE_KEY_REMINDER, JSON.stringify(config));
  
  if (config.enabled) {
    return await scheduleDailyReminder(config);
  } else {
    return await cancelAllReminders();
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } else if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return false;
  }
};

export const scheduleDailyReminder = async (config: ReminderConfig): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return false;

    const [hourStr, minuteStr] = config.time.split(':');
    const hour = parseInt(hourStr, 10) || 20;
    const minute = parseInt(minuteStr, 10) || 30;

    if (Capacitor.isNativePlatform()) {
      // Cancel previous scheduled notifications
      await cancelAllReminders();

      const randomQuote = INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1001,
            title: config.title || 'إمتاع القارئ 📖',
            body: config.body || randomQuote,
            schedule: {
              on: {
                hour,
                minute,
              },
              repeats: true,
              allowWhileIdle: true,
            },
            sound: 'default',
            smallIcon: 'ic_launcher_round',
            iconColor: '#a37c6c',
          },
        ],
      });
      return true;
    } else {
      // Web notification setup
      return true;
    }
  } catch (err) {
    console.error('Error scheduling reminder:', err);
    return false;
  }
};

export const cancelAllReminders = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    }
    return true;
  } catch (err) {
    console.error('Error canceling notifications:', err);
    return false;
  }
};

export const sendInstantNotification = async (title: string, body: string): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return false;

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 90000) + 10000,
            title,
            body,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            smallIcon: 'ic_launcher_round',
            iconColor: '#a37c6c',
          },
        ],
      });
      return true;
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/app-logo.png',
        badge: '/app-logo.png',
      });
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Instant notification failed:', err);
    return false;
  }
};
