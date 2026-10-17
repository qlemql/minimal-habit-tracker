# Ssak 문구 · 4개 언어 스토어 초안

2026-10-17 갱신. 네 언어 등록정보 저장 완료. iOS는 설명 수정 후 재제출, Google Play는 계정 정보 보완 후 검토 전송 대기. 국가 전체의 말투를 검증한 조사나 원어민 검수 결과는 아니다.

## 문구 원칙

- 자주 쓰는 말로, 읽고 나면 무엇을 할지 알 수 있게 쓴다.
- 버튼에는 행동을, 확인 화면에는 기록 보존·삭제·알림 중단 등 결과를 적는다.
- ‘작은’, ‘나만의’, ‘공간’, ‘여정’ 같은 추상적인 표현을 반복하지 않는다.
- 한국어 구조를 직역하지 않는다. 기록을 마치는 기능은 영어 Stop tracking, 일본어 記録を終了, 대만 번체중국어 停止追蹤으로 설명한다. 이전 기록을 보존하는 동작은 같다.
- 습관 형성 기간이나 성과를 보장하지 않는다. 무료 범위와 구매 조건은 실제 기능과 일치해야 한다.
- 이미 저장된 사용자 습관·메모는 문구 변경으로 수정하지 않는다.

## 참고 조사

공식 제품 소개와 도움말에서 실제 용어 사용을 확인했다. 자료는 표현 선택의 참고이며 우리 문구가 현지 사용자에게 검증됐다는 근거는 아니다. 경쟁사 문장을 그대로 가져오지 않았다.

