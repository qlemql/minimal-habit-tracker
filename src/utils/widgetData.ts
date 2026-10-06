import { ackWidgetEvents } from '../../modules/shared-defaults';
import { flushHabitStorage } from '@/renewal/storage';
import { useHabitStore } from '@/store/habitStore';
import { formatDate } from './date';
import { Platform } from 'react-native';
import { setSharedDefault, getSharedDefault } from './sharedDefaults';

const WIDGET_DATA_KEY = 'widgetHabits';

// 위젯이 "오늘"을 자체 판정하기 위해 보내주는 최근 완료 날짜 윈도우.
// 오늘 상태와 월요일 시작 주간 기록을 기기에서 계산한다.
const HISTORY_WINDOW_DAYS = 90;

export interface WidgetHabit {
  id: string;
  name: string;
  icon: string;
  color: string;
  weeklyTarget: number;
  tinyDates: string[];
  // 최근 HISTORY_WINDOW_DAYS 일간 완료한 날짜들 (YYYY-MM-DD, 오름차순).
  // 위젯 측이 표시 날짜로 오늘 상태와 주간 횟수를 재계산.
  completedDates: string[];
}

export function getWidgetData(): WidgetHabit[] {
  const { habits, logs } = useHabitStore.getState();
  const cutoffDate = new Date();
  const today = formatDate(cutoffDate);
  cutoffDate.setDate(cutoffDate.getDate() - HISTORY_WINDOW_DAYS);
  const cutoff = formatDate(cutoffDate);

  return habits
    .filter((h) => useHabitStore.getState().canTrackHabit(h.id))
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)
    .map((habit) => ({
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      weeklyTarget: habit.weeklyTarget ?? 7,
      tinyDates: [...new Set(logs.filter((log) => log.habitId === habit.id &&
        log.completed && log.effort === 'tiny' && log.date >= cutoff && log.date <= today)
        .map((log) => log.date))].sort(),
      completedDates: [...new Set(logs
        .filter(
          (l) =>
            l.habitId === habit.id &&
            l.completed &&
            l.date >= cutoff && l.date <= today
        )
        .map((l) => l.date))].sort(),
    }));
}

let syncing: Promise<void> = Promise.resolve();
export function syncWidgetData(): Promise<void> {
  syncing = syncing.catch(() => {}).then(() =>
    setSharedDefault(WIDGET_DATA_KEY, JSON.stringify(getWidgetData())),
  );
  return syncing;
}

/**
 * Android 위젯의 tap-to-check 큐를 처리
 * 날짜와 최종 완료 상태를 저장한 후 처리된 이벤트만 확인 처리한다.
 */
let processing: Promise<void> | null = null;
export function processPendingWidgetToggles(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  if (processing) return processing;
  processing = importPendingEvents().finally(() => { processing = null; });
  return processing;
}
async function importPendingEvents(): Promise<void> {
  const raw = await getSharedDefault('widgetPendingToggles');
  if (!raw) return;
  const queue: unknown = JSON.parse(raw);
  if (!Array.isArray(queue) || queue.length === 0) return;
  const ids: string[] = [];
  const events: unknown[] = queue;
  for (const event of events) {
    if (!event || typeof event !== 'object') continue;
    if (!('eventId' in event) || typeof event.eventId !== 'string') continue;
    ids.push(event.eventId);
    if (!('habitId' in event) || !('date' in event) || !('completed' in event) ||
        typeof event.habitId !== 'string' || typeof event.date !== 'string' ||
        typeof event.completed !== 'boolean') continue;
    useHabitStore.getState().applyWidgetEvent(event.habitId, event.date, event.completed, event.eventId);
  }
  // Also retry persisting already-applied events after a previous storage failure.
  useHabitStore.setState({});
  await flushHabitStorage();
  await ackWidgetEvents(ids);
  await syncWidgetData();
}
