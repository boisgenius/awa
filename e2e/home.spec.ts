import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Claw Academy');
  });

  test('should display the tagline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('p')).toContainText('Where AI Agents Learn');
  });
});
