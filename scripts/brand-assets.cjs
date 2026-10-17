// G3 / Soft Fold: code-native production drawing of the selected concept.
// No system fonts: the splash wordmark is vector artwork too.
const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { brown, cream, coral, background, contour, tip, wordS } = require('../assets/brand/design.json');
// Asymmetric flowing contour retained from G, with G3's smaller curved coral tip.
const shape = (fill = cream, mono = false) => `<path fill="${fill}" d="${contour}"/>${mono ? '' : `<path fill="${coral}" d="${tip}"/>`}`;
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${body}</svg>`;
const icon = svg(`<path fill="${brown}" d="M0 0h512v512H0z"/>${shape()}`);
const mark = svg(shape(brown));
// Foreground stays inside Android's central safe circle, even at the endpoints.
const adaptive = svg(`<g transform="translate(51.2 51.2) scale(.8)">${shape()}</g>`);
const mono = svg(`<g transform="translate(51.2 51.2) scale(.8)">${shape('#FFFFFF', true)}</g>`);
const wordmark = `<g fill="none" stroke="${brown}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"><path d="${wordS}"/><path transform="translate(44 0)" d="${wordS}"/><path d="M120 24 C120 1 84 1 84 24 C84 48 120 48 120 24 M120 7 V42 M138 -9 V42 M165 8 L140 26 L168 42"/></g>`;
const splash = svg(`<g transform="translate(102.4 42) scale(.6)">${shape(brown)}</g><g transform="translate(172 357)">${wordmark}</g>`);
const favicon = svg(`<rect width="512" height="512" rx="112" fill="${brown}"/>${shape()}`);
async function main() {
  const browser = await chromium.launch({ headless: true });
  await fs.mkdir(path.join(root, 'assets/brand'), { recursive: true });
  await fs.writeFile(path.join(root, 'assets/brand/mark.svg'), mark);
  await fs.writeFile(path.join(root, 'assets/brand/icon.svg'), icon);
  await fs.writeFile(path.join(root, 'assets/brand/splash.svg'), splash);
  const outputs = [
    ['assets/icon.png', icon, 1024, false],
    ['assets/adaptive-icon.png', adaptive, 1024, true],
    ['assets/monochrome-icon.png', mono, 1024, true],
    ['assets/splash-icon.png', splash, 512, true],
    ['assets/favicon.png', favicon, 64, true],
    ['assets/play-store/store-icon-512.png', icon, 512, false],
  ];
  try {
    for (const [file, content, size, transparent] of outputs) {
      const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
      await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;background:transparent}svg{display:block;width:100%;height:100%}</style>${content}`);
      await page.screenshot({ path: path.join(root, file), omitBackground: transparent });
      await page.close();
      console.log(`${file}: ${size}px`);
    }
    // Review the actual generated artwork, including launcher masks and small sizes.
    const preview = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
    await preview.setContent(`<style>body{margin:0;padding:48px;background:${background};color:${brown};font:18px system-ui}h1{font-size:26px}main{display:flex;gap:70px;align-items:center}.icon{width:260px;height:260px;border-radius:58px;overflow:hidden}.sizes{display:flex;gap:20px;align-items:center;margin-top:28px}.sizes svg{border-radius:22%}.mask{width:120px;height:120px;border-radius:50%;overflow:hidden;background:${brown}}.splash{width:300px;height:580px;border:2px solid #dac8b4;border-radius:38px;display:grid;place-items:center}.splash svg{width:220px;height:220px}svg{width:100%;height:100%}</style><h1>G3 · Production artwork</h1><main><section><div class="icon">${icon}</div><div class="sizes">${[64,48,32].map(n=>`<div style="width:${n}px;height:${n}px">${icon}</div>`).join('')}</div></section><section><p>Android · adaptive</p><div class="mask">${adaptive}</div><p>Android · themed</p><div class="mask" style="background:#715642">${mono}</div></section><section class="splash">${splash}</section></main>`);
    await fs.mkdir(path.join(root, 'artifacts/brand/g3'), { recursive: true });
    await preview.screenshot({ path: path.join(root, 'artifacts/brand/g3/production-preview.png') });
    await preview.close();
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
