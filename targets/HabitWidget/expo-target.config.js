/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  displayName: "오늘의 습관",
  bundleIdentifier: ".widget",
  deploymentTarget: "16.0",
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.qlemql.minimalhabittracker",
    ],
  },
});
