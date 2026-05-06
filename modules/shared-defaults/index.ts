import { Platform } from 'react-native';

let SharedDefaultsModule: any = null;

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    SharedDefaultsModule = requireNativeModule('SharedDefaultsModule');
  } catch {
    console.warn('[Widget] SharedDefaultsModule not available');
  }
}

export async function setItem(key: string, value: string): Promise<boolean> {
  if (!SharedDefaultsModule) return false;
  return SharedDefaultsModule.setItem(key, value);
}

export async function getItem(key: string): Promise<string | null> {
  if (!SharedDefaultsModule) return null;
  return SharedDefaultsModule.getItem(key);
}
