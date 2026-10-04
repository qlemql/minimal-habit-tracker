# Ssak 문구 · 4개 언어 스토어 초안

2026-10-04. 앱과 이미지에 반영한 기준. 스토어 미게시. 국가 전체의 말투를 검증한 조사나 원어민 검수 결과는 아니다.

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

이름은 후보다. 실제 앱 이름·상표는 변경하지 않았다. 제출 시 스토어별 글자 수와 이름 사용 가능 여부를 확인한다.

### English — Ssak: Habit Tracker

Start small. Keep it manageable.

Want to read more, take a walk, or keep a journal? Pick one habit and decide when you’ll do it.

In Ssak, you also choose an easier option for busy days. Read for ten minutes when you can, or just one sentence when you’re short on time. Both can be recorded. If the plan is hard to keep up with, change it.

Once you no longer need daily check-ins, you can stop tracking. Your history stays, and you can start tracking again anytime.

Track one habit at a time for free, with no time limit. Ssak Plus is a one-time purchase for up to three habits at once, backup and restore. No subscription, no ads, and no account required.

Records are stored on your device and don’t sync automatically. iOS and Android purchases are separate. Existing users keep their original three habit slots.

### 한국어 — 싹: 습관 기록

할 수 있는 만큼부터 시작해요.

책 읽기, 산책, 일기 쓰기. 평소에 하고 싶었던 일을 하나 골라 언제 할지 정해보세요.

싹에서는 바쁜 날 할 일도 미리 정할 수 있어요. 여유가 있으면 책을 10분 읽고, 시간이 없으면 한 문장만 읽어도 기록할 수 있어요. 해보니 어렵다면 할 일을 줄여보세요.

이제 매일 체크하지 않아도 된다면 기록을 마쳐도 돼요. 이전 기록은 남고, 필요하면 다시 시작할 수 있어요.

습관 하나는 기간 제한 없이 무료로 기록할 수 있어요. Ssak Plus는 한 번 결제로 습관을 최대 3개까지 함께 기록하고, 백업과 복원을 쓸 수 있어요. 구독료와 광고는 없고, 가입하지 않아도 돼요.

기록은 이 기기에 저장되며 자동으로 동기화되지 않아요. iOS와 Android 구매는 별도예요. 기존 사용자는 원래 쓰던 습관 3개를 계속 기록할 수 있어요.

### 日本語 — Ssak：習慣記録

できることから、少しずつ。

読書、散歩、日記。普段から続けたいことをひとつ選んで、いつやるか決めてみましょう。

Ssakでは、忙しい日にやることも決めておけます。時間がある日は10分読書、忙しい日は1行だけ。それでも記録に残せます。続けるのが大変なら、やることを減らしてみましょう。

毎日のチェックが必要なくなったら、記録を終了できます。これまでの記録は残り、いつでも再開できます。

習慣ひとつの記録は、期限なく無料です。買い切りのSsak Plusでは、同時に最大3つの習慣を記録でき、バックアップと復元も使えます。月額料金、広告、アカウント登録はありません。

記録はこの端末に保存され、自動では同期されません。iOSとAndroidは別々に購入する必要があります。以前から利用している方は、これまでどおり3つの習慣を記録できます。

### 繁體中文（台灣）— Ssak：習慣紀錄

從做得到的事，慢慢開始。

看書、散步、寫日記。選一件平常想做的事，先想好什麼時候開始。

在 Ssak，你也可以先設定忙的時候要做多少。有空就看書 10 分鐘，沒時間就只看一句，兩種都能記錄。如果不容易持續，試著少做一點，再慢慢調整。

不需要每天打卡時，就可以停止追蹤。過去的紀錄都會保留，隨時也能重新開始。

一次追蹤一個習慣完全免費，沒有使用期限。Ssak Plus 只需付費一次，就能同時追蹤最多 3 個習慣，並使用備份與還原功能。不用訂閱、沒有廣告，也不用註冊帳號。

紀錄儲存在這台裝置，不會自動同步。iOS 和 Android 需分別購買。原本已在使用的使用者，仍可繼續記錄 3 個習慣。

## 이미지와 검증 범위

4개 언어 × 2개 플랫폼 × 5장, Google Play 배너 4장 포함 총 44장. 실제 앱의 웹 렌더링 초안이며 네이티브 제출본은 아니다. [갤러리](http://localhost:4174/store/)에서 확인한다.

현지 사용자 검수에서는 두 완료 버튼의 차이를 이해하는지, 기록 마치기를 삭제로 오해하지 않는지 확인해야 한다. 이번 표현 조사는 사용성 검증을 대신하지 않는다.
