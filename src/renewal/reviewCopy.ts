import type { Language } from './copy';

interface ReviewCopy {
  title: string;
  subtitle: string;
  lastWeek: string;
  count: (days: number) => string;
  breakdown: (full: number, tiny: number) => string;
  empty: string;
  prompt: string;
  keep: string;
  adjust: string;
  kept: string;
  saved: string;
  saving: string;
  saveError: string;
  history: string;
}

export const reviewCopy: Record<Language, ReviewCopy> = {
  en: {
    title: 'Does this plan\nfit your life?',
    subtitle: 'Take a moment to see what worked for you.',
    lastWeek: 'Last week',
    count: (days) => `You practiced on ${days} ${days === 1 ? 'day' : 'days'}.`,
    breakdown: (full, tiny) => `Full goal: ${full} · Small step: ${tiny}`,
    empty: 'No records from last week. You can start with a small step today.',
    prompt: 'Keep what works.\nAdjust what feels like too much.',
    keep: 'Keep my plan', adjust: 'Adjust my plan',
    kept: 'Your plan stays the same.', saved: 'Your updated plan is ready.',
    saving: 'Saving…', saveError: 'Your review could not be saved. Check your storage space and try again. Your edits are still here.',
    history: 'Your past records stay as they are.',
  },
  ko: {
    title: '이 계획,\n잘 맞았나요?', subtitle: '내 생활에 맞는 정도인지 돌아봐요.',
    lastWeek: '지난주', count: (days) => `${days}일 기록했어요.`,
    breakdown: (full, tiny) => `평소 행동 ${full}일 · 작은 대안 ${tiny}일`,
    empty: '지난주 기록은 없어요. 오늘 작은 대안부터 시작해도 좋아요.',
    prompt: '괜찮았다면 그대로,\n버거웠다면 조금 바꿔도 좋아요.',
    keep: '이대로 이어가기', adjust: '계획 바꾸기', kept: '지금의 계획으로 이어가요.',
    saved: '바꾼 계획으로 이어가요.', history: '바꿔도 지난 기록은 그대로 남아요.',
    saving: '저장 중…', saveError: '돌아보기를 저장하지 못했어요. 저장 공간을 확인하고 다시 시도해주세요. 입력한 내용은 그대로 있어요.',
  },
  ja: {
    title: 'この計画、\n生活に合っていますか？', subtitle: '無理なくできたか、振り返ってみましょう。',
    lastWeek: '先週', count: (days) => `${days}日取り組みました。`,
    breakdown: (full, tiny) => `いつもの行動 ${full}日 · 小さな行動 ${tiny}日`,
    empty: '先週の記録はありません。今日、小さな一歩から始めても大丈夫です。',
    prompt: '合っていれば、そのまま。\n大変なら、少し変えても大丈夫。',
    keep: 'この計画を続ける', adjust: '計画を変える', kept: '今の計画で続けましょう。',
    saved: '新しい計画で続けましょう。', history: '計画を変えても、過去の記録は残ります。',
    saving: '保存中…', saveError: '振り返りを保存できませんでした。空き容量を確認して再試行してください。入力内容はそのまま残っています。',
  },
  'zh-TW': {
    title: '這個計畫，\n適合你的生活嗎？', subtitle: '回想一下，這樣的安排是否適合自己。',
    lastWeek: '上週', count: (days) => `你實踐了 ${days} 天。`,
    breakdown: (full, tiny) => `平常的行動 ${full} 天 · 小小的行動 ${tiny} 天`,
    empty: '上週還沒有紀錄。今天可以從一個小行動開始。',
    prompt: '適合就繼續，\n覺得吃力就調整一下。',
    keep: '繼續目前的計畫', adjust: '調整計畫', kept: '繼續目前的計畫吧。',
    saved: '接下來就照調整後的計畫進行。', history: '調整計畫不會改變過去的紀錄。',
    saving: '儲存中…', saveError: '無法儲存回顧。請確認儲存空間後重試，輸入的內容仍會保留。',
  },
};
