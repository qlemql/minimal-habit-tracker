const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const { copies, languages } = require('./lib/renewal-copy.cjs');

const capture = async () => {
  const directory = path.resolve(__dirname, '../artifacts/review/soft-fold');
  await fs.mkdir(directory, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const { code, label } of languages) {
      const c = copies[code];
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      try {
        const page = await context.newPage();
        await page.goto('http://localhost:4173');
        await page.getByRole('button', { name: label, exact: true }).click();
        await page.getByRole('button', { name: c.sample, exact: true }).click();
        await page.getByRole('button', { name: c.readingMin, exact: true }).waitFor();
        await page.screenshot({ path: path.join(directory, `${code}-today.png`) });
        await page.getByRole('button', { name: `${c.details}: ${c.reading}`, exact: true }).click();
        await page.getByRole('button', { name: c.edit, exact: true }).click();
        await page.getByRole('textbox', { name: c.minimumField, exact: true }).waitFor();
        await page.screenshot({ path: path.join(directory, `${code}-plan.png`) });
        await page.goto('http://localhost:4173/stats');
        await page.getByRole('button', { name: c.writing, exact: true }).waitFor();
        await page.screenshot({ path: path.join(directory, `${code}-habits.png`) });
      } finally {
        await context.close();
      }
    }
    await fs.writeFile(path.join(directory, 'index.html'), `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ssak · 4개 언어 화면</title><style>body{font-family:system-ui;background:#fff9ef;color:#302a25;margin:32px}a{color:#704a30}section{margin:36px 0}main{display:flex;gap:24px;flex-wrap:wrap}figure{margin:0}img{width:300px;max-width:100%;border:1px solid #e8ded2;border-radius:20px}figcaption{margin:12px 0}</style><h1>Ssak · 4개 언어 화면</h1><p>실제 앱의 예시 기록을 사용한 화면입니다. <a href="/">앱 열기</a></p>${languages.map(({ code, label }) => `<section><h2>${label}</h2><main>${[['today', '오늘'], ['plan', '계획 수정'], ['habits', '내 습관']].map(([screen, name]) => `<figure><figcaption>${name}</figcaption><a href="${code}-${screen}.png"><img src="${code}-${screen}.png" alt="${label} ${name}"></a></figure>`).join('')}</main></section>`).join('')}</html>`);
  } finally {
    await browser.close();
  }
};
capture().catch((error) => { console.error(error); process.exitCode = 1; });
