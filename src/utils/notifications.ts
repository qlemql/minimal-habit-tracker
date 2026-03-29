import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 알림 설정 초기화
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// 습관별 알림 스케줄 등록
export async function scheduleHabitReminder(
  habitId: string,
  habitName: string,
  timeString: string // HH:mm
): Promise<string | null> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return null;

  // 기존 알림 취소
  await cancelHabitReminder(habitId);

  const [hours, minutes] = timeString.split(':').map(Number);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '습관 리마인더',
      body: `${habitName} 할 시간이에요!`,
      data: { habitId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });

  return identifier;
}

// 습관 알림 취소
export async function cancelHabitReminder(habitId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.habitId === habitId) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    }
  }
}

