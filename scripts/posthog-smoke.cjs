// Send one synthetic event to the public ingest endpoint. Does not read private
// PostHog pages or use a Personal API key. No real user data is included.
process.env.NODE_ENV ||= 'production';
require('@expo/env').load(process.cwd());
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const token = process.env.EXPO_PUBLIC_POSTHOG_TOKEN;
if (!/^phc_[A-Za-z0-9]+$/.test(token || '')) throw new Error('Set EXPO_PUBLIC_POSTHOG_TOKEN to the project token first.');
const uuid = randomUUID();
const payload = {
  api_key: token,
  distinct_id: `ssak-smoke-${randomUUID()}`,
  event: 'app_open',
  uuid,
  timestamp: new Date().toISOString(),
  properties: { environment: 'test', cohort: 'unknown', platform: 'synthetic',
    app_version: '2.1.1', app_build: 'smoke', schema_version: 1, source: 'app',
    $geoip_disable: true, $process_person_profile: false },
};
(async () => {
  const response = await fetch('https://us.i.posthog.com/i/v0/e/', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`PostHog ingestion failed: HTTP ${response.status}`);
  fs.mkdirSync('artifacts/posthog', { recursive: true });
  const evidence = { uuid, timestamp: payload.timestamp, environment: 'test', status: response.status,
    response: body.slice(0, 200), note: 'Ingest acceptance only; dashboard visibility and native SDK delivery still require verification.' };
  fs.writeFileSync('artifacts/posthog/ingest-smoke.json', JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
