const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');
const names = {
  en: 'Ssak: Habit Tracker', ko: '싹: 습관 기록',
  ja: 'Ssak：習慣記録', 'zh-rTW': 'Ssak：習慣紀錄',
};
module.exports = function withAppNameI18n(config) {
  return withDangerousMod(config, ['android', async (config) => {
    const res = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res');
    for (const [locale, name] of Object.entries(names)) {
      const dir = path.join(res, `values-${locale}`);
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, 'strings.xml');
      const xml = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '<resources>\n</resources>\n';
      const stripped = xml.replace(/\s*<string name="app_name"[^>]*>[\s\S]*?<\/string>/g, '');
      fs.writeFileSync(file, stripped.replace('</resources>',
        `  <string name="app_name">${name}</string>\n</resources>`));
    }
    // Remove only iOS-specific entries accidentally generated in Android locales.
    for (const locale of ['ko', 'en', 'ja', 'zh+TW', 'zh-TW']) {
      const file = path.join(res, `values-b+${locale}`, 'strings.xml');
      if (fs.existsSync(file)) fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
        .replace(/\s*<string name="CFBundle(?:DisplayName|Name)"[^>]*>[\s\S]*?<\/string>/g, ''));
    }
    return config;
  }]);
};
