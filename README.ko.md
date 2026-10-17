# 싹 - 습관 트래커

[English](README.md) · **한국어**

> 내 생활에 맞는 습관.
> 바쁜 날에는 미리 정해둔 만큼만 해도 좋아요. 그것도 기록에 남아요.

📱 **v2.0** — App Store 업데이트 심사 중 · Google Play 준비 중
🌐 [ssak-habit-tracker.pages.dev/ko](https://ssak-habit-tracker.pages.dev/ko/) · Instagram [@ssak.app](https://www.instagram.com/ssak.app/)

---

## 왜 만들었나

습관은 마음이 식어서보다 바쁜 날에 끊기는 경우가 많습니다. "책 10분 읽기"로 정해뒀는데 시간이 없던 날, 연속 기록이 끊기고 앱을 여는 게 실패를 확인하는 일이 됩니다.

싹 1.x는 습관을 최대 3개로 제한하고, 하루 쉬어도 흐름이 이어지는 방식으로 이 문제에 답했습니다. 2.0은 한 걸음 더 나아갑니다. 이전에 시도한 습관이 생활에 맞지 않았던 사람이 다시 시작하도록 돕는, 조용하고 기기 중심인 도구입니다. 바쁜 날이 오기 전에 바쁜 날의 계획을 미리 정해둡니다.

## 설계 결정

### 1. 모든 습관에 바쁜 날 할 일이 있다

계획을 만들 때 세 가지를 정합니다. *무엇을 할까요? 무엇을 한 뒤에 할까요? 바쁜 날에는 얼마나 할까요?*

```
책 10분 읽기          ← 평소 계획
책 한 페이지만 읽기    ← 바쁜 날
```

오늘 화면에서 실제로 한 것을 누릅니다. 둘 다 기록됩니다. 조금만 한 날도 기록에 남아요.

### 2. 완벽한 연속 기록 대신 이번 주 계획

일주일에 며칠이 적당한지(3·5·7일) 고릅니다. 진행은 이번 주에 한 날 수로 보여줍니다(`4 / 5일`). 하루 빠져도 그 주가 사라지지 않습니다. 하루 쉬었어도 다시 시작하면 됩니다.

### 3. 계획을 돌아보고, 준비되면 기록을 마친다

계획을 지키기 어려웠다면 앱이 계획 돌아보기를 제안합니다. 그대로 이어가거나, 바쁜 날 할 일을 더 쉽게 바꾸거나, 다시 시작할 수 있습니다. 매일 체크하지 않아도 된다면 기록을 마칠 수 있습니다. 그동안의 기록은 남고, 원하면 언제든 다시 기록할 수 있습니다.

### 4. 습관 하나는 계속 무료

습관 하나는 기간 제한 없이 무료입니다. **Ssak Plus**는 습관 최대 3개 동시 기록과 백업·복원을 제공하는 일회성 구매입니다. 구독, 광고, 계정이 없습니다.

## 기능

**습관**
- 18가지 기본 아이디어로 시작하거나 직접 만드는 계획 편집기
- 평소 계획이나 바쁜 날 할 일을 한 번에 기록
- 주 3·5·7일 계획
- 계획 돌아보기 제안, 기록 마치기와 다시 시작(기록 보존)
- 빈 상태에서만 보여주는 예시 모드(예시라고 표시)

**알림**
- 습관별 알림 시간. 권한 요청은 계획 편집기에서만
- 이미 기록한 날에는 알림 없음
- 알림에서 바로 *완료* 처리(해당 날짜에만 적용)

**위젯**
- iOS 홈 화면 위젯(소형·중형)과 잠금 화면 위젯
- Android 홈 화면 위젯
- 기록 중인 습관 개수에 맞춰 바뀌는 구성

**백업**
- 백업 파일 내보내기·불러오기, 텍스트로 복사(Plus)
- 기기의 기록을 바꾸기 전에 백업을 검증

**언어**
- 영어, 한국어, 일본어, 번체중국어(대만). 기기 언어를 따름

**개인정보**
- 습관 기록은 기기에 저장됩니다. 싹 서버는 없고 자동 동기화도 없습니다.
- 결제는 App Store 또는 Google Play가 처리하고, RevenueCat이 익명 앱 식별자로 구매를 확인합니다. 습관 이름과 메모는 보내지 않습니다.
- [개인정보처리방침](https://ssak-habit-tracker.pages.dev/ko/privacy/) · [이용약관](https://ssak-habit-tracker.pages.dev/ko/terms/) · [지원](https://ssak-habit-tracker.pages.dev/ko/support/)

## 기술적으로 흥미로운 부분

**같은 React Native 앱을 웹에서도.** 앱의 Expo 웹 빌드로 검토하고 Playwright E2E 테스트를 돌립니다. 홍보용 릴스도 여기서 녹화합니다. 알림, 위젯, 결제처럼 네이티브에서만 되는 동작은 실기기 확인이 따로 필요합니다.

**기록을 잃지 않는 데이터 이전.** 저장소 `habit-store`는 버전이 있습니다(스키마 3). 이전 과정에서 기존 습관과 기록을 보존하고, 1.x 데이터를 새 모델로 옮기고, 예전 체험 기간 방식의 권한은 제거합니다.

**결제를 흉내 내지 않는 구조.** RevenueCat에서 현재 평생 이용 상품을 읽어 실제 스토어 가격을 보여주고, 구매·복원하고, `ssak_plus` 권한을 확인합니다. SDK 키나 상품이 없으면 구매를 성공한 척하지 않고 비활성화합니다. 백업 파일로는 Plus를 얻을 수 없습니다.

**캘린더 큐 방식의 알림.** 반복 트리거 대신 앞으로 7일 동안의 날짜별 단일 알림을 예약합니다. 기록한 날은 건너뛰고, 습관별로 변경을 순서대로 처리하고, 앱으로 돌아올 때 7일 창을 다시 채웁니다. 알림의 *완료* 동작은 여러 번 눌러도 결과가 같고, 해당 날짜에만 적용됩니다.

**Expo 앱의 iOS·Android 위젯.** [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets)와 직접 만든 config plugin으로 구현했습니다.
- `plugins/withSharedDefaults.js` — Swift 위젯 타깃과 App Group 권한
- `plugins/withAndroidWidget.js` — prebuild 때 Kotlin AppWidgetProvider 등록
- `plugins/withAppNameI18n.js` — Android 앱 이름 현지화, Expo prebuild의 로케일 누수 정리
- `plugins/withWindowsCmakePaths.js` — 네이티브 빌드 경로를 Windows MAX_PATH 제한 안으로 유지

위젯은 App Group `UserDefaults`(iOS)와 `SharedPreferences`(Android)로 상태를 공유합니다.

**네 언어, 하나의 키.** 모든 UI 사전은 같은 키로 타입 검사합니다. 사용자가 쓴 습관 문구는 번역하지 않습니다.

## 개발

```bash
npm ci
npm run typecheck
npm run test:run      # Vitest 단위 테스트
npm run build         # Expo 웹 빌드 → dist/
npm run preview       # http://127.0.0.1:4173 에서 dist/ 제공
npm run test:e2e      # preview 대상 Playwright
```

네이티브 결제에는 플랫폼별 RevenueCat **공개** SDK 키를 `.env.local`에 넣어야 합니다(`.env.example` 참고). 비밀 키는 커밋하지 않습니다. 구현 기록과 출시 점검은 [docs/renewal-cycle.md](docs/renewal-cycle.md), [docs/renewal-native-followup.md](docs/renewal-native-followup.md)에 있습니다.

## 출시 이력

| 버전 | 출시 | 주요 변경 |
|------|------|-----------|
| 2.0.0 | 심사 중 (2026-10) | 리뉴얼: 바쁜 날 할 일, 이번 주 계획, 계획 돌아보기와 기록 마치기, 습관 1개 무료 + 일회성 Plus, 백업, 4개 언어, 위젯 재설계 |
| 1.2.0 | — | 빈 슬롯 표시, 똑똑한 알림(완료한 날 생략 + 재활성화), Android 개선 |
| 1.1.1 | 2026-05-26 | 습관 카드 재디자인, 최장 흐름 기준 졸업 조건, 시간 선택 UX |
| 1.1.0 | 2026-05-19 | 영어 지원, 졸업 시스템, 통계 화면, 브랜드명 *Ssak: Three Habits* |
| 1.0.3 | 2026-04-28 | 잠금 화면 위젯(3종) |
| 1.0.2 | 2026-04-27 | 성장 단계, 브랜드에 맞춘 축하 연출 |
| 1.0.1 | 2026-04-19 | 온보딩 알림 설정, 습관 프리셋 단순화 |
| 1.0.0 | 2026-04-12 | 정식 출시 |

## 기술 스택

`React Native 0.81` · `Expo SDK 54` (New Architecture) · `TypeScript` · `Expo Router` · `Zustand` + `AsyncStorage` · `Reanimated 4` · `expo-notifications` · `RevenueCat` (`react-native-purchases`) · `@bacons/apple-targets` (iOS 위젯) · `Kotlin` (Android 위젯) · `Vitest` · `Playwright` · `EAS Build`

## 프로젝트 구조

```
app/                     Expo Router 경로 (오늘, 편집기, 내 습관, 설정, Plus, 약관)
src/
├── renewal/             2.0 화면과 로직: Today, Editor, Journey, Settings,
│                        도메인 규칙, 문구(4개 언어), 아이디어, 결제, 백업
├── store/               Zustand 저장소 (habit-store 스키마 v3, Plus 권한)
├── billing/             RevenueCat 서비스와 타입
├── utils/               알림, 위젯 데이터 동기화, 날짜
└── components/, constants/, i18n/   공용 UI, 테마 토큰, i18n 설정
modules/shared-defaults/ 네이티브 모듈 — iOS UserDefaults + Android SharedPreferences 브리지
plugins/                 Expo config plugin (위젯, 앱 이름 i18n, Windows 경로)
targets/
├── HabitWidget/         Swift WidgetKit 타깃 (홈 + 잠금 화면)
└── HabitWidgetAndroid/  Kotlin AppWidgetProvider + RemoteViews 레이아웃
tests/                   Vitest 단위 테스트, tests/e2e Playwright 시나리오
scripts/                 웹 미리보기, 스토어 이미지, 약관·랜딩 사이트 생성
docs/                    제품 결정, 출시 기록, 랜딩·정책 페이지
```

---

주 개발 환경은 Claude Code입니다.
만든 사람: [Hyun (qlemql)](https://github.com/qlemql) · taehyun_fe@naver.com
