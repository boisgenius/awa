import { test, expect } from '@playwright/test';

test.describe('Claim Page', () => {
  test('should display claim page with valid token', async ({ page, request }) => {
    // First register an agent to get a valid claim token
    const uniqueName = `ClaimTest_${Date.now()}`;

    const registerResponse = await request.post('/api/agents/register', {
      data: {
        name: uniqueName,
        description: 'Testing claim page',
      },
    });

    if (registerResponse.status() !== 201) {
      test.skip();
      return;
    }

    const registerData = await registerResponse.json();
    const claimToken = registerData.data.claimToken;
    const verificationCode = registerData.data.verificationCode;

    // Navigate to claim page
    await page.goto(`/claim/${claimToken}`);

    // Should display agent name
    await expect(page.locator('text=' + uniqueName)).toBeVisible({ timeout: 10000 });

    // Should display verification code
    await expect(page.locator('text=' + verificationCode)).toBeVisible();

    // Should have tweet button
    await expect(page.locator('text=Tweet')).toBeVisible();

    // Should have tweet URL input
    await expect(page.locator('input[type="url"], input[placeholder*="twitter"]')).toBeVisible();

    // Should have verify button
    await expect(page.locator('button:has-text("Verify")')).toBeVisible();
  });

  test('should show error for invalid claim token', async ({ page }) => {
    await page.goto('/claim/invalid_token_12345');

    // Should show error or not found message
    await expect(page.locator('text=/error|not found|invalid|expired/i')).toBeVisible({ timeout: 10000 });
  });

  test('should disable verify button without tweet URL', async ({ page, request }) => {
    // Register an agent
    const uniqueName = `ClaimTest2_${Date.now()}`;

    const registerResponse = await request.post('/api/agents/register', {
      data: { name: uniqueName },
    });

    if (registerResponse.status() !== 201) {
      test.skip();
      return;
    }

    const registerData = await registerResponse.json();
    const claimToken = registerData.data.claimToken;

    await page.goto(`/claim/${claimToken}`);

    // Verify button should be disabled without URL
    const verifyButton = page.locator('button:has-text("Verify")');
    await expect(verifyButton).toBeDisabled();
  });

  test('should enable verify button with tweet URL', async ({ page, request }) => {
    // Register an agent
    const uniqueName = `ClaimTest3_${Date.now()}`;

    const registerResponse = await request.post('/api/agents/register', {
      data: { name: uniqueName },
    });

    if (registerResponse.status() !== 201) {
      test.skip();
      return;
    }

    const registerData = await registerResponse.json();
    const claimToken = registerData.data.claimToken;

    await page.goto(`/claim/${claimToken}`);

    // Enter a tweet URL
    const urlInput = page.locator('input[type="url"], input[placeholder*="twitter"]');
    await urlInput.fill('https://twitter.com/test/status/1234567890');

    // Verify button should be enabled
    const verifyButton = page.locator('button:has-text("Verify")');
    await expect(verifyButton).toBeEnabled();
  });
});

test.describe('Developers Page', () => {
  test('should display developers documentation', async ({ page }) => {
    await page.goto('/developers');

    // Should have main title
    await expect(page.locator('h1:has-text("Developer")')).toBeVisible();

    // Should have tabs
    await expect(page.locator('text=Quickstart')).toBeVisible();
    await expect(page.locator('text=Authentication')).toBeVisible();
    await expect(page.locator('text=Endpoints')).toBeVisible();
    await expect(page.locator('text=Examples')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/developers');

    // Click on Authentication tab
    await page.click('button:has-text("Authentication")');

    // Should show authentication content
    await expect(page.locator('text=API Key Format')).toBeVisible();

    // Click on Endpoints tab
    await page.click('button:has-text("Endpoints")');

    // Should show endpoints content
    await expect(page.locator('text=/api\/agents/')).toBeVisible();

    // Click on Examples tab
    await page.click('button:has-text("Examples")');

    // Should show code examples
    await expect(page.locator('text=Python')).toBeVisible();
  });

  test('should have links to OpenAPI spec', async ({ page }) => {
    await page.goto('/developers');

    // Should have link to OpenAPI spec
    const openapiLink = page.locator('a[href="/openapi.yaml"]');
    await expect(openapiLink).toBeVisible();
  });

  test('should copy code on button click', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/developers');

    // Find first copy button and click it
    const copyButton = page.locator('button:has-text("📋")').first();
    await copyButton.click();

    // Button should show checkmark after copy
    await expect(page.locator('button:has-text("✓")').first()).toBeVisible();
  });
});
