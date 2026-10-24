import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

vi.mock('@/i18n',()=>({}));
vi.mock('react-native',()=>({View:'view',Text:'text',Pressable:'button',StyleSheet:{create:(styles:unknown)=>styles}}));
vi.mock('expo-router',()=>({Stack:'main'}));
vi.mock('expo-status-bar',()=>({StatusBar:'status'}));
vi.mock('react-native-safe-area-context',()=>({SafeAreaProvider:'safe'}));
vi.mock('react-native-gesture-handler',()=>({GestureHandlerRootView:'gesture'}));
vi.mock('expo-localization',()=>({getLocales:()=>[{languageCode:'en'}]}));
vi.mock('@/renewal/ui',()=>({palette:{paper:'paper',green:'green',soft:'soft',white:'white'}}));
vi.mock('@/renewal/Runtime',()=>({Runtime:()=>null}));
vi.mock('@/renewal/backupFile',()=>({shareBackupFile:vi.fn(async()=> 'shared')}));
import RootLayout from '../app/_layout';
import { useHabitStore } from '../src/store/habitStore';
import { useProStore } from '../src/store/proStore';
import { usePreferences } from '../src/renewal/preferences';
import { usePersistenceHealth } from '../src/renewal/persistenceHealth';
import { shareBackupFile } from '../src/renewal/backupFile';
import { startupCopy } from '../src/renewal/startupCopy';

Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let renderer:ReactTestRenderer;
beforeEach(async()=>{
  vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  await Promise.all([useHabitStore.persist.rehydrate(),useProStore.persist.rehydrate(),usePreferences.persist.rehydrate()]);
  usePreferences.getState().setLanguage('en');
});
afterEach(async()=>{if(renderer)await act(async()=>renderer.unmount());});
it('shows recovery rather than an endless spinner, and retries into navigation',async()=>{
  vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error('read failed'));
  await useHabitStore.persist.rehydrate();
  await act(async()=>{renderer=create(createElement(RootLayout));});
  expect(JSON.stringify(renderer.toJSON())).toContain(startupCopy.en.title);
  expect(renderer.root.findAllByType('main')).toHaveLength(0);
  vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  const retry=renderer.root.findAllByType('button')[0];
  await act(async()=>{retry.props.onPress();});
  expect(renderer.root.findAllByType('main')).toHaveLength(1);
  expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
});
it('offers a raw recovery export without unlocking the app or deleting corrupt data',async()=>{
  vi.mocked(AsyncStorage.getItem).mockImplementation(async key=>key==='habit-store'?'{corrupt':null);
  await useHabitStore.persist.rehydrate();
  await act(async()=>{renderer=create(createElement(RootLayout));});
  await act(async()=>{renderer.root.findAllByType('button')[1].props.onPress();});
  expect(shareBackupFile).toHaveBeenCalled();
  const text=vi.mocked(shareBackupFile).mock.calls[0][0];
  expect(JSON.parse(text).stores['habit-store']).toBe('{corrupt');
  expect(usePersistenceHealth.getState().stores['habit-store']).toBe('error');
  expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
});
