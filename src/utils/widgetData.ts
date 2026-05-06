import { useHabitStore } from '@/store/habitStore';
import { getToday } from './date';
import { calculateFlow } from './streak';
import { Platform } from 'react-native';
import { setSharedDefault, getSharedDefault } from './sharedDefaults';

const WIDGET_DATA_KEY = 'widgetHabits';

export interface WidgetHabit {
  id: string;
  name: string;
  icon: string;
  color: string;
  completed: boolean;
  flowDays: number;
}

export function getWidgetData(): WidgetHabit[] {
  const { habits, logs, isHabitCompleted } = useHabitStore.getState();
  const today = getToday();

  return [...habits]
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)
    .map((habit) => ({
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      completed: isHabitCompleted(habit.id, today),
      flowDays: calculateFlow(habit.id, logs, today).currentFlowDays,
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
