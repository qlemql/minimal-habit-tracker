import { Platform } from 'react-native';
import * as SharedDefaults from '../../modules/shared-defaults';

/**
 * 앱 ↔ 위젯 데이터 공유
 * iOS: App Group UserDefaults / Android: SharedPreferences
 */
export async function setSharedDefault(key: string, value: string): Promise<void> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;
  try {
    await SharedDefaults.setItem(key, value);
  } catch (e) {
    console.warn('[Widget] Sync failed:', e);
  }
}

export async function getSharedDefault(key: string): Promise<string | null> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;
  try {
    return await SharedDefaults.getItem(key);
  } catch {
    return null;
  }
}
