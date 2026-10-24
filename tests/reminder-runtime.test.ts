import { beforeEach, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHabitStore } from '../src/store/habitStore';
import { useProStore } from '../src/store/proStore';
import { flushHabitStorage } from '../src/renewal/storage';
const callbacks=vi.hoisted(()=>({response:undefined as undefined|((value:unknown)=>void),cleanup:undefined as undefined|(()=>void)}));
vi.mock('react',()=>({useEffect:(effect:()=>()=>void)=>{callbacks.cleanup=effect();}}));
vi.mock('react-native',()=>({AppState:{addEventListener:()=>({remove(){}})}}));
vi.mock('@/renewal/preferences',()=>({usePreferences:(select:(state:{language:string})=>unknown)=>select({language:'en'})}));
vi.mock('@/renewal/billing',()=>({syncPurchase:async()=>{},listenToPurchaseUpdates:async()=>()=>{}}));
vi.mock('@/utils/widgetData',()=>({syncWidgetData:vi.fn(async()=>{}),processPendingWidgetToggles:async()=>{}}));
vi.mock('@/utils/notifications',()=>({cancelTodayReminder:async()=>{},setupNotificationCategories:async()=>{},refreshHabitReminders:async()=>{},HABIT_TOGGLE_ACTION:'toggle'}));
vi.mock('expo-notifications',()=>({
  getLastNotificationResponseAsync:async()=>null,
  clearLastNotificationResponseAsync:vi.fn(async()=>{}),
  addNotificationResponseReceivedListener:(callback:(value:unknown)=>void)=>{callbacks.response=callback;return{remove(){}};},
}));
import { Runtime } from '../src/renewal/Runtime';
import * as Notifications from 'expo-notifications';
beforeEach(async()=>{
  callbacks.cleanup?.();
  vi.mocked(AsyncStorage.setItem).mockResolvedValue();
  await flushHabitStorage().catch(()=>{});
  useHabitStore.setState({habits:[],logs:[],freeHabitId:null});useProStore.setState({isPro:false});
  await flushHabitStorage();
});
const response=(id:string)=>({actionIdentifier:'toggle',notification:{date:Date.now(),request:{content:{data:{habitId:id,kind:'daily-reminder'}}}}});
it('the actual notification listener preserves a tiny record and acknowledges after the write',async()=>{
  const id=useHabitStore.getState().addHabit('Read','book','#9C6842')!;
  useHabitStore.getState().checkIn(id,'tiny');await flushHabitStorage();
  const original=useHabitStore.getState().logs[0];Runtime();
  let finish:(()=>void)|undefined;
  vi.mocked(AsyncStorage.setItem).mockImplementationOnce(()=>new Promise<void>(resolve=>{finish=resolve;}));
  callbacks.response!(response(id));
  await vi.waitFor(()=>expect(finish).toBeDefined());
  expect(Notifications.clearLastNotificationResponseAsync).not.toHaveBeenCalled();
  finish!();await vi.waitFor(()=>expect(Notifications.clearLastNotificationResponseAsync).toHaveBeenCalled());
  expect(useHabitStore.getState().logs).toEqual([original]);
});
it('does not clear the OS response when the completion cannot be saved',async()=>{
  const id=useHabitStore.getState().addHabit('Read','book','#9C6842')!;
  await flushHabitStorage();Runtime();
  vi.mocked(AsyncStorage.setItem).mockRejectedValue(new Error('disk-full'));
  callbacks.response!(response(id));
  await expect(flushHabitStorage()).rejects.toThrow('disk-full');
  await new Promise(resolve=>setTimeout(resolve,0));
  expect(Notifications.clearLastNotificationResponseAsync).not.toHaveBeenCalled();
  vi.mocked(AsyncStorage.setItem).mockResolvedValue();
});
