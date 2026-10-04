const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const output = path.resolve(__dirname, '../artifacts/store-drafts');
const baseURL = process.env.PREVIEW_URL || 'http://localhost:4173';
const nativeRoot = process.env.STORE_NATIVE_CAPTURES;
const platforms = [
  { id: 'ios', width: 1290, height: 2796, viewport: { width: 430, height: 932 } },
  { id: 'android', width: 1080, height: 1920, viewport: { width: 360, height: 800 } },
];
const locales = require('./store-copy.cjs');
const escape = (value) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const multiline = (value) => escape(value).replace(/\n/g, '<br>');
const screenshot = async (page, file) => {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images).map(async (img) => {
      img.loading = 'eager';
      await img.decode();
    }));
  });
  await page.screenshot({ path: file, animations: 'disabled' });
};

const capture = async (browser, platform, language, c, dir) => {
  await fs.mkdir(dir, { recursive: true });
  const context = await browser.newContext({ viewport: platform.viewport, deviceScaleFactor: 3, locale: { en: 'en-US', ko: 'ko-KR', ja: 'ja-JP', 'zh-TW': 'zh-TW' }[language] });
  const page = await context.newPage();
  const button = (name) => page.getByRole('button', { name, exact: true });
  try {
    await page.goto(baseURL);
    await button(c.label).click();
    await button(c.start).click();
    await button(c.own).waitFor();
    await screenshot(page, path.join(dir, '02-discover.png'));
    await button(c.own).click();
    await page.getByRole('textbox', { name: c.nameLabel, exact: true }).fill(c.name);
    await page.getByRole('textbox', { name: c.cueLabel, exact: true }).fill(c.cue);
    await page.getByRole('textbox', { name: c.minLabel, exact: true }).fill(c.min);
    await screenshot(page, path.join(dir, '03-plan.png'));
    await button(c.save).click();
    await button(c.done).waitFor();
    await screenshot(page, path.join(dir, '01-today.png'));
    await button(c.tiny).click();
    await button(c.review).click();
    await page.getByRole('radio', { name: c.adjust, exact: true }).click();
    await screenshot(page, path.join(dir, '04-reflect.png'));
    await button(c.reviewSave).click();
    await button(c.details).click();
    await button(c.graduate).click();
    await button(c.confirm).click();
    await page.getByRole('tab', { name: c.journey, exact: true }).waitFor();
    await button(c.name).scrollIntoViewIfNeeded();
    await screenshot(page, path.join(dir, '05-graduate.png'));
  } finally {
    await context.close();
  }
};

const render = async (page, platform, language, c, rawDir, dir, records) => {
  await fs.mkdir(dir, { recursive: true });
  await page.setViewportSize({ width: platform.width, height: platform.height });
  for (const [id, title, subtitle] of c.slides) {
    const raw = await fs.readFile(path.join(rawDir, `${id}.png`));
    const apple = platform.id === 'ios';
    await page.setContent(`<!doctype html><html lang="${language}"><meta charset="utf-8"><style>
      *{box-sizing:border-box}body{margin:0;background:#f7f7f2;color:#233c35;font-family:system-ui,'Segoe UI',sans-serif}
      .canvas{height:${platform.height}px;position:relative;overflow:hidden;padding:${apple ? 85 : 56}px 90px}
      .brand{font-weight:750;font-size:38px;letter-spacing:-2px}.number{float:right;letter-spacing:3px;font-size:23px;color:#56695f}
      h1{font-size:${apple ? 91 : 76}px;line-height:1.16;letter-spacing:-3px;margin:48px 0 24px;word-break:keep-all}
      p{font-size:${apple ? 32 : 27}px;line-height:1.5;margin:0;max-width:1050px;color:#56695f;word-break:keep-all}
      .halo{position:absolute;background:#dde9d6;width:1700px;height:1700px;border-radius:50%;top:${apple ? 1120 : 820}px;left:-270px}
      img{position:absolute;top:${apple ? 625 : 440}px;width:${apple ? 940 : 640}px;height:auto;left:50%;transform:translateX(-50%);border:8px solid #fff;border-radius:32px;box-shadow:0 24px 70px #233c3525}
      </style><div class="canvas"><div class="brand">ssak<span class="number">${id.slice(0, 2)} / 05</span></div><h1>${multiline(title)}</h1><p>${escape(subtitle)}</p><div class="halo"></div><img alt="${escape(title)}" src="data:image/png;base64,${raw.toString('base64')}"></div></html>`);
    await page.evaluate(() => {
      const subtitle = document.querySelector('p');
      const shot = document.querySelector('img');
      if (!subtitle || !shot) throw new Error('Missing screenshot content');
      const top = Math.max(shot.offsetTop, subtitle.getBoundingClientRect().bottom + 36);
      const availableHeight = innerHeight - top - 55;
      const ratio = shot.naturalHeight / shot.naturalWidth;
      shot.style.top = `${top}px`;
      shot.style.width = `${Math.min(shot.width, (availableHeight - 16) / ratio + 16)}px`;
    });
    const file = path.join(dir, `${id}.png`);
    await screenshot(page, file);
    records.push({ file: path.relative(output, file).replaceAll('\\', '/'), platform: platform.id, language, width: platform.width, height: platform.height });
  }
};

