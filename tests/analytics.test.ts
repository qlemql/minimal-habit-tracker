import { beforeEach, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHabitStore } from '../src/store/habitStore';
import { useProStore } from '../src/store/proStore';
import { habitStorage, flushHabitStorage, observeHabitWrites, withHabitWriteSource } from '../src/renewal/storage';
import { allowedProperties, activities, classifyCohort, type Snapshot, type Activity, type Cohort } from '../src/analytics/model';
import { createAnalyticsEngine } from '../src/analytics/engine';
import { localDate } from '../src/renewal/domain';

const empty: Snapshot = { habits: [], logs: [] };
const now = new Date('2026-11-02T10:00:00Z');
function harness() {
  let disk: string | null = null;
  const send = vi.fn(async (_event: Activity & { uuid: string }, _cohort: Cohort, _id: string) => {});
  let counter = 0;
  const deps = { read: async () => disk, write: async (raw: string) => { disk = raw; },
    send, uuid: () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`, now: () => now };
  return { deps, engine: createAnalyticsEngine(deps), send, disk: () => disk };
}
beforeEach(async () => {
  vi.mocked(AsyncStorage.setItem).mockResolvedValue();
  await flushHabitStorage().catch(() => {});
  useHabitStore.setState({ habits: [], logs: [], widgetEventIds: [], freeHabitId: null });
  useProStore.setState({ isPro: false });
  await flushHabitStorage();
});
const createHabit = () => useHabitStore.getState().addHabit('PRIVATE NAME', 'book', '#123456', { minimum: 'PRIVATE PLAN' })!;

it('does not classify an update as a new install or guess when install evidence is missing', () => {
  const release = new Date('2026-11-02');
  expect(classifyCohort(true, false, now, release)).toBe('existing');
  expect(classifyCohort(false, true, now, release)).toBe('existing');
  expect(classifyCohort(false, false, new Date('2026-10-01'), release)).toBe('existing');
  expect(classifyCohort(false, false, now, release)).toBe('new');
  expect(classifyCohort(false, false, undefined, release)).toBe('unknown');
});
it('preserves installation identity and does not fire first_open again after restart', async () => {
  const h = harness();
  await h.engine.start(empty, 'new', true);
  const id = JSON.parse(h.disk()!).id;
  const restarted = createAnalyticsEngine(h.deps);
  await restarted.start(empty, 'existing', true);
  expect(h.send.mock.calls.filter(call => (call as unknown as [{ name: string }])[0].name === 'first_open')).toHaveLength(1);
  expect(JSON.parse(h.disk()!).id).toBe(id);
});
it('does not report a legacy user as first_open', async () => {
  const h = harness(); await h.engine.start(empty, 'existing', true);
  expect(JSON.stringify(h.send.mock.calls)).not.toContain('first_open');
});
it('only observes successful disk writes, and recovers the event on a later successful retry', async () => {
  const h = harness(); await h.engine.start(empty, 'existing', true); h.send.mockClear();
  const stop = observeHabitWrites((raw, source) => h.engine.committed(JSON.parse(raw).state, source));
  try {
    vi.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('disk-full'));
    createHabit(); await expect(flushHabitStorage()).rejects.toThrow('disk-full');
    await h.engine.settled(); expect(h.send).not.toHaveBeenCalled();
    useHabitStore.setState({}); await flushHabitStorage(); await h.engine.settled();
    expect(JSON.stringify(h.send.mock.calls)).toContain('habit_created');
    expect(JSON.stringify(h.send.mock.calls)).not.toContain('PRIVATE');
  } finally { stop(); }
});
it('counts completion once per habit/day across undo, repeated taps and a process restart', async () => {
  const id = createHabit(); await flushHabitStorage();
  const baseline = useHabitStore.getState();
  const h = harness(); await h.engine.start(baseline, 'existing', true); h.send.mockClear();
  const stop = observeHabitWrites((raw, source) => h.engine.committed(JSON.parse(raw).state, source));
  try {
    useHabitStore.getState().checkIn(id, 'tiny');
    useHabitStore.getState().checkIn(id, 'full');
    useHabitStore.getState().toggleHabit(id);
    useHabitStore.getState().checkIn(id, 'full');
    await flushHabitStorage(); await h.engine.settled();
    const matches = h.send.mock.calls.filter(call => (call as unknown as [{ name: string }])[0].name === 'habit_completed');
    expect(matches).toHaveLength(1);
    const next = createAnalyticsEngine(h.deps);
    await next.start(baseline, 'existing', true);
    next.committed(useHabitStore.getState(), 'app'); await next.settled();
    expect(h.send.mock.calls.filter(call => (call as unknown as [{ name: string }])[0].name === 'habit_completed')).toHaveLength(1);
  } finally { stop(); }
});
it('restores the durable outbox with original timestamp and stable UUID after a network failure', async () => {
  const h = harness();
  h.send.mockRejectedValueOnce(new Error('offline'));
  await expect(h.engine.start(empty, 'existing', true)).rejects.toThrow('offline');
  const saved = JSON.parse(h.disk()!).queue[0];
  const next = createAnalyticsEngine(h.deps);
  await next.start(empty, 'existing', true);
  expect(h.send.mock.calls[1][0]).toEqual(saved);
  expect(saved.at).toBe(now.toISOString());
  expect(JSON.parse(h.disk()!).queue).toEqual([]);
});
it('does not replay disabled-period actions or unsent events when opting back in', async () => {
  const h = harness();
  h.send.mockRejectedValueOnce(new Error('offline'));
  await h.engine.start(empty, 'existing', true).catch(() => {});
  await h.engine.setEnabled(false);
  const id = createHabit();
  h.engine.committed(useHabitStore.getState(), 'app');
  await h.engine.setEnabled(true); h.send.mockClear();
  await h.engine.flush(); expect(h.send).not.toHaveBeenCalled();
  useHabitStore.getState().checkIn(id, 'full');
  h.engine.committed(useHabitStore.getState(), 'app'); await h.engine.settled();
  expect(h.send).toHaveBeenCalledTimes(1);
});
it('excludes example data and backup imports, and never replays their history on the next action', async () => {
  createHabit(); const data = useHabitStore.getState();
  const h = harness(); await h.engine.start(empty, 'existing', true); h.send.mockClear();
  h.engine.committed(data, 'excluded'); await h.engine.settled();
  h.engine.committed(data, 'app'); await h.engine.settled();
  expect(h.send).not.toHaveBeenCalled();
  const sample = { habits: [{ ...data.habits[0], id: 'sample-reading' }], logs: [] };
  expect(activities(empty, sample, 'app', new Date())).toEqual([]);
});
it('tracks a current-day notification or widget completion but excludes undated historical queue imports', () => {
  const id = createHabit(); const base = useHabitStore.getState();
  const log = { id: 'local-only', habitId: id, date: localDate(now), completed: true, completedAt: now.toISOString() };
  const after = { ...base, logs: [log] };
  expect(activities(base, after, 'notification', now)[0].source).toBe('notification');
  expect(activities(base, after, 'widget', now)[0].source).toBe('widget');
  expect(activities(base, { ...base, logs: [{ ...log, date: '2026-10-01' }] }, 'widget', now)).toEqual([]);
});
it('keeps per-write source metadata when an excluded restore and a real action are queued together', async () => {
  const sources: string[] = [];
  const stop = observeHabitWrites((_raw, source) => sources.push(source));
  try {
    const excluded = withHabitWriteSource('excluded', () => habitStorage.setItem('habit-store', '{}'));
    const app = habitStorage.setItem('habit-store', '{}');
    await Promise.all([excluded, app]); expect(sources).toEqual(['excluded', 'app']);
  } finally { stop(); }
});
it('strips SDK properties and person payloads outside the explicit analytics schema', () => {
  expect(allowedProperties({ distinct_id: 'random', cohort: 'existing', source: 'app',
    habitName: 'PRIVATE', '$device_model': 'model', '$set': { email: 'private@example.com' }, url: 'private://note' }))
    .toEqual({ distinct_id: 'random', cohort: 'existing', source: 'app' });
});
it('does not reuse a corrupt identifier or emit events after analytics metadata fails to load', async () => {
  const h = harness();
  h.deps.read = async () => JSON.stringify({ id: 'PRIVATE', cohort: 'new', seen: [], queue: [] });
  const engine = createAnalyticsEngine(h.deps);
  await expect(engine.start(empty, 'new', true)).rejects.toThrow('invalid-analytics-state');
  await engine.opened();
  createHabit(); engine.committed(useHabitStore.getState(), 'app'); await engine.settled();
  expect(h.send).not.toHaveBeenCalled();
});
it('rapid opt-out and opt-in discards the old queue before new actions can be sent', async () => {
  const h = harness(); h.send.mockRejectedValueOnce(new Error('offline'));
  await h.engine.start(empty, 'existing', true).catch(() => {});
  const off = h.engine.setEnabled(false);
  const on = h.engine.setEnabled(true);
  await Promise.all([off, on]); h.send.mockClear();
  await h.engine.flush(); expect(h.send).not.toHaveBeenCalled();
});
it('persists new activity and clears opt-out data while a previous network request is stalled', async () => {
  const h = harness();
  let finish: (() => void) | undefined;
  h.send.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const started = h.engine.start(empty, 'existing', true);
  await vi.waitFor(() => expect(finish).toBeDefined());
  createHabit(); h.engine.committed(useHabitStore.getState(), 'app');
  await vi.waitFor(() => expect(JSON.parse(h.disk()!).queue.some((event: Activity) => event.name === 'habit_created')).toBe(true));
  await h.engine.setEnabled(false);
  expect(JSON.parse(h.disk()!).queue).toEqual([]);
  finish!(); await started;
});
