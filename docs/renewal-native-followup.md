# 리뉴얼 후속 개발 — 2026-10-06

기준: `feat/ssak-renewal`, `dc0cbe7`. 사용자 요청 범위는 개발 환경/회귀검증,
iOS 빌드·실행 확인, 위젯과 새 제품 방향의 정합성까지다.

## 작업 순서

1. lockfile로 의존성 설치, TypeScript·Vitest·프로덕션 웹·전체 E2E 재검증.
2. 독립된 iOS 테스트 환경에서 네이티브 빌드와 실행 확인. 기존 설치 데이터는 건드리지 않는다.
3. 위젯을 Soft Fold 색상과 월요일 시작 주간 목표에 맞춘다.
   - 일반/최소 행동 모두 하루 한 번으로 계산한다. 쉬는 날을 실패나 연속 기록 초기화로 표시하지 않는다.
   - 주간 목표는 각 습관의 설정값, 구버전 미설정 값은 앱과 같은 7일이다.
   - 위젯에서 습관을 열어 앱의 동일한 일반/최소 행동 선택과 취소를 사용한다.
     Android의 기존 즉시 토글 대신 명시적인 선택 화면으로 연결한다.
     구버전 위젯에서 이미 발생한 대기 입력의 저장·중복 방지·확인은 유지한다.
   - 작은 iOS 위젯/잠금 화면은 오늘 화면으로, 중간 크기와 Android는 해당 습관으로 연결한다.
4. 변경한 계산·딥링크·권한 경계를 회귀검증하고 최종 빌드 결과와 미검증 범위를 기록한다.

## 범위 밖

실제 스토어 결제·환불, 정책 게시, 출시 및 커밋/푸시는 이번 요청 범위에 포함하지 않는다.
기존 main 작업 폴더는 그대로 보존한다.

## 검증 결과

### 완료한 구현

- iOS·Android 위젯의 흐름 일수를 `이번 주 실천 횟수 / 설정한 주간 목표`로 교체.
  월요일 시작, 중복·미래 날짜 제외, 최소 행동도 하루 한 번. 목표를 넘긴 실천도 그대로 표시.
- Soft Fold 배경·본문·강조색과 절제된 완료 문구 적용. 최소 행동을 한 날은 별도 표시.
- Android 행과 iOS 중간 크기 위젯 행은 해당 습관 상세로 이동.
  상세 상단의 공통 HabitAction으로 일반/최소 실천을 선택하고 취소할 수 있다.
  졸업한 습관과 무료 한도 밖 습관에는 기록 버튼이 없다.
- iOS 작은 위젯과 잠금 화면은 오늘 화면으로 이동. 빈 위젯에서 앱을 열 수 있다.
- Android의 신규 위젯 탭은 기록을 자동 변경하지 않는다. 기존 날짜 포함 큐는 종전의
  저장 후 확인·중복 방지 경로로 가져온다. 과거 전체 실천 이벤트를 가져올 때 최소 실천 표시는 제거한다.
- iOS는 7일간 자정 timeline 항목을 미리 제공하고 마지막 항목에서 다시 갱신을 요청한다.
  빈 실제 사용자 위젯에 예시 습관이 나타나지 않도록 갤러리 프리뷰와 실제 snapshot도 분리했다.
- Android 3행의 44dp 터치 영역과 주간 보조 문구를 위해 기본 4×3, 최소 높이 200dp로 조정했다.

### 자동 검증

- 최초 상태: TypeScript, Vitest 52개, 프로덕션 웹 export, E2E 28개 통과.
- 변경 후: TypeScript, Vitest 54개, 프로덕션 웹 export, E2E 31개 통과.
  추가 E2E는 딥링크 목적지의 일반/최소 행동·취소·재실행·자정과
  졸업/무료 한도에 따른 기록 차단을 검증한다. 네이티브 OS 링크 전달 검증을 대신하지 않는다.
- `python3 scripts/test-widget-models.py`: 실제 Swift·Kotlin 소스의 모델을 컴파일해
  각각 10가지 주 경계·연말·윤년·DST·중복·미래·공백 기간·목표 초과 사례를
  서울/UTC/뉴욕 세 시간대에서 통과. 구형 payload 기본값, 최소 행동 상태도 확인.
  Swift에서는 특수문자가 포함된 습관 ID의 URL 인코딩/복원까지 확인한다.
