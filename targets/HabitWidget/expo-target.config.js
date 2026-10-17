/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  displayName: "Ssak",
  bundleIdentifier: ".widget",
  deploymentTarget: "16.0",
  // Localizable.strings resources: en, ko, ja, zh-TW.
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.qlemql.minimalhabittracker",
    ],
  },
});
