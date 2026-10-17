import type { Language } from './copy';

export const releaseCopy: Record<Language, {
  choose: string; chooseSub: string; chooseAction: string; readOnly: string;
  reminderNote: string; privacy: string; support: string; terms: string;
  contactMissing: string; contact: string; refund: string;
  openError: string; selected: string;
  purchasePending: string;
  processingPurchase: string; restoringPurchase: string; processingPurchaseDetail: string;
  readOnlyLabel: string; trackableLabel: string; readOnlyListNote: string; changeHabit: string;
}> = {
  en: {
    processingPurchase: 'Completing your purchase…',
    restoringPurchase: 'Restoring your purchase…',
    processingPurchaseDetail: 'Please wait while the store confirms your purchase. This screen will update automatically. You do not need to tap again.',
    readOnlyLabel: 'Read only',
    trackableLabel: 'Tracking enabled',
    readOnlyListNote: 'Read-only habits keep all their records. Choose which habit to track for free in Settings.',
    changeHabit: 'Choose in Settings',

    choose: 'Choose one habit to keep tracking',
    chooseSub: 'Plus is not active. You can track one habit for free. All your other plans and records stay here. You can change your choice in Settings.',
    chooseAction: 'Track this habit',
    readOnly: 'Your records are saved. Choose this habit in Settings to keep tracking it for free.',
    reminderNote: 'Repeats every day, even if you have already finished. You can turn it off here. Delivery may be delayed by your phone’s settings.',
    privacy: 'Privacy policy', support: 'Help & refunds', terms: 'Purchase terms',
    contactMissing: 'Support contact details are being prepared for release.',
    contact: 'Email support', refund: 'Request a refund from the store',
    openError: 'Could not open the link. Please try again.', selected: 'Selected',
    purchasePending: 'Your payment is waiting for approval. Plus will be available after the store confirms it. You do not need to buy again.',
  },
  ko: {
    processingPurchase: '구매를 진행하고 있어요',
    restoringPurchase: '구매 내역을 복원하고 있어요',
    processingPurchaseDetail: '스토어 확인에 시간이 걸릴 수 있어요. 확인이 끝나면 자동으로 알려드릴게요. 다시 누르지 않아도 돼요.',
    readOnlyLabel: '읽기 전용',
    trackableLabel: '기록 가능',
    readOnlyListNote: '읽기 전용 습관도 기존 기록은 그대로 남아요. 무료로 기록할 습관은 설정에서 바꿀 수 있어요.',
    changeHabit: '설정에서 습관 선택',

    choose: '계속 기록할 습관 하나를 골라주세요',
    chooseSub: '지금은 Plus를 사용하고 있지 않아요. 무료로 습관 하나를 기록할 수 있어요. 다른 습관의 계획과 기록도 그대로 남아요. 설정에서 언제든 다시 고를 수 있어요.',
    chooseAction: '이 습관 기록하기',
    readOnly: '기록은 그대로 남아 있어요. 무료로 계속 기록하려면 설정에서 이 습관을 골라주세요.',
    reminderNote: '이미 마친 날에도 매일 정한 시간에 알려드려요. 여기서 알림을 끌 수 있어요. 휴대폰 설정에 따라 알림이 늦어질 수 있어요.',
    privacy: '개인정보처리방침', support: '도움말과 환불', terms: '구매 안내',
    contactMissing: '출시를 위한 문의처를 준비하고 있어요.',
    contact: '이메일로 문의하기', refund: '스토어에서 환불 요청하기',
    openError: '링크를 열지 못했어요. 다시 시도해주세요.', selected: '선택됨',
    purchasePending: '결제 승인을 기다리고 있어요. 스토어에서 확인되면 Plus를 사용할 수 있어요. 다시 구매하지 않아도 돼요.',
  },
  ja: {
    processingPurchase: '購入を処理しています…',
    restoringPurchase: '購入を復元しています…',
    processingPurchaseDetail: 'ストアでの確認に時間がかかる場合があります。確認が終わると画面が自動で切り替わります。もう一度押す必要はありません。',
    readOnlyLabel: '閲覧のみ',
    trackableLabel: '記録できます',
    readOnlyListNote: '閲覧のみの習慣も記録はすべて残ります。無料で記録する習慣は設定で変更できます。',
    changeHabit: '設定で習慣を選ぶ',

    choose: '記録を続ける習慣を1つ選んでください',
    chooseSub: '現在Plusは有効ではありません。無料で1つの習慣を記録できます。他の習慣の計画や記録も残ります。設定からいつでも選び直せます。',
    chooseAction: 'この習慣を記録する',
    readOnly: 'これまでの記録は残っています。無料で記録を続けるには、設定でこの習慣を選んでください。',
    reminderNote: 'すでに終わった日も、毎日設定した時刻に通知します。ここでオフにできます。端末の設定によって通知が遅れることがあります。',
    privacy: 'プライバシーポリシー', support: 'ヘルプと返金', terms: '購入について',
    contactMissing: '公開に向けてお問い合わせ先を準備しています。',
    contact: 'メールで問い合わせる', refund: 'ストアで返金を申請する',
    openError: 'リンクを開けませんでした。もう一度お試しください。', selected: '選択中',
    purchasePending: 'お支払いの承認を待っています。ストアで確認されるとPlusが使えるようになります。再購入は不要です。',
  },
  'zh-TW': {
    processingPurchase: '正在處理購買…',
    restoringPurchase: '正在恢復購買…',
    processingPurchaseDetail: '商店確認可能需要一些時間。確認完成後，畫面會自動更新，不需要再次點選。',
    readOnlyLabel: '唯讀',
    trackableLabel: '可記錄',
    readOnlyListNote: '唯讀習慣的既有紀錄都會保留。可以到設定更換免費記錄的習慣。',
    changeHabit: '到設定選擇習慣',

    choose: '選一個繼續記錄的習慣',
    chooseSub: '目前沒有啟用 Plus。你可以免費記錄一個習慣，其他習慣的計畫和紀錄都會保留。隨時可以到設定重新選擇。',
    chooseAction: '記錄這個習慣',
    readOnly: '先前的紀錄都還在。想免費繼續記錄，請到設定選擇這個習慣。',
    reminderNote: '每天都會在設定的時間提醒，已完成的日子也一樣。你可以在這裡關閉提醒。手機設定可能會讓通知延遲。',
    privacy: '隱私權政策', support: '說明與退款', terms: '購買說明',
    contactMissing: '正在準備正式上架的聯絡方式。',
    contact: '寄信聯絡我們', refund: '向商店申請退款',
    openError: '無法開啟連結，請再試一次。', selected: '已選擇',
    purchasePending: '付款正在等待核准。商店確認後就能使用 Plus，不需要再次購買。',
  },
};
