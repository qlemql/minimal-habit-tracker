import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHabitStore } from '../src/store/habitStore';
import { useProStore } from '../src/store/proStore';
import { usePersistenceHealth } from '../src/renewal/persistenceHealth';
import { exportOriginalStorage } from '../src/renewal/recoveryExport';
import { saveReview } from '../src/renewal/saveReview';
import { completeReminder } from '../src/renewal/completeReminder';
import { flushHabitStorage } from '../src/renewal/storage';
import { localDate } from '../src/renewal/domain';

beforeEach(async () => {
  await flushHabitStorage().catch(() => {});
  vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  vi.mocked(AsyncStorage.setItem).mockResolvedValue();
  await Promise.all([useHabitStore.persist.rehydrate(), useProStore.persist.rehydrate()]);
  useHabitStore.setState({habits:[],logs:[],freeHabitId:null,widgetEventIds:[]});
  useProStore.setState({isPro:false});
  await flushHabitStorage();
});
afterEach(async () => {
  vi.mocked(AsyncStorage.setItem).mockResolvedValue();
  vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  await flushHabitStorage().catch(() => {});
});
const add = () => useHabitStore.getState().addHabit('Read', 'book', '#9C6842', {minimum:'One page'})!;

it.each(['invalid-json','read-error'])('exposes %s and permits a non-destructive retry', async failure => {
  const before=useHabitStore.getState().habits;
  if(failure==='invalid-json')vi.mocked(AsyncStorage.getItem).mockResolvedValue('{broken');
  else vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error('unavailable'));
  await useHabitStore.persist.rehydrate();
  expect(usePersistenceHealth.getState().stores['habit-store']).toBe('error');
  expect(useHabitStore.getState().habits).toBe(before);
  expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  await useHabitStore.persist.rehydrate();
  expect(usePersistenceHealth.getState().stores['habit-store']).toBe('ready');
});
it('tracks a failed entitlement load separately and does not grant Plus', async () => {
  vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error('unavailable'));
  await useProStore.persist.rehydrate();
  expect(usePersistenceHealth.getState().stores['pro-store']).toBe('error');
  expect(useProStore.getState().isPro).toBe(false);
});
it('preserves malformed original strings in a recovery export without writing to storage',async()=>{
  vi.mocked(AsyncStorage.getItem).mockImplementation(async key=>key==='habit-store'?'{broken':null);
  vi.mocked(AsyncStorage.setItem).mockClear();
  expect(JSON.parse(await exportOriginalStorage())).toMatchObject({format:'ssak-storage-recovery',stores:{'habit-store':'{broken','pro-store':null}});
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
});
it('waits for the review write to finish before reporting success',async()=>{
  const id=add();await flushHabitStorage();
  let finish: (()=>void)|undefined;
  vi.mocked(AsyncStorage.setItem).mockImplementationOnce(()=>new Promise<void>(resolve=>{finish=resolve;}));
  let done=false;
  const result=saveReview(id,{minimum:'One sentence',note:'',feeling:'adjust'}).then(()=>{done=true;});
  await vi.waitFor(()=>expect(finish).toBeDefined());
  expect(done).toBe(false);finish!();await result;expect(done).toBe(true);
});
it('rolls back a failed review and allows retry without duplicating its history',async()=>{
  const id=add();await flushHabitStorage();
  const original=useHabitStore.getState().habits[0];
  vi.mocked(AsyncStorage.setItem).mockRejectedValue(new Error('disk-full'));
  const review={minimum:'One sentence',note:'',feeling:'adjust' as const};
  await expect(saveReview(id,review)).rejects.toThrow('disk-full');
  expect(useHabitStore.getState().habits[0]).toBe(original);
  vi.mocked(AsyncStorage.setItem).mockResolvedValue();
  await saveReview(id,review);
  expect(useHabitStore.getState().habits[0].reviews).toHaveLength(1);
});
it('does not roll back another habit or a newer edit on a failed review',async()=>{
  useProStore.setState({isPro:true});const id=add();const other=add();await flushHabitStorage();
  let fail:((error:Error)=>void)|undefined;
  vi.mocked(AsyncStorage.setItem).mockImplementationOnce(()=>new Promise<void>((_,reject)=>{fail=reject;}));
  const result=saveReview(id,{minimum:'First draft',note:'',feeling:'adjust'});
  const expected=expect(result).rejects.toThrow('disk-full');
  await vi.waitFor(()=>expect(fail).toBeDefined());
  useHabitStore.getState().checkIn(other,'tiny');
  await useHabitStore.getState().updateHabit(id,{minimum:'Newer edit'});
  fail!(new Error('disk-full'));await expected;
  expect(useHabitStore.getState().habits.find(h=>h.id===id)?.minimum).toBe('Newer edit');
  expect(useHabitStore.getState().logs[0]).toMatchObject({habitId:other,effort:'tiny'});
});
it('rejects invalid reviews instead of acknowledging success',async()=>{
  const id=add();await expect(saveReview(id,{minimum:' ',note:'',feeling:'adjust'})).rejects.toThrow('review-not-saved');
});
it.each(['tiny','full'] as const)('notification completion preserves an existing %s record and timestamp',async effort=>{
  const id=add();useHabitStore.getState().checkIn(id,effort);
  const original=useHabitStore.getState().logs[0];
  await completeReminder(id);await completeReminder(id);
  expect(useHabitStore.getState().logs).toEqual([original]);
});
it('notification completion creates a full record only when one is missing',async()=>{
  const id=add();await completeReminder(id);
  expect(useHabitStore.getState().logs[0]).toMatchObject({habitId:id,date:localDate(),effort:'full'});
});
it('rejects failed notification persistence and retries without changing a tiny completion',async()=>{
  const id=add();useHabitStore.getState().checkIn(id,'tiny');await flushHabitStorage();
  vi.mocked(AsyncStorage.setItem).mockRejectedValue(new Error('disk-full'));
  await expect(completeReminder(id)).rejects.toThrow('disk-full');
  vi.mocked(AsyncStorage.setItem).mockResolvedValue();await completeReminder(id);
  expect(useHabitStore.getState().logs[0].effort).toBe('tiny');
});
