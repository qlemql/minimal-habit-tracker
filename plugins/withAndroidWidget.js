const {
  withAndroidManifest,
  withDangerousMod,
  AndroidConfig,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WIDGET_PROVIDER_NAME = 'com.qlemql.minimalhabittracker.widget.HabitWidgetProvider';
const WIDGET_ACTION_TOGGLE = 'com.qlemql.minimalhabittracker.widget.ACTION_TOGGLE';
const WIDGET_ACTION_MIDNIGHT = 'com.qlemql.minimalhabittracker.widget.ACTION_MIDNIGHT_REFRESH';
const WIDGET_RECEIVER_EXTRA_NAME = 'com.qlemql.minimalhabittracker.widget.HabitWidgetReceiver';

/**
 * AndroidManifest.xml에 위젯 receiver 등록
 */
function withWidgetManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

    application.receiver = application.receiver ?? [];

    // Widget Provider receiver
    if (!application.receiver.find((r) => r.$['android:name'] === WIDGET_PROVIDER_NAME)) {
      application.receiver.push({
        $: {
          'android:name': WIDGET_PROVIDER_NAME,
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
              { $: { 'android:name': WIDGET_ACTION_TOGGLE } },
              { $: { 'android:name': WIDGET_ACTION_MIDNIGHT } },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/habit_widget_info',
            },
          },
        ],
      });
    }

    return config;
  });
}

/**
 * 위젯 관련 Kotlin/XML 리소스를 android/app/src/main/ 으로 복사
 */
function withWidgetFiles(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformRoot = config.modRequest.platformProjectRoot;

      const sourceDir = path.join(projectRoot, 'targets', 'HabitWidgetAndroid');
      const targetMain = path.join(platformRoot, 'app', 'src', 'main');

      if (!fs.existsSync(sourceDir)) {
        console.warn('[withAndroidWidget] source not found:', sourceDir);
        return config;
      }

      // res/xml/habit_widget_info.xml
      copyFile(
        path.join(sourceDir, 'res', 'xml', 'habit_widget_info.xml'),
        path.join(targetMain, 'res', 'xml', 'habit_widget_info.xml')
      );

      // res/layout/habit_widget_medium.xml + habit_widget_row.xml
      copyFile(
        path.join(sourceDir, 'res', 'layout', 'habit_widget_medium.xml'),
        path.join(targetMain, 'res', 'layout', 'habit_widget_medium.xml')
      );

      // res/drawable (배경 등)
      const drawableDir = path.join(sourceDir, 'res', 'drawable');
      if (fs.existsSync(drawableDir)) {
        for (const f of fs.readdirSync(drawableDir)) {
          copyFile(
            path.join(drawableDir, f),
            path.join(targetMain, 'res', 'drawable', f)
          );
        }
      }

      // res/values/widget_strings.xml + res/values-en/widget_strings.xml
      // 위젯 전용 리소스만 별도 파일명(widget_strings.xml)으로 분리해 main app strings.xml과 충돌 방지.
      // values/는 한국어 기본값, values-en/는 영문 디바이스에서 자동 픽업.
      for (const valuesDir of ['values', 'values-en']) {
        const src = path.join(sourceDir, 'res', valuesDir, 'widget_strings.xml');
        if (fs.existsSync(src)) {
          copyFile(
            src,
            path.join(targetMain, 'res', valuesDir, 'widget_strings.xml')
          );
        }
      }

      // Kotlin sources
      const kotlinSrc = path.join(sourceDir, 'kotlin');
      if (fs.existsSync(kotlinSrc)) {
        const targetKotlin = path.join(
          targetMain,
          'java',
          'com',
          'qlemql',
          'minimalhabittracker',
          'widget'
        );
        for (const f of fs.readdirSync(kotlinSrc)) {
          if (f.endsWith('.kt')) {
            copyFile(path.join(kotlinSrc, f), path.join(targetKotlin, f));
          }
        }
      }

      return config;
    },
  ]);
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

module.exports = function withAndroidWidget(config) {
  config = withWidgetManifest(config);
  config = withWidgetFiles(config);
  return config;
};
