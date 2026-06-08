import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 네이티브 의존성 없는 UUID 생성
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
import { Habit, HabitLog } from '@/types/habit';
import { getToday } from '@/utils/date';
import { scheduleHabitReminder, cancelHabitReminder, cancelTodayReminder } from '@/utils/notifications';
import { getCurrentStage, GrowthStageId } from '@/constants/growth';
import { calculateFlow } from '@/utils/streak';
// Pro 기능은 v1.4에서 활성화
// import { useProStore } from './proStore';

const MAX_FREE_HABITS = 3;

interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];

  // 습관 CRUD — addHabit은 생성된 습관 ID를 반환 (null이면 제한 초과)
  addHabit: (name: string, icon: string, color: string) => string | null;
  updateHabit: (id: string, updates: Partial<Pick<Habit, 'name' | 'icon' | 'color' | 'reminderTime'>>) => Promise<void>;
  deleteHabit: (id: string) => void;

  // 졸업 시스템 (v1.3+)
  graduateHabit: (id: string) => void;
  getActiveHabits: () => Habit[];
  getGraduatedHabits: () => Habit[];

  // 로그
  toggleHabit: (habitId: string, date?: string) => void;
  getLogsForDate: (date: string) => HabitLog[];
  isHabitCompleted: (habitId: string, date: string) => boolean;

  // 제한
  canAddHabit: () => boolean;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],

      addHabit: (name, icon, color) => {
        if (!get().canAddHabit()) return null;

        const now = new Date().toISOString();
        const id = generateId();
        // order는 전체 habits(졸업 포함) 중 max + 1 — 졸업한 항목 order와 겹치지 않도록.
        // 메인 리스트는 활성만 표시하므로 띄엄띄엄한 order 값이라도 정렬엔 영향 없음.
        const maxOrder = get().habits.reduce((max, h) => Math.max(max, h.order), -1);
        const newHabit: Habit = {
          id,
          name,
          icon,
          color,
          reminderTime: null,
          order: maxOrder + 1,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ habits: [...state.habits, newHabit] }));
        return id;
      },

      updateHabit: async (id, updates) => {
        const habit = get().habits.find((h) => h.id === id);
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id
              ? { ...h, ...updates, updatedAt: new Date().toISOString() }
              : h
          ),
        }));

        // 알림 시간이 변경된 경우
        if (updates.reminderTime !== undefined && habit) {
          const name = updates.name ?? habit.name;
          if (updates.reminderTime) {
            await scheduleHabitReminder(id, name, updates.reminderTime);
          } else {
            await cancelHabitReminder(id);
          }
        }
      },

      deleteHabit: (id) => {
        cancelHabitReminder(id);
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          logs: state.logs.filter((l) => l.habitId !== id),
        }));
      },

      graduateHabit: (id) => {
        const habit = get().habits.find((h) => h.id === id);
        if (!habit || habit.isGraduated) return;

        // 졸업 시점 단계 + 누적 흐름 일수 계산해서 보존
        const flow = calculateFlow(id, get().logs);
        const stage = getCurrentStage(flow.currentFlowDays).id as GrowthStageId;
        const today = getToday();

        // 알림 끄기 — 졸업한 습관은 더 이상 푸시 안 옴
        cancelHabitReminder(id);

        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  isGraduated: true,
                  graduatedAt: today,
                  graduatedStage: stage,
                  totalFlowDays: flow.currentFlowDays,
                  reminderTime: null,
                  updatedAt: new Date().toISOString(),
                }
              : h
          ),
        }));
      },

      getActiveHabits: () => {
        return get().habits.filter((h) => !h.isGraduated);
      },

      getGraduatedHabits: () => {
        return get()
          .habits.filter((h) => h.isGraduated)
          .sort((a, b) => (b.graduatedAt ?? '').localeCompare(a.graduatedAt ?? ''));
      },

      toggleHabit: (habitId, date) => {
        const targetDate = date ?? getToday();
        // 오늘만 수정 가능 — 과거/미래 날짜 조작 방지
        if (targetDate !== getToday()) return;
        const existing = get().logs.find(
          (l) => l.habitId === habitId && l.date === targetDate
        );

        let nowCompleted = false;
        if (existing) {
          nowCompleted = !existing.completed;
          set((state) => ({
            logs: state.logs.map((l) =>
              l.id === existing.id
                ? {
                    ...l,
                    completed: nowCompleted,
                    completedAt: nowCompleted ? new Date().toISOString() : null,
                  }
                : l
            ),
          }));
        } else {
          nowCompleted = true;
          const newLog: HabitLog = {
            id: generateId(),
            habitId,
            date: targetDate,
            completed: true,
            completedAt: new Date().toISOString(),
          };
          set((state) => ({ logs: [...state.logs, newLog] }));
        }

        // 완료 처리되면 오늘 알림 cancel (중복 알림 회피).
        // 미완료로 되돌리면 알림 복구 X — 그 시각이 이미 지났을 가능성 高 + UX 단순화.
        if (nowCompleted) {
          cancelTodayReminder(habitId).catch(() => {});
        }
      },

      getLogsForDate: (date) => {
        return get().logs.filter((l) => l.date === date);
      },

      isHabitCompleted: (habitId, date) => {
        return get().logs.some(
          (l) => l.habitId === habitId && l.date === date && l.completed
        );
      },

      canAddHabit: () => {
        const activeCount = get().habits.filter((h) => !h.isGraduated).length;
        return activeCount < MAX_FREE_HABITS;
      },
    }),
    {
      name: 'habit-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => persisted as any,
      onRehydrateStorage: () => {
        return () => {
          // 스토어 복원 완료 후 위젯 데이터 동기화
          try {
            const { syncWidgetData } = require('@/utils/widgetData');
            syncWidgetData();
          } catch (e) {
            console.warn('[Widget] Hydration sync failed:', e);
          }
        };
      },
    }
  )
);
