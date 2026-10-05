import { test, expect } from '@playwright/test';
import { discoveryCopy, getHabitIdeas } from '../../src/renewal/ideas';
import { copies } from '../../src/renewal/copy';
import type { Language } from '../../src/renewal/copy';
for (const language of ['en', 'ko', 'ja', 'zh-TW'] as Language[]) {
  test(`discover outside the original three and customize in ${language}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.addInitScript(
      (language) =>
        localStorage.setItem(
          'ssak-preferences',
          JSON.stringify({ version: 0, state: { language, welcomed: true, example: false } }),
        ),
      language,
    );
    const c = copies[language];
    const d = discoveryCopy[language];
    const idea = getHabitIdeas(language).find((item) => item.id === 'message')!;
    await page.goto('/add');
    await page.getByRole('radio', { name: d.categories[4], exact: true }).click();
    await page.getByRole('button', { name: idea.name, exact: true }).click();
    await expect(page.getByRole('textbox', { name: c.cueField, exact: true })).toHaveValue(
      idea.cue,
    );
    await page
      .getByRole('textbox', { name: c.nameLabel, exact: true })
      .fill('My own connection habit');
    await page.getByRole('button', { name: d.change, exact: true }).click();
    await expect(page.getByText(d.replace, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: d.own, exact: true }).click();
    await expect(page.getByRole('textbox', { name: c.nameLabel, exact: true })).toHaveValue(
      'My own connection habit',
    );
    await page.getByRole('button', { name: c.save, exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'My own connection habit', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: idea.minimum, exact: true }).click();
    await expect(
      page.getByText(c.tinyCompleted, { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
test('all hints can be browsed and a completely custom habit needs no hint', async ({ page }) => {
  await page.goto('/add');
  await page.getByRole('button', { name: discoveryCopy.en.more, exact: true }).click();
  for (const idea of getHabitIdeas('en'))
    await expect(page.getByRole('button', { name: idea.name, exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: discoveryCopy.en.own, exact: true }).click();
  await expect(page.getByRole('textbox', { name: copies.en.nameLabel, exact: true })).toHaveValue(
    '',
  );
  await page.getByRole('textbox', { name: copies.en.nameLabel, exact: true }).fill('Sketch my cat');
  await page
    .getByRole('textbox', { name: copies.en.cueField, exact: true })
    .fill('After feeding my cat');
  await page
    .getByRole('textbox', { name: copies.en.minimumField, exact: true })
    .fill('Draw one line');
  await page.getByRole('button', { name: copies.en.save, exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Sketch my cat', exact: true }),
  ).toBeVisible();
});
