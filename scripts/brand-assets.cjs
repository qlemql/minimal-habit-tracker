// Code-native artwork matching Brand in src/renewal/ui.tsx. No stock artwork or fonts.
const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const green = '#315E4C';
const bars = (mono = false) => `<rect x="8.5" y="14.5" width="7" height="13" rx="3.5" fill="#FFFFFF"/><rect x="18.5" y="7.5" width="7" height="20" rx="3.5" fill="${mono ? '#FFFFFF' : '#DDE9D6'}"/>`;
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35">${body}</svg>`;
const icon = svg(`<path fill="${green}" d="M0 0h35v35H0z"/>${bars()}`);
const mark = svg(`<rect width="35" height="35" rx="12" fill="${green}"/>${bars()}`);
const adaptive = svg(`<g transform="translate(5.25 5.25) scale(.7)">${bars()}</g>`);
const mono = svg(`<g transform="translate(5.25 5.25) scale(.7)">${bars(true)}</g>`);
async function main() {
  const browser = await chromium.launch({ headless: true });
  await fs.mkdir(path.join(root, 'assets/brand'), { recursive: true });
  await fs.writeFile(path.join(root, 'assets/brand/mark.svg'), mark);
  await fs.writeFile(path.join(root, 'assets/brand/icon.svg'), icon);
  const outputs = [
    ['assets/icon.png', icon, 1024, false],
    ['assets/adaptive-icon.png', adaptive, 1024, true],
    ['assets/monochrome-icon.png', mono, 1024, true],
    ['assets/splash-icon.png', mark, 512, true],
    ['assets/favicon.png', mark, 64, true],
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
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
