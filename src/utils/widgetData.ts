import { useHabitStore } from '@/store/habitStore';
import { formatDate } from './date';
import { Platform } from 'react-native';
import { setSharedDefault, getSharedDefault } from './sharedDefaults';

const WIDGET_DATA_KEY = 'widgetHabits';

// 위젯이 "오늘"을 자체 판정하기 위해 보내주는 최근 완료 날짜 윈도우.
// 90일이면 90일 흐름까지 정확히 재계산 가능 + 페이로드 크기 ~1KB/습관.
const HISTORY_WINDOW_DAYS = 90;

export interface WidgetHabit {
  id: string;
  name: string;
  icon: string;
  color: string;
  // 최근 HISTORY_WINDOW_DAYS 일간 완료한 날짜들 (YYYY-MM-DD, 오름차순).
  // 위젯 측이 Date()로 오늘을 직접 구해서 contains/flow 재계산.
  completedDates: string[];
}

export function getWidgetData(): WidgetHabit[] {
  const { habits, logs } = useHabitStore.getState();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - HISTORY_WINDOW_DAYS);
  const cutoff = formatDate(cutoffDate);

  return habits
    .filter((h) => !h.isGraduated)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)
    .map((habit) => ({
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      completedDates: logs
        .filter(
          (l) =>
            l.habitId === habit.id &&
            l.completed &&
            l.date >= cutoff // YYYY-MM-DD 문자열 비교 = 사전식 = 시간순
        )
        .map((l) => l.date)
        .sort(),
    }));
}

export async function syncWidgetData(): Promise<void> {
  const data = getWidgetData();
  await setSharedDefault(WIDGET_DATA_KEY, JSON.stringify(data));
}

/**
 * Android 위젯의 tap-to-check 큐를 처리
 * 앱 포그라운드 전환 시 호출 — 큐의 habitId들에 대해 toggleHabit 수행 후 큐 비움
 */
export async function processPendingWidgetToggles(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const raw = await getSharedDefault('widgetPendingToggles');
  if (!raw) return;
  try {
    const queue = JSON.parse(raw) as string[];
    if (!Array.isArray(queue) || queue.length === 0) return;
    const { toggleHabit } = useHabitStore.getState();
    for (const habitId of queue) {
      toggleHabit(habitId);
    }
    // 큐 비우기
    await setSharedDefault('widgetPendingToggles', JSON.stringify([]));
    // 변경된 store 상태로 위젯 재동기화
    await syncWidgetData();
  } catch (e) {
    console.warn('[Widget] process pending failed:', e);
  }
}
