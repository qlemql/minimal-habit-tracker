const steps = [
  {
    id: 'welcome',
    title: '시작',
    caption: '무엇을 돕는 앱인지 이해하기',
    body: '계정 없이 시작합니다. 실제 습관을 만들거나 명시된 예시을 먼저 볼 수 있습니다.',
    next: '시작하기 → 습관 발견',
    scope: '무료 · 4개 언어',
  },
  {
    id: 'discovery',
    title: '습관 발견',
    caption: '내 생각 또는 관심 분야에서 출발',
    body: '직접 정하기를 가장 먼저 제시합니다. 몸·마음·배움·생활·관계·휴식의 18개 힌트 중 처음에는 분야별 하나씩만 보여줍니다. 힌트는 선택의 범위가 아니라 출발점입니다.',
    next: '힌트 또는 직접 정하기 → 내 계획 만들기',
    scope: '무료 · 새로 개선',
  },
  {
    id: 'plan',
    title: '내 계획',
    caption: '계기와 최소 행동을 내 말로',
    body: '어떤 행동을 할지, 이미 하는 일 다음 언제 할지, 바쁜 날에는 어디까지 할지를 정합니다. 힌트의 모든 내용은 바꿀 수 있습니다. 알림은 모바일에서 선택적으로 설정합니다.',
    next: '저장 → 오늘 화면',
    scope: '무료 · 직접 입력 가능',
  },
  {
    id: 'today',
    title: '오늘의 실천',
    caption: '보통 실천도, 작은 실천도 기록',
    body: '한 번 눌러 기록합니다. 바쁜 날 정해둔 만큼만 한 경우도 실천한 날로 인정하고 중복 집계하지 않습니다. 잘못 눌렀으면 취소할 수 있고 하루를 놓쳐도 누적 기록은 사라지지 않습니다.',
    next: '일상은 여기서 끝. 필요하면 돌아보기',
    scope: '무료 · 로컬 저장',
  },
  {
    id: 'reflection',
    title: '돌아보기',
    caption: '안 맞는 계획을 조금 더 쉽게',
    body: '잘 맞는지, 더 쉽게 할지, 이제 기록 없이 할 수 있을지 살펴봅니다. 최소 행동을 줄이고 이유를 적으면 조정 기록에 남습니다.',
    next: '계속 실천 / 계획 수정 / 기록 마치기 검토',
    scope: '무료 · 강제 과제 아님',
  },
  {
    id: 'journey',
    title: '기록 마치기와 재시작',
    caption: '습관은 남고, 매일 체크는 끝',
    body: '내 일상이 되었다고 느끼면 매일 기록을 마칠 수 있습니다. 과거 실천과 돌아보기는 보존하고 알림은 중단합니다. 필요하면 이전 기록을 유지한 채 다시 기록할 수 있습니다.',
    next: '새 습관 시작 또는 같은 습관 다시 기록',
    scope: '무료 · 졸업 후 슬롯 재사용',
  },
  {
    id: 'plus',
    title: '필요할 때 Plus',
    caption: '추가 공간을 일회성으로 구매',
    body: '한 가지 습관은 기간 제한 없이 무료입니다. Plus는 최대 세 가지 동시 진행과 백업·복원을 제공합니다. 스토어 가격과 권한 확인을 사용하며, 현재는 상품 미설정으로 구매할 수 없습니다.',
    next: '스토어 구매 / 같은 스토어의 구매 복원',
    scope: '상품 설정·실결제 검증 전',
  },
  {
    id: 'settings',
    title: '설정과 기록 보관',
    caption: '언어를 바꾸고 내 기록 관리',
    body: '언어를 바꾸어도 사용자가 작성한 습관 내용은 그대로입니다. Plus 백업은 습관·실천·돌아보기를 포함하며 유료 권한 자체를 복사하지 않습니다. 구매 복원과 기록 복원은 서로 다릅니다.',
    next: '오늘로 돌아가기',
    scope: '언어 무료 · 백업 Plus',
  },
];
const features = [
  [
    '습관 힌트',
    '6개 분야·18개 예시, 대표 예시/분야별 보기, 직접 정하기',
    '무료',
    '구현·브라우저 검증',
  ],
  ['내 계획 만들기', '이름·계기·최소 행동·일주일 목표 수정', '무료', '구현·브라우저 검증'],
  ['매일 기록', '보통/작은 실천, 취소, 중복 방지, 기기 내 저장', '무료', '구현·브라우저 검증'],
  ['돌아보기', '쉽게 조정하고 그 이유를 기록', '무료', '구현·브라우저 검증'],
  ['졸업·재시작', '기록 보존, 졸업 시 활성 슬롯 확보', '무료', '구현·브라우저 검증'],
  ['여정', '현재 습관·졸업 습관·실천과 조정 기록', '무료', '구현·브라우저 검증'],
  ['다국어', '영어·한국어·일본어·번체중국어', '무료', '구현 / 원어민 감수 전'],
  [
    '동시 습관 수',
    '신규 무료 1개, Plus 3개, 기존 사용자 3개 유지',
    '일회성 Plus',
    '제한·마이그레이션 검증',
  ],
  [
    '백업·복원',
    '전체 기록 JSON 복사·유효성 검증 후 교체',
    'Plus',
    '브라우저 검증 / 자동 동기화 아님',
  ],
  ['스토어 구매', '현지 가격·구매·권한 확인·구매 복원', 'Plus', 'SDK 연결 / 실결제 검증 전'],
  [
    '로컬 알림',
    '선택한 시간에 최소 행동 알림, 완료 액션',
    '무료',
    '네이티브 코드 / 실기기 검증 전',
  ],
  [
    '홈·잠금화면 위젯',
    '앱 밖에서 상태를 확인하는 기존 네이티브 코드',
    '기존 기능',
    '리뉴얼 대응·실기기 검증 필요',
  ],
  ['Dynamic Island', '짧은 실천 세션의 진행 표시 후보', '미정', '아이디어 / 미구현'],
];
const feedback = [
  [
    '세 가지 힌트가 선택의 한계처럼 보임',
    '독서·산책·기록만 제시해, 관심이 다르면 시작점을 찾기 어려웠다.',
    '6개 분야·18개 힌트로 확장하고 직접 정하기를 첫 행동으로 배치했다.',
    '분야별 하나씩 먼저 보여주고, 펼치기와 분야 필터로 선택 과부하를 줄였다.',
  ],
  [
    '선택하지 않았는데 독서가 선택된 듯 보임',
    '기본 아이콘이 독서이고 선택 표시도 아이콘에 묶여 있었다.',
    '선택 전 강조를 없애고, 직접 만들기의 기본 아이콘을 중립적으로 바꿨다.',
    '힌트를 고른 뒤에만 계획이 채워지며 모든 문구를 수정할 수 있다.',
  ],
  [
    '처음부터 긴 입력 폼이 부담',
    '무엇을 할지 생각하는 일과 언제·얼마나 할지 정하는 일이 섞여 있었다.',
    '발견(01)과 내 계획(02)으로 나눴다.',
    '다른 힌트로 돌아가도 초안은 유지한다. 새 힌트를 선택하면 초안이 바뀐다는 설명을 넣었다.',
  ],
  [
    '웹의 넓은 화면으로 모바일 경험이 안 보임',
    '데스크톱 배치만으로는 휴대폰에서 읽고 누르는 순서를 판단하기 어려웠다.',
    '390/375/360px 실제 앱 프리뷰와 흐름별 화면 캡처를 만들었다.',
    '웹 크기 재현과 네이티브 기기 검증은 구분해서 안내한다.',
  ],
  [
    '결제보다 장식이 먼저 보임',
    'Plus 상단의 큰 그림이 무료/유료 범위와 구매 설명을 아래로 밀었다.',
    '장식을 줄이고 무료 범위·유료 가치·구매 상태를 먼저 보여준다.',
    '실제 가격은 스토어 응답만 쓴다. 상품 미설정 시 임의의 가격이나 성공 화면을 만들지 않는다.',
  ],
  [
    '구매 복원과 플랫폼 이동이 모호함',
    '“한 번 구매”가 iOS·Android 공유나 데이터 동기화까지 뜻하는 것으로 읽힐 수 있었다.',
    '같은 스토어 복원, 플랫폼별 구매, 기록 동기화 없음이라는 범위를 결제 화면에 명시했다.',
    '계정 없는 구조의 한계를 숨기지 않는다. 교차 플랫폼 공유는 계정 설계가 필요한 별도 과제다.',
  ],
];
const prices = [
  ['미국', 'US$7.99', 'App Store / Google Play', '기준 시장·가격 가설'],
  ['한국', '₩9,900', 'App Store / Google Play', '원화 제안가·기존 3개 슬롯 유지'],
  ['일본', '¥1,000', 'App Store / Google Play', '일본어 감수 후 소규모 검증'],
  ['대만', 'NT$250', 'App Store / Google Play', '번체중국어·현지 통화 검증'],
  ['영국', '£6.99', 'App Store / Google Play', '영어권 확장 후보'],
  ['유로 사용 시장', '€7.99', 'App Store / Google Play', '세금·판매국별 설정 확인'],
  ['캐나다 / 호주', 'C$10.99 / A$12.99', 'App Store / Google Play', '각 스토어 허용 가격 확인'],
  ['싱가포르', 'S$10.98', 'App Store / Google Play', '영어권 아시아 비교 후보'],
  ['기타 시장', '스토어 환산 후 검토', '지원되는 스토어', '일괄 출시보다 언어·결제 지원 확인'],
];
const el = (id) => document.getElementById(id);
const dialog = el('detail');
const showTab = (id) => {
  document.body.classList.toggle('compact', id !== 'flow');
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.hidden = panel.id !== id;
  });
  document
    .querySelectorAll('[data-tab]')
    .forEach((button) => button.setAttribute('aria-selected', String(button.dataset.tab === id)));
  history.replaceState(null, '', `#${id}`);
  if (id === 'phone') {
    if (el('app-frame').getAttribute('src') === 'about:blank') el('app-frame').src = '/';
    requestAnimationFrame(resizePhone);
  }
};
const resizePhone = () => {
  const width = Number(el('app-frame').dataset.width || 390);
  const height = Number(el('app-frame').dataset.height || 844);
  const outer = width + 16;
  el('app-frame').style.width = `${width}px`;
  el('app-frame').style.height = `${height}px`;
  document.querySelector('.phone-frame').style.width = `${outer}px`;
  el('phone-scaler').style.width = `${outer}px`;
  const availableHeight = Math.max(
    440,
    innerHeight - el('phone-stage').getBoundingClientRect().top - 28,
  );
  const scale = Math.min(
    1,
    el('phone-stage').clientWidth / outer,
    innerWidth > 620 ? availableHeight / (height + 75) : 1,
  );
  el('phone-scaler').style.transform = `scale(${scale})`;
  el('phone-stage').style.height = `${(height + 75) * scale + 32}px`;
};
document
  .querySelectorAll('[data-tab]')
  .forEach((button) => button.addEventListener('click', () => showTab(button.dataset.tab)));
