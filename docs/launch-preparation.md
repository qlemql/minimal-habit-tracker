# 출시 준비 — 2026-10-04

요청 범위: 기존 데이터 보존, 환불 후 무료 전환, 위젯 날짜 오류, 장기 알림,
4개 언어 시스템 표시명, 정책/지원 화면, 결제 및 네이티브 출시 검증.

## 다음 세션 인수인계 — 2026-10-04 작업 저장

### 오늘 작업 최종 요약 — 2026-10-04

- 브랜치: `feat/ssak-renewal`. 사용자 요청으로 오늘 작업을 기능별 커밋 후 origin에 푸시한다.
- **브랜딩:** G3 / Soft Fold로 우선 진행. 브라운·크림·코랄, 흐르는 비대칭 S.
  앱 아이콘·스플래시·Android adaptive/단색·favicon·Play 아이콘·앱 내부 로고 적용 완료.
  원본 색상/곡선은 `assets/brand/design.json`, 재생성은 `npm run brand:assets`.
- **스크롤/인터랙션:** 공통 화면의 Android 오버스크롤을 끔. 완료 체크 220ms 반응과
  가벼운 햅틱, 완료/취소 140ms 페이드, 버튼/탭 눌림 표시. 동작 줄이기 설정 반영.
- **다국어:** LocalizedText로 언어별 줄바꿈 정책 통일. 좁은 화면 제목 크기와 영어·일본어·
  번체 제목의 의미 단위 줄바꿈 보완. 한국어는 웹/iOS 단어 경계를 우선하며 Android는
  기본 고품질 줄바꿈과 제목 balanced를 사용한다. 모든 플랫폼이 같은 줄로 끊기지는 않는다.
- **검증:** TypeScript, 웹 export, 최신 웹 흐름 8개, Android x86_64 release 빌드 통과.
  인터랙션 변경 시 reduced-motion 흐름 1개도 통과. 웹 4개 언어 × 3개 폭(320/360/390px)
  × 5개 화면 = 60개 조합의 가로 넘침 검사 및 주요 캡처 확인.
- **설치 상태:** `Ssak_Pixel_API36`에 최신 x86_64 APK를 데이터 유지 업데이트했다.
  내부 G3 로고와 한국어 오늘 화면을 실제 캡처로 확인. 기존 습관/기록 보존.
  APK 경로는 `artifacts/android/ssak-x86_64-internal.apk`이며 테스트 서명이다.
  ARM64 APK는 이전 디자인 상태로 갱신하지 않았다.
- **로컬 증거:** `artifacts/android/brand-typography-build.log`, `brand-typography.png`,
  `artifacts/typography/`, `artifacts/brand/g3/`. APK·생성 시안·캡처·로그는 Git에 넣지 않는다.
- **다음 확인:** 4개 언어 전체 Android/iOS 화면, 확대 글꼴, 실제 기기에서 완료 동작·햅틱·
  스크롤 체감 확인. iOS 빌드, ARM64 최신 빌드, 결제/환불·스토어 출시 검증은 별도 미완료.
- 이전 테스트 기록(52개 단위/통합, 27개 웹 흐름)을 오늘 전체 재실행한 것으로 해석하지 않는다.

### 오늘 진행 기록 — 아래는 각 작업 시점의 상태

- 최신 후속: 누락됐던 앱 내부 공통 Brand도 G3 심볼과 브라운 벡터 워드마크로 교체.
  `assets/brand/design.json`을 에셋 생성기와 앱이 공유한다.
- 언어별 줄바꿈: `LocalizedText`에 웹 언어 태그·한국어 keep-all·CJK strict,
  iOS 한국어 hangul-word/기타 standard, Android highQuality(제목 balanced) 적용.
  375px 미만 제목은 28px/37px, 긴 보조 문구는 줄바꿈할 공간을 확보.
  영어 첫 제목과 일본어 습관 선택/회고 제목을 짧게 다듬고 번체 Plus 제목을 의미 단위로 분리.
