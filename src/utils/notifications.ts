import * as Notifications from 'expo-notifications';
import i18n from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';

// 알림 액션 식별자 — 잠금화면/알림센터에서 "완료" 버튼이 눌렸을 때
export const HABIT_TOGGLE_CATEGORY = 'HABIT_TOGGLE';
export const HABIT_TOGGLE_ACTION = 'toggle';

// 알림 표시 정책
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// 카테고리는 한 번만 등록되면 됨 — 앱 수명 동안 캐시
let categoryRegistered = false;

export async function setupNotificationCategories(): Promise<void> {
  if (categoryRegistered) return;
  await Notifications.setNotificationCategoryAsync(HABIT_TOGGLE_CATEGORY, [
    {
      identifier: HABIT_TOGGLE_ACTION,
      buttonTitle: i18n.t('notifications.actionDone'),
      options: {
        // 액션 탭 시 앱을 깨우지 않음 — 잠금화면 그대로 유지
        opensAppToForeground: false,
      },
    },
  ]);
  categoryRegistered = true;
}

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

  const lockScreenEnabled = useSettingsStore.getState().lockScreenActionEnabled;
  if (lockScreenEnabled) {
    await setupNotificationCategories();
  }

  const [hours, minutes] = timeString.split(':').map(Number);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t('notifications.title'),
      body: i18n.t('notifications.body', { habitName }),
      data: { habitId },
      // 토글 ON일 때만 카테고리 부여 — 액션 버튼 노출 조건
      ...(lockScreenEnabled && { categoryIdentifier: HABIT_TOGGLE_CATEGORY }),
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

/**
 * 모든 활성 알림을 현재 설정(lockScreenActionEnabled)으로 재등록.
 * 토글 변경 시 호출 — 기존 알림에는 categoryIdentifier가 박혀 있어 변경 안 되므로
 * 전부 취소 후 재등록해야 함.
 */
export async function rescheduleAllReminders(): Promise<void> {
  // 순환 import 방지 — 런타임 require
  const { useHabitStore } = require('@/store/habitStore');
  const { habits } = useHabitStore.getState();

  for (const habit of habits) {
    // 졸업한 습관은 알림 재예약 대상 아님
    if (habit.isGraduated) continue;
    if (habit.reminderTime) {
      await scheduleHabitReminder(habit.id, habit.name, habit.reminderTime);
    }
  }
}
