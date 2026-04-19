# Play Store Assets

Google Play Console에 업로드할 이미지 에셋을 관리하는 폴더.

## 자동 생성 (권장)

```bash
npm run capture-play-assets
```

한 번에 생성됨:
- `feature-graphic.png` (1024×500)
- `screenshots/0X_*.png` (1080×2160, 1:2 비율)

내부적으로 Puppeteer + sharp 사용. HTML 템플릿 수정 시 다시 실행하면 PNG 재생성.

## 수동 생성 방법

### 1. 피처 그래픽 (1024×500, 필수)

버전:
- `feature-graphic.html` — **v1**. SVG로 새싹 아이콘을 임의로 그린 버전. 실제 앱 아이콘과 디자인이 다름 (참고용 보관)
- `feature-graphic-v2.html` — **v2 (권장)**. `assets/icon.png` 실제 아이콘을 그대로 임베드. 브랜드 일관성 확보

**방법 A — Chrome 수동 캡처 (가장 빠름, 1분)**
1. Chrome에서 `feature-graphic-v2.html` 열기
2. F12 → Device Toolbar(Ctrl+Shift+M) → "Responsive" 선택
3. 크기 입력: **1024 × 500**
4. DeviceMode 메뉴(⋮) → **Capture screenshot**
5. 다운로드된 PNG를 `feature-graphic.png`로 저장

**방법 B — Puppeteer 자동 캡처**
```bash
npx puppeteer --version  # 미설치 시: npm i -D puppeteer
```
(전용 스크립트는 요청 시 추가)

### 2. 앱 아이콘 (512×512, 필수)

`assets/icon.png` (1024×1024 예상) 을 512×512로 리사이즈:
- [Squoosh](https://squoosh.app/) 에 드래그 → Resize → 512×512 → Export PNG

### 3. 스크린샷 (1080×1920, 2~8장)

`docs/play-assets/screenshots-spec.md` 참조.

## 업로드 전 체크리스트

- [ ] 피처 그래픽: 정확히 1024×500 PNG
- [ ] 아이콘: 정확히 512×512 PNG, 알파 채널 없음
- [ ] 스크린샷: 최소 2장, 짧은 변:긴 변 비율 ≤ 2:1
- [ ] 모든 이미지에 앱 외부 브랜딩(Apple, iOS 로고 등) 없음
- [ ] 가격·"무료" 등 프로모션 문구 없음 (Play Store 정책)
