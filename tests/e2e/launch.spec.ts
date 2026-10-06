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

for (const language of ['en', 'ko', 'ja', 'zh-TW'] satisfies Language[]) {
  for (const pro of [false, true]) {
    test(`${language}: ${pro ? 'Plus' : 'free'} status survives deleting a habit`, async ({ page }) => {
      const c = copies[language];
      await page.setViewportSize({ width: 360, height: 800 });
      await page.addInitScript(({ language, pro }) => {
        if (localStorage.getItem('plan-fixture')) return;
        localStorage.setItem('plan-fixture', '1');
        localStorage.setItem('ssak-preferences', JSON.stringify({ state: { language, welcomed: true }, version: 0 }));
        localStorage.setItem('pro-store', JSON.stringify({ state: { isPro: pro }, version: 2 }));
        const habits = ['Reading', 'Walking'].map((name, i) => ({ id: `h${i}`, name, icon: '📖', color: '#315E4C', order: i, createdAt: '2026-10-01', updatedAt: '2026-10-01', reminderTime: null }));
        localStorage.setItem('habit-store', JSON.stringify({ state: { habits, logs: [], freeHabitId: 'h0', widgetEventIds: [] }, version: 3 }));
      }, { language, pro });
      const label = pro ? c.plusActive : c.freeStatus;
      await page.goto('/');
      await expect(page.getByTestId('check-h0')).toBeVisible();
      await expect(page.getByTestId('check-h1')).toHaveCount(pro ? 1 : 0);
      await expect(page.getByTestId('plan-status')).toHaveCount(0);
      for (const path of ['/stats', '/settings']) {
        await page.goto(path);
        await expect(page.getByTestId('plan-status')).toHaveText(label);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      if (language === 'ko') await page.screenshot({ path: `artifacts/renewal/plan-${pro ? 'plus' : 'free'}-ko.png` });
      await page.goto('/practice?id=h0');
      await page.getByRole('button', { name: c.delete, exact: true }).click();
      await page.getByRole('button', { name: c.confirmDelete, exact: true }).click();
      await page.goto('/stats');
      await expect(page.getByTestId('plan-status')).toHaveText(label);
      await page.reload();
      await expect(page.getByTestId('plan-status')).toHaveText(label);
      await page.setViewportSize({ width: 1440, height: 900 });
      await expect(page.getByTestId('plan-status')).toHaveText(label);
      await page.getByTestId('plan-status').click();
      if (pro) {
        await expect(page.getByText(c.plusActive, { exact: true }).filter({ visible: true })).toBeVisible();
        await expect(page.getByRole('button', { name: c.buy, exact: true })).toHaveCount(0);
      } else {
        await expect(page.getByRole('button', { name: c.buy, exact: true })).toBeVisible();
      }
    });
  }
}
