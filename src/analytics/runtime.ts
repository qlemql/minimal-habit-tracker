import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { randomUUID } from 'expo-crypto';
import { useHabitStore } from '@/store/habitStore';
import { usePreferences } from '@/renewal/preferences';
import { hadStoredHabits, observeHabitWrites } from '@/renewal/storage';
import { analyticsConfig } from './config';
import { ANALYTICS_STORAGE_KEY, createAnalyticsEngine } from './engine';
import { allowedProperties, classifyCohort, eventNames, type EventName, type Snapshot } from './model';
import type PostHog from 'posthog-react-native';

// Do not backfill events before this release. Existing installs are kept out of
// the new-install cohort even when their first PostHog appearance is today.
const releaseAt = new Date('2026-11-02T00:00:00+09:00');
let running = false;

export function startAnalytics(): () => void {
  if (running || Platform.OS === 'web' || !analyticsConfig.enabled || !analyticsConfig.token ||
    (!Device.isDevice && analyticsConfig.environment === 'production') ||
    (typeof __DEV__ !== 'undefined' && __DEV__ && analyticsConfig.environment === 'production')) return () => {};
  running = true;
  let alive = true;
  let permitted = usePreferences.getState().analyticsEnabled;
  let client: PostHog | undefined;
  const engine = createAnalyticsEngine({
    read: () => AsyncStorage.getItem(ANALYTICS_STORAGE_KEY),
    write: value => AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, value),
    uuid: randomUUID,
    now: () => new Date(),
    send: async (event, cohort, id) => {
      if (!alive) throw new Error('analytics-stopped');
      if (!permitted) return;
      if (!eventNames.has(event.name) || !Number.isFinite(Date.parse(event.at))) return;
      if (!client) {
        const { default: PostHogClient } = await import('posthog-react-native');
        if (!alive) throw new Error('analytics-stopped');
        if (!permitted) return;
        client = new PostHogClient(analyticsConfig.token, {
          host: analyticsConfig.host,
          // The app owns a durable, redacted outbox. Keep the SDK queue in memory
          // so disabling analytics cannot leave a second disk queue to replay.
          persistence: 'memory',
          captureAppLifecycleEvents: false,
          enableSessionReplay: false,
          errorTracking: { autocapture: false, exceptionSteps: { enabled: false } },
          personProfiles: 'never',
          disableGeoip: true,
          disableRemoteConfig: true,
          disableSurveys: true,
          preloadFeatureFlags: false,
          flushAt: 1000,
          flushInterval: 0,
          before_send: payload => {
            if (!alive || !permitted || !eventNames.has(payload.event as EventName)) return null;
            return { event: payload.event, uuid: payload.uuid, timestamp: payload.timestamp,
              properties: allowedProperties(payload.properties ?? {}) };
          },
        });
        await client.ready();
        client.identify(id);
      }
      if (!alive) throw new Error('analytics-stopped');
      if (!permitted) return;
      client.capture(event.name, {
        cohort, environment: analyticsConfig.environment, platform: Platform.OS,
        app_version: Application.nativeApplicationVersion ?? 'unknown',
        app_build: Application.nativeBuildVersion ?? 'unknown',
        schema_version: 1, source: event.source,
      }, { uuid: event.uuid, timestamp: new Date(event.at), disableGeoip: true });
      try { await client.flush(); }
      finally {
        // The durable outbox retains failed events and retries with the same
        // UUID. Do not accumulate a second retry queue inside the SDK.
        const { PostHogPersistedProperty } = await import('posthog-react-native');
        client.setPersistedProperty(PostHogPersistedProperty.Queue, []);
      }
    },
  });
  const snapshot = useHabitStore.getState();
  const wasStored = hadStoredHabits;
  const wasWelcomed = usePreferences.getState().welcomed;
  const cohort = Application.getInstallationTimeAsync()
    .then(installed => classifyCohort(wasStored, wasWelcomed, installed, releaseAt))
    .catch(() => classifyCohort(wasStored, wasWelcomed, undefined, releaseAt));
  void engine.start(snapshot, cohort, permitted).catch(() => {});
  const stopWrites = observeHabitWrites((raw, source) => {
    try { engine.committed((JSON.parse(raw) as { state: Snapshot }).state, source); } catch {}
  });
  let lastState = AppState.currentState;
  if (lastState === 'active') void engine.opened().catch(() => {});
  const appState = AppState.addEventListener('change', state => {
    if (state === 'active' && lastState !== 'active') void engine.opened().catch(() => {});
    lastState = state;
  });
  const stopPreferences = usePreferences.subscribe((state, previous) => {
    if (state.analyticsEnabled === previous.analyticsEnabled) return;
    permitted = state.analyticsEnabled;
    const requested = permitted;
    void engine.setEnabled(requested).then(async () => {
      if (requested !== permitted) return;
      if (!permitted && client) {
        const { PostHogPersistedProperty } = await import('posthog-react-native');
        client.setPersistedProperty(PostHogPersistedProperty.Queue, []);
        await client.optOut();
      } else if (permitted) {
        await client?.optIn();
        if (AppState.currentState === 'active') await engine.opened();
      }
    }).catch(() => {});
  });
  return () => {
    alive = false;
    running = false;
    stopWrites(); stopPreferences(); appState.remove();
  };
}
