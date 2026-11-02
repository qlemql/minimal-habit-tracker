import type { Habit, HabitLog } from '@/types/habit';
import type { HabitWriteSource } from '@/renewal/storage';

export type Cohort = 'new' | 'existing' | 'unknown';
export type EventName = 'analytics_started' | 'first_open' | 'app_open' |
  'habit_created' | 'habit_completed' | 'review_completed';
export type Snapshot = { habits: Habit[]; logs: HabitLog[] };
export type Activity = {
  name: EventName;
  // Local deduplication key: never sent to PostHog.
  key: string;
  at: string;
  source: HabitWriteSource;
};
const day = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function classifyCohort(stored: boolean | undefined, welcomed: boolean,
  installedAt: Date | undefined, releaseAt: Date): Cohort {
  if (stored || welcomed || (installedAt && installedAt < releaseAt)) return 'existing';
  if (stored === false && installedAt && installedAt >= releaseAt) return 'new';
  return 'unknown';
}

// Only newly committed actions count. Hydration, example loading and restores set a
// new baseline without reporting historical activity as new behavior.
export function activities(before: Snapshot, after: Snapshot, source: HabitWriteSource, now: Date): Activity[] {
  if (source === 'excluded') return [];
  const at = now.toISOString();
  const result: Activity[] = [];
  for (const habit of after.habits) {
    if (habit.id.startsWith('sample-')) continue;
    const old = before.habits.find(item => item.id === habit.id);
    if (!old) result.push({ name: 'habit_created', key: `create:${habit.id}`, at, source });
    for (const review of habit.reviews ?? []) {
      if (!(old?.reviews ?? []).some(item => item.id === review.id)) {
        result.push({ name: 'review_completed', key: `review:${review.id}`, at, source });
      }
    }
  }
  for (const log of after.logs) {
    if (!log.completed || log.habitId.startsWith('sample-') ||
      before.logs.some(item => item.habitId === log.habitId && item.date === log.date && item.completed)) continue;
    // Legacy widget queues have a day but no tap timestamp. Do not fabricate
    // historical retention by reporting their import time as their action time.
    if (log.date !== day(now)) continue;
    result.push({ name: 'habit_completed', key: `complete:${log.habitId}:${log.date}`, at, source });
  }
  return result;
}

export const eventNames = new Set<EventName>([
  'analytics_started', 'first_open', 'app_open', 'habit_created', 'habit_completed', 'review_completed',
]);
// Strip SDK-added model, locale, screen text, URL, person properties and anything
// else not explicitly needed for the agreed retention measurements.
const propertyNames = new Set([
  'distinct_id', '$device_id', '$session_id', '$lib', '$lib_version', '$geoip_disable',
  '$process_person_profile', 'token', '$insert_id',
  'cohort', 'environment', 'platform', 'app_version', 'app_build', 'schema_version', 'source',
]);
export function allowedProperties<T>(properties: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(properties).filter(([key]) => propertyNames.has(key)));
}
