import { Platform } from 'react-native';

interface SharedDefaultsNative {
  setItem: (key: string, value: string) => Promise<boolean>;
  getItem: (key: string) => Promise<string | null>;
  ackWidgetEvents?: (ids: string) => Promise<boolean>;
}
let SharedDefaultsModule: SharedDefaultsNative | null = null;

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

export async function ackWidgetEvents(ids: string[]): Promise<void> {
  if (!SharedDefaultsModule?.ackWidgetEvents) throw new Error('widget-native-update-required');
  await SharedDefaultsModule.ackWidgetEvents(JSON.stringify(ids));
}
