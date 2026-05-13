const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin: 앱 표시명 영문 분기 (Android only).
 *
 * iOS는 app.json의 `expo.locales`로 처리 — Expo prebuild가 ko/en lproj/InfoPlist.strings을
 * 생성하고 Xcode pbxproj의 Copy Bundle Resources에 자동 등록.
 *
 * Android는 Expo의 자동 분기가 없어 직접 처리:
 *   - values/strings.xml = expo.name(한국어) — prebuild가 자동 생성
 *   - values-en/strings.xml = 본 플러그인이 생성, app_name만 영문판으로 오버라이드
 *
 * 디바이스 언어가 영어 계열이면 Android가 자동으로 values-en/ 우선 적용.
 */

const APP_NAME_EN = 'Ssak: Three Habits';

module.exports = function withAppNameI18n(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const platformRoot = config.modRequest.platformProjectRoot;
      const valuesEnDir = path.join(
        platformRoot,
        'app',
        'src',
        'main',
        'res',
        'values-en'
      );
      fs.mkdirSync(valuesEnDir, { recursive: true });

      const filePath = path.join(valuesEnDir, 'strings.xml');
      const content = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${APP_NAME_EN}</string>
</resources>
`;
      fs.writeFileSync(filePath, content, 'utf8');

      // ── iOS locales 누락 정리 ────────────────────────────────────────────
      // Expo prebuild가 app.json의 `expo.locales` (iOS InfoPlist.strings용)를
      // Android의 values-b+{locale}/strings.xml 로도 잘못 복사하는 버그가 있음.
      // → CFBundleDisplayName / CFBundleName 같은 iOS 전용 키가 Android 리소스에
      //   포함되어 release lint의 ExtraTranslation fatal 에러를 일으킴.
      // 우리가 만든 values-en/strings.xml(app_name 영문판)만 남기고 leak 디렉토리 제거.
      const resDir = path.join(platformRoot, 'app', 'src', 'main', 'res');
      for (const leakDir of ['values-b+ko', 'values-b+en']) {
        const target = path.join(resDir, leakDir);
        if (fs.existsSync(target)) {
          fs.rmSync(target, { recursive: true, force: true });
        }
      }

      return config;
    },
  ]);
};
