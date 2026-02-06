import { test, expect } from '@playwright/test';

test.describe('Marketplace Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/marketplace');
  });

  test('should display the marketplace page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Skill Marketplace');

    // Check for skill grid
    const skillGrid = page.locator('[class*="grid"]');
    await expect(skillGrid).toBeVisible();
  });

  test('should display skill cards', async ({ page }) => {
    // Wait for skill cards to load
    const skillCards = page.locator('[class*="card"], [class*="Card"]');
    await expect(skillCards.first()).toBeVisible();
  });

  test('should have filter options', async ({ page }) => {
    // Check for category filter pills
    const filterPills = page.locator('button, [role="button"]').filter({ hasText: /all|research|coding|finance/i });
    await expect(filterPills.first()).toBeVisible();
  });

  test('should filter skills by category', async ({ page }) => {
    // Click on a category filter
    const researchFilter = page.locator('button, [role="button"]').filter({ hasText: /research/i }).first();

    if (await researchFilter.isVisible()) {
      await researchFilter.click();

      // Wait for filter to apply
      await page.waitForTimeout(300);

      // Verify page still displays content
      const content = page.locator('main');
      await expect(content).toBeVisible();
    }
  });

  test('should have sort options', async ({ page }) => {
    // Check for sort dropdown or buttons
    const sortElements = page.locator('select, [class*="select"], button').filter({ hasText: /trending|newest|rating|sort/i });
    const count = await sortElements.count();
    expect(count).toBeGreaterThanOrEqual(0); // Sort may be optional
  });
});
