const { withAppBuildGradle } = require('expo/config-plugins');

// CMake hashes long source paths before Ninja reaches Windows' MAX_PATH limit.
// Keep this in prebuild configuration so generated android/ stays disposable.
module.exports = function withWindowsCmakePaths(config) {
  return withAppBuildGradle(config, (mod) => {
    const stagingMarker = '// ssak-windows-cmake-staging';
    if (!mod.modResults.contents.includes(stagingMarker)) {
      mod.modResults.contents = mod.modResults.contents.replace(/android\s*\{/, `android {
    ${stagingMarker}
    if (System.getProperty("os.name").toLowerCase().contains("windows")) {
        externalNativeBuild {
            cmake { buildStagingDirectory file(System.getProperty("user.home") + "/.ssak-cxx") }
        }
    }`);
    }
    const marker = '// ssak-windows-cmake-paths';
    if (mod.modResults.contents.includes(marker)) return mod;
    if (!/defaultConfig\s*\{/.test(mod.modResults.contents))
      throw new Error('Cannot locate Android defaultConfig for CMake path configuration');
    mod.modResults.contents = mod.modResults.contents.replace(/defaultConfig\s*\{/, `defaultConfig {
        ${marker}
        externalNativeBuild {
            cmake { arguments "-DCMAKE_OBJECT_PATH_MAX=240" }
        }`);
    return mod;
  });
};
