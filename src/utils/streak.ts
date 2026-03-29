import { HabitLog } from '@/types/habit';
import { formatDate } from './date';

// 특정 습관의 연속 달성 일수 계산
export function calculateStreak(habitId: string, logs: HabitLog[]): number {
  const completedDates = new Set(
    logs
      .filter((log) => log.habitId === habitId && log.completed)
      .map((log) => log.date)
  );

  if (completedDates.size === 0) return 0;

  let streak = 0;
  const today = new Date();

  // 오늘부터 역순으로 확인
  // 오늘 미완료면 어제부터 카운트
  const todayStr = formatDate(today);
  let checkDate = new Date(today);

  if (!completedDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (completedDates.has(formatDate(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}