- 웹 4개 언어 × 320/360/390px × 5개 화면(첫 화면·습관 선택·오늘·설정·Plus)
  총 60개 조합 가로 넘침 검사 및 주요 캡처 확인. `artifacts/typography/` 참조.
- TypeScript·웹 export·기존 웹 흐름 8개·Android x86_64 release 빌드 통과.
  에뮬레이터에 `adb install -r`로 데이터 유지 업데이트 후 내부 로고/한국어 오늘 화면 확인.
  `artifacts/android/brand-typography.png`, `brand-typography-build.log`에 증거 보관.
  4개 언어 전체 네이티브 화면 및 iOS 실기기 줄바꿈 검증은 아직 남아 있다.

- 절제된 인터랙션 추가: 완료 체크만 1 → 1.08 → 1 배율로 220ms 동안 반응,
  완료·취소 영역은 140ms 페이드. 버튼·탭은 누르는 동안만 투명도 피드백.
- `HabitAction`에서 직접 완료한 경우에만 네이티브 Light 햅틱 1회.
  첫 진입 시 기존 완료 상태는 애니메이션을 재생하지 않고, 동작 줄이기 설정을 따른다.
- TypeScript·웹 export·Android x86_64 release 빌드, 기존 웹 흐름 8개,
  reduced-motion 환경의 완료/취소/유지 흐름 1개 통과.
  빌드 로그: `artifacts/android/interaction-build.log`. 에뮬레이터용 APK 갱신.
  실제 기기의 애니메이션·햅틱 체감 검증은 아직 하지 못했다.

- 후속 스크롤 피드백: Android 에뮬레이터 전체 화면에서 위·아래로 튕기는 느낌.
  공통 `Screen`의 `ScrollView`에 `overScrollMode="never"`를 적용해 Android 기본
  stretch overscroll을 비활성화했다. TypeScript와 x86_64 release 빌드 통과.
  APK는 아래와 같은 경로로 갱신. `artifacts/android/scroll-build.log` 참조.
  adb 연결 기기가 없어 실제 증상 재현 및 수정 후 설치 검증은 아직 하지 못했다.

- 사용자가 따뜻한 브라운·크림·코랄 색감과 단순 구성을 선호. 최종 대화에서
  **G3 / Soft Fold로 우선 진행**에 동의했다. 아래의 ‘새 시안 미제작’ 상태는 이전 기록이다.
- 흐르는 비대칭 S와 작은 코랄 포인트를 사용한다. G2의 정돈된 S는 원안의 개성을 잃어 제외.
- `scripts/brand-assets.cjs`와 `app.json`에 적용. 재생성 명령은 `npm run brand:assets`.
- `assets/brand/`에 SVG, 아이콘·Android 전경/단색·스플래시·favicon·Play 아이콘에 PNG 반영.
- 목업과 실제 생성 에셋 미리보기는 `artifacts/brand/g3/`에 보관.
- 최초 적용 시 내부 Brand는 누락됐으나 위 최신 후속에서 반영했다. UI 팔레트는 유지한다.
- 검증: 에셋 재생성, 실제 에셋의 32/48/64px 및 원형·단색 미리보기, TypeScript,
  웹 export, Android x86_64 release 빌드 통과. 로그: `artifacts/brand/g3/android-build.log`.
- `artifacts/android/ssak-x86_64-internal.apk`는 G3로 갱신했다. 테스트 서명 APK다.
  ARM64 APK는 이전 디자인이며 이번에 갱신하지 않았다.
- 연결 기기가 없어 G3의 설치·콜드 스타트 실기기 검증은 미실시. iOS 빌드도 미실시.
  아래 이전 APK·캡처 검증을 G3 검증으로 간주하지 않는다.
- 첫 TypeScript 실행은 동시에 진행한 웹 export의 dist 교체와 충돌했다.
  export 완료 후 단독 재실행해 통과했다.

