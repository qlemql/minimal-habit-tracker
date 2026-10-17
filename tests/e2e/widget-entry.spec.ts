import { test, expect } from '@playwright/test';
import { en } from '../../src/renewal/copy';

const id = 'habit with spaces & 한글';
const habit = {
  id, name: 'Read two pages', minimum: 'Read one sentence', cue: 'After tea',
  icon: '📖', color: '#9C6842', order: 0, reminderTime: null, weeklyTarget: 3,
  createdAt: '2026-09-01T03:00:00Z', updatedAt: '2026-09-01T03:00:00Z',
};

test('widget destination supports explicit tiny/full actions, undo, persistence and midnight', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-06T23:59:40') });
  await page.addInitScript(({ habit }) => {
    if (!localStorage.getItem('habit-store')) localStorage.setItem('habit-store', JSON.stringify({
      version: 2, state: { habits: [habit], logs: [], legacyAccess: false, freeHabitId: null },
    }));
  }, { habit });
  await page.goto(`/practice?id=${encodeURIComponent(id)}`);
  await page.getByRole('button', { name: habit.minimum, exact: true }).click();
  await expect(page.getByText(en.tinyCompleted, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: en.undo, exact: true })).toBeVisible();
  await page.getByRole('button', { name: en.undo, exact: true }).click();
  await page.getByRole('button', { name: habit.name, exact: true }).click();
  await expect(page.getByText(en.completed, { exact: true })).toBeVisible();
  await page.clock.fastForward(40000);
  await page.getByRole('button', { name: habit.minimum, exact: true }).click();
  const logs = await page.evaluate(() => JSON.parse(localStorage.getItem('habit-store')!).state.logs);
  expect(logs.map((log: { date: string; effort: string }) => [log.date, log.effort])).toEqual([
    ['2026-10-06', 'full'], ['2026-10-07', 'tiny'],
  ]);
});

for (const state of ['graduated', 'read-only'] as const) {
  test(`stale widget entry cannot change a ${state} habit`, async ({ page }) => {
    await page.addInitScript(({ habit, state }) => localStorage.setItem('habit-store', JSON.stringify({
      version: 2, state: {
        habits: [{ ...habit, isGraduated: state === 'graduated' }, { ...habit, id: 'other' }],
        logs: [], legacyAccess: false, freeHabitId: 'other',
      },
    })), { habit, state });
    await page.goto(`/practice?id=${encodeURIComponent(id)}`);
    await expect(page.getByText(habit.name, { exact: true })).toBeVisible();
    await expect(page.locator('[data-testid^="check-"]')).toHaveCount(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('habit-store')!).state.logs)).toEqual([]);
  });
}
