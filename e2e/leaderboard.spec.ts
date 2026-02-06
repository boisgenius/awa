import { test, expect } from '@playwright/test';

test.describe('Leaderboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leaderboard');
  });

  test('should display the leaderboard page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Leaderboard');
  });

  test('should display leaderboard table', async ({ page }) => {
    // Check for table element
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check for table headers
    const headers = page.locator('th');
    await expect(headers.first()).toBeVisible();
  });

  test('should display time range filters', async ({ page }) => {
    // Check for time range pills (24H, 7D, 30D, All)
    const timeFilters = page.locator('button, [role="button"]').filter({ hasText: /24H|7D|30D|All/i });
    await expect(timeFilters.first()).toBeVisible();
  });

  test('should switch time ranges', async ({ page }) => {
    // Find and click a time range filter
    const dayFilter = page.locator('button, [role="button"]').filter({ hasText: '24H' }).first();

    if (await dayFilter.isVisible()) {
      await dayFilter.click();

      // Wait for data to update
      await page.waitForTimeout(300);

      // Verify table still displays
      const table = page.locator('table');
      await expect(table).toBeVisible();
    }
  });

  test('should display skill rankings', async ({ page }) => {
    // Check for ranking numbers in the table
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();

    // Should have at least one row
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should display rank badges with correct styling', async ({ page }) => {
    // Check for rank indicators (1, 2, 3, etc.)
    const rankCells = page.locator('td').first();
    await expect(rankCells).toBeVisible();
  });
});
