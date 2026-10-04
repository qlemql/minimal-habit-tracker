import { beforeEach, describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useHabitStore } from '../src/store/habitStore';
import { useProStore } from '../src/store/proStore';
import { flushHabitStorage } from '../src/renewal/storage';
import { localDate, shiftDate } from '../src/renewal/domain';
const native = vi.hoisted(() => ({
  getSharedDefault: vi.fn(async () => '[]'),
  setSharedDefault: vi.fn(async () => {}),
  ackWidgetEvents: vi.fn(async (_ids: string[]) => {}),
}));
vi.mock('@/utils/sharedDefaults', () => native);
vi.mock('../modules/shared-defaults', () => native);
import { processPendingWidgetToggles, getWidgetData } from '../src/utils/widgetData';
beforeEach(async () => {
  Platform.OS = 'android';
  useHabitStore.setState({ habits: [], logs: [], legacyAccess: false, freeHabitId: null, widgetEventIds: [] });
  useProStore.setState({ isPro: true });
  await flushHabitStorage();
  vi.clearAllMocks();
});
describe('widget queue acknowledgement', () => {
  it('imports dated events once during concurrent refresh and acknowledges only those IDs', async () => {
    const id = useHabitStore.getState().addHabit('Read', 'book', '#315E4C')!;
    await flushHabitStorage();
    native.getSharedDefault.mockResolvedValue(JSON.stringify([
      { eventId: 'one', habitId: id, date: shiftDate(localDate(), -1), completed: true },
      id, // Old queue format has no date and must not mark today done.
    ]));
    await Promise.all([processPendingWidgetToggles(), processPendingWidgetToggles()]);
    expect(native.getSharedDefault).toHaveBeenCalledTimes(1);
    expect(native.ackWidgetEvents).toHaveBeenCalledWith(['one']);
    expect(useHabitStore.getState().logs.map((log) => log.date)).toEqual([shiftDate(localDate(), -1)]);
  });
  it('keeps native events on storage failure and safely replays after recovery', async () => {
    const id = useHabitStore.getState().addHabit('Read', 'book', '#315E4C')!;
    await flushHabitStorage();
    native.getSharedDefault.mockResolvedValue(JSON.stringify([
      { eventId: 'retry', habitId: id, date: localDate(), completed: true },
    ]));
    vi.mocked(AsyncStorage.setItem).mockRejectedValue(new Error('disk-full'));
    await expect(processPendingWidgetToggles()).rejects.toThrow('disk-full');
    expect(native.ackWidgetEvents).not.toHaveBeenCalled();
    vi.mocked(AsyncStorage.setItem).mockResolvedValue();
    await processPendingWidgetToggles();
    expect(native.ackWidgetEvents).toHaveBeenCalledWith(['retry']);
    expect(useHabitStore.getState().logs).toHaveLength(1);
  });
  it('replayed acknowledged state never overwrites a later in-app undo', async () => {
    const id = useHabitStore.getState().addHabit('Read', 'book', '#315E4C')!;
    native.getSharedDefault.mockResolvedValue(JSON.stringify([
      { eventId: 'duplicate', habitId: id, date: localDate(), completed: true },
    ]));
    await processPendingWidgetToggles();
    useHabitStore.getState().toggleHabit(id);
    await processPendingWidgetToggles();
    expect(useHabitStore.getState().logs).toHaveLength(0);
  });
  it('exports only the selected habit after Plus is revoked', () => {
    useHabitStore.getState().addHabit('Read', 'book', '#315E4C');
    const id = useHabitStore.getState().addHabit('Walk', 'walk', '#315E4C')!;
    useProStore.setState({ isPro: false });
    expect(getWidgetData()).toEqual([]);
    useHabitStore.getState().selectFreeHabit(id);
    expect(getWidgetData().map((habit) => habit.id)).toEqual([id]);
  });
});
