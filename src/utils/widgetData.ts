import { useHabitStore } from '@/store/habitStore';
import { getToday } from './date';
import { calculateFlow } from './streak';
import { setSharedDefault } from './sharedDefaults';

const WIDGET_DATA_KEY = 'widgetHabits';

// 위젯에 전달할 데이터 구조
export interface WidgetHabit {
  id: string;
  name: string;
  icon: string;
  color: string;
  completed: boolean;
  flowDays: number;
}

// 위젯용 데이터 생성
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

// 위젯 데이터를 App Group UserDefaults에 동기화
export async function syncWidgetData(): Promise<void> {
  const data = getWidgetData();
  await setSharedDefault(WIDGET_DATA_KEY, JSON.stringify(data));
}
