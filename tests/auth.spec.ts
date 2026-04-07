import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Welcome back');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('rejects invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'fake@email.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.auth-error')).toBeVisible();
  });

  test('firm admin login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@taxccount.ca');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('individual login redirects to portal', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'james.personal@email.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/portal**', { timeout: 10000 });
    expect(page.url()).toContain('/portal');
  });

  test('unauthenticated users are redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login**', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('platform admin login redirects to platform', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'platform@abidebylaw.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/platform**', { timeout: 10000 });
    expect(page.url()).toContain('/platform');
  });
});

test.describe('MFA Challenge Page', () => {
  test('MFA page loads and has code inputs', async ({ page }) => {
    await page.goto('/login/mfa');
    await expect(page.locator('h1')).toContainText('Two-Factor Authentication');
  });

  test('MFA page has recovery code toggle', async ({ page }) => {
    await page.goto('/login/mfa');
    const toggle = page.getByText('Use a recovery code');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('#recovery-code')).toBeVisible();
  });
});
