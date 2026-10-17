// Native screenshots are mandatory. No web screenshot fallback.
const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const copy = require('./store-copy.cjs');
const brand = require('../assets/brand/design.json');
const output = path.resolve(process.env.STORE_OUTPUT || 'artifacts/store-2.0-2026-10-14');
const escape = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const multiline = (s) => escape(s).replace(/\n/g, '<br>');
const langNames = { ko: '한국어', en: 'English', ja: '日本語', 'zh-TW': '繁體中文' };
const descriptor = { ko: '나의 속도로 쌓는 습관', en: 'Habits at your own pace', ja: '自分のペースで、習慣づくり', 'zh-TW': '用自己的步調，養成習慣' };
const sizes = [
  { platform: 'ios', width: 1320, height: 2868 },
  { platform: 'ios', width: 1206, height: 2622 },
  { platform: 'android', width: 1080, height: 1920 },
];
const wordmark = `<svg viewBox="-4 -15 180 67" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${brand.brown}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"><path d="${brand.wordS}"/><path d="${brand.wordS}" transform="translate(44 0)"/><path d="M120 24 C120 1 84 1 84 24 C84 48 120 48 120 24 M120 7 V42 M138 -9 V42 M165 8 L140 26 L168 42"/></g></svg>`;
const trail = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><circle cx="340" cy="145" r="65" fill="#E9C982"/><path d="M125 395 C125 275 370 300 350 105" fill="none" stroke="#E9D8BF" stroke-width="92" stroke-linecap="round"/><path d="M125 395 C125 275 370 300 350 105" fill="none" stroke="#9C6842" stroke-width="3" stroke-dasharray="6 16"/><circle cx="130" cy="368" r="26" fill="#9C6842"/><circle cx="240" cy="286" r="24" fill="#C77E50"/><circle cx="330" cy="195" r="19" fill="#FFF9EF"/><path d="m321 195 7 7 12-15" fill="none" stroke="#9C6842" stroke-width="4" stroke-linecap="round"/><circle cx="419" cy="354" r="8" fill="#FF8068"/><path d="M65 190h24m-12-12v24" stroke="#C77E50" stroke-width="3"/></svg>`;
const png = async (page, file) => {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => image.decode())); });
  await page.screenshot({ path: file, animations: 'disabled', omitBackground: false });
};
(async () => {
  const browser = await chromium.launch();
  const assets = [];
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    for (const size of sizes) for (const [language, c] of Object.entries(copy)) {
      const { platform, width, height } = size;
      const scale = width / 1080;
      const android = platform === 'android';
      const dir = path.join(output, platform, `${width}x${height}`, language);
      await fs.mkdir(dir, { recursive: true });
      await page.setViewportSize({ width, height });
      for (const [scene, title, subtitle] of c.slides) {
        const source = path.join(output, 'native', platform, language, `${scene}.png`);
        const raw = await fs.readFile(source);
        const top = (android ? 415 : 460) * scale;
        await page.setContent(`<!doctype html><html lang="${language}"><meta charset="utf-8"><style>
          *{box-sizing:border-box}body{margin:0;background:#F4E8D8;color:#322B24;font-family:system-ui,-apple-system,'Hiragino Sans','PingFang TC',sans-serif}
          main{height:${height}px;overflow:hidden;position:relative;padding:${52 * scale}px ${70 * scale}px}
          header{display:flex;align-items:center;justify-content:space-between;color:#89654A;font-size:${23 * scale}px;font-weight:500}
          header svg{width:${126 * scale}px;height:${47 * scale}px}
          h1{font-size:${(language === 'ko' && scene === '05-graduate' ? 63 : 69) * scale}px;letter-spacing:-.045em;line-height:1.24;font-weight:750;margin:${34 * scale}px 0 ${17 * scale}px;word-break:keep-all}
          p{font-size:${27 * scale}px;line-height:1.5;color:#786858;margin:0;word-break:keep-all}
          .arc{position:absolute;top:58%;left:-40%;width:180%;height:100%;border-radius:50%;background:#E9D5BA}
          .dot{position:absolute;right:6%;top:48%;width:${26 * scale}px;height:${26 * scale}px;background:#D59B72;border-radius:50%}
          .shot{position:absolute;top:${top}px;left:50%;transform:translateX(-50%);width:${(android ? 660 : 815) * scale}px;border:${7 * scale}px solid #FFF9EF;border-radius:${35 * scale}px;box-shadow:0 ${18 * scale}px ${60 * scale}px #704D3429;overflow:hidden;background:#FFF9EF}
          .shot img{display:block;width:100%;height:auto}
          </style><main><header>${wordmark}<span>${escape(descriptor[language])}</span></header><h1>${multiline(title)}</h1><p>${escape(subtitle)}</p><div class="arc"></div><div class="dot"></div><div class="shot"><img alt="${escape(title.replace('\n', ' '))}" src="data:image/png;base64,${raw.toString('base64')}"></div></main></html>`);
        await page.evaluate(async ({ scale, height }) => {
          await document.fonts.ready; await document.querySelector('img').decode();
          const p = document.querySelector('p'); const shot = document.querySelector('.shot');
          const image = document.querySelector('img');
          const top = Math.max(shot.offsetTop, p.getBoundingClientRect().bottom + 32 * scale);
          const width = Math.min(shot.offsetWidth, (height - top - 48 * scale - 14 * scale) * image.naturalWidth / image.naturalHeight + 14 * scale);
          shot.style.top = `${top}px`; shot.style.width = `${width}px`;
        }, { scale, height });
        const overflow = await page.evaluate(() => [...document.querySelectorAll('header,h1,p,.shot')].some((el) => {
          const r = el.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth || r.bottom > innerHeight;
        }));
        if (overflow) throw Error(`Layout overflow: ${platform}/${language}/${scene}`);
        const file = path.join(dir, `${scene}.png`); await png(page, file);
        assets.push({ file: path.relative(output, file), platform, language, width, height,
          title, subtitle, altText: `${title.replace('\n', ' ')} ${subtitle}`.slice(0,140),
          source: path.relative(output, source), sourceSha256: crypto.createHash('sha256').update(raw).digest('hex') });
      }
    }
    for (const [language, c] of Object.entries(copy)) {
      await page.setViewportSize({ width: 1024, height: 500 });
      await page.setContent(`<!doctype html><html lang="${language}"><meta charset="utf-8"><style>
        *{box-sizing:border-box}body{margin:0;background:#F2E1C8;color:#3C2E23;font-family:system-ui,-apple-system,'Hiragino Sans','PingFang TC',sans-serif}main{width:1024px;height:500px;padding:64px 72px;position:relative;overflow:hidden}.logo{width:112px;height:42px}h1{font-size:52px;line-height:1.28;letter-spacing:-2px;margin:28px 0 20px;font-weight:750;position:relative;z-index:1}p{font-size:21px;margin:0;color:#79624D;position:relative;z-index:1}.art{position:absolute;right:15px;top:17px;width:420px;height:440px}.art svg{width:100%;height:100%}</style><main><div class="logo">${wordmark}</div><h1>${multiline(c.featureTitle)}</h1><p>${escape(c.featureSub)}</p><div class="art">${trail}</div></main></html>`);
      const dir = path.join(output, 'android', 'feature-graphic'); await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, `${language}.png`); await png(page, file);
      assets.push({ file: path.relative(output, file), platform: 'android', language, width: 1024, height: 500, title: c.featureTitle, subtitle: c.featureSub, altText: `${c.featureTitle.replace('\n', ' ')} ${c.featureSub}` });
    }
    const manifest = { generatedAt: new Date().toISOString(), status: 'native-captures-rendered-awaiting-visual-review',
      source: 'iOS simulator and Android emulator running native app; synthetic localized free-tier data. Initial-route harness only; application UI unchanged.',
      uploaded: false, assets };
    await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2));
    const sections = sizes.flatMap(({ platform, width, height }) => Object.keys(copy).map((language) => {
      const rows = assets.filter((a) => a.platform === platform && a.language === language && a.width === width);
      return `<section data-platform="${platform}" data-language="${language}"><h2>${platform === 'ios' ? 'App Store' : 'Google Play'} · ${langNames[language]} <small>${width} × ${height}</small></h2><div class="grid">${rows.map((a) => `<a href="${a.file}" target="_blank"><img src="${a.file}"><span>${escape(a.title.replace('\n', ' '))}</span></a>`).join('')}</div></section>`;
    })).join('');
    await fs.writeFile(path.join(output, 'index.html'), `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ssak 2.0 스토어 이미지</title><style>
      *{box-sizing:border-box}body{margin:0;padding:36px;background:#FFF9EF;color:#382D24;font:16px/1.6 system-ui,sans-serif}h1{font-size:32px;margin:0}h2{font-size:22px}small{font-weight:400;font-size:15px;color:#826D5B}p{max-width:1000px}.controls{display:flex;gap:12px;margin:24px 0;position:sticky;top:0;z-index:2;padding:14px;background:#FFF9EFee;border-bottom:1px solid #DECDB8}select{font:inherit;padding:8px 12px;border:1px solid #DECDB8;border-radius:8px;background:#fff}.grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px}.grid a{text-decoration:none;color:inherit;font-size:13px}.grid img{display:block;width:100%;border-radius:12px;box-shadow:0 6px 18px #704D3416;margin-bottom:10px}section{margin-bottom:48px}.banners{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.banners img{width:100%;border-radius:12px}[hidden]{display:none!important}@media(max-width:700px){body{padding:18px}.grid{grid-template-columns:repeat(2,1fr)}.banners{grid-template-columns:1fr}.controls{flex-wrap:wrap}}
      </style><h1>Ssak 2.0 · 스토어 소개 이미지</h1><p>한국어·영어·일본어·번체중국어. 실제 네이티브 앱 화면과 예시 기록으로 제작했습니다. 화면 안의 문구도 해당 언어입니다. 스토어에는 아직 업로드하지 않았습니다.</p><p>01 → 05 순서로 업로드하세요. 영어 이미지는 미국·영국·캐나다·호주 등 영어 등록정보에 공통으로 사용할 수 있습니다. <a href="upload-guide.txt">업로드 안내</a> · <a href="manifest.json">파일·출처 목록</a></p><div class="controls"><select id="platform"><option value="">모든 스토어</option><option value="ios">App Store</option><option value="android">Google Play</option></select><select id="language"><option value="">모든 언어</option>${Object.entries(langNames).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>${sections}<h2>Google Play · 그래픽 이미지 <small>1024 × 500</small></h2><div class="banners">${Object.entries(copy).map(([language]) => `<a href="android/feature-graphic/${language}.png"><img src="android/feature-graphic/${language}.png">${langNames[language]}</a>`).join('')}</div><script>function filter(){document.querySelectorAll('section').forEach(s=>s.hidden=(platform.value&&s.dataset.platform!==platform.value)||(language.value&&s.dataset.language!==language.value))}platform.onchange=language.onchange=filter;</script></html>`);
    console.log(`Rendered ${assets.length} assets: ${output}`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
