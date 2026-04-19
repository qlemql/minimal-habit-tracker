import puppeteer from 'puppeteer';
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SCREENSHOT_FILES = [
  '01_main',
  '02_check',
  '03_flow',
  '04_celebrate',
  '05_unlock',
  '06_widget',
];

const SCREENSHOT_IN_DIR = path.join(ROOT, 'assets/screenshots/final');
const PLAY_OUT_DIR = path.join(ROOT, 'docs/play-assets');
const SCREENSHOT_OUT_DIR = path.join(PLAY_OUT_DIR, 'screenshots');

const toFileUrl = (p) => 'file:///' + p.replace(/\\/g, '/');

const NATIVE_W = 1242;
const NATIVE_H = 2688;
const CROP_H = 2484; // 1:2 ratio — Play Store max allowed
const TARGET_W = 1080;
const TARGET_H = 2160;

async function captureScreenshots(browser) {
  fs.mkdirSync(SCREENSHOT_OUT_DIR, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({
    width: NATIVE_W,
    height: NATIVE_H,
    deviceScaleFactor: 1,
  });

  for (const name of SCREENSHOT_FILES) {
    const src = path.join(SCREENSHOT_IN_DIR, `${name}.html`);
    if (!fs.existsSync(src)) {
      console.warn(`[skip] ${src} not found`);
      continue;
    }
    const out = path.join(SCREENSHOT_OUT_DIR, `${name}.png`);

    await page.goto(toFileUrl(src), { waitUntil: 'networkidle0' });
    const raw = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: NATIVE_W, height: NATIVE_H },
    });

    const cropTop = Math.round((NATIVE_H - CROP_H) / 2);
    await sharp(raw)
      .extract({ left: 0, top: cropTop, width: NATIVE_W, height: CROP_H })
      .resize(TARGET_W, TARGET_H)
      .png({ compressionLevel: 9 })
      .toFile(out);

    console.log(`✓ ${name}.png (${TARGET_W}x${TARGET_H})`);
  }

  await page.close();
}

async function captureFeatureGraphic(browser) {
  const page = await browser.newPage();
  const W = 1024;
  const H = 500;
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

  const src = path.join(PLAY_OUT_DIR, 'feature-graphic-v2.html');
  const out = path.join(PLAY_OUT_DIR, 'feature-graphic.png');

  await page.goto(toFileUrl(src), { waitUntil: 'networkidle0' });
  await page.screenshot({
    path: out,
    type: 'png',
    clip: { x: 0, y: 0, width: W, height: H },
    omitBackground: false,
  });

  console.log(`✓ feature-graphic.png (${W}x${H})`);
  await page.close();
}

async function main() {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    await captureFeatureGraphic(browser);
    await captureScreenshots(browser);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
