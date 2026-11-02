import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep writes ordered. A failed write must prevent acknowledging native widget events.
let pending: Promise<void> = Promise.resolve();
export type HabitWriteSource = 'app' | 'notification' | 'widget' | 'excluded';
let source: HabitWriteSource = 'app';
const listeners = new Set<(value: string, source: HabitWriteSource) => void>();
// Capture the source when enqueueing, not when the asynchronous write finishes.
export const withHabitWriteSource = <T>(next: HabitWriteSource, action: () => T): T => {
  const previous = source;
  source = next;
  try { return action(); } finally { source = previous; }
};
export const observeHabitWrites = (listener: (value: string, source: HabitWriteSource) => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
export let hadStoredHabits: boolean | undefined;
export const habitStorage = {
  getItem: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    hadStoredHabits = value !== null;
    return value;
  },
  removeItem: (key: string) => AsyncStorage.removeItem(key),
  setItem: (key: string, value: string) => {
    const writeSource = source;
    pending = pending.catch(() => {}).then(async () => {
      await AsyncStorage.setItem(key, value);
      for (const listener of listeners) {
        // Telemetry must never turn a successful habit save into a failure.
        try { listener(value, writeSource); } catch {}
      }
    });
    void pending.catch(() => {});
    return pending;
  },
};
export const flushHabitStorage = () => pending;
