import { test, expect } from '@playwright/test';
import { copies, languages } from '../../src/renewal/copy';
import { discoveryCopy, getHabitIdeas } from '../../src/renewal/ideas';

for (const { code, label } of languages) {
  test(`UF-01 through UF-08: complete lifecycle in ${code}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const c = copies[code];
    const d = discoveryCopy[code];
    const idea = getHabitIdeas(code).find((item) => item.id === 'read')!;
    const button = (name: string) => page.getByRole('button', { name, exact: true });
    await page.setViewportSize({ width: 360, height: 800 });

    await test.step('UF-01 choose a language and start without an account', async () => {
      await page.goto('/');
      await button(label).click();
      await button(c.welcomeButton).click();
      await expect(button(d.own)).toBeVisible();
    });
    await test.step('UF-02 validate an empty plan, then choose and customize an example', async () => {
      await button(d.own).click();
      await button(c.save).click();
      await expect(page.getByText(c.invalid, { exact: true })).toBeVisible();
      await button(d.change).click();
      await button(idea.name).click();
      await page.getByRole('textbox', { name: c.minimumField, exact: true }).fill('1');
      await button(c.save).click();
      await expect(button(`${c.details}: ${idea.name}`)).toBeVisible();
    });
    await test.step('UF-03 record less, reload, undo and record the full habit', async () => {
      await button('1').click();
      await page.reload();
      await expect(page.getByText(c.tinyCompleted, { exact: true }).filter({ visible: true })).toBeVisible();
      await button(c.undo).click();
      await button(idea.name).click();
      await expect(button(c.undo)).toBeVisible();
      const logs = await page.evaluate(() => JSON.parse(localStorage.getItem('habit-store') || '{}').state.logs);
      expect(logs).toHaveLength(1);
      expect(logs[0].effort).toBe('full');
    });
    await test.step('UF-04 edit and persist the plan', async () => {
      await button(`${c.details}: ${idea.name}`).click();
      await button(c.edit).click();
      await page.getByRole('textbox', { name: c.nameLabel, exact: true }).fill(`${idea.name} ✓`);
      await button(c.saveChanges).click();
      await page.reload();
      await expect(button(`${c.details}: ${idea.name} ✓`)).toBeVisible();
    });
    await test.step('UF-05 review, make the busy-day action easier, and save a note', async () => {
      await button(c.review).click();
      await page.getByRole('radio', { name: c.adjust, exact: true }).click();
      await page.getByRole('textbox', { name: c.minimumField, exact: true }).fill('');
      await expect(button(c.reflectSave)).toBeDisabled();
      await page.getByRole('textbox', { name: c.minimumField, exact: true }).fill(idea.minimum);
      await page.getByRole('textbox', { name: `${c.note} · ${c.optional}`, exact: true }).fill('✓');
      await button(c.reflectSave).click();
      await button(c.details).click();
    });
    await test.step('UF-06 cancel stopping first, then stop and preserve history', async () => {
      await button(c.graduate).click();
      await button(c.cancel).click();
      await expect(button(c.review)).toBeVisible();
      await button(c.graduate).click();
      await button(c.graduateConfirm).click();
      await button(`${idea.name} ✓`).click();
      await expect(button(c.restart)).toBeVisible();
      const state = await page.evaluate(() => JSON.parse(localStorage.getItem('habit-store') || '{}').state);
      expect(state.habits[0].isGraduated).toBe(true);
      expect(state.logs).toHaveLength(1);
      expect(state.habits[0].reviews).toHaveLength(1);
    });
    await test.step('UF-07 restart and keep today’s completion', async () => {
      await button(c.restart).click();
      await expect(button(c.undo)).toBeVisible();
    });
    await test.step('UF-08 cancel deletion, then confirm deletion', async () => {
      await button(`${c.details}: ${idea.name} ✓`).click();
      await button(c.delete).click();
      await button(c.cancel).click();
      await expect(button(c.review)).toBeVisible();
      await button(c.delete).click();
      await button(c.confirmDelete).click();
      await page.reload();
      const state = await page.evaluate(() => JSON.parse(localStorage.getItem('habit-store') || '{}').state);
      expect(state.habits).toEqual([]);
      expect(state.logs).toEqual([]);
    });
    expect(errors).toEqual([]);
  });
}

test('UF-09 stale edit, review and detail links show recovery UI', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const route of ['/edit?id=missing', '/review?id=missing', '/practice?id=missing']) {
    await page.goto(route);
    await expect(page.getByText(copies.en.notFound, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: copies.en.back, exact: true }).click();
  }
  expect(errors).toEqual([]);
});
