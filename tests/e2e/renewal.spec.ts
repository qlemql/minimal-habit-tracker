import { test, expect } from '@playwright/test';
import { en, ja, zh, ko } from '../../src/renewal/copy';
import { discoveryCopy } from '../../src/renewal/ideas';
import { releaseCopy } from '../../src/renewal/releaseCopy';

test('first habit: validate, tiny action, persist, adjust, graduate and restart', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: en.welcomeButton, exact: true }).click();
  await page.getByRole('button', { name: discoveryCopy.en.own, exact: true }).click();
  await page.getByRole('button', { name: en.save, exact: true }).click();
  await expect(page.getByText(en.invalid, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: discoveryCopy.en.change, exact: true }).click();
  await page.getByRole('button', { name: en.reading, exact: true }).click();
  await page.getByRole('button', { name: en.save, exact: true }).click();
  await page.getByRole('button', { name: en.readingMin, exact: true }).click();
  await expect(
    page.getByText(en.tinyCompleted, { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText(en.tinyCompleted, { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: en.undo, exact: true }).click();
  await page.getByRole('button', { name: en.reading, exact: true }).click();
  await page.getByRole('button', { name: en.review, exact: true }).click();
  await page.getByRole('radio', { name: en.adjust, exact: true }).click();
  await page.getByRole('textbox', { name: en.minimumField, exact: true }).fill('Read one sentence');
  await page
    .getByRole('textbox', { name: `${en.note} · ${en.optional}`, exact: true })
    .fill('A page felt too big this week.');
  await page.getByRole('button', { name: en.reflectSave, exact: true }).click();
  await page.getByRole('button', { name: en.details, exact: true }).click();
  await expect(
    page.getByText('Read one sentence', { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await expect(page.getByText('A page felt too big this week.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: en.graduate, exact: true }).click();
  await page.getByRole('button', { name: en.graduateConfirm, exact: true }).click();
  await page.getByRole('button', { name: new RegExp(en.reading) }).click();
  await page.getByRole('button', { name: en.restart, exact: true }).click();
  await expect(
    page.getByText(en.completed, { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: en.add, exact: true }).click();
  await page.getByRole('button', { name: en.plusCta, exact: true }).last().click();
  await expect(page.getByText(en.billingUnavailable, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: en.buy, exact: true })).toBeDisabled();
  expect(errors).toEqual([]);
});

for (const version of [1, 2]) test(`v${version} installation keeps records with one free selection`, async ({ page }) => {
  const habits = [0, 1, 2].map((order) => ({
    id: `old-${order}`,
    name: `Old habit ${order}`,
    icon: '📖',
    color: '#315E4C',
    order,
    reminderTime: null,
    createdAt: '2026-09-01T03:00:00Z',
    updatedAt: '2026-09-01T03:00:00Z',
  }));
  await page.addInitScript(
    ({ habits, version }) => {
      if (!localStorage.getItem('habit-store'))
        localStorage.setItem(
          'habit-store',
          JSON.stringify({
            version,
            state: {
              habits,
              legacyAccess: true,
              logs: [
                {
                  id: 'l',
                  habitId: 'old-0',
                  date: '2026-09-02',
                  completed: true,
                  completedAt: '2026-09-02T03:00:00Z',
                },
              ],
            },
          }),
        );
    },
    { habits, version },
  );
  await page.goto('/');
  await expect(page.getByText(releaseCopy.en.choose, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: `Old habit 1 · ${releaseCopy.en.chooseAction}`, exact: true }).click();
  await expect(page.getByTestId('check-old-1')).toBeVisible();
  await expect(page.getByTestId('check-old-0')).toHaveCount(0);
  await page.getByRole('tab', { name: en.settings, exact: true }).click();
  await expect(page.getByTestId('plan-status')).toHaveText(en.freeStatus);
  await page.reload();
  const data = await page.evaluate(() => JSON.parse(localStorage.getItem('habit-store') || '{}'));
  expect(data.version).toBe(3);
  expect(data.state.logs).toHaveLength(1);
  expect(data.state.habits).toEqual(habits);
  expect(data.state.legacyAccess).toBeUndefined();
  expect(data.state.freeHabitId).toBe('old-1');
  await page.goto('/');
  await expect(page.getByTestId('check-old-1')).toBeVisible();
});

for (const width of [360, 375, 390, 1440]) {
  test(`example and localization fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width > 800 ? 1000 : 844 });
    await page.goto('/');
    await page.getByRole('button', { name: en.sample, exact: true }).click();
    await expect(page.getByText(en.sampleLabel, { exact: true })).toBeVisible();
    await page.screenshot({ path: `artifacts/renewal/today-${width}.png`, fullPage: true });
    await page.getByRole('tab', { name: en.settings, exact: true }).click();
    for (const [label, c] of [
      ['日本語', ja],
      ['繁體中文', zh],
      ['한국어', ko],
    ] as const) {
      await page.getByRole('radio', { name: label, exact: true }).click();
      await expect(page.getByRole('tab', { name: c.today, exact: true })).toBeVisible();
      await page.getByRole('tab', { name: c.today, exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: `artifacts/renewal/${label}-${width}.png`, fullPage: true });
      await page.getByRole('tab', { name: c.settings, exact: true }).click();
    }
    await page.getByRole('radio', { name: 'English', exact: true }).click();
    await page.getByRole('button', { name: en.sampleClear, exact: true }).click();
    await expect(page.getByRole('button', { name: en.start, exact: true })).toBeVisible();
    const data = await page.evaluate(() => JSON.parse(localStorage.getItem('habit-store') || '{}'));
    expect(data.state.habits).toHaveLength(0);
    expect(data.state.logs).toHaveLength(0);
  });
}

test('paid backup restore validates before changing existing data', async ({ page }) => {
  // Test-only stored entitlement fixture. The product has no fake purchase switch.
  await page.addInitScript(() => {
    if (!localStorage.getItem('pro-store'))
      localStorage.setItem('pro-store', JSON.stringify({ version: 2, state: { isPro: true } }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: en.sample, exact: true }).click();
  await page.getByRole('tab', { name: en.settings, exact: true }).click();
  await page.getByRole('button', { name: en.restore, exact: true }).click();
  await page.getByRole('textbox', { name: en.restore, exact: true }).fill('{"bad": true}');
  await page.getByRole('button', { name: en.restoreConfirm, exact: true }).click();
  await expect(page.getByText(en.backupError, { exact: true })).toBeVisible();
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem('habit-store') || '{}').state,
  );
  expect(before.habits).toHaveLength(2);
  const habit = { ...before.habits[0], name: 'Restored reading' };
  await page
    .getByRole('textbox', { name: en.restore, exact: true })
    .fill(
      JSON.stringify({ format: 'ssak-backup', version: 1, habits: [habit], logs: before.logs }),
    );
  await page.getByRole('button', { name: en.restoreConfirm, exact: true }).click();
  await expect(page.getByText(en.restored, { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('tab', { name: en.today, exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Restored reading', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(en.sampleLabel, { exact: true })).toHaveCount(0);
});

test('delete requires confirmation and removes history only after confirmation', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: en.sample, exact: true }).click();
  await page.getByRole('button', { name: `${en.details}: ${en.reading}`, exact: true }).click();
  await page.getByRole('button', { name: en.delete, exact: true }).click();
  await page.getByRole('button', { name: en.cancel, exact: true }).click();
  await expect(page.getByRole('button', { name: en.review, exact: true })).toBeVisible();
  await page.getByRole('button', { name: en.delete, exact: true }).click();
  await page.getByRole('button', { name: en.confirmDelete, exact: true }).click();
  const data = await page.evaluate(
    () => JSON.parse(localStorage.getItem('habit-store') || '{}').state,
  );
  expect(data.habits).toHaveLength(1);
  expect(data.habits[0].id).toBe('sample-writing');
  expect(data.logs).toHaveLength(0);
});
