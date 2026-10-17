# Windows Android 빌드

현재 프로젝트는 JDK 17, Android API 36, Build Tools 36.0.0 (AGP가 35.0.0도 설치),
NDK 27.1.12297006을 사용한다. 클라우드 계정 없이 로컬 설치 파일을 만들 수 있지만
실기기 동작·스토어 결제 검증과 서명된 스토어 제출은 별도다.

## 도구

- SDK 기본 경로: `%LOCALAPPDATA%/Android/Sdk`
- JDK: 현재 설치된 Microsoft OpenJDK 17
- 최소 패키지: `platform-tools`, `platforms;android-36`, `build-tools;36.0.0`,
  `ndk;27.1.12297006`, `cmake;3.22.1`
- 명령줄 도구 19.0은 Google 공식 repository XML에서 확인한 ZIP을 사용한다.
  `commandlinetools-win-13114758_latest.zip`, SHA-1 `54a582f3bf73e04253602f2d1c80bd5868aac115`.
  다운로드는 HTTPS, 실행 전 배포 metadata의 checksum과 비교한다.
  [Android 도구 설치 안내](https://developer.android.com/tools/sdkmanager).

## 빌드

```powershell
npm ci
powershell -File scripts/android-build.ps1
```

기본은 실제 휴대폰용 arm64-v8a 한 가지 아키텍처만 빌드해 시간과 디스크 사용을 줄인다.
에뮬레이터용은 `-Architecture x86_64`를 사용한다. SDK가 다른 경로에 있으면
`-SdkRoot C:/your/sdk`를 지정한다. 스크립트는 시스템 환경변수를 영구 변경하지 않는다.

Windows의 Ninja 260자 경로 오류를 방지하기 위해 prebuild 플러그인이 앱 CMake에
`CMAKE_OBJECT_PATH_MAX=240`을 전달한다. CMake가 긴 오브젝트 파일 경로를 해시로 줄인다.
작업 디렉터리 자체도 길어 Windows에 한해 앱의 CMake 중간 산출물을
`%USERPROFILE%/.ssak-cxx`에 만든다. 소스와 기존 앱 데이터는 이동하지 않는다.
[CMake 공식 설명](https://cmake.org/cmake/help/latest/variable/CMAKE_OBJECT_PATH_MAX.html).
Gradle 다운로드에는 연결 30초/읽기 60초 제한을 둬 응답 없는 전송이 계속 대기하지 않게 한다.

성공 시 `artifacts/android/ssak-arm64-v8a-internal.apk`에 복사한다.
이것은 release 모드의 **로컬 테스트용 debug 서명 APK**이며 스토어 제출용이 아니다.
기존 스토어 앱과 서명이 다를 수 있어 업데이트 설치가 거절될 수 있다. 이를 해결하려고
기존 앱을 삭제하면 로컬 기록을 잃을 수 있으므로 테스트 기기/별도 프로필을 사용한다.

## 기기 확인

### 설치된 에뮬레이터

2026-10-04: Android Emulator 37.2.12, API 36 Google Play x86_64 이미지 revision 7 설치.
`Ssak_Pixel_API36` (Pixel 5 화면), RAM 2GB / CPU 2개, WHPX 가속 사용 확인.
첫 부팅 완료 후 `ssak-x86_64-internal.apk` 설치와 앱 첫 화면 표시를 확인했다.
Google Play 패키지도 확인했으며 계정 로그인·결제 검증은 하지 않았다.
실행 화면: `artifacts/android/emulator-launch.png`. 전체 유저플로우 검증 결과는 아니다.

프로젝트 폴더에서 다시 실행:

```powershell
powershell -File scripts/android-emulator.ps1
```

에뮬레이터 창을 닫으면 종료된다. 스냅샷은 저장하지 않지만 앱 데이터는 유지된다.
앱은 런처의 Ssak 아이콘으로 다시 열 수 있다. 기존 ARM64 APK는 실물 기기용으로 별도 보관한다.

USB 디버깅을 켠 테스트 기기를 연결하고 SDK의 `platform-tools/adb.exe devices`로
연결을 확인한다. 설치와 데이터 변경은 사용할 테스트 기기가 확인된 뒤 진행한다.
현재 자동으로 연결 기기에 설치하거나 기존 앱 데이터를 지우는 스크립트는 없다.

기존 데이터 업그레이드 검증은 기존 앱과 같은 정식 서명으로 만든 내부 테스트 빌드에서
수행한다. Play 결제는 Play 내부 테스트 배포와 라이선스 테스터 계정이 필요하다.
