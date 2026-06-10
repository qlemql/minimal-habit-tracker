# 싹: 세 가지 습관

[English](README.md) · **한국어**

> 딱 3개 습관. 5초면 끝. 하루 쉬어도 흐름은 이어져요.
> *많으면 지치고, 적으면 지켜져요.*

📱 **App Store** (iOS) 다운로드 · **Google Play** 출시 준비 중

---

## 왜 만들었나요?

대부분의 습관 앱은 같은 방식으로 실패합니다. 무제한으로 습관을 추가하게 하고, 완벽한 연속 기록을 요구하고, 하루만 빠뜨려도 0으로 리셋합니다. 결국 앱 자체를 안 열게 되고 — 습관을 만들어주려던 앱이 가장 먼저 포기되는 앱이 됩니다.

싹은 반대로 갑니다. **딱 3개 습관. 하루 빠지면 쉼표일 뿐, 마침표가 아닙니다. 모든 입력은 5초 안에 끝.**

## 모든 것을 결정하는 두 가지 설계 원칙

### 1. 3개 제한은 제약이 아니라 기능입니다

행동 연구는 일관됩니다. 한 번에 여러 습관을 만들려는 사람은 결국 아무것도 만들지 못합니다. 하드 제한은 질문을 강제합니다 — *정말 중요한 3개가 무엇인가?* 네 번째를 추가하려면 기존 습관을 하나 빼야 합니다.

이제는 홈 화면에서도 빈 슬롯이 보입니다 — 4번째를 추가하려 할 때만 알게 되는 게 아니라, 매일 시각적으로 인지됩니다.

### 2. 이어가는 흐름 (Forgiving Flow)

일반적인 스트릭 로직은 하루 빠지면 카운터가 0으로 리셋됩니다. 그 심리적 효과는 잘 알려져 있습니다 — 하루 빠진 것이 완전한 포기로 이어집니다.

싹에서는 하루 빠진 것이 **흐름 안의 쉼표**입니다. 이틀 연속 빠지면 새로운 흐름이 시작됩니다. 이는 습관 형성에 대한 행동 연구가 실제로 말하는 것과 일치합니다 — 하루 정도의 공백은 장기적 결과에 거의 영향이 없지만, 리셋의 처벌은 습관 자체를 죽일 만큼 가혹합니다.

```
● ● ◌ ● ● ●
● = 완료    ◌ = 쉼표 (흐름 유지)
```

> 쉼표가 있어도 문장은 이어지니까요.

## 주요 기능

**핵심**

- 3개 습관 제한 — 의도적 설계 (홈에서 빈 슬롯도 시각적으로 노출)
- 원탭 체크인 (열고 → 탭하고 → 닫기)
- 이어가는 흐름 시스템
- 카드 길게 누르면 이름·아이콘·알림 수정
- 꽃이 핀 습관 졸업 — 7일(떡잎)부터 조기 졸업, 50일 자동 제안
- 졸업한 정원 + 통계 화면

**똑똑한 알림**

- 습관별 알림 + 스마트 기본 시간 제안
- 오늘 이미 완료했으면? 알림이 안 와요 (완료 시점에 그날 알림만 취소)
- 일주일 동안 앱을 안 열면? "다시 이어가볼까요?" 알림으로 부드럽게 복귀 유도
- 잠금화면 알림 액션 — 알림 길게 눌러 *완료* 탭 (잠금 그대로 유지)

**네이티브 위젯**

- iOS 잠금 화면 위젯 3종: 시계 위 한 줄, 진행률 링, 도트 + 카운트
- iOS 홈 화면 위젯 (small / medium)
- Android 홈 화면 위젯 (Kotlin RemoteViews, tap-to-check 큐 동기화)

**디테일**

- 성장 단계 애니메이션: 씨앗 → 발아 → 떡잎 → 줄기 → 꽃봉오리 → 개화
- 라이트(크림) / 다크 모드
- 해금 시스템: 흐름이 자라면 새 아이콘과 색상이 열림
- 한국어 / 영어 (위젯·알림 포함 시스템 레벨 분기)

**프라이버시**

- 모든 데이터는 기기에만 저장
- 서버 없음. 계정 없음. 추적 없음.

## 기술적으로 흥미로운 부분

**Expo 앱에서의 iOS 위젯**은 간단하지 않습니다 — Expo는 위젯 익스텐션을 기본 지원하지 않거든요. [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets)와 세 개의 커스텀 config 플러그인으로 해결:

- `plugins/withSharedDefaults.js` — Swift 타겟 + App Group entitlement 주입
- `plugins/withAndroidWidget.js` — Kotlin AppWidgetProvider를 prebuild 시 등록
- `plugins/withAppNameI18n.js` — Android `values-en/strings.xml` 자동 생성 + Expo prebuild가 iOS `expo.locales`를 Android 리소스로 잘못 leak하는 이슈 정리 (그대로 두면 release lint `ExtraTranslation` fatal)

**네이티브 ↔ JS 동기화**는 iOS App Group `UserDefaults`와 Android `SharedPreferences`로 처리 — 위젯이 IPC 없이 상태 변화를 즉시 반영합니다.

**알림 시스템 v2** — 매일 반복되는 DAILY trigger 대신, 다음 7일치 single-shot calendar 알림 + 마지막 알림 다음날 reactivation 알람을 미리 등록합니다. 사용자가 완료하면 그 습관의 오늘 알림만 취소(내일 이후는 유지). 앱을 열 때마다 큐를 채워 넣고, reactivation 탭으로 들어오면 다시 7일치를 새로 채웁니다. 트레이드오프는 bookkeeping이지만, 백그라운드에서 알림이 발사되는 시점에 JS handler를 호출할 수 없는 expo-notifications의 한계를 우회합니다.

**`react-native-reanimated` 4 worklets**로 전환 애니메이션이 UI 스레드에서 실행되어, 구형 기기에서도 60fps를 유지합니다.

## 릴리즈 히스토리

| 버전 | 출시일 | 핵심 변경 |
|------|--------|----------|
| 1.2.0 | 예정 | 빈 슬롯 가시화, 똑똑한 알림(완료 시 그날 패스 + reactivation), Android 다듬기 |
| 1.1.1 | 2026-05-26 | HabitCard 리디자인(체크박스 제거, 아이콘 강조), 졸업 자격 longestFlow 기준, 시간 선택 UX |
| 1.1.0 | 2026-05-19 | 영어 지원, 졸업 시스템, 통계 화면, 앱명 *싹: 세 가지 습관*으로 변경 |
| 1.0.3 | 2026-04-28 | 잠금 화면 위젯 3종 추가 |
| 1.0.2 | 2026-04-27 | 싹 성장 단계, 브랜드 정렬 축하 화면 |
| 1.0.1 | 2026-04-19 | 온보딩 알람 설정, 습관 프리셋 단순화 |
| 1.0.0 | 2026-04-12 | 정식 출시 |

## 기술 스택

`React Native 0.81` · `Expo SDK 54` (New Architecture) · `TypeScript` · `Zustand` · `AsyncStorage` · `Expo Router` · `Reanimated 4` · `i18next` + `react-i18next` · `expo-notifications` · `@bacons/apple-targets` (iOS 위젯) · `Kotlin` (Android 위젯) · `EAS Build`

## 프로젝트 구조

```
app/                          Expo Router 화면 (index, add, edit, settings, stats, onboarding)
src/
├── components/               UI 프리미티브 및 습관 카드
├── store/                    Zustand 스토어 (habit, reward, settings, theme, onboarding)
├── utils/                    흐름 계산, 알림, 위젯 데이터 동기화, 날짜
├── i18n/                     i18next 설정 + ko/en 로케일
├── types/                    공유 TypeScript 타입
└── constants/                테마 토큰, 성장 단계, 보상, 기본 습관
modules/
└── shared-defaults/          네이티브 모듈 — iOS UserDefaults + Android SharedPreferences 브릿지
plugins/
├── withSharedDefaults.js     iOS App Group + 모듈 주입
├── withAndroidWidget.js      Android 위젯 provider 등록
└── withAppNameI18n.js        Android values-en + iOS locale leak 정리
targets/
├── HabitWidget/              Swift WidgetKit 타겟 (system + accessory family)
└── HabitWidgetAndroid/       Kotlin AppWidgetProvider + RemoteViews layouts
```

---

주된 개발 환경은 Claude Code입니다.
작성자: [Hyun (qlemql)](https://github.com/qlemql) · taehyun_fe@naver.com
[개인정보처리방침](https://ssak-habit-tracker.pages.dev/privacy-policy.html) · [이용약관](https://ssak-habit-tracker.pages.dev/terms-of-service.html)