(async () => {
  const browser = await chromium.launch();
  const records = [];
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    for (const platform of platforms) {
      for (const [language, c] of Object.entries(locales)) {
        const rawDir = nativeRoot ? path.resolve(nativeRoot, platform.id, language) : path.join(output, 'raw', platform.id, language);
        if (!nativeRoot) await capture(browser, platform, language, c, rawDir);
        await render(page, platform, language, c, rawDir, path.join(output, platform.id, language), records);
      }
    }
    for (const [language, c] of Object.entries(locales)) {
      await page.setViewportSize({ width: 1024, height: 500 });
      await page.setContent(`<html lang="${language}"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#315e4c;color:#fff;font-family:system-ui,'Segoe UI',sans-serif}main{padding:55px 64px;width:1024px;height:500px;position:relative;overflow:hidden}small{font-size:28px;font-weight:700}h1{font-size:62px;line-height:1.2;margin:30px 0 22px;letter-spacing:-2px}p{font-size:23px;color:#dde9d6}.mark{position:absolute;right:92px;top:145px;display:flex;align-items:flex-end;gap:20px}.bar{width:52px;border-radius:26px;height:145px;background:#fff}.tall{height:230px;background:#dde9d6}</style><main><small>ssak.</small><h1>${multiline(c.featureTitle)}</h1><p>${escape(c.featureSub)}</p><div class="mark"><div class="bar"></div><div class="bar tall"></div></div></main></html>`);
      const file = path.join(output, 'android', language, 'feature-graphic.png');
      await screenshot(page, file);
      records.push({ file: path.relative(output, file).replaceAll('\\', '/'), platform: 'android', language, width: 1024, height: 500 });
    }
    const manifest = { generatedAt: new Date().toISOString(), status: nativeRoot ? 'native-source-needs-review' : 'WEB_RENDER_DRAFT_NOT_FOR_SUBMISSION', source: nativeRoot ? 'User supplied native captures; verify provenance before submission.' : 'Actual app rendered in Chromium, not iOS/Android binaries.', assets: records };
    await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2));
    const sections = platforms.flatMap((p) => Object.entries(locales).map(([language, c]) => `<section><h2>${p.id === 'ios' ? 'App Store · 1290 × 2796' : 'Google Play · 1080 × 1920'} / ${c.label}</h2><div class="grid">${records.filter((r) => r.platform === p.id && r.language === language).map((r) => `<a href="${r.file}" target="_blank"><img src="${r.file}" alt="${escape(r.file)}" loading="lazy"><span>${escape(r.file.split('/').at(-1))}</span></a>`).join('')}</div></section>`)).join('');
    await fs.writeFile(path.join(output, 'index.html'), `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ssak · 스토어 이미지 검토</title><style>body{margin:0;padding:40px;background:#f7f7f2;color:#233c35;font:16px/1.6 system-ui,sans-serif}h1{font-size:32px}p{max-width:960px}.notice{padding:20px;background:#f4e8da;border-radius:16px}section{margin-top:45px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px}a{color:inherit;text-decoration:none;min-width:0}img{width:100%;border-radius:12px;border:1px solid #dde9d6}span{display:block;font-size:12px;overflow-wrap:anywhere}footer{margin-top:40px}@media(max-width:600px){body{padding:18px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}</style><h1>ssak. 스토어 이미지</h1><p class="notice"><strong>검토용 초안 · 스토어 미업로드</strong><br>${escape(manifest.source)}<br>현재 웹 렌더링 초안은 네이티브 서체·키보드·안전 영역 검증을 대신하지 않습니다. iOS/Android 출시 빌드의 실제 캡처로 교체하고 문구를 확인한 뒤 제출하세요.</p><p>오늘의 실천 → 습관 찾기 → 계획 → 돌아보기 → 졸업. 이미지를 누르면 원본 PNG를 열 수 있습니다. 가격·위젯·노치 등 미검증 기능은 홍보 이미지에 포함하지 않았습니다.</p>${sections}<footer><a href="manifest.json">파일 목록과 캡처 출처</a></footer></html>`);
    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.goto(`file:///${path.join(output, 'index.html').replaceAll('\\', '/')}`);
    await screenshot(page, path.join(output, 'overview.png'));
    console.log(`Generated ${records.length} images and a review gallery: ${output}`);
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
