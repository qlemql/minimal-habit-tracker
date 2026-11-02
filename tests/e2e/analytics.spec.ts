import { test, expect } from '@playwright/test';
import { en } from '../../src/renewal/copy';
import { analyticsCopy } from '../../src/analytics/copy';

test('analytics choice persists, privacy disclosures are visible, and web previews send no telemetry', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('posthog.com')) requests.push(request.url());
  });
  await page.goto('/');
  await page.getByRole('tab', { name: en.settings, exact: true }).click();
  const toggle = page.getByRole('switch', { name: analyticsCopy.en.title });
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await page.reload();
  await expect(page.getByRole('switch', { name: analyticsCopy.en.title })).not.toBeChecked();
  await page.getByRole('switch', { name: analyticsCopy.en.title }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'artifacts/posthog/settings-en.png', fullPage: true });
  await page.getByRole('button', { name: 'Privacy policy', exact: true }).click();
  await expect(page.getByText(/When usage analytics is enabled, PostHog/)).toBeVisible();
  expect(requests).toEqual([]);
});

test('Korean analytics controls fit a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.getByRole('tab', { name: en.settings, exact: true }).click();
  await page.getByRole('radio', { name: '한국어', exact: true }).click();
  const toggle = page.getByRole('switch', { name: analyticsCopy.ko.title });
  await toggle.scrollIntoViewIfNeeded();
  await expect(toggle).toBeVisible();
  const box = await toggle.boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(360);
  await page.screenshot({ path: 'artifacts/posthog/settings-ko.png', fullPage: true });
});
