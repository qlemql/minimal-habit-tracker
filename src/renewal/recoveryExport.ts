import AsyncStorage from '@react-native-async-storage/async-storage';

// Preserve raw strings, including malformed JSON. This is a recovery file, not a portable habit backup.
export const exportOriginalStorage = async (): Promise<string> => {
  const keys = ['habit-store', 'ssak-preferences', 'pro-store'];
  const values = await Promise.all(keys.map(async (key) => [key, await AsyncStorage.getItem(key)]));
  return JSON.stringify({ format: 'ssak-storage-recovery', version: 1,
    exportedAt: new Date().toISOString(), stores: Object.fromEntries(values) }, null, 2);
};
