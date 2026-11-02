import { activities, eventNames, type Activity, type Cohort, type Snapshot } from './model';
import type { HabitWriteSource } from '@/renewal/storage';

export const ANALYTICS_STORAGE_KEY = 'ssak-analytics-v1';
type Queued = Activity & { uuid: string };
type State = { id: string; cohort: Cohort; seen: string[]; queue: Queued[] };
type Dependencies = {
  read: () => Promise<string | null>;
  write: (value: string) => Promise<void>;
  uuid: () => string;
  send: (event: Queued, cohort: Cohort, id: string) => Promise<void>;
  now: () => Date;
};

export function createAnalyticsEngine(deps: Dependencies) {
  let state: State | undefined;
  let baseline: Snapshot = { habits: [], logs: [] };
  let enabled = false;
  let generation = 0;
  let pending = Promise.resolve();
  let sending: Promise<void> | undefined;
  const serial = (action: () => Promise<void>) => {
    pending = pending.catch(() => {}).then(action);
    // All errors are isolated from app startup and habit persistence.
    void pending.catch(() => {});
    return pending;
  };
  const save = () => deps.write(JSON.stringify(state));
  const drain = (): Promise<void> => {
    if (sending) return sending;
    sending = (async () => {
      await pending.catch(() => {});
      while (enabled && state?.queue.length) {
        const event = state.queue[0];
        const epoch = generation;
        await deps.send(event, state.cohort, state.id);
        if (!enabled || generation !== epoch) return;
        await serial(async () => {
          if (!state || !enabled || generation !== epoch) return;
          state.queue = state.queue.filter(item => item.uuid !== event.uuid);
          await save();
        });
      }
    })().finally(() => { sending = undefined; });
    void sending.catch(() => {});
    return sending;
  };
  const add = (events: Activity[]) => {
    if (!state) return;
    for (const event of events) {
      if (state.seen.includes(event.key)) continue;
      state.seen.push(event.key);
      state.queue.push({ ...event, uuid: deps.uuid() });
    }
    // Bound local telemetry independently of habit records. At most 2000
    // unsent events and deduplication keys are retained during long outages.
    const permanent: string[] = state.seen.filter(key => key === 'analytics-started' || key === 'first-open');
    state.seen = [...permanent, ...state.seen.filter(key => !permanent.includes(key)).slice(-1998)];
    state.queue = state.queue.slice(-2000);
  };
  return {
    start(snapshot: Snapshot, cohort: Cohort | Promise<Cohort>, permitted: boolean) {
      baseline = snapshot;
      enabled = permitted;
      return serial(async () => {
        const raw = await deps.read();
        const parsed = raw ? JSON.parse(raw) as State : undefined;
        const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (parsed && (typeof parsed.id !== 'string' || !uuid.test(parsed.id) ||
          !['new', 'existing', 'unknown'].includes(parsed.cohort) ||
          !Array.isArray(parsed.seen) || !parsed.seen.every(key => typeof key === 'string') ||
          !Array.isArray(parsed.queue) || !parsed.queue.every(item => item &&
            eventNames.has(item.name) && typeof item.key === 'string' && uuid.test(item.uuid) &&
            Number.isFinite(Date.parse(item.at)) && ['app', 'notification', 'widget'].includes(item.source))))
          throw new Error('invalid-analytics-state');
        state = parsed ?? { id: deps.uuid(), cohort: await cohort, seen: [], queue: [] };
        if (generation > 0) state.queue = [];
        if (!enabled) { state.queue = []; await save(); return; }
        const at = deps.now().toISOString();
        add([{ name: 'analytics_started', key: 'analytics-started', at, source: 'app' }]);
        if (state.cohort === 'new') add([{ name: 'first_open', key: 'first-open', at, source: 'app' }]);
        await save();
      }).then(drain);
    },
    committed(snapshot: Snapshot, source: HabitWriteSource) {
      const events = activities(baseline, snapshot, source, deps.now());
      baseline = snapshot;
      if (!enabled) return;
      const epoch = generation;
      void serial(async () => {
        if (!enabled || !state || epoch !== generation) return;
        add(events);
        await save();
      }).then(drain).catch(() => {});
    },
    opened() {
      if (!enabled) return Promise.resolve();
      const at = deps.now().toISOString();
      const key = `open:${deps.uuid()}`;
      const epoch = generation;
      return serial(async () => {
        if (!enabled || !state || epoch !== generation) return;
        add([{ name: 'app_open', key, at, source: 'app' }]);
        await save();
      }).then(drain);
    },
    setEnabled(value: boolean) {
      enabled = value;
      generation += 1;
      return serial(async () => {
        if (state && !value) { state.queue = []; await save(); }
      });
    },
    flush: () => pending.then(drain),
    settled: async () => { await pending; await sending; await pending; },
  };
}
