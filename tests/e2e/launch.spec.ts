import { test, expect } from '@playwright/test';
import { copies, type Language } from '../../src/renewal/copy';
import { releaseCopy } from '../../src/renewal/releaseCopy';
import { legalCopy } from '../../src/renewal/legalCopy';

for (const language of ['en', 'ko', 'ja', 'zh-TW'] satisfies Language[]) {
  test(`${language}: refund keeps records, selection persists, legal pages fit phone`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const c = copies[language]; const r = releaseCopy[language];
    await page.addInitScript(({ language }) => {
      if (localStorage.getItem('launch-fixture')) return;
      localStorage.setItem('launch-fixture', '1');
      localStorage.setItem('ssak-preferences', JSON.stringify({ state: { language, welcomed: true, example: false }, version: 0 }));
      localStorage.setItem('pro-store', JSON.stringify({ state: { isPro: false }, version: 2 }));
      const habits = ['Reading', 'Walking'].map((name, i) => ({ id: `h${i}`, name, icon: '📖', color: '#315E4C', order: i, createdAt: '2026-10-01', updatedAt: '2026-10-01', reminderTime: null }));
      localStorage.setItem('habit-store', JSON.stringify({ state: { habits, logs: [{ id: 'old', habitId: 'h1', date: '2026-10-01', completed: true }], legacyAccess: false, freeHabitId: null }, version: 2 }));
    }, { language });
    await page.goto('/');
    await expect(page.getByText(r.choose, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: `Reading · ${r.chooseAction}`, exact: true }).click();
    await expect(page.getByTestId('check-h0')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('check-h0')).toBeVisible();
    await page.goto('/practice?id=h1');
    await expect(page.getByText(r.readOnly, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: c.edit, exact: true })).toHaveCount(0);
    await page.goto('/edit?id=h1');
    await expect(page.getByText(r.readOnly, { exact: true })).toBeVisible();
    await page.goto('/settings');
    await page.getByRole('button', { name: `Walking · ${r.chooseAction}`, exact: true }).click();
    for (const kind of ['privacy', 'terms', 'support'] as const) {
      await page.goto('/settings');
      await page.getByRole('button', { name: r[kind], exact: true }).click();
      await expect(page.getByText(legalCopy[language][kind][0], { exact: true })).toBeVisible();
      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
      expect(fits).toBe(true);
    }
    await page.goto('/');
    await expect(page.getByTestId('check-h1')).toBeVisible();
    const logs = await page.evaluate(() => JSON.parse(localStorage.getItem('habit-store')!).state.logs);
    expect(logs).toHaveLength(1);
    expect(logs[0].id).toBe('old');
  });
}