### 이전 인수인계 보관 — 오늘 작업 전 상태

사용자가 외출 전 작업 저장을 요청했던 기록이다. 최신 결정과 설치 상태는 위 최종 요약을 따른다.

- 현재 브랜치: `feat/ssak-renewal`. iOS/Android 글로벌 습관 앱 리뉴얼 중이며 공개 출시 전이다.
- 사용자 목표: 광고 없이 일회성 Plus 구매로 작은 수익과 실제 사용자를 확보. 한국어·영어·일본어·번체중국어.
- 최신 피드백: **두 막대 아이콘과 스플래시가 마음에 들지 않는다. 현재 브랜딩은 승인되지 않은 초안이다.**
- 다음 작업: 서로 확실히 다른 아이콘 시안 3개를 홈 화면의 작은 아이콘 및 스플래시와 나란히 비교해 보여준다.
  기존 앱 안의 작은 심볼을 확대하는 접근은 재사용하지 않는다. ‘쉬었다 다시 이어가는 작은 발걸음’은
  제안한 탐색 방향일 뿐 확정된 디자인이 아니다. 새 시안은 아직 제작하지 않았다.
- 구현: 무료 1개/Plus 3개/기존 사용자 3개 유지, 환불 후 무료 습관 선택과 기록 보존,
  승인 대기 처리, 위젯 이벤트 날짜·중복·저장 실패 처리, 반복 알림, 정책/지원 화면 완료.
- 검증: 단위·통합 52개, 웹 유저플로우 27개 통과. 이후 브랜딩 변경은 TypeScript·웹 export 및
  Android release 빌드로 확인했다. 전체 실기기 유저플로우·결제·환불 검증 완료를 뜻하지 않는다.
- Windows SDK/NDK 및 Google Play Android 16 x86_64 에뮬레이터 설치 완료.
  `powershell -File scripts/android-emulator.ps1`로 `Ssak_Pixel_API36` 실행.
  새 APK 업데이트 설치와 콜드 스타트/홈 아이콘 표시 확인. 에뮬레이터 앱 데이터는 유지한다.
- `artifacts/android/ssak-x86_64-internal.apk`는 에뮬레이터용,
  `ssak-arm64-v8a-internal.apk`는 실물 기기용. 둘 다 브랜딩 초안 포함 **테스트 서명**이며 스토어 제출 불가.
- APK·캡처·로그·스토어 초안은 gitignore된 `artifacts/`에 로컬 보관. 소스와 재생성 스크립트는 Git에 저장.
  `brand-start-1.png`는 실제 스플래시, `brand-launcher.png`는 실제 홈 화면 캡처.
- EAS/Cloudflare 미인증, RevenueCat 공개 SDK 키·상품/서버 알림 연결, 정책 최종 검토·게시,
  정식 서명·iOS 빌드·스토어 테스트가 남았다. 기존 공개 연락처와 사이트는 release-public.json 참조.
- 남은 npm audit 23개는 braces/node-forge 두 advisory의 빌드 의존 경로다.
  런타임 소스맵에는 없지만 위험이 모두 해결된 것은 아니다. dependency-security.md 참조.
- 오늘 설치 이후 C: 여유 약 10GB. 추가 이미지/기기 설치 전 용량 확인. 사용자 파일이나 앱 데이터 삭제 금지.

## 구현 계획

1. 위젯 이벤트에 날짜·완료 상태·식별자를 저장. 중복 적용은 같은 결과를 내고,
   기기 저장 성공 뒤 해당 이벤트만 삭제. 동시에 들어온 탭은 남긴다.
2. 알림은 매일 반복 예약으로 변경. 완료 여부와 관계없이 정한 시간에 울릴 수
   있다는 설명을 설정 시 표시한다. 오래된 알림의 완료 버튼은 오늘에 적용하지 않는다.
