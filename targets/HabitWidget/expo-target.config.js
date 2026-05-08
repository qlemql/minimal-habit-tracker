/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  displayName: "오늘의 습관",
  bundleIdentifier: ".widget",
  deploymentTarget: "16.0",
  // ko/en .lproj/Localizable.strings 자동 picking — Xcode가 디렉토리명으로 인식.
  // CFBundleDevelopmentRegion은 ko (한국 우선), 영문 디바이스에서는 en으로 자동 폴백.
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.qlemql.minimalhabittracker",
    ],
  },
});
