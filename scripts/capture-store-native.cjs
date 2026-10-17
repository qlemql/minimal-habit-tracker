// Capture only disposable devices. Never point this script at a user's device.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const copy = require('./store-copy.cjs');
const platform = process.argv[2];
const device = process.env.STORE_CAPTURE_DEVICE;
const output = path.resolve(process.env.STORE_CAPTURE_OUTPUT || 'artifacts/store-2.0-2026-10-14/native');
const bundle = 'com.qlemql.minimalhabittracker';
const adb = `${process.env.HOME}/Library/Android/sdk/platform-tools/adb`;
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', ...opts });
const sim = (...args) => run('xcrun', ['simctl', ...args]);
const android = (...args) => run(adb, ['-s', device, ...args]);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
if (!['ios', 'android'].includes(platform) || !device || process.env.STORE_CAPTURE_DISPOSABLE !== 'yes') {
  throw Error('Require platform, STORE_CAPTURE_DEVICE and STORE_CAPTURE_DISPOSABLE=yes (fresh dedicated device only)');
}
if (platform === 'ios') {
  const devices = Object.values(JSON.parse(sim('list', 'devices', '--json')).devices).flat();
  if (!devices.find((entry) => entry.udid === device && entry.name.startsWith('Ssak-Store-Capture'))) throw Error('Not a dedicated capture simulator');
} else if (!android('emu', 'avd', 'name').startsWith('Ssak_Store_Capture')) throw Error('Not a dedicated capture emulator');
const day = (offset = 0) => {
  const date = new Date(); date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
function seed(language, scene) {
  const c = copy[language];
  const habit = { id: 'store-reading', name: c.name, icon: '📖', color: '#9C6842', reminderTime: null,
    order: 0, createdAt: `${day(-28)}T08:00:00.000Z`, updatedAt: `${day(-1)}T08:00:00.000Z`,
    cue: c.cue, minimum: c.min, weeklyTarget: 5, isGraduated: scene === '05-graduate',
    reviews: [{ id: 'store-review', date: day(-1), feeling: 'easy', note: '', minimum: c.min }],
    ...(scene === '05-graduate' ? { graduatedAt: day(-1), graduatedStage: 'bloom' } : {}) };
  const logs = [-1,-2,-4,-5,-7,-8,-10,-11,-12,-14,-15,-17,-18,-20,-21,-23,-24,-25].map((offset, i) =>
    ({ id: `store-log-${i}`, habitId: habit.id, date: day(offset), completed: true,
      completedAt: `${day(offset)}T08:00:00.000Z`, effort: i % 3 ? 'full' : 'tiny' }));
  return {
    'ssak-preferences': JSON.stringify({ state: { language, welcomed: true, example: false }, version: 0 }),
    'habit-store': JSON.stringify({ state: { habits: scene === '02-discover' ? [] : [habit],
      logs: scene === '02-discover' ? [] : logs, freeHabitId: habit.id, widgetEventIds: [] }, version: 3 }),
    'pro-store': JSON.stringify({ state: { isPro: false }, version: 2 }),
  };
}
const routes = { '01-today': '/', '02-discover': '/add', '03-plan': '/edit?id=store-reading',
  '04-reflect': '/review?id=store-reading', '05-graduate': '/practice?id=store-reading' };
(async () => {
  for (const language of (process.env.STORE_CAPTURE_LANGUAGES || Object.keys(copy).join(',')).split(',')) {
    for (const [scene, route] of Object.entries(routes)) {
      const dir = path.join(output, platform, language); fs.mkdirSync(dir, { recursive: true });
      const data = { ...seed(language, scene), 'store-capture-route': route };
      if (platform === 'ios') {
        try { sim('terminate', device, bundle); } catch {}
        const container = sim('get_app_container', device, bundle, 'data').trim();
        const storage = path.join(container, 'Library/Application Support', bundle, 'RCTAsyncLocalStorage_V1');
        fs.mkdirSync(storage, { recursive: true });
        fs.writeFileSync(path.join(storage, 'manifest.json'), JSON.stringify(data));
        sim('launch', device, bundle);
        await wait(5000);
        sim('io', device, 'screenshot', path.join(dir, `${scene}.png`));
      } else {
        android('shell', 'am', 'force-stop', bundle);
        const jsonFile = '/tmp/ssak-store-seed.json';
        fs.writeFileSync(jsonFile, JSON.stringify(data));
        run('python3', ['-c', `import sqlite3,json,os
p='/tmp/ssak-store-RKStorage'
if os.path.exists(p): os.remove(p)
c=sqlite3.connect(p)
c.execute('CREATE TABLE catalystLocalStorage (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
c.executemany('INSERT INTO catalystLocalStorage VALUES (?,?)',json.load(open('${jsonFile}')).items())
c.execute('PRAGMA user_version=1');c.commit();c.close()`]);
        android('push', '/tmp/ssak-store-RKStorage', '/data/local/tmp/ssak-store-RKStorage');
        android('shell', 'run-as', bundle, 'mkdir', '-p', 'databases');
        android('shell', 'run-as', bundle, 'cp', '/data/local/tmp/ssak-store-RKStorage', 'databases/RKStorage');
        android('shell', 'run-as', bundle, 'rm', '-f', 'databases/RKStorage-wal', 'databases/RKStorage-shm', 'databases/RKStorage-journal');
        android('shell', 'am', 'start', '-n', `${bundle}/.MainActivity`);
        await wait(6000);
        let shot;
        for (let attempt = 0; attempt < 12; attempt++) {
          shot = execFileSync(adb, ['-s', device, 'exec-out', 'screencap', '-p']);
          // Loading/blank frames are much smaller than these localized screens.
          if (shot.length > 100000) break;
          await wait(2000);
        }
        if (shot.length <= 100000) throw Error(`App did not render ${language}/${scene}`);
        // Let initial focus and keyboard dismissal finish after the first app frame.
        await wait(3500);
        shot = execFileSync(adb, ['-s', device, 'exec-out', 'screencap', '-p']);
        fs.writeFileSync(path.join(dir, `${scene}.png`), shot);
      }
      console.log(`${platform}/${language}/${scene}`);
    }
  }
  fs.writeFileSync(path.join(output, `${platform}-provenance.json`), JSON.stringify({
    capturedAt: new Date().toISOString(), platform, device, source: 'native app on isolated simulator/emulator',
    data: 'synthetic localized examples; no customer records; free tier',
    code: 'current working tree; local capture build with initial-route harness; UI components unchanged; no store upload',
    scenes: routes,
  }, null, 2));
})().catch((error) => { console.error(error); process.exitCode = 1; });
