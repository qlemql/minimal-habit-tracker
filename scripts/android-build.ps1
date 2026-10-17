param(
  [string]$SdkRoot = (Join-Path $env:LOCALAPPDATA 'Android/Sdk'),
  [ValidateSet('arm64-v8a', 'x86_64')][string]$Architecture = 'arm64-v8a'
)
$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$sdkPath = [IO.Path]::GetFullPath($SdkRoot)
if (!(Test-Path -LiteralPath (Join-Path $sdkPath 'platforms/android-36/android.jar'))) {
  throw 'Android SDK 36 is missing. Install the packages listed in docs/windows-android.md.'
}
if ((Get-PSDrive -Name ([IO.Path]::GetPathRoot($repoRoot).Substring(0,1))).Free -lt 8GB) {
  throw 'At least 8 GB of free space is required before starting a fresh native build.'
}
$env:ANDROID_HOME = $sdkPath
$env:ANDROID_SDK_ROOT = $sdkPath
$env:NODE_ENV = 'production'
$env:CI = '1'
Push-Location $repoRoot
try {
  & npx.cmd expo prebuild --platform android --no-install
  if ($LASTEXITCODE -ne 0) { throw 'Android prebuild failed.' }
  Push-Location (Join-Path $repoRoot 'android')
  try {
    # Windows PowerShell treats native stderr warnings as ErrorRecords when redirected.
    # Judge Gradle by its exit code, while retaining all warning/error output.
    $ErrorActionPreference = 'Continue'
    & .\gradlew.bat :app:assembleRelease "-PreactNativeArchitectures=$Architecture" '--no-daemon' '--console=plain' '--max-workers=2' '-Dorg.gradle.internal.http.socketTimeout=60000' '-Dorg.gradle.internal.http.connectionTimeout=30000'
    $ErrorActionPreference = 'Stop'
    if ($LASTEXITCODE -ne 0) { throw 'Android native build failed.' }
  } finally { $ErrorActionPreference = 'Stop'; Pop-Location }
  $artifactRoot = Join-Path $repoRoot 'artifacts/android'
  New-Item -ItemType Directory -Force $artifactRoot | Out-Null
  $apk = Join-Path $repoRoot 'android/app/build/outputs/apk/release/app-release.apk'
  $output = Join-Path $artifactRoot "ssak-$Architecture-internal.apk"
  Copy-Item -LiteralPath $apk -Destination $output -Force
  Write-Output "Internal APK: $output"
  Write-Output 'This local build uses the generated debug signing key. Do not upload it to the store.'
  Write-Output 'Do not uninstall an existing production app to install this APK without first preserving its records.'
  & (Join-Path $sdkPath 'build-tools/36.0.0/aapt.exe') dump badging $output |
    Select-String 'package:|sdkVersion:|targetSdkVersion:'
} finally { Pop-Location }