3. Plus 해제 시 무료로 기록할 습관 하나를 선택. 나머지 기록/계획은 보관하며
   읽기 가능. 기존 사용자 3개 권한은 유지한다.
4. 4개 언어 정책/지원/환불 안내와 시스템 앱 이름을 준비한다.
5. 자동 테스트, 네이티브 번들, Expo 설정/의존성 검사. 실제 구매·환불·위젯은
   네이티브 빌드 및 실기기 증거가 있어야 통과로 표시한다.

## 현재 외부 제약

- EAS CLI: `eas whoami` 결과 Not logged in. 계정 인증 없이 클라우드 빌드 불가.
- 로컬 Android SDK/NDK/adb 설치 완료. Windows에서 Xcode 실행 불가.
- 기존 공개 정보 발견: README의 `Hyun (qlemql)`, `taehyun_fe@naver.com`,
  `https://ssak-habit-tracker.pages.dev`를 release-public.json에 연결했다.
  기존 공개 개인정보 페이지 HTTP 200 확인. 정식 사업자/운영자 고지는 별도 확인 필요.
- Cloudflare Wrangler도 미인증. 기존 정책 사이트에 새 정책을 게시하려면 로그인 필요.
- RevenueCat/스토어 상품·서버 알림 설정과 실기기 결제는 별도 검증 필요.

완료 내역과 최종 검증 결과는 작업 후 아래에 기록한다.

## 후속 작업 — 의존성 및 Windows 환경

- URL decoder 0.5.0 / image-size 2.0.4 / uuid 11.1.1 적용.
  버전 변경에 필요한 두 개의 작은 호환 패치를 postinstall로 재현한다.
- 새 `npm ci` 이후 패치 적용 확인. 최종 52개 테스트와 27개 웹 유저플로우 통과.
- 결제 승인 대기를 별도로 안내하고 중복 구매 버튼을 잠근다. 승인 전 Plus를 부여하지 않으며
  SDK 고객 정보 갱신으로 승인·환불 상태를 반영한다. 실스토어 검증은 별도다.
- 네이티브 소스맵에 braces/node-forge 미포함 확인. audit 23개는 이 두 빌드 도구의
  전이 경고. 완전 해결로 표시하지 않는다. [상세 보안 검토](./dependency-security.md).
- Node 22.14.0에서도 URL decoder 연동 확인. EAS Node 버전을 동일하게 고정.
- Android 명령줄 도구 19.0, API 36, Build Tools 36.0.0,
  NDK 27.1.12297006, CMake 3.22.1, adb 설치 완료.
- [Windows 빌드 방법](./windows-android.md)과 로컬 빌드 스크립트 추가.
  연결된 adb 기기는 현재 없음. 로컬 테스트 APK 컴파일 성공: 아래 산출물 참조.
- 기존 공개 연락처로 앱의 문의 버튼을 연결. 12개 정책/지원 페이지도 연락처 반영.
  구버전의 공개 정책을 자동으로 덮어쓰지 않았다. 새 정책은 최종 검토·게시 대기.

## 반영한 내용

### Android 설치 파일 — 2026-10-04 최종 확인

- `artifacts/android/ssak-arm64-v8a-internal.apk` (후속 브랜딩 수정 시 같은 경로에 갱신).
- 패키지 `com.qlemql.minimalhabittracker`, 2.0.0 (11), min SDK 24 / target SDK 36.
- Windows 경로 제한을 CMake 경로 해시·짧은 중간 산출물 디렉터리로 해결했고,
  PowerShell이 Gradle 경고를 실패로 처리하던 실행 스크립트도 수정했다.
- `artifacts/android-native-verified.log`: BUILD SUCCESSFUL, 564 tasks.
- APK v2 서명 확인: Android Debug 인증서. 스토어 제출용이 아니다.
- ZIP 16KB 정렬 검사 및 20개 `.so`의 ELF LOAD 정렬 확인.
  `artifacts/android/verification.json`, `signature.txt`, `badging.txt`에 증거 저장.
