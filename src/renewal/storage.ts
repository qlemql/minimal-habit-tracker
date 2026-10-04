import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep writes ordered. A failed write must prevent acknowledging native widget events.
let pending: Promise<void> = Promise.resolve();
export const habitStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
  setItem: (key: string, value: string) => {
    pending = pending.catch(() => {}).then(() => AsyncStorage.setItem(key, value));
    void pending.catch(() => {});
    return pending;
  },
};
export const flushHabitStorage = () => pending;
