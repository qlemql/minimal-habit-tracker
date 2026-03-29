import { useHabitStore } from '@/store/habitStore';
import { getToday } from './date';
import { calculateStreak } from './streak';

// 위젯에 전달할 데이터 구조
export interface WidgetHabit {
  id: string;
  name: string;
  icon: string;
  color: string;
  completed: boolean;
  streak: number;
}

// 위젯용 데이터 생성 (SharedDefaults를 통해 위젯과 공유)
export function getWidgetData(): WidgetHabit[] {
  const { habits, logs, isHabitCompleted } = useHabitStore.getState();
  const today = getToday();

  return habits
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)
    .map((habit) => ({
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      completed: isHabitCompleted(habit.id, today),
      streak: calculateStreak(habit.id, logs),
    }));
}
