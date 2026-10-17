import { describe, expect, it } from 'vitest';
import {
  migrateHabitData,
  parseBackup,
  serializeBackup,
  weeklyCount,
  weekDays,
  hasReviewDue,
} from '../src/renewal/domain';
import type { Habit, HabitLog } from '../src/types/habit';
const habit: Habit = {
  id: 'old',
  name: 'Read',
  icon: 'book',
  color: '#315E4C',
  reminderTime: '09:00',
  order: 0,
  createdAt: '2026-09-01T03:00:00Z',
  updatedAt: '2026-09-01T03:00:00Z',
};
const log: HabitLog = {
  id: 'entry',
  habitId: 'old',
  date: '2026-10-02',
  completed: true,
  completedAt: '2026-10-02T03:00:00Z',
};
describe('existing records and portable backups', () => {
  it('preserves v1 habit fields and logs without granting purchase access', () => {
    const data = migrateHabitData({ habits: [habit], logs: [log] }, 1);
    expect(data).toEqual({ habits: [habit], logs: [log], freeHabitId: null, widgetEventIds: [] });
  });
  it('drops v2 legacy access but preserves the free choice and event replay protection', () => {
    const data = migrateHabitData({ habits: [habit], logs: [log], legacyAccess: true,
      freeHabitId: habit.id, widgetEventIds: ['event-1'] }, 2);
    expect(data).toEqual({ habits: [habit], logs: [log], freeHabitId: habit.id,
      widgetEventIds: ['event-1'] });
    expect(migrateHabitData(null, 0)).toEqual({ habits: [], logs: [], freeHabitId: null, widgetEventIds: [] });
    expect(migrateHabitData({ habits: [habit], logs: [], freeHabitId: 'deleted' }, 2).freeHabitId).toBeNull();
  });
  it('preserves older records without completion timestamps', () => {
    const { completedAt, ...oldLog } = log;
    expect(migrateHabitData({ habits: [habit], logs: [oldLog] }, 2).logs)
      .toEqual([{ ...oldLog, completedAt: null }]);
  });
  it('round trips graduation, adjustments and tiny actions without entitlements', () => {
    const graduated = {
      ...habit,
      isGraduated: true,
      graduatedAt: '2026-10-04',
      totalFlowDays: 1,
      reviews: [
        {
          id: 'r',
          date: '2026-10-03',
          feeling: 'adjust' as const,
          note: 'Busy',
          minimum: 'One page',
        },
      ],
    };
    const tiny = { ...log, effort: 'tiny' as const };
    const data = JSON.parse(serializeBackup([graduated], [tiny]));
    data.isPro = true;
    data.legacyAccess = true;
    expect(parseBackup(JSON.stringify(data))).toEqual({ habits: [graduated], logs: [tiny] });
  });
  it.each([
    { habits: [habit, habit], logs: [] },
    { habits: [habit], logs: [log, log] },
    { habits: [], logs: [log] },
    { habits: [{ ...habit, weeklyTarget: 99 }], logs: [] },
    { habits: [{ ...habit, totalFlowDays: 'fake' }], logs: [] },
    { habits: [habit], logs: [{ ...log, date: '2026-02-30' }] },
    { habits: [habit], logs: [{ ...log, effort: 'fake' }] },
    { habits: Array.from({ length: 4 }, (_, i) => ({ ...habit, id: String(i) })), logs: [] },
  ])('rejects invalid or inconsistent backups before returning data (%#)', (data) => {
    expect(() =>
      parseBackup(JSON.stringify({ format: 'ssak-backup', version: 1, ...data })),
    ).toThrow();
  });
});
describe('calendar and review intent', () => {
  it('keeps a Monday-based week across month/year and DST boundaries', () => {
    expect(weekDays('2027-01-01')).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ]);
    expect(weekDays('2026-03-08')).toHaveLength(7);
    expect(new Set(weekDays('2026-03-08')).size).toBe(7);
  });
  it('counts tiny actions once and excludes future and other habits', () => {
    expect(
      weeklyCount(
        'old',
        [
          log,
          { ...log, effort: 'tiny' },
          { ...log, date: '2026-10-04' },
          { ...log, habitId: 'other' },
        ],
        '2026-10-03',
      ),
    ).toBe(1);
  });
  it('waits seven days after restarting even if old reflections exist', () => {
    const restarted = {
      ...habit,
      restartedAt: '2026-10-02T03:00:00Z',
      reviews: [
        { id: 'r', date: '2026-09-03', feeling: 'easy' as const, note: '', minimum: 'Page' },
      ],
    };
    expect(hasReviewDue(restarted, '2026-10-04')).toBe(false);
    expect(hasReviewDue(restarted, '2026-10-09')).toBe(true);
  });
});
