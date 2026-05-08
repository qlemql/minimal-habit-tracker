# i18n 작업계획서 — 영어 추가 + 글로벌 진출

> 작성: 2026-05-08
> 트리거: Android 정식 출시 결정 + 글로벌 채널 홍보 결정 (2026-05-08)
> 영문 브랜드: **Ssak: Three Habits**

---

## 0. 정책 변경 사실 (헌법/로드맵)

기존 `phase4-plan.md`에 명시된 두 정책이 **무효화**됨.

| 기존 정책 | 변경 |
|----------|------|
| "i18n은 헌법 범위 밖, 충족 전 글로벌 런칭 금지" | 정식 작업 항목으로 편입 |
| "Product Hunt / 글로벌 채널은 v1.x 로드맵 전면 제외" | v1.2 출시 시 포함 |

→ `phase4-plan.md` 갱신은 별도 태스크 (#28).

헌법 룰 4("로드맵에 없는 기능은 논의하지 않는다")에 위배되지 않도록 **이 작업계획서가 새 마일스톤 v1.2의 공식 범위**가 됨. 이 외 추가 기능은 금지.

---

## 1. 마일스톤 정의

### v1.2 (단일 통합 마일스톤) — 결정 2026-05-08
- 자정 동기화 + 잠금화면 알림 체크 (이미 코드 완료)
- 영어 i18n 전면 적용
- 앱 표시명 변경: `싹: 세 가지 습관` / `Ssak: Three Habits`
- iOS 1.2.0 + Android 1.0.0 동시 출시
- 글로벌 + 한국 채널 동시 홍보
- v1.1은 발행하지 않음 (i18n 완료 시점까지 자정/잠금화면 기능 출시 보류 결정)

---

## 2. 작업 범위

### 인앱 텍스트
- [ ] 모든 화면 UI (`app/`, `src/screens/`, `src/components/`)
- [ ] 온보딩 4단계 (`app/onboarding/`)
- [ ] 빈 상태 / 에러 메시지
- [ ] 알림 본문 + 카테고리 액션 ("완료" → "Done")
- [ ] 축하 오버레이 / 해금 토스트 카피
- [ ] 설정 화면 모든 항목
- [ ] "쉼표" / "이어가기" / "흐름" 등 브랜드 용어 영문 표기 결정

### 위젯
- [ ] iOS WidgetExtension `Localizable.strings` (ko / en)
- [ ] Android `res/values/strings.xml` + `res/values-en/strings.xml`
- [ ] 한국어 의존 포맷 (예: "5월 8일 목요일") → `LocalizedDate` 분기

### 앱 외부
- [ ] App Store / Play Store 메타데이터 영문판 (`docs/store-metadata.md`)
- [ ] 영문 스크린샷 6장 (en locale로 빌드 후 시뮬레이터 캡처)
- [ ] Privacy / Terms 영문판 + Cloudflare Pages `/en/` 호스팅
- [ ] App Store Connect의 Localizations에 English 추가
- [ ] `CFBundleLocalizations: ["ko"]` → `["ko", "en"]`

---

## 3. 기술 스택 결정

### 라이브러리
**채택: `i18next` + `react-i18next` + `expo-localization`**

근거:
- React Native 표준, Expo 관리형에서 동작 검증됨
- 키-값 분리, 보간/복수형 지원, lazy loading 가능
- 위젯/네이티브는 별도 (Localizable.strings, strings.xml) — 라이브러리 선택과 무관

대안 비교:
- `expo-localization` 단독: 번역 키 관리 기능 없음, 직접 매핑 필요 → 규모상 비효율
- `react-intl`: ICU 메시지 포맷 강력하나 학습 곡선 + 번들 크기 큼 → 과잉

### 디렉토리 구조
```
src/
  i18n/
    index.ts          # i18next 설정 + 디바이스 로케일 감지
    locales/
      ko.json         # 기존 한국어 마이그레이션
      en.json         # 영문 번역
```

### 키 네이밍
- 도메인 기반 계층화: `onboarding.welcome.title`, `settings.notifications.lockScreenToggle`
- 평탄 키 금지 (관리 어려움)

---

## 4. 단계별 진행

### Phase A — 인프라 (1일)
1. 라이브러리 설치 + `src/i18n/index.ts` 설정
2. 디바이스 로케일 감지 + 폴백 (default: ko, fallback: en)
3. `t()` 헬퍼 export

### Phase B — 한국어 마이그레이션 (2~3일)
1. 코드베이스 grep으로 한국어 문자열 인벤토리 작성 (`docs/i18n-inventory.md`)
2. `src/i18n/locales/ko.json` 일괄 마이그레이션 — 화면 단위로 PR 분리
3. 마이그레이션 후 시각적 회귀 없는지 확인

### Phase C — 영문 번역 (2~3일)
1. 브랜드 용어집 확정 (`docs/glossary.md` — 4번 항목 참고)
2. ko.json 키 → en.json 번역
3. 영어권 메이커 검수 1회 (선택, 가능하면 reddit r/getdisciplined에 비공개 피드백)

### Phase D — 위젯 / 알림 (1~2일)
1. iOS Localizable.strings 추가 + Swift 코드의 한국어 하드코딩 제거
2. Android strings.xml + values-en/ 분리 + Kotlin 하드코딩 제거
3. expo-notifications 카테고리 액션 텍스트 i18n

### Phase E — 메타데이터 / 자산 (1~2일)
1. store-metadata.md 영문 섹션 갱신 (브랜드 "Ssak: Three Habits" 반영)
2. en locale 빌드 → 시뮬레이터 스크린샷 6장
3. Privacy / Terms 영문판 작성 + 호스팅
4. App Store Connect / Play Console에 영문 메타데이터 등록

### Phase F — 검증 + 출시 (1일)
1. en/ko 양쪽 시뮬레이터 검증
2. v1.2 빌드 → 심사 제출 (iOS) / 내부 테스트 (Android)
3. 심사 통과 후 양 플랫폼 동시 출시 + 홍보

**총 예상 기간: 8~12일 (2주 이내).** 사업자등록 + Google Play 사업자 계정 활성화 기간(1~2주)과 병렬.

---

## 5. 브랜드 / 카피 결정사항 (사용자 결정 필요)

### 브랜드 용어 영문 매핑 — 초안

| 한국어 | 영문 후보 | 비고 |
|--------|----------|------|
| 싹 | **Ssak** | 음역 유지, 브랜드 정체성 핵심 |
| 흐름 | **Flow** | 직관적 |
| 쉼표 | **Pause** / **Comma** | 'Comma' 직역은 어색, 'Pause' 추천 |
| 이어가기 | **Keep going** / **Continue flow** | 톤에 따라 결정 |
| 작은 습관이 자라는 곳 | **Where small habits grow** | 이미 store-metadata.md에 사용 중 |
| 딱 3개 | **Just 3** / **Only 3** | 이미 "Just 3 habits" 사용 중 |
| 발아 / 떡잎 / 줄기 / 꽃봉오리 / 개화 | Sprout / Leaf / Stem / Bud / Bloom | 이모지(🌱🌿🎋🌷🌸)와 매칭 |
| 씨앗 | **Seed** | 🌰 |

### 한국어 스토어 표시명 (확정 2026-05-08)
- 한국: `싹: 세 가지 습관`
- 영어: `Ssak: Three Habits`
- 디바이스 로케일에 따라 자연 분기 (CFBundleDisplayName / strings.xml app_name)

### 도메인 (확정 2026-05-08)
- 출시까지 기존 호스팅 유지 (`ssak-habit-tracker.pages.dev`)
- 출시 후 반응 보고 도메인 등록 검토 (`ssak.co` 사용 가능)

---

## 6. 리스크 / 주의사항

- **위젯 i18n은 RN 라이브러리와 별개**: WidgetKit 익스텐션과 Android AppWidgetProvider는 RN 코드 밖이라 i18next가 안 닿음. 네이티브 리소스로 직접 처리 필요. 누락 시 한국어가 영문 디바이스에 그대로 노출됨 — 첫 인상 손실.
- **알림 카테고리 액션 텍스트는 OS 언어 기반 캐싱**: 디바이스 언어 바꿔도 즉시 반영 안 됨. 앱 재설치 또는 카테고리 재등록 필요. 출시 전 검증 필수.
- **App Store 심사 시 영문 메타데이터 + 영문 스크린샷 동시 등록 필수**: 한쪽만 영문이면 거부 가능.
- **이어가기 시스템 카피 톤**: "하루 쉬어도 괜찮아요"의 따뜻함이 영어로 옮길 때 sterile해지기 쉬움. 카피 작성 시 따뜻한 톤 유지.

---

## 7. 본 작업이 끝나면 갱신할 문서

- `phase4-plan.md` — 글로벌 정책 변경, 새 v1.1/v1.2 마일스톤, "Android 대응 v2.0+" → "v1.2"
- `docs/store-metadata.md` — 영문 섹션 전면 갱신, "Ssak: Three Habits" 반영
- `CLAUDE.md` — 헌법 룰 5(i18n 외부 SaaS 범위) 변경 없음, 룰 9(iOS 우선)는 v1.2부터 양 플랫폼 동시 출시로 정책 전환 명시 검토
