# Android 스크린샷 재생성 가이드

## 현재 상태 점검 결과

| 파일 | 해상도 | 비율 | Play Store 적합 여부 |
|------|--------|------|---------------------|
| `assets/screenshots/final/01~06_*.png` | 1242×2688 | 2.164:1 | ❌ (최대 2:1 초과) |
| `assets/screenshots/screenshot_1~5.png` | 1290×2796 | 2.167:1 | ❌ (최대 2:1 초과) |
| `assets/screenshots/01_main.png` | 1206×2622 | 2.174:1 | ❌ (최대 2:1 초과) |
| `assets/screenshots/main-screen.png` | 1206×2228 | 1.848:1 | ✅ |

**결론**: 기존 스크린샷은 모두 iOS 디바이스 비율(iPhone 15 Pro Max 등)로 만들어져 있어 대부분 반려됩니다. Android 규격으로 재생성 필요.

## Play Store 요구사항

| 항목 | 사양 |
|------|------|
| 최소 해상도 | 각 변 320px 이상 |
| 최대 해상도 | 각 변 3840px 이하 |
| 비율 | **짧은 변 : 긴 변 = 최소 1:1, 최대 2:1** (현재 초과) |
| 장수 | 2~8장 (권장 4~6장) |
| 포맷 | PNG 또는 JPEG |
| 권장 해상도 | **1080×1920** (9:16, 정확히 2:1 경계 안쪽) |

## 재생성 방법 (권장 순서)

### 옵션 A. 기존 HTML 재캡처 (10분, 권장)
1. `assets/screenshots/final/0X_*.html` 파일을 Chrome으로 열기
2. DevTools (F12) → Device Toolbar (Ctrl+Shift+M)
3. 커스텀 사이즈 **1080 × 1920** 입력
4. Chrome 메뉴 → "페이지 캡처" → 전체 페이지 스크린샷
5. `docs/play-assets/screenshots/0X_*.png`에 저장

### 옵션 B. Puppeteer 자동 캡처
```bash
npm i -D puppeteer
node scripts/capture-play-screenshots.js
```
(스크립트 필요 시 요청 — 6장 자동 캡처됨)

### 옵션 C. 실기기 스크린샷
- Android 폰에서 앱 실행 후 캡처
- 대부분 기기가 1080×2400 이상 → 크롭하여 1080×1920 또는 1080×2160(1:2)로 조정

## 스크린샷 구성 (동일 유지)

1. **메인 화면** — 3개 습관 + "딱 3개만, 작은 습관을 심어보세요"
2. **원탭 체크** — 체크 인터랙션 + "5초면 끝"
3. **이어가기** — 주간 캘린더 + "하루 쉬어도 괜찮아요"
4. **축하** — 컨페티 + "오늘의 습관, 모두 자랐어요!"
5. **해금** — 잠긴 아이콘 + "꾸준히 키우면 보상이 와요"
6. **위젯** — 홈 화면 위젯 + "홈에서 바로 확인"

## 저장 경로 규칙

최종 Play Store 업로드용 에셋은 모두 `docs/play-assets/` 아래:
```
docs/play-assets/
├── feature-graphic.png     (1024×500)
├── icon-512.png            (512×512, assets/icon.png 리사이즈)
└── screenshots/
    ├── 01_main.png         (1080×1920)
    ├── 02_check.png
    ├── 03_flow.png
    ├── 04_celebrate.png
    ├── 05_unlock.png
    └── 06_widget.png
```
