const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin: SharedDefaults pod를 Podfile에 추가
 */
function withSharedDefaults(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      // use_expo_modules! 다음에 SharedDefaults pod 추가
      if (!podfile.includes("pod 'SharedDefaults'")) {
        podfile = podfile.replace(
          "use_expo_modules!",
          "use_expo_modules!\n  pod 'SharedDefaults', :path => '../modules/shared-defaults/ios'"
        );
        fs.writeFileSync(podfilePath, podfile);
        console.log('[withSharedDefaults] Added SharedDefaults pod to Podfile');
      }

      return config;
    },
  ]);
}

module.exports = withSharedDefaults;