- 실제 기기에 설치하지 않았다. 기존 스토어 앱과 서명이 달라 업데이트 설치가 거절될 수 있으며,
  이를 해결하려고 기존 앱을 지우면 기록을 잃을 수 있다. 별도 테스트 기기/프로필을 사용한다.

### 기능 및 정책

- 환불 또는 entitlement 해제 후 무료로 기록할 습관 선택. 다른 습관은 읽기 전용으로
  유지하며 설정에서 선택 변경 가능. 기존 사용자 3개 권한 보존. 직접 편집 주소와
  저장소 함수, 알림, 위젯에도 같은 한도를 적용했다.
- 구매 SDK의 CustomerInfo 변경 구독을 추가했다. 앱 재실행/포그라운드에서도 동기화하며
  네트워크 오류만으로 기존 구매 권한을 제거하지 않는다.
- Android 위젯 입력에 날짜·완료 상태·이벤트 ID 추가. 저장 후 ID 단위 확인 처리,
  중복 이벤트 재적용 방지, 기록 저장 실패 시 재시도, 동기화 중 새 탭 보존.
  과거 버전의 날짜 없는 큐는 날짜를 추측해 오늘에 넣지 않고 무시한다.
- 7일 알림 창을 매일 반복으로 변경. 완료한 날에도 알림이 울릴 수 있음을 화면에 명시.
  오래된 알림 완료 버튼으로 오늘을 기록하는 것을 차단했다.
- 한국어/영어/일본어/번체중국어의 시스템 표시명과 위젯 리소스 추가.
  앱 2.0.0, iOS 13 / Android 11은 **로컬의 다음 빌드 번호 후보**다.
  콘솔에 더 높은 번호가 있으면 빌드 전 조정해야 한다. 패키지 ID·앱 그룹은 유지했다.
- 위젯의 텍스트/배경/강조색을 앱 팔레트에 맞췄다. 앱은 현재 밝은 테마를 제공하므로
  시스템 설정도 light로 명시했다. 후속 작업에서 앱 내부 두 막대 심볼로 아이콘·스플래시를
  교체했다. Android 테마 아이콘, Play 등록 아이콘, 웹 favicon도 통일했다.
- 설정과 Plus에서 정책/지원/구매 안내로 이동. 4개 언어 총 12개 공개용 정적 페이지를
  `artifacts/legal-site`에 생성. 기존 공개 연락처를 연결했으며 최종 정책 검토 전이므로 DRAFT로
  표시한다. 아직 외부 게시 전.

## 검증 기록과 한계

| 점검 | 결과 |
|---|---|
| 단위/통합 자동 테스트 | 52개 통과. 환불, 승인 대기, 날짜, 위젯 큐 저장 실패·중복 재실행, 의존성 호환 포함 |
| 웹 유저플로우 | 27개 통과. 네 언어 환불 후 선택·기록 보존·정책 화면 포함 |
| TypeScript / 웹 export | 통과 |
| iOS/Android Hermes JS export | 통과. IPA/APK 컴파일을 의미하지 않음 |
| Android native prebuild | 통과. 네 언어 리소스, private 위젯 receiver 생성 확인 |
| Android release APK 컴파일 | 통과. API 36 / ARM64 / 테스트 서명. 설치·결제 검증 전 |
| iOS native prebuild | Expo가 Windows에서 생성을 지원하지 않아 실행 불가 |
| Expo 의존성 버전 / doctor | 호환 버전 검사 및 18/18 검사 통과 |
| 구매·환불 실기기 | 미실행. SDK 키/상품 연결과 인증 필요 |
| 공개 정책 URL / 문의처 | 기존 사이트·이메일 재사용. 새 정책은 검토·게시 전 |
| 스토어 이미지 | 웹 렌더링 초안 44장. 네이티브 실캡처로 교체 후 제출 |