- 재현 환경: Xcode command-line tools, Java 및 Gradle의 Kotlin compiler가 필요하다.
  `JAVA_HOME`과 `KOTLIN_LIB`로 컴파일 도구 위치를 지정할 수 있다.
- 로그는 gitignore된 `artifacts/native-followup/`에 보관한다.

### 네이티브 빌드

- Xcode 26.6: iOS Release 시뮬레이터 앱 + HabitWidget 확장 컴파일 성공.
  2.0.0 (13), 양 타깃에 en/ko/ja/zh-TW 리소스 포함, 앱 내부 JS 번들 포함 확인.
  `/tmp/ssak-renewal-derived/Build/Products/Release-iphonesimulator/SsakHabitTracker.app`.
- 별도 `Ssak-Renewal-QA` 기기(`D2CDFA91-F02C-4D97-832B-E2A762C7FE55`)에 설치 성공.
  화면 실행/터치 검증은 아래 연결 오류로 보류. 실제 기기용 서명/Archive 빌드는 아니다.
- Android ARM64 Debug APK 컴파일 성공. 마지막 위젯 색상·크기 조정 후 재빌드까지 성공.
  `android/app/build/outputs/apk/debug/app-debug.apk`. 테스트 서명이며 스토어 제출본이 아니다.
- 커밋·푸시·스토어 배포 없음.

### 화면 검증의 제한

Computer Use 활성화·앱 재시작 이후에도 `Sky Computer Use native pipe startup failed`가
반환됐다. 네이티브 서비스에서 `Sender process is not authenticated`도 확인했다.
따라서 Simulator 화면 캡처·터치·키보드·큰 글자·VoiceOver·햅틱 검증은 미완료다.
다른 화면 제어 도구로 우회하지 않았다. 사용자의 기존 앱 기록은 변경하지 않았다.

실제 위젯의 딥링크, 자정/시간대 이동/재부팅, 홈 화면 크기별 배치도 기기 검증이 남아 있다.
빌드와 자동 검증 통과를 출시 승인으로 해석하지 않는다.

### 자체 검토

1. 제품 방향: 설정을 추가하지 않고 기존 주간 목표·최소 행동을 재사용했다.
   기존 위젯의 즉시 토글은 앱에서 명시적으로 실천 종류를 선택하는 경로로 변경되므로
   Android에서 탭 한 번이 늘어난다. 본문의 일반/최소 기록 의미를 일치시키는 선택이다.
2. 품질: 구형 snapshot 기본값, 대기 입력의 영속 저장, 중복/미래 날짜, 주 시작일,
   졸업/환불 후 권한, 특수문자 ID를 확인했다. 실제 기기에서만 검증할 수 있는 항목은 남겨뒀다.

