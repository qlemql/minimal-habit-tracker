const { copies, discoveryCopy, languages } = require('./lib/renewal-copy.cjs');

const marketing = {
  en: {
    name: 'Read for 10 minutes', cue: 'After my morning coffee', min: 'Read one sentence',
    slides: [
      ['01-today', 'Busy day?\nOne sentence counts.', 'Set an easier option for days when you have less time.'],
      ['02-discover', 'What would you\nlike to start?', 'Choose from 18 ideas, or write your own.'],
      ['03-plan', 'After coffee.\nBefore you head out.', 'Pick a moment in your day to do your habit.'],
      ['04-reflect', 'Hard to keep up?\nTry doing less.', 'Change your plan whenever you need to.'],
      ['05-graduate', 'Got the hang of it?\nYou can stop tracking.', 'Your records stay. Start tracking again anytime.'],
    ],
    featureTitle: 'Start small.\nKeep it manageable.',
    featureSub: 'Plan your habits. Do what you can. Keep a record.',
  },
  ko: {
    name: '책 10분 읽기', cue: '아침 커피를 마신 뒤', min: '한 문장만 읽기',
    slides: [
      ['01-today', '바쁜 날엔\n한 문장만 읽어도 돼요.', '시간이 없을 때 할 일도 미리 정해두세요.'],
      ['02-discover', '평소에 하고 싶던 일,\n하나 골라볼까요?', '18가지 예시에서 고르거나 직접 적어보세요.'],
      ['03-plan', '아침 커피를 마신 뒤,\n책을 펴볼까요?', '이미 하는 일 다음에 할 수 있게 정해보세요.'],
      ['04-reflect', '꾸준히 하기 어렵다면\n할 일을 줄여보세요.', '해보면서 나에게 맞게 바꿔도 돼요.'],
      ['05-graduate', '이제 익숙해졌다면\n매일 체크는 그만해도 돼요.', '기록은 남아요. 필요하면 다시 시작하세요.'],
    ],
    featureTitle: '할 수 있는 만큼부터\n시작해요.',
    featureSub: '할 일을 정하고, 해본 만큼 기록하세요.',
  },
  ja: {
    name: '10分読書する', cue: '朝のコーヒーを飲んだ後', min: '1行だけ読む',
    slides: [
      ['01-today', '忙しい日は、\n1行だけでも。', '時間がない日にやることも、決めておこう。'],
      ['02-discover', '続けたいこと、\nひとつ選ぼう。', '18の例から選んでも、自分で決めても。'],
      ['03-plan', '朝のコーヒーの後に、\n本を開こう。', 'いつもの行動の後にやる、と決めておく。'],
      ['04-reflect', '続けるのが大変なら、\nやることを減らそう。', 'やってみてから、計画を変えても大丈夫。'],
      ['05-graduate', '習慣になったら、\n毎日の記録はおしまい。', '記録は残ります。必要になったら、また再開。'],
    ],
    featureTitle: 'できることから、\n少しずつ。',
    featureSub: 'やることを決めて、できた分を記録。',
  },
  'zh-TW': {
    name: '看書 10 分鐘', cue: '喝完早上的咖啡後', min: '只看一句',
    slides: [
      ['01-today', '忙的時候，\n看一句也可以。', '先想好時間不夠時，至少能做多少。'],
      ['02-discover', '一直想做的事，\n選一個開始吧。', '從 18 個範例挑選，也可以自己填寫。'],
      ['03-plan', '喝完早上的咖啡，\n就翻開書吧。', '把新習慣接在每天都會做的事後面。'],
      ['04-reflect', '不容易持續？\n試著少做一點。', '做過之後，再調整成適合自己的計畫。'],
      ['05-graduate', '已經養成習慣，\n就不用每天打卡了。', '紀錄都會保留，需要時隨時能重新開始。'],
    ],
    featureTitle: '從做得到的事，\n慢慢開始。',
    featureSub: '設定習慣，做多少就記多少。',
  },
};

module.exports = Object.fromEntries(Object.entries(marketing).map(([language, content]) => {
  const c = copies[language];
  return [language, {
    ...content,
    label: languages.find((item) => item.code === language).label,
    start: c.welcomeButton, own: discoveryCopy[language].own,
    nameLabel: c.nameLabel, cueLabel: c.cueField, minLabel: c.minimumField,
    save: c.save, done: c.done, tiny: c.tiny, review: c.review,
    adjust: c.adjust, reviewSave: c.reflectSave, details: c.details,
    graduate: c.graduate, confirm: c.graduateConfirm, journey: c.journey,
  }];
}));