알림 테스트 2개는 이전의 7일 예약 기대값 때문에 처음 실패했다. 변경한 반복 정책에 맞춰
미래 알림 유지/중복 방지를 검증하도록 수정했다. 의존성 정리 중 Xcode 플러그인의
누락된 xmldom 직접 의존성도 발견해 명시적으로 추가했다.

### 의존성 보안

Vitest 4.1.11, PostCSS 8.5.28, 구형 plist 경로의 xmldom 0.8.15에 이어
decode-uri-component 0.5.0, image-size 2.0.4, uuid 11.1.1을 적용했다.
`npm audit` 경고는 최초 41개 → 중간 36개 → 최종 23개(상 23/중 0/치명적 0).
이 수치는 전이 의존 경로까지 포함한다. 남은 실제 advisory는 braces와 node-forge 두 종류이며
현재 제공되는 수정 버전이 없다. 네이티브 소스맵에서 두 패키지가 런타임에 없음을 확인했다.
빌드 도구 위험까지 없어진 것은 아니므로 출시 점검의 dependency-risk-review는 별도로 유지한다.
ESM decoder와 이미지 parser의 호출 방식 변경은 두 개의 재현 가능한 패치로 처리하고,
실제 라이브러리를 사용하는 호환성 테스트 및 웹/네이티브 export를 수행했다.
상세 내용과 잔여 위험은 [dependency-security.md](./dependency-security.md)에 기록했다.
Expo 44로 역행하는 `audit fix --force`는 적용하지 않았다.
[Vitest 보안 공지](https://github.com/advisories/GHSA-82fw-gwwq-j7x9),
[PostCSS 보안 공지](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp).

## 결제·환불 운영 설정

실제 콘솔 작업은 [iOS 및 Google Play 결제 설정 체크리스트](payment-setup.ko.md)를 따라 진행한다. 상품 ID, 플랫폼별 키, 환불 알림, 테스트 결과 기록란을 포함한다.

1. App Store Connect에 **비소모성** 상품, Play Console에 **소비하지 않는 일회성** 상품을
   만든다. RevenueCat entitlement `ssak_plus`에 양쪽 상품을 연결하고 current offering의
   lifetime package에 넣는다. 구독 상품으로 등록하지 않는다.
2. Apple/Google의 공개 SDK 키를 `.env.local` 또는 EAS 빌드 환경에 넣는다. 비밀 키는
   앱 환경변수에 넣지 않는다. 앱에는 스토어의 `priceString`을 그대로 표시한다.
3. Apple App Store Server Notifications V2의 운영/샌드박스 URL을 RevenueCat에 연결하고
   테스트 이벤트 수신을 확인한다. 비구독 환불 감지에 이 설정이 필요하다.
   Google의 서비스 계정·실시간 개발자 알림도 구성하고 수신을 확인한다.
   [RevenueCat 환불 안내](https://www.revenuecat.com/docs/subscription-guidance/refunds).
4. 양 스토어에서 성공/취소/결제 대기/오프라인/복원/재설치/환불을 실제 테스트한다.
   환불 후 기록이 남는지, Plus가 해제되는지, 한 습관만 기록되는지 확인한다.
   SDK 캐시와 오프라인 상태 때문에 즉시 차단을 보장하지 않는다.
5. 환불을 일괄 거절하거나 임의의 국가 공통 환불 기간을 만들지 않는다. 스토어 규정과
   현지 소비자 권리를 따르고 승인 여부/사유는 주문별로 처리한다.
   [Apple](https://support.apple.com/en-us/118223),
   [Google Play](https://support.google.com/googleplay/answer/2479637?hl=en).
6. 매월 국가/상품별 정산액·환불액·스토어/SDK 수수료·지원 시간을 기록한다. 기존 가격안은
   `mobile-review.md`의 검증 가설이며 실제 판매 가격이 아니다.

## 개인정보 및 스토어 제출

- `EXPO_PUBLIC_OPERATOR_NAME`, `EXPO_PUBLIC_SUPPORT_EMAIL`, `EXPO_PUBLIC_SITE_URL` 입력 후
  `npm run legal:build`. 운영자/국가별 필수 고지·국외 처리·보유기간·문의 처리 방침을
  실제 사업 형태에 맞춰 확정한 뒤 공개 HTTPS 주소에 게시한다. 초안만으로 준법 완료라고
  간주하지 않는다. 국내/일본/대만 등 판매자 고지 의무 적용 여부도 운영자 정보가 있어야 판단 가능하다.
- Apple App Privacy를 “수집 없음”으로 기입하지 않는다. RevenueCat 공식 안내상 구매 내역에
  앱 기능과 분석 목적을 표시해야 한다. 익명 식별자만 쓰고 개인과 연결하지 않는 현재 구성은
  해당 조건을 재확인해 작성한다. 광고 추적은 사용하지 않는다.
  [RevenueCat App Privacy 안내](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy).
- Google Data Safety도 최종 SDK 구성/익명 식별자/구매 내역 및 서비스 제공자 처리에 맞춰
  작성한다. 문의 이메일에 이용자가 직접 보낸 데이터의 보유·삭제 절차도 정한다.
- App Store/Play 판매 계약·세금·정산계좌, 개인정보/지원 URL, 연령 등급, 콘텐츠/광고 선언,
  수출규제 문항, 판매 국가를 확인한다. 계정을 만들지 않으므로 계정 삭제 메뉴는 해당 없음.
- [Apple iOS 26 SDK 요건](https://developer.apple.com/news/upcoming-requirements/?id=04282026a),
  [Google target SDK 요건](https://developer.android.com/google/play/requirements/target-sdk).
  현재 RN Android 기본값은 target/compile 36. 최종 AAB manifest로 다시 확인한다.
  [Expo SDK 54 기본 EAS 이미지가 Xcode 26을 사용](https://expo.dev/blog/app-store-connect-minimum-sdk-26)하지만
  실제 빌드 로그에서도 확인해야 한다.
- 새 개인 Play 계정이라면 12명/14일 비공개 테스트 요건의 적용 여부 확인.
  [Google 안내](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB).

## 이어서 실행할 순서

1. 사용자가 이 PC에서 `eas login` 실행. 비밀번호를 대화에 전달하지 않는다.
2. 운영자 공개 정보와 스토어/RevenueCat 설정 입력. 빌드 번호 중복 여부 확인.
3. `eas build --platform android --profile preview-device`,
   `eas build --platform ios --profile preview-device`로 설치 파일 준비.
   iOS 내부 배포는 등록된 테스트 기기가 필요하다. 스토어 결제 검증은 적절한
   TestFlight/Play internal testing 빌드로 별도 진행한다.
4. release-qa.md의 N-01~07 및 환불/재부팅/시간대 시나리오를 실제 기기로 실행.
   iOS/Android에서 화면 캡처 후 `STORE_NATIVE_CAPTURES`로 제출 이미지를 교체한다.
5. 검증한 항목을 `artifacts/release-evidence.json`에 아래 형식으로 기록한다.
   항목 목록은 `npm run release:check`에서 볼 수 있다. 테스트 기기/OS/빌드 번호,
   영상·로그·콘솔 확인 결과를 evidence에 남기고 실제 완료한 것만 passed로 표시한다.

```json
{
  "ios-device-flow": {
    "status": "pending",
    "evidence": "실기기 검증 전. 기기/OS/빌드/날짜와 결과를 여기에 기록"
  }
}
```

6. `npm run release:check` 통과와 증거 검토 후 내부 테스트 → 소규모 공개 출시.
   이 스크립트는 수동 증거의 존재를 점검하며 증거 자체를 검증하는 서비스가 아니다.
   현재 스토어 업로드·공개 출시·Git 커밋/푸시는 하지 않았다.