el('flow-cards').innerHTML = steps
  .map(
    (step, i) =>
      `<button class="flow-card" data-step="${i}"><span class="number">${String(i + 1).padStart(2, '0')}</span><h3>${step.title}</h3><p>${step.caption}</p><img src="/shots/${step.id}.png" alt="${step.title} 실제 휴대폰 화면" loading="lazy"><span class="scope">${step.scope} ↗</span></button>`,
  )
  .join('');
document.querySelectorAll('[data-step]').forEach((button) =>
  button.addEventListener('click', () => {
    const step = steps[Number(button.dataset.step)];
    el('detail-image').src = `/shots/${step.id}.png`;
    el('detail-image').alt = step.title;
    el('detail-step').textContent =
      `USER FLOW / ${String(Number(button.dataset.step) + 1).padStart(2, '0')}`;
    el('detail-title').textContent = step.title;
    el('detail-body').textContent = step.body;
    el('detail-next').textContent = step.next;
    dialog.showModal();
  }),
);
el('close-detail').addEventListener('click', () => dialog.close());
el('detail-live').addEventListener('click', () => {
  dialog.close();
  showTab('phone');
});
el('open-phone').addEventListener('click', () => {
  el('app-frame').src = '/';
});
document.querySelectorAll('[data-width]').forEach((button) =>
  button.addEventListener('click', () => {
    document
      .querySelectorAll('[data-width]')
      .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    el('app-frame').dataset.width = button.dataset.width;
    el('app-frame').dataset.height = button.dataset.height;
    resizePhone();
  }),
);
el('feature-rows').innerHTML = features
  .map(
    ([name, desc, scope, status]) =>
      `<tr><td>${name}</td><td>${desc}</td><td>${scope}</td><td><span class="status ${status.includes('전') || status.includes('필요') || status.includes('미구현') ? 'pending' : ''}">${status}</span></td></tr>`,
  )
  .join('');
el('feedback-cards').innerHTML = feedback
  .map(
    ([title, before, after, reason]) =>
      `<article class="feedback-card"><h3>${title}</h3><span class="label">발견한 문제</span><p>${before}</p><span class="label">수정한 점</span><p>${after}</p><span class="label">판단</span><p>${reason}</p></article>`,
  )
  .join('');
el('price-rows').innerHTML = prices
  .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
  .join('');
window.addEventListener('resize', () => {
  if (!el('phone').hidden) resizePhone();
});
const initialTab = location.hash.slice(1);
if (['flow', 'phone', 'features', 'feedback', 'payments'].includes(initialTab)) showTab(initialTab);
