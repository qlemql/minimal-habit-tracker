import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { copies, type Language } from '../../src/renewal/copy';
import { backupCopy } from '../../src/renewal/backupCopy';

const fixture = async (page: Page, count = 3, language: Language = 'ko') => {
  await page.addInitScript(({ count, language }) => {
    if (localStorage.getItem('file-backup-fixture')) return;
    localStorage.setItem('file-backup-fixture', '1');
    localStorage.setItem('ssak-preferences', JSON.stringify({ state: { language, welcomed: true }, version: 0 }));
    localStorage.setItem('pro-store', JSON.stringify({ state: { isPro: true }, version: 2 }));
    const habits = ['책 한 페이지 읽기', '점심 먹고 공원 한 바퀴 걷기', '잠들기 전 오늘의 생각 적기'].slice(0, count)
      .map((name, i) => ({ id: `h${i}`, name, icon: '🌱', color: '#315E4C', order: i,
        weeklyTarget: i + 3, minimum: '한 번만 해보기', cue: '평소 하던 일 다음에',
        createdAt: '2026-10-01T03:00:00Z', updatedAt: '2026-10-01T03:00:00Z', reminderTime: null }));
    const logs = [{ id: 'l0', habitId: 'h0', date: '2026-10-02', completed: true, completedAt: null, effort: 'tiny' }];
    localStorage.setItem('habit-store', JSON.stringify({ state: { habits, logs, freeHabitId: null, widgetEventIds: [] }, version: 3 }));
  }, { count, language });
};
const data = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('habit-store')!).state);
const choose = async (page: Page, contents: string, language: Language = 'ko') => {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: backupCopy[language].importFile, exact: true }).click();
  await (await chooser).setFiles({ name: 'ssak-backup.json', mimeType: 'application/json', buffer: Buffer.from(contents) });
};

test('file round trip: export, preview, cancel, invalid file, replace and persistence', async ({ page }) => {
  await fixture(page);
  await page.goto('/settings');
  const original = await data(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: backupCopy.ko.save, exact: true }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^ssak-backup-.*\.json$/);
  const text = await readFile((await file.path())!, 'utf8');
  expect(JSON.parse(text).habits).toEqual(original.habits);
  expect(JSON.parse(text).logs).toEqual(original.logs);
  expect(JSON.parse(text).isPro).toBeUndefined();
  const changed = JSON.parse(text);
  changed.habits[0].name = '복원할 습관';
  const changedText = JSON.stringify(changed);
  await choose(page, changedText);
  await expect(page.getByTestId('backup-preview')).toContainText('습관 수: 3');
  await expect(page.getByTestId('backup-preview')).toContainText('일별 기록 수: 1');
  expect((await data(page)).habits).toEqual(original.habits);
  await page.getByTestId('backup-preview').screenshot({ path: 'artifacts/backup-ui-2026-10-13/restore-preview.png' });
  await page.getByRole('button', { name: backupCopy.ko.cancel }).click();
  expect((await data(page)).habits).toEqual(original.habits);
  await choose(page, '{"format":"not-a-backup"}');
  await expect(page.getByText(backupCopy.ko.importError, { exact: true })).toBeVisible();
  await expect(page.getByTestId('backup-preview')).toHaveCount(0);
  expect((await data(page)).habits).toEqual(original.habits);
  await choose(page, changedText);
  await page.getByRole('button', { name: copies.ko.restoreConfirm, exact: true }).click();
  await expect(page.getByText(copies.ko.restored, { exact: true })).toBeVisible();
  await page.reload();
  expect((await data(page)).habits).toEqual(changed.habits);
  expect((await data(page)).logs).toEqual(original.logs);
});

for (const language of ['ko', 'en', 'ja', 'zh-TW'] as const) {
  for (const count of [1, 2, 3]) {
    test(`${language}: ${count} habit cards contain their own week and fit a small screen`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await fixture(page, count, language);
      await page.goto('/');
      for (let i = 0; i < count; i++) {
        const card = page.getByTestId(`today-habit-h${i}`);
        await expect(card.getByText(copies[language].intention, { exact: true })).toHaveCount(1);
        await expect(card).toContainText(`/ ${i + 3}`);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `artifacts/backup-ui-2026-10-13/today-${language}-${count}.png`, fullPage: true });
      await page.getByTestId(`today-habit-h${count - 1}`).screenshot({ path: `artifacts/backup-ui-2026-10-13/last-card-${language}-${count}.png` });
      if (count === 3) {
        await page.goto('/settings');
        await choose(page, JSON.stringify({ format: 'ssak-backup', version: 1, habits: [], logs: [] }), language);
        await expect(page.getByTestId('backup-preview')).toContainText(backupCopy[language].unknownDate);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: `artifacts/backup-ui-2026-10-13/settings-${language}.png`, fullPage: true });
      }
    });
  }
}