위젯 링크 구성 참고: [Apple WidgetKit 문서](https://developer.apple.com/documentation/widgetkit/creating-a-widget-extension).

## iPhone 설치 준비

연결된 iPhone 13 mini(iOS 26.6.1, Developer Mode 활성)의 기존 1.2.0 (12) 앱 확인.
업데이트 전 앱 Library를 Mac의 `~/.ssak-device-backups/2026-10-06-before-renewal/`에
백업했고, 파일별 SHA-256 목록을 함께 보관했다. 이 백업은 Git에 포함하지 않는다.
실제 백업의 habit-store를 새 마이그레이션 함수에 통과시켜 모든 습관·기록이 동일하게
유지되고 기존 3슬롯 권한도 유지됨을 확인했다. 사용자 습관 내용은 로그에 출력하지 않았다.

자동 서명 시 Xcode가 `No Accounts`를 반환했다. 현재 개발 인증서는 유효하지만
로컬 wildcard 프로파일에는 App Groups 및 aps-environment 권한이 없다.
위젯을 포함한 전체 빌드에는 App Groups를 지원하는 프로파일이 필요하다.
다른 프로젝트의 설치 성공본을 확인해, 기존 wildcard 프로파일로 앱 단독 테스트 빌드를
서명할 수 있음을 확인했다.

서명을 제외한 iPhone용 Release 앱 + 위젯 컴파일은 성공했다.
산출물: `/tmp/ssak-renewal-device-derived/Build/Products/Release-iphoneos/SsakHabitTracker.app`.
이 원본은 서명되지 않았으며 위젯을 포함한 전체 빌드용으로 보존했다.

### 앱 단독 실기기 테스트 빌드 설치 완료

2026-10-06 14:05 KST, 기존 개발 인증서와 기기가 등록된 wildcard 프로파일로
별도 임시 사본을 서명했다. 사본에서만 위젯 확장을 제외하고, App Groups 및 push
entitlement 없이 서명했다. 저장소의 위젯 구현과 전체 빌드 설정은 그대로 유지했다.
중첩 프레임워크 및 앱의 codesign strict 검증 통과 후 devicectl 업데이트 설치 성공.
기기 앱 목록에서 **Ssak: Habit Tracker 2.0.0 (13)** 확인.
기존 앱 삭제 없이 같은 bundle identifier로 업데이트했고, 설치 직후 AsyncStorage의
모든 파일 SHA-256이 설치 전 백업과 동일함을 확인했다. 실기기 첫 실행 후 마이그레이션은
아직 검증하지 않았다.

자동 실행 요청은 기기 잠금(`FBSOpenApplicationErrorDomain: Locked`)으로 거부됐다.
사용자가 iPhone 잠금을 풀고 앱을 열어야 한다. 화면 QA는 아직 미완료다.
이번 설치본은 앱 화면·습관 기록 테스트용이며 홈 화면 위젯과 App Group 공유를
검증할 수 없다. push entitlement도 없으며 알림·구매 검증 완료를 의미하지 않는다.

설치 결과: `/tmp/ssak-device-install-result.json`.
버전 확인: `/tmp/ssak-device-app-after.json`.
실행 결과: `/tmp/ssak-device-launch-result.json`.
서명된 임시 앱 경로는 `/tmp/ssak-device-app-only-path.txt`에 기록했다.


## 2026-10-06 이용 상태 단순화 작업계획

사용자 결정에 따라 기존 사용자 3슬롯 예외를 폐지하고 무료 1개 / 구매 Plus 3개만 유지한다.
1. 저장소 v3 마이그레이션으로 기존 습관·기록·무료 선택·위젯 처리 ID를 보존하고 과거 권한 플래그를 제거한다.
2. 내 습관·설정의 구매 유도 배지를 실제 무료/Plus 이용 상태로 바꾸고, 오늘은 날짜를 유지한다.
3. 4개 언어 안내와 정책 문구를 맞추고 마이그레이션·구매 권한·표시 회귀 검증 후 기기 테스트 빌드를 갱신한다.

### Plan simplification completed

- Free: one active habit. Purchased Plus: up to three. Legacy access no longer grants slots.
- Schema v3 preserves habits, logs, the free selection and widget replay IDs. Missing completion timestamps become null.
- My habits and Settings show actual plan status. Today retains the date. Paid Settings links to benefits instead of an upgrade CTA.
- Updated app copy and policy descriptions in all four languages, and the review guide.
- Passed typecheck, 54 unit tests, 40 E2E tests, web export and iPhone Release build.
- E2E covers v1/v2 migration and all four languages' free/Plus labels before and after deletion, reload and desktop resizing. Inspected Korean 360px free/Plus screenshots.
- Fresh device Library backup: `~/.ssak-device-backups/2026-10-06-before-plan-v3/`. Its one active habit and all logs survive migration unchanged.
- Installed updated app-only 2.0.0 (13) on the iPhone at 14:19 KST. Widget remains excluded from this test build.
- Install evidence: `/tmp/ssak-plan-v3-install-result.json`; signed app path: `/tmp/ssak-plan-v3-app-path.txt`.

Review: plan status follows purchase entitlement, never habit count. Nonselected free habits remain readable; changing the selection does not delete records. The earlier legacy-slot preservation notes describe the previous build and are superseded by this change.

Physical-device launch succeeded. Read back AsyncStorage after launch: schema v3, legacy flag absent, and habits/logs identical to the immediate pre-update backup. Native visual/touch QA and real purchase testing remain unverified.

## Fresh-device test reset (2026-10-06 14:45 KST)

User approved resetting this iPhone's test records for a new-user walkthrough. Backed up all AsyncStorage files and verified habit/log data plus file hashes at `/Users/daniel/.ssak-device-backups/2026-10-06-144453-before-clean-start`. The Library-wide copy encountered a protected OS SplashBoard snapshot; the dedicated AsyncStorage backup succeeded. Uninstalled only `com.qlemql.minimalhabittracker` and reinstalled the same signed app-only 2.0.0 (13) test build. Automatic launch was denied because the iPhone was locked; the user must unlock it and open the app. No production reset behavior was added. Evidence: `/tmp/ssak-clean-start-install.json`, `/tmp/ssak-clean-start-files.json`.
