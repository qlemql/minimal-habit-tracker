import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
const sdk = vi.hoisted(() => ({ capture: vi.fn(), flush: vi.fn(async () => {}), optOut: vi.fn(async () => {}),
  identify: vi.fn(), options: undefined as undefined | { before_send: (event: { event: string; properties: Record<string, unknown> }) => unknown } }));
vi.mock('@/analytics/config', () => ({ analyticsConfig: { token: 'phc_test', host: 'https://us.i.posthog.com', enabled: true, environment: 'test' } }));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' }, AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } }));
vi.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en' }] }));
vi.mock('expo-application', () => ({ nativeApplicationVersion: '2.1.1', nativeBuildVersion: '18', getInstallationTimeAsync: async () => new Date('2026-11-03') }));
vi.mock('expo-device', () => ({ isDevice: true }));
vi.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));
vi.mock('posthog-react-native', () => ({
  PostHogPersistedProperty: { Queue: 'queue' },
  default: class {
    constructor(_token: string, options: typeof sdk.options) { sdk.options = options; }
    ready = async () => {};
    identify = sdk.identify;
    capture = sdk.capture;
    flush = sdk.flush;
    optOut = sdk.optOut;
    optIn = async () => {};
    setPersistedProperty = vi.fn();
  },
}));
import { startAnalytics } from '../src/analytics/runtime';
import { usePreferences } from '../src/renewal/preferences';
import { useHabitStore } from '../src/store/habitStore';
import { flushHabitStorage } from '../src/renewal/storage';

let stop = () => {};
beforeEach(async () => {
  vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  vi.mocked(AsyncStorage.setItem).mockResolvedValue();
  usePreferences.setState({ analyticsEnabled: true, welcomed: true });
  useHabitStore.setState({ habits: [], logs: [], freeHabitId: null });
  await flushHabitStorage();
});
afterEach(() => stop());
it('configures privacy at the SDK boundary and sends original event timestamps and a stable installation ID', async () => {
  stop = startAnalytics();
  await vi.waitFor(() => expect(sdk.capture).toHaveBeenCalledTimes(2));
  expect(sdk.options).toMatchObject({ captureAppLifecycleEvents: false, enableSessionReplay: false,
    preloadFeatureFlags: false, disableRemoteConfig: true, disableGeoip: true, personProfiles: 'never', persistence: 'memory' });
  expect(sdk.identify.mock.calls[0][0]).toMatch(/^[a-f0-9-]{36}$/);
  expect(sdk.capture.mock.calls[1]).toMatchObject(['app_open', { cohort: 'existing', environment: 'test' }, { timestamp: expect.any(Date), uuid: expect.any(String) }]);
  expect(sdk.options!.before_send({ event: '$autocapture', properties: { text: 'PRIVATE' } })).toBeNull();
  expect(sdk.options!.before_send({ event: 'app_open', properties: { distinct_id: 'random', habitName: 'PRIVATE', url: 'PRIVATE', '$set': { email: 'PRIVATE' } } }))
    .toEqual({ event: 'app_open', uuid: undefined, timestamp: undefined, properties: { distinct_id: 'random' } });
});
it('does not create an SDK connection for an opted-out user', async () => {
  usePreferences.setState({ analyticsEnabled: false });
  stop = startAnalytics();
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(sdk.capture).not.toHaveBeenCalled();
  expect(sdk.identify).not.toHaveBeenCalled();
});
it('stops collection immediately on opt-out and removes pending SDK events', async () => {
  stop = startAnalytics();
  await vi.waitFor(() => expect(sdk.capture).toHaveBeenCalledTimes(2));
  usePreferences.getState().setAnalyticsEnabled(false);
  useHabitStore.getState().addHabit('PRIVATE', 'book', '#123456');
  await flushHabitStorage();
  await vi.waitFor(() => expect(sdk.optOut).toHaveBeenCalled());
  expect(sdk.capture).toHaveBeenCalledTimes(2);
  expect(sdk.options!.before_send({ event: 'app_open', properties: {} })).toBeNull();
});
