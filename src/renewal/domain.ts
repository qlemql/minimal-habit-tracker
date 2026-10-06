import type { Habit, HabitLog } from '../types/habit';

export const localDate = (date = new Date()): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const shiftDate = (day: string, offset: number): string => {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return localDate(date);
};
export const weekDays = (today = localDate()): string[] => {
  const offset = (new Date(`${today}T12:00:00`).getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, index) => shiftDate(today, index - offset));
};
export const completedDays = (id: string, logs: HabitLog[]): Set<string> =>
  new Set(logs.filter((log) => log.habitId === id && log.completed).map((log) => log.date));
export const weeklyCount = (id: string, logs: HabitLog[], today = localDate()): number => {
  const dates = completedDays(id, logs);
  return weekDays(today).filter((day) => day <= today && dates.has(day)).length;
};
export const hasReviewDue = (habit: Habit, today = localDate()): boolean => {
  const started = localDate(new Date(habit.restartedAt ?? habit.createdAt));
  const last = [started, habit.reviews?.at(-1)?.date ?? started].sort().at(-1) ?? started;
  return shiftDate(last, 7) <= today;
};
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown, max = 500): value is string =>
  typeof value === 'string' && value.length <= max;
const isDate = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  localDate(new Date(`${value}T12:00:00`)) === value;
const isTimestamp = (value: unknown): value is string =>
  isText(value, 40) && Number.isFinite(Date.parse(value));
const isReview = (value: unknown): boolean =>
  isRecord(value) &&
  isText(value.id, 100) &&
  isDate(value.date) &&
  ['easy', 'adjust', 'ready'].includes(String(value.feeling)) &&
  isText(value.note) &&
  isText(value.minimum, 120);
const isHabit = (value: unknown): value is Habit =>
  isRecord(value) &&
  isText(value.id, 100) &&
  value.id.length > 0 &&
  isText(value.name, 80) &&
  value.name.trim().length > 0 &&
  isText(value.icon, 30) &&
  isText(value.color, 30) &&
  /^#[\da-fA-F]{6}$/.test(value.color) &&
  (value.reminderTime === null ||
    (typeof value.reminderTime === 'string' &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(value.reminderTime))) &&
  Number.isInteger(value.order) &&
  isTimestamp(value.createdAt) &&
  isTimestamp(value.updatedAt) &&
  (value.cue === undefined || isText(value.cue, 120)) &&
  (value.minimum === undefined || isText(value.minimum, 120)) &&
  (value.weeklyTarget === undefined ||
    (typeof value.weeklyTarget === 'number' &&
      [1, 2, 3, 4, 5, 6, 7].includes(value.weeklyTarget))) &&
  (value.isGraduated === undefined || typeof value.isGraduated === 'boolean') &&
  (value.graduatedAt === undefined || isDate(value.graduatedAt)) &&
  (value.totalFlowDays === undefined ||
    (typeof value.totalFlowDays === 'number' &&
      Number.isInteger(value.totalFlowDays) &&
      value.totalFlowDays >= 0)) &&
  (value.graduatedStage === undefined ||
    ['seed', 'sprout', 'leaf', 'stem', 'bud', 'bloom'].includes(String(value.graduatedStage))) &&
  (value.restartedAt === undefined || isTimestamp(value.restartedAt)) &&
  (value.reviews === undefined ||
    (Array.isArray(value.reviews) &&
      value.reviews.length <= 10000 &&
      value.reviews.every(isReview)));
const isLog = (value: unknown): value is HabitLog =>
  isRecord(value) &&
  isText(value.id, 150) &&
  isText(value.habitId, 100) &&
  isDate(value.date) &&
  typeof value.completed === 'boolean' &&
  (value.completedAt === null || isTimestamp(value.completedAt)) &&
  (value.effort === undefined || value.effort === 'full' || value.effort === 'tiny');
export interface HabitData {
  habits: Habit[];
  logs: HabitLog[];
  freeHabitId: string | null;
  widgetEventIds: string[];
}
export const migrateHabitData = (value: unknown, _version: number): HabitData => {
  if (!isRecord(value)) return { habits: [], logs: [], freeHabitId: null, widgetEventIds: [] };
  const habits = Array.isArray(value.habits) ? value.habits.filter(isHabit) : [];
  const ids = new Set(habits.map((habit) => habit.id));
  const logs = Array.isArray(value.logs)
    ? value.logs
      .map((log) => isRecord(log) && log.completedAt === undefined
        ? { ...log, completedAt: null } : log)
      .filter(isLog).filter((log) => ids.has(log.habitId))
    : [];
  // Upgrade records without carrying over the retired legacy entitlement.
  const freeHabitId = typeof value.freeHabitId === 'string' &&
    habits.some((habit) => habit.id === value.freeHabitId && !habit.isGraduated)
    ? value.freeHabitId : null;
  const widgetEventIds = Array.isArray(value.widgetEventIds)
    ? value.widgetEventIds.filter((id): id is string => typeof id === 'string').slice(-2000)
    : [];
  return { habits, logs, freeHabitId, widgetEventIds };
};
export const serializeBackup = (habits: Habit[], logs: HabitLog[]): string =>
  JSON.stringify(
    { format: 'ssak-backup', version: 1, exportedAt: new Date().toISOString(), habits, logs },
    null,
    2,
  );
export const parseBackup = (text: string): Pick<HabitData, 'habits' | 'logs'> => {
  if (text.length > 10_000_000) throw new Error('backup-invalid');
  const value: unknown = JSON.parse(text);
  if (
    !isRecord(value) ||
    value.format !== 'ssak-backup' ||
    value.version !== 1 ||
    !Array.isArray(value.habits) ||
    !Array.isArray(value.logs) ||
    value.habits.length > 10000 ||
    value.logs.length > 100000 ||
    !value.habits.every(isHabit) ||
    !value.logs.every(isLog)
  )
    throw new Error('backup-invalid');
  const ids = new Set(value.habits.map((habit) => habit.id));
  const logKeys = new Set(value.logs.map((log) => `${log.habitId}/${log.date}`));
  if (
    ids.size !== value.habits.length ||
    logKeys.size !== value.logs.length ||
    value.logs.some((log) => !ids.has(log.habitId)) ||
    value.habits.filter((habit) => !habit.isGraduated).length > 3
  )
    throw new Error('backup-invalid');
  return { habits: value.habits, logs: value.logs };
};