- 한국어: [토스 UX writer 인터뷰](https://toss.tech/article/1st_uxwriter)의 실용적인 제품 문구와 원칙 운영을 참고했다. [라이팅 원칙](https://toss.tech/article/21022)은 검색 결과에서 모호하지 않고 한 번에 이해되는 표현을 강조하는 부분을 확인했다. 본문 열람은 타임아웃으로 실패했다.
- 영어: [Habitify 시작 안내](https://intercom.help/habitify-app/en/articles/11957562-get-started-with-habitify)의 habit, reminder, tracking, complete 등 기능 용어를 확인했다.
- 일본어: [bondavi 제품 소개](https://bondavi.jp/products/habit)의 続ける·行動のタイミング·通知와 [Apple 일본 도움말](https://support.apple.com/ja-jp/102484)의 설정 용어를 참고했다. 小さなバージョン 대신 忙しい日にやること처럼 상황을 설명한다.
- 대만: [Apple 대만 도움말](https://support.apple.com/zh-tw/102484)의 設定·新增·完成·提醒를 참고했다. 行動契機·小小實踐 대신 什麼時候做·基本目標로 설명한다. 대만 기준이며 홍콩 사용자까지 검증한 것은 아니다.

## 변경 예시

| 이전 | 적용 문구 |
|---|---|
| 부드러운 알림 | 알림 시간 |
| 가장 작은 버전은 무엇인가요? | 바쁜 날에는 얼마나 할까요? |
| 이미 하고 있는 일 다음에… | 무엇을 한 뒤에 할까요? |
| 나의 여정 | 내 습관 |
| 다음 돌아보기부터 이야기가 쌓여요. | 아직 돌아본 기록이 없어요. |
| A little moment… | Loading… |
| Let this habit graduate | Stop tracking this habit |
| 小さなバージョン | 忙しい日にやること |
| 行動契機 | 什麼時候做 |

앱 문구 원본은 src/renewal/copy.ts와 ideas.ts, 이미지 문구는 scripts/store-copy.cjs에 있다. 캡처 스크립트는 앱의 현재 버튼 문구를 읽는다.

## 스토어 소개 초안

아래는 다시 복사할 때 사용할 수정 초안이다. 실제 콘솔의 전체 문구를 내려받아 대조한 사본은 아니다.

10월 16일 Apple이 설명의 Android 언급을 지적했다(2.3.10). 아래 네 언어 설명에서 해당 문장을 제거했다. **App Store Connect의 설명을 각 언어별로 수정하고 저장해야 하며, 콘솔 반영/재제출 완료는 아직 확인하지 않았다.** 업데이트 안내에 같은 언급이 있다면 함께 제거한다. 이 수정으로 플랫폼 간 구매 공유나 자동 동기화를 제공한다고 해석되지 않도록 기기 내 저장 안내를 유지한다.

### English — Ssak: Habit Tracker

Start small. Keep it manageable.

Want to read more, take a walk, or keep a journal? Pick one habit and decide when you’ll do it.

In Ssak, you also choose an easier option for busy days. Read for ten minutes when you can, or just one sentence when you’re short on time. Both can be recorded. If the plan is hard to keep up with, change it.

Once you no longer need daily check-ins, you can stop tracking. Your history stays, and you can start tracking again anytime.

Track one habit at a time for free, with no time limit. Ssak Plus is a one-time purchase for up to three habits at once, backup and restore. No subscription, no ads, and no account required.

Records are stored on your device and don’t sync automatically.

### 한국어 — 싹 - 습관 트래커

할 수 있는 만큼부터 시작해요.

책 읽기, 산책, 일기 쓰기. 평소에 하고 싶었던 일을 하나 골라 언제 할지 정해보세요.

싹에서는 바쁜 날 할 일도 미리 정할 수 있어요. 여유가 있으면 책을 10분 읽고, 시간이 없으면 한 문장만 읽어도 기록할 수 있어요. 해보니 어렵다면 할 일을 줄여보세요.

이제 매일 체크하지 않아도 된다면 기록을 마쳐도 돼요. 이전 기록은 남고, 필요하면 다시 시작할 수 있어요.

습관 하나는 기간 제한 없이 무료로 기록할 수 있어요. Ssak Plus는 한 번 결제로 습관을 최대 3개까지 함께 기록하고, 백업과 복원을 쓸 수 있어요. 구독료와 광고는 없고, 가입하지 않아도 돼요.

기록은 이 기기에 저장되며 자동으로 동기화되지 않아요.

### 日本語 — Ssak：習慣トラッカー

できることから、少しずつ。

読書、散歩、日記。普段から続けたいことをひとつ選んで、いつやるか決めてみましょう。

Ssakでは、忙しい日にやることも決めておけます。時間がある日は10分読書、忙しい日は1行だけ。それでも記録に残せます。続けるのが大変なら、やることを減らしてみましょう。

毎日のチェックが必要なくなったら、記録を終了できます。これまでの記録は残り、いつでも再開できます。

習慣ひとつの記録は、期限なく無料です。買い切りのSsak Plusでは、同時に最大3つの習慣を記録でき、バックアップと復元も使えます。月額料金、広告、アカウント登録はありません。

記録はこの端末に保存され、自動では同期されません。

### 繁體中文（台灣）— Ssak：習慣追蹤

從做得到的事，慢慢開始。

看書、散步、寫日記。選一件平常想做的事，先想好什麼時候開始。

在 Ssak，你也可以先設定忙的時候要做多少。有空就看書 10 分鐘，沒時間就只看一句，兩種都能記錄。如果不容易持續，試著少做一點，再慢慢調整。

不需要每天打卡時，就可以停止追蹤。過去的紀錄都會保留，隨時也能重新開始。

一次追蹤一個習慣完全免費，沒有使用期限。Ssak Plus 只需付費一次，就能同時追蹤最多 3 個習慣，並使用備份與還原功能。不用訂閱、沒有廣告，也不用註冊帳號。

紀錄儲存在這台裝置，不會自動同步。

## 이미지와 검증 범위

4개 언어 × 2개 플랫폼 × 5장, Google Play 배너 4장 포함 총 44장. 실제 앱의 웹 렌더링 초안이며 네이티브 제출본은 아니다. [갤러리](http://localhost:4174/store/)에서 확인한다.

현지 사용자 검수에서는 두 완료 버튼의 차이를 이해하는지, 기록 마치기를 삭제로 오해하지 않는지 확인해야 한다. 이번 표현 조사는 사용성 검증을 대신하지 않는다.


## 2026-10-15 네이티브 스토어 이미지

완성 파일은 `artifacts/store-2.0-2026-10-14/`에 보관한다(폴더 날짜는 작업 시작일).
기존 웹 렌더링 초안 대신 실제 네이티브 앱을 별도의 캡처 전용 기기에서 실행했다.
고객 데이터 대신 현지화된 무료 습관 1개와 예시 기록을 사용했다.

- 한국어, 영어, 일본어, 중국어 번체(대만 표현 기준) 각 5개 장면.
- iOS: 1320×2868, 1206×2622 두 크기, 총 40장.
- Android: 1080×1920 총 20장, 1024×500 그래픽 이미지 4장.
- `index.html`: 언어·스토어 필터가 있는 갤러리.
- `upload-guide.txt`: 업로드 순서와 폴더 안내.
- `manifest.json`: 문구, 대체 텍스트, 네이티브 원본 경로와 SHA-256.
- `ssak-store-2.0.zip`: 업로드용 최종 이미지와 안내. 네이티브 원본은 ZIP에서 제외.

제작 스크립트:

1. `scripts/store-capture-entry.js`를 별도의 로컬 캡처 번들 진입점으로 사용한다.
   `EXPO_NO_DOTENV=1 npx expo export:embed --platform ios|android --dev false
   --entry-file scripts/store-capture-entry.js --bundle-output <번들 경로>
   --assets-dest <에셋 경로>`로 캡처 번들을 만든다. 앱의 production main은 바꾸지 않는다.
   시작 경로와 키보드 닫기만 제어하며 UI 컴포넌트는 변경하지 않는다.
2. 캡처 전용 네이티브 앱에 위 번들을 넣어 설치한다. iOS는 simulator Release 앱,
   Android는 로컬 번들을 로드하는 debug 앱을 사용했다. 새 배포 빌드는 아니다.
3. `STORE_CAPTURE_DEVICE=<기기 ID> STORE_CAPTURE_DISPOSABLE=yes node scripts/capture-store-native.cjs ios|android`.
   iOS 기기 이름은 `Ssak-Store-Capture`로 시작해야 하며 Android AVD는 `Ssak_Store_Capture`여야 한다.
   이 스크립트는 기기의 앱 데이터를 예시 데이터로 교체하므로 사용자 기기에 실행하지 않는다.
4. `node scripts/render-store-release.cjs`로 원본을 마케팅 레이아웃에 넣는다.
   원본이 없으면 실패하며 웹 캡처로 대체하지 않는다.

제작 당시에는 업로드하지 않았다. 이후 10월 16일 사용자가 양 스토어에 언어별 이미지를 업로드하고 저장했다. 최신 심사 상태는 문서 상단과 `renewal-native-followup.md`를 따른다.
가격, Plus 구매 완료 상태, 알림 정상 동작을 증명하는 이미지는 아니다.
4개 언어의 UI와 문구를 육안 검수했으며 현지 사용자 검수는 별도다.

규격 참고: [Apple 스크린샷 규격](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/),
[Google Play 미리보기 애셋](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en).
