import { HabitLog } from '@/types/habit';
import { formatDate } from './date';

export interface FlowResult {
  currentFlowDays: number;       // 현재 흐름에서 수행한 일수
  currentFlowStartDate: string;  // 현재 흐름의 시작일
  isBreathingToday: boolean;     // 오늘이 쉼표 상태인지
  longestFlow: number;           // 역대 최장 흐름
  status: 'active' | 'breathing' | 'new';
}

/**
 * "이어가기" 흐름 계산
 * - 하루 빠짐 = 쉼표 (흐름 유지)
 * - 이틀 연속 빠짐 = 흐름 끊김 (새로운 시작)
 * - 흐름 일수 = 실제 수행한 날만 카운트
 */
export function calculateFlow(
  habitId: string,
  logs: HabitLog[],
  today?: string
): FlowResult {
  const todayStr = today || formatDate(new Date());
  const completedDates = new Set(
    logs
      .filter((log) => log.habitId === habitId && log.completed)
      .map((log) => log.date)
  );

  // 오늘부터 과거로 탐색
  let flowDays = 0;
  let consecutiveMisses = 0;
  let flowStartDate = todayStr;
  let isBreathingToday = false;

  const checkDate = new Date(todayStr + 'T00:00:00');

  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(checkDate);

    if (completedDates.has(dateStr)) {
      flowDays++;
      consecutiveMisses = 0;
      flowStartDate = dateStr;
    } else {
      consecutiveMisses++;
      if (consecutiveMisses >= 2) {
        break; // 흐름 끊김
      }
      if (i === 0) {
        isBreathingToday = true;
      }
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  const longestFlow = calculateLongestFlow(habitId, logs);

  // 흐름이 없으면 쉼표도 없음 (신규 습관에 쉼표 표시 방지)
  const actualBreathing = isBreathingToday && flowDays > 0;

  return {
    currentFlowDays: flowDays,
    currentFlowStartDate: flowStartDate,
    isBreathingToday: actualBreathing,
    longestFlow,
    status: flowDays === 0 ? 'new' : actualBreathing ? 'breathing' : 'active',
  };
}

/**
 * 역대 최장 흐름 계산
 */
function calculateLongestFlow(habitId: string, logs: HabitLog[]): number {
  const habitLogs = logs.filter((log) => log.habitId === habitId);
  if (habitLogs.length === 0) return 0;

  // 모든 관련 날짜를 정렬 (오름차순)
  const completedDates = new Set(
    habitLogs.filter((l) => l.completed).map((l) => l.date)
  );

  const allDates = [...new Set(habitLogs.map((l) => l.date))].sort();
  if (allDates.length === 0) return 0;

  // 첫 날짜부터 오늘까지 순회
  const start = new Date(allDates[0] + 'T00:00:00');
  const end = new Date(formatDate(new Date()) + 'T00:00:00');

  let longest = 0;
  let current = 0;
  let consecutiveMisses = 0;

  const d = new Date(start);
  while (d <= end) {
    const dateStr = formatDate(d);

    if (completedDates.has(dateStr)) {
      current++;
      consecutiveMisses = 0;
      longest = Math.max(longest, current);
    } else {
      consecutiveMisses++;
      if (consecutiveMisses >= 2) {
        current = 0;
        consecutiveMisses = 0;
      }
    }

    d.setDate(d.getDate() + 1);
  }

  return longest;
}

/**
 * 기존 호환용 — calculateStreak은 calculateFlow로 대체되지만
 * 기존 코드에서 참조하는 곳이 있으면 이어가기 흐름 일수를 반환
 */
export function calculateStreak(habitId: string, logs: HabitLog[]): number {
  return calculateFlow(habitId, logs).currentFlowDays;
}
