import { test, expect } from '@playwright/test';
import { en, ko } from '../../src/renewal/copy';
import { discoveryCopy } from '../../src/renewal/ideas';

test('maximum length habit keeps its detail action inside a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: en.welcomeButton, exact: true }).click();
  await page.getByRole('button', { name: discoveryCopy.en.own, exact: true }).click();
  const name = 'Read a book and write down something useful for tomorrow '.repeat(2).slice(0, 80);
  await page.getByRole('textbox', { name: en.nameLabel, exact: true }).fill(name);
  await page.getByRole('textbox', { name: en.cueField, exact: true }).fill('After breakfast');
  await page.getByRole('textbox', { name: en.minimumField, exact: true }).fill('Read one sentence');
  await page.getByRole('button', { name: en.save, exact: true }).click();
  const details = page.getByRole('button', { name: `${en.details}: ${name}`, exact: true });
  await expect(details).toBeVisible();
  const action = page.getByRole('button', { name, exact: true });
  await expect(action).toBeVisible();
  const actionBox = await action.boundingBox();
  expect(actionBox!.x + actionBox!.width).toBeLessThanOrEqual(360);
  const box = await details.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(360);
  await details.click();
  await expect(page.getByRole('button', { name: en.edit, exact: true })).toBeVisible();
});

test('identical actions appear once and changing UI language preserves the entered plan', async ({ page }) => {
  await page.goto('/add');
  await page.getByRole('button', { name: discoveryCopy.en.own, exact: true }).click();
  await page.getByRole('textbox', { name: en.nameLabel, exact: true }).fill('Draw one line');
  await page.getByRole('textbox', { name: en.cueField, exact: true }).fill('After tea');
  await page.getByRole('textbox', { name: en.minimumField, exact: true }).fill('Draw one line');
  await page.getByRole('button', { name: en.save, exact: true }).click();
  await expect(page.getByRole('button', { name: 'Draw one line', exact: true })).toHaveCount(1);
  await expect(page.locator('[data-testid^="check-tiny-"]')).toHaveCount(0);
  await page.getByRole('tab', { name: en.settings, exact: true }).click();
  await page.getByRole('radio', { name: '한국어', exact: true }).click();
  await page.getByRole('tab', { name: ko.today, exact: true }).click();
  await expect(page.getByText(ko.checkInQuestion, { exact: true })).toBeVisible();
  await expect(page.getByText('After tea', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Draw one line', exact: true }).click();
  await expect(page.getByText(ko.completed, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: ko.undo, exact: true }).click();
  await expect(page.getByRole('button', { name: 'Draw one line', exact: true })).toBeVisible();
});

test('a day boundary clears yesterday completion without a reload', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-04T23:59:40') });
  await page.goto('/');
  await page.getByRole('button', { name: en.sample, exact: true }).click();
  await page.getByRole('button', { name: en.reading, exact: true }).click();
  await expect(page.getByRole('button', { name: en.undo, exact: true })).toBeVisible();
  await page.clock.fastForward(40000);
  await expect(page.getByRole('button', { name: en.reading, exact: true })).toBeVisible();
  await page.getByRole('button', { name: en.reading, exact: true }).click();
  const dates = await page.evaluate(() => JSON.parse(localStorage.getItem('habit-store') || '{}').state.logs.map((log: {date: string}) => log.date));
  expect(dates).toContain('2026-10-04');
  expect(dates).toContain('2026-10-05');
});
