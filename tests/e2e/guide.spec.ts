import { en as c } from '../../src/renewal/copy';
﻿import { test, expect } from '@playwright/test';
const guide = 'http://localhost:4174/guide/';
test('guide maps all screens, opens detail and labels planned features', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(guide);
  await expect(page.locator('.flow-card')).toHaveCount(8);
  expect(
    await page
      .locator('.flow-card img')
      .evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
  ).toBe(true);
  await page.getByRole('button', { name: /02 습관 발견/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#detail-body')).toContainText('18개');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('tab', { name: '03 기능별 정리' }).click();
  await expect(page.locator('#feature-rows')).toContainText('아이디어 / 미구현');
  await page.getByRole('tab', { name: '05 국가별 결제' }).click();
  await expect(page.locator('#price-rows')).toContainText('₩9,900');
  await expect(page.getByText('모두 수요 검증 전 제안가이며', { exact: false })).toBeVisible();
});
test('phone frame uses actual device widths and creates a real habit', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${guide}#phone`);
  const app = page.frameLocator('#app-frame');
  for (const width of [375, 360, 390]) {
    await page.locator(`[data-width="${width}"]`).click();
    const frame = page.frames().find((frame) => frame.url() === 'http://localhost:4174/')!;
    expect(await frame.evaluate(() => innerWidth)).toBe(width);
  }
  await app.getByRole('button', { name: c.welcomeButton, exact: true }).click();
  await app.getByRole('button', { name: 'Create my own habit', exact: true }).click();
  await app
    .getByRole('textbox', { name: c.nameLabel, exact: true })
    .fill('My phone preview habit');
  await app
    .getByRole('textbox', { name: c.cueField, exact: true })
    .fill('After coffee');
  await app
    .getByRole('textbox', { name: c.minimumField, exact: true })
    .fill('One small action');
  await app.getByRole('button', { name: c.save, exact: true }).click();
  await app.getByRole('button', { name: 'One small action', exact: true }).click();
  await expect(
    app.getByText(c.tinyCompleted, { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    app.getByText(c.tinyCompleted, { exact: true }).filter({ visible: true }),
  ).toBeVisible();
});
test('guide remains usable on a 360px display', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(guide);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('tab', { name: '02 휴대폰 체험' }).click();
  await expect(page.locator('#app-frame')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('tab', { name: '05 국가별 결제' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
