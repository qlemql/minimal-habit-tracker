import { Platform } from 'react-native';
import * as SharedDefaults from '../../modules/shared-defaults';

/**
 * App Group UserDefaults에 데이터 저장 (iOS 전용)
 * 앱 ↔ 위젯 데이터 공유에 사용
 */
export async function setSharedDefault(key: string, value: string): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    await SharedDefaults.setItem(key, value);
  } catch (e) {
    console.warn('[Widget] Sync failed:', e);
  }
}

export async function getSharedDefault(key: string): Promise<string | null> {
  if (Platform.OS !== 'ios') return null;
  try {
    return await SharedDefaults.getItem(key);
  } catch {
    return null;
  }
}
