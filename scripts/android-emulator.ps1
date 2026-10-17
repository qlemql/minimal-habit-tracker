param([string]$SdkRoot = (Join-Path $env:LOCALAPPDATA 'Android/Sdk'))
$ErrorActionPreference = 'Stop'
$env:ANDROID_HOME = [IO.Path]::GetFullPath($SdkRoot)
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$emulator = Join-Path $SdkRoot 'emulator/emulator.exe'
$adb = Join-Path $SdkRoot 'platform-tools/adb.exe'
$name = 'Ssak_Pixel_API36'
if (!(Test-Path -LiteralPath $emulator)) { throw 'Android Emulator is not installed.' }
foreach ($line in (& $adb devices)) {
  if ($line -match '^(emulator-\d+)\s+device\b') {
    $serial = $Matches[1]
    if ((& $adb -s $serial emu avd name) -contains $name) {
      Write-Output "Already running: $name ($serial)"
      exit 0
    }
  }
}
if (!((& $emulator -list-avds) -contains $name)) { throw "AVD $name is missing." }
# Visible window is intentional: this is the user's interactive test phone.
Start-Process -FilePath $emulator -ArgumentList '-avd',$name,'-memory','2048','-cores','2','-no-snapshot','-no-boot-anim','-scale','0.33' -WindowStyle Normal
Write-Output "Starting $name. Close the emulator window to stop it; app records remain saved."
