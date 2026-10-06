import type { Language } from './copy';

type LegalContent = { privacy: string[]; terms: string[]; support: string[] };
export const legalCopy: Record<Language, LegalContent> = {
  en: {
    privacy: [
      'Ssak stores your habit names, plans, check-ins, reviews and preferences on your device. We do not run a server for these records. Home-screen widgets read the habit information shared by the app on the same device.',
      'You can use Ssak without creating an account. There are no ads or advertising tracking. Local reminders use your device’s notification permission; we do not register you for remote push notifications.',
      'The App Store or Google Play handles payments. RevenueCat verifies purchases and manages Plus access using purchase history and an anonymous app identifier. It also provides purchase reporting. Habit names and notes are not sent to RevenueCat. We do not receive your card details.',
      'Copying a backup puts your records on the clipboard. Keep that copy private and clear it after use. Device or system backups may also contain app data, depending on your settings. Ssak does not sync habit records between devices.',
      'Delete a habit to remove its records from the app. Removing the app can remove local records; it does not delete copies you saved elsewhere or store transaction records. Purchase records are held by the store and RevenueCat under their own retention policies. Contact support for a purchase-data or privacy request. If you email us, we receive the address and details you choose to send and use them to answer your request.',
    ],
    terms: [
      'Ssak is a personal habit journal. One active habit is free. Ssak Plus is a one-time purchase for up to three active habits and backup import/export. It is not a subscription and does not renew.',
      'The price and currency shown by your store at checkout apply. Purchases can be restored using the same store account on the same platform. An iOS purchase does not unlock the Android app, or vice versa. Restoring a purchase does not restore habit records.',
      'Refund requests are handled under the store’s rules and applicable consumer law. These terms do not remove your statutory rights. We do not promise that every refund request will be approved. After a confirmed refund, Plus access ends when the app receives the updated purchase status. Offline updates may take longer.',
      'When Plus is no longer active, choose one habit to keep tracking for free. The other plans and records remain available to read, and you can change the selected habit in Settings. Please keep a separate backup of records you want to retain.',
    ],
    support: [
      'Purchase missing? Open Ssak Plus and choose Restore purchases while signed in to the store account that made the purchase. Make sure the device is online. Contact us if access is still missing; do not buy again just to troubleshoot.',
      'For a refund, use the store link below. If you contact us, include the store, purchase date and order reference only when needed. Never send card details or your store password. You do not need to send your habit notes.',
      'Records missing after changing phones? Restoring a purchase restores Plus access only. Habit records stay on the device unless you made a backup. If you still have the old phone, keep its app data until you have checked your restored records.',
    ],
  },
  ko: {
    privacy: [
      '습관 이름, 계획, 완료 기록, 돌아보기 내용과 설정은 기기에 저장됩니다. 이 기록을 저장하는 별도 서버는 운영하지 않습니다. 홈 화면 위젯은 같은 기기에서 앱이 공유한 습관 정보를 읽습니다.',
      '계정 없이 사용할 수 있고 광고나 광고 추적은 없습니다. 알림은 기기의 알림 권한을 이용하는 로컬 알림입니다. 원격 푸시 알림을 위한 등록은 하지 않습니다.',
      '결제는 App Store 또는 Google Play에서 처리합니다. RevenueCat은 구매 내역과 익명 앱 식별자로 구매를 확인하고 Plus 권한을 관리하며 구매 통계를 제공합니다. 습관 이름이나 메모는 RevenueCat에 보내지 않습니다. 카드 정보는 전달받지 않습니다.',
      '백업을 복사하면 기록이 클립보드에 들어갑니다. 복사한 내용은 안전한 곳에 보관하고 사용 후 클립보드에서 지워주세요. 기기 설정에 따라 운영체제 백업에 앱 데이터가 포함될 수 있습니다. 싹은 기기 간 습관 기록을 자동으로 동기화하지 않습니다.',
      '습관을 삭제하면 해당 습관의 기록이 앱에서 삭제됩니다. 앱 삭제로 기기의 기록이 사라질 수 있지만, 별도로 보관한 백업이나 스토어 구매 내역까지 삭제되지는 않습니다. 구매 관련 정보는 스토어와 RevenueCat의 보관 정책에 따릅니다. 구매 정보나 개인정보 관련 요청은 문의처로 보내주세요. 이메일로 문의하면 보내주신 주소와 내용을 답변에 사용합니다.',
    ],
    terms: [
      '싹은 개인 습관 기록 앱입니다. 무료로 습관 하나를 기록할 수 있습니다. Ssak Plus는 최대 세 개의 습관과 백업 내보내기·불러오기를 제공하는 일회성 구매입니다. 구독이나 자동 갱신은 없습니다.',
      '결제 시 스토어에 표시되는 가격과 통화가 적용됩니다. 같은 플랫폼에서 구매에 사용한 스토어 계정으로 구매를 복원할 수 있습니다. iOS 구매와 Android 구매는 서로 공유되지 않습니다. 구매 복원은 습관 기록을 복구하는 기능이 아닙니다.',
      '환불 요청에는 해당 스토어의 규정과 적용되는 소비자보호법이 따릅니다. 이 안내가 법에서 보장하는 권리를 제한하지 않습니다. 모든 환불 요청의 승인을 보장하지는 않습니다. 환불이 확정되면 앱에서 갱신된 구매 상태를 확인한 뒤 Plus가 해제됩니다. 오프라인에서는 반영이 늦어질 수 있습니다.',
      'Plus가 해제되면 무료로 계속 기록할 습관 하나를 고를 수 있습니다. 나머지 계획과 기록도 열어볼 수 있고, 설정에서 기록할 습관을 바꿀 수 있습니다. 오래 보관할 기록은 별도로 백업해주세요.',
    ],
    support: [
      '구매했는데 Plus가 보이지 않나요? 인터넷에 연결한 뒤, 구매에 사용한 스토어 계정으로 로그인하고 Ssak Plus 화면에서 구매 복원을 눌러주세요. 그래도 해결되지 않으면 다시 구매하지 말고 문의해주세요.',
      '환불은 아래 스토어 링크에서 요청할 수 있습니다. 문의할 때는 필요한 경우에만 스토어, 구매일, 주문번호를 보내주세요. 카드 정보나 스토어 비밀번호는 보내지 마세요. 습관 메모를 보낼 필요도 없습니다.',
      '휴대폰을 바꾼 뒤 기록이 없나요? 구매 복원은 Plus 권한만 복원합니다. 습관 기록은 백업하지 않으면 원래 기기에 남아 있습니다. 이전 휴대폰이 있다면 기록을 옮겨 확인할 때까지 앱 데이터를 지우지 마세요.',
    ],
  },
  ja: {
    privacy: [
      '習慣の名前、計画、達成記録、振り返り、設定は端末に保存されます。これらの記録を保存する専用サーバーは運営していません。ホーム画面のウィジェットは、同じ端末でアプリが共有した習慣の情報を読み取ります。',
      'アカウント登録は不要です。広告や広告目的の追跡はありません。通知は端末の許可を使うローカル通知です。リモートプッシュ通知への登録は行いません。',
      '支払いはApp StoreまたはGoogle Playが処理します。RevenueCatは購入履歴と匿名のアプリ識別子を使い、購入の確認、Plusの利用権限の管理、購入状況の集計を行います。習慣の名前やメモはRevenueCatに送信しません。カード情報は受け取りません。',
      'バックアップをコピーすると、記録がクリップボードに入ります。安全な場所に保管し、使用後はクリップボードから消してください。端末の設定によっては、OSのバックアップにもアプリのデータが含まれます。習慣の記録は端末間で自動同期されません。',
      '習慣を削除すると、その習慣の記録がアプリから削除されます。アプリの削除で端末内の記録が失われる場合がありますが、別に保存したコピーやストアの購入履歴は削除されません。購入情報の保存期間はストアとRevenueCatの方針に従います。購入情報や個人情報に関するご依頼はお問い合わせください。メールでいただいたアドレスと内容は、回答のために使用します。',
    ],
    terms: [
      'Ssakは個人向けの習慣記録アプリです。1つの習慣を無料で記録できます。Ssak Plusは、最大3つの習慣とバックアップの書き出し・読み込みを利用できる買い切りです。サブスクリプションや自動更新はありません。',
      '購入時にストアに表示される価格と通貨が適用されます。同じプラットフォームで、購入に使ったストアのアカウントから購入を復元できます。iOSとAndroidの購入は共通ではありません。購入の復元では習慣の記録は戻りません。',
      '返金にはストアの規定と適用される消費者保護法が適用されます。この案内は法律上の権利を制限しません。すべての返金申請が承認されるとは限りません。返金が確定し、アプリが更新された購入状態を受け取るとPlusが無効になります。オフラインでは反映が遅れる場合があります。',
      'Plusが無効になった場合は、無料で記録を続ける習慣を1つ選べます。他の計画や記録も閲覧でき、設定から選び直せます。残しておきたい記録は別にバックアップしてください。',
    ],
    support: [
      '購入したのにPlusが使えない場合は、インターネットに接続し、購入時のストアアカウントで「購入を復元」をお試しください。解決しない場合は、再購入せずにお問い合わせください。',
      '返金は下のストアのリンクから申請できます。お問い合わせには、必要な場合のみストア名、購入日、注文番号をお知らせください。カード情報やストアのパスワードは送らないでください。習慣のメモも不要です。',
      '機種変更後に記録が見つからない場合、購入の復元で戻るのはPlusの利用権限のみです。バックアップしていない記録は元の端末にあります。移行後の記録を確認するまで、古い端末のアプリデータを消さないでください。',
    ],
  },
  'zh-TW': {
    privacy: [
      '習慣名稱、計畫、完成紀錄、回顧和設定都儲存在你的裝置。我們沒有用來儲存這些紀錄的獨立伺服器。主畫面小工具會讀取 App 在同一台裝置分享的習慣資料。',
      '不需要註冊帳號，也沒有廣告或廣告追蹤。提醒使用裝置的通知權限，屬於本機通知，不會註冊遠端推播服務。',
      '付款由 App Store 或 Google Play 處理。RevenueCat 使用購買紀錄和匿名 App 識別碼來確認購買、管理 Plus 權限及提供購買統計。我們不會將習慣名稱或筆記傳送給 RevenueCat，也不會收到你的信用卡資料。',
      '複製備份會將紀錄放到剪貼簿，請妥善保管，使用後清除剪貼簿。視裝置設定而定，系統備份也可能包含 App 資料。Ssak 不會自動同步不同裝置的習慣紀錄。',
      '刪除習慣會移除 App 內該習慣的紀錄。移除 App 可能會刪除裝置上的紀錄，但不會刪除另外保存的備份或商店購買紀錄。購買資料的保存依商店與 RevenueCat 的政策辦理。如需處理購買資料或隱私權相關請求，請聯絡我們。來信的電子郵件地址和內容會用於回覆你的問題。',
    ],
    terms: [
      'Ssak 是個人習慣記錄 App。你可以免費記錄一個習慣。Ssak Plus 採一次買斷，可記錄最多三個習慣，並匯出、匯入備份。沒有訂閱或自動續費。',
      '價格和幣別以結帳時商店顯示的內容為準。使用購買時的商店帳號，可在相同平台回復購買。iOS 和 Android 的購買不能共用。回復購買不會還原習慣紀錄。',
      '退款依商店規定及適用的消費者保護法處理。這份說明不會限制你的法定權利，也不保證每筆退款申請都會獲准。退款確認後，App 收到更新的購買狀態才會停用 Plus。離線時可能需要更久才會更新。',
      'Plus 停用後，可以選一個習慣繼續免費記錄。其他計畫和紀錄仍可查看，也能到設定重新選擇。想長期保存的紀錄，請另外備份。',
    ],
    support: [
      '買了卻沒有 Plus？請連上網路，以購買時的商店帳號登入，並在 Ssak Plus 畫面選擇回復購買。如果還是無法使用，請聯絡我們，不需要為了解決問題再買一次。',
      '你可以透過下方的商店連結申請退款。聯絡我們時，僅在需要時提供商店名稱、購買日期和訂單編號。請勿提供信用卡資料或商店密碼，也不需要寄送習慣筆記。',
      '換手機後找不到紀錄？回復購買只會恢復 Plus 權限。沒有備份的習慣紀錄仍在原本的裝置上。確認新手機已還原紀錄前，請先保留舊手機的 App 資料。',
    ],
  },
};
