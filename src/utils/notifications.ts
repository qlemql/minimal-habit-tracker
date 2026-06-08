import * as Notifications from 'expo-notifications';
import i18n from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { getToday } from '@/utils/date';

// ────────────────────────────────────────────────────────────────────────────
// 알림 액션 식별자 — 잠금화면/알림센터에서 "완료" 버튼이 눌렸을 때
// ────────────────────────────────────────────────────────────────────────────
export const HABIT_TOGGLE_CATEGORY = 'HABIT_TOGGLE';
export const HABIT_TOGGLE_ACTION = 'toggle';

// 한 습관당 미리 등록하는 single-shot reminder 일수 — 그 후 reactivation 1개
// 3 habits × 7 reminders + 3 reactivation = 24개 (iOS 64개 한도 안전)
const REMINDER_DAYS_AHEAD = 7;

// 알림 data payload kind 분류
type NotificationKind = 'reminder' | 'reactivation';

interface NotificationData {
  habitId: string;
  kind: NotificationKind;
  date?: string; // 'YYYY-MM-DD' — reminder만 사용 (오늘 알림 cancel 시 매칭)
  [key: string]: unknown;
}

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

// ────────────────────────────────────────────────────────────────────────────
// 내부 헬퍼
// ────────────────────────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** timeString HH:mm 기준으로 다음 N번의 fire Date 배열 (오늘 시간이 미래면 오늘 포함). */
function getNextFireDates(timeString: string, count: number): Date[] {
  const [hour, minute] = timeString.split(':').map(Number);
  const now = new Date();
  const first = new Date(now);
  first.setHours(hour, minute, 0, 0);
  if (first <= now) {
    first.setDate(first.getDate() + 1);
  }

  const dates: Date[] = [];
  const cursor = new Date(first);
  for (let i = 0; i < count; i++) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

// ────────────────────────────────────────────────────────────────────────────
// 알림 스케줄/취소
// ────────────────────────────────────────────────────────────────────────────

/**
 * 습관별 알림 스케줄 등록.
 * - 다음 7일치 single-shot reminder 등록
 * - 마지막 reminder 다음날 같은 시간에 reactivation 알람 1개 등록
 *   (사용자가 7일 동안 앱을 안 열면 끊김 → reactivation으로 복귀 유도)
 */
export async function scheduleHabitReminder(
  habitId: string,
  habitName: string,
  timeString: string // HH:mm
): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  // 기존 알림 모두 취소 후 새로 등록 (일관성)
  await cancelHabitReminder(habitId);

  const lockScreenEnabled = useSettingsStore.getState().lockScreenActionEnabled;
  if (lockScreenEnabled) {
    await setupNotificationCategories();
  }

  const fireDates = getNextFireDates(timeString, REMINDER_DAYS_AHEAD);

  // 1) 정상 reminder N개
  for (const fireDate of fireDates) {
    const data: NotificationData = {
      habitId,
      kind: 'reminder',
      date: toISODate(fireDate),
    };
    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifications.title'),
        body: i18n.t('notifications.body', { habitName }),
        data,
        ...(lockScreenEnabled && { categoryIdentifier: HABIT_TOGGLE_CATEGORY }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        year: fireDate.getFullYear(),
        month: fireDate.getMonth() + 1,
        day: fireDate.getDate(),
        hour: fireDate.getHours(),
        minute: fireDate.getMinutes(),
        repeats: false,
      },
    });
  }

  // 2) reactivation 알람 — 마지막 reminder 다음날 같은 시간
  const reactivationDate = new Date(fireDates[fireDates.length - 1]);
  reactivationDate.setDate(reactivationDate.getDate() + 1);
  const reactivationData: NotificationData = {
    habitId,
    kind: 'reactivation',
  };
  await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t('notifications.reactivation.title'),
      body: i18n.t('notifications.reactivation.body', { habitName }),
      data: reactivationData,
      // reactivation은 액션 카테고리 X — 탭만으로 앱 launch
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      year: reactivationDate.getFullYear(),
      month: reactivationDate.getMonth() + 1,
      day: reactivationDate.getDate(),
      hour: reactivationDate.getHours(),
      minute: reactivationDate.getMinutes(),
      repeats: false,
    },
  });
}

/** 습관의 모든 알림(reminder + reactivation) 취소. */
export async function cancelHabitReminder(habitId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    const data = notification.content.data as unknown as NotificationData | undefined;
    if (data?.habitId === habitId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * 특정 습관의 "오늘 reminder만" 취소.
 * - toggleHabit 완료 시 호출 → 이미 완료한 날은 알림 안 옴
 * - 내일 이후 + reactivation은 유지
 */
export async function cancelTodayReminder(habitId: string): Promise<void> {
  const today = getToday();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    const data = notification.content.data as unknown as NotificationData | undefined;
    if (
      data?.habitId === habitId &&
      data?.kind === 'reminder' &&
      data?.date === today
    ) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * 모든 활성 습관 알림을 현재 설정으로 재등록.
 * - 앱 launch 시 호출 → 다음 N일치 보충 + reactivation 갱신
 * - 토글 변경 시 호출 → categoryIdentifier 재적용
 * - 오늘 이미 완료한 습관은 오늘 reminder는 cancel 처리
 */
export async function rescheduleAllReminders(): Promise<void> {
  // 순환 import 방지 — 런타임 require
  const { useHabitStore } = require('@/store/habitStore');
  const { habits, isHabitCompleted } = useHabitStore.getState();
  const today = getToday();

  for (const habit of habits) {
    if (habit.isGraduated) continue;
    if (!habit.reminderTime) continue;
    await scheduleHabitReminder(habit.id, habit.name, habit.reminderTime);
    if (isHabitCompleted(habit.id, today)) {
      await cancelTodayReminder(habit.id);
    }
  }
}

/** rescheduleAllReminders의 alias — 앱 launch 의도를 더 명확히 표현. */
export const refreshHabitReminders = rescheduleAllReminders;
