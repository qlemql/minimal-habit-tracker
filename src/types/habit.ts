export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  reminderTime: string | null; // HH:mm 형식
  order: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt: string | null; // ISO 8601
}
