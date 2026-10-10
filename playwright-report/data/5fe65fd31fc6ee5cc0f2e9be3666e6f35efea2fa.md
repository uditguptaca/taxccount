# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> MFA Challenge Page >> MFA page has recovery code toggle
- Location: tests\auth.spec.ts:59:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('#recovery-code')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('#recovery-code')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - link "A" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [ref=e6]: A
    - heading "Two-Factor Authentication" [level=1] [ref=e7]
    - paragraph [ref=e8]: Enter the 6-digit code from your authenticator app.
  - generic [ref=e9]:
    - generic [ref=e10]:
      - textbox [ref=e11]
      - textbox [ref=e12]
      - textbox [ref=e13]
      - textbox [ref=e14]
      - textbox [ref=e15]
      - textbox [ref=e16]
    - button "Verify & Sign In" [ref=e17]
  - button "Use a recovery code" [active] [ref=e19] [cursor=pointer]
  - link "← Back to login" [ref=e21] [cursor=pointer]:
    - /url: /login
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   test('login page loads correctly', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     await expect(page.locator('h1')).toContainText('Welcome back');
  7  |     await expect(page.locator('#email')).toBeVisible();
  8  |     await expect(page.locator('#password')).toBeVisible();
  9  |   });
  10 | 
  11 |   test('rejects invalid credentials', async ({ page }) => {
  12 |     await page.goto('/login');
  13 |     await page.fill('#email', 'fake@email.com');
  14 |     await page.fill('#password', 'wrongpassword');
  15 |     await page.click('button[type="submit"]');
  16 |     await expect(page.locator('.auth-error')).toBeVisible();
  17 |   });
  18 | 
  19 |   test('firm admin login redirects to dashboard', async ({ page }) => {
  20 |     await page.goto('/login');
  21 |     await page.fill('#email', 'admin@taxccount.ca');
  22 |     await page.fill('#password', 'password123');
  23 |     await page.click('button[type="submit"]');
  24 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  25 |     expect(page.url()).toContain('/dashboard');
  26 |   });
  27 | 
  28 |   test('individual login redirects to portal', async ({ page }) => {
  29 |     await page.goto('/login');
  30 |     await page.fill('#email', 'james.personal@email.com');
  31 |     await page.fill('#password', 'password123');
  32 |     await page.click('button[type="submit"]');
  33 |     await page.waitForURL('**/portal**', { timeout: 10000 });
  34 |     expect(page.url()).toContain('/portal');
  35 |   });
  36 | 
  37 |   test('unauthenticated users are redirected to login', async ({ page }) => {
  38 |     await page.goto('/dashboard');
  39 |     await page.waitForURL('**/login**', { timeout: 10000 });
  40 |     expect(page.url()).toContain('/login');
  41 |   });
  42 | 
  43 |   test('platform admin login redirects to platform', async ({ page }) => {
  44 |     await page.goto('/login');
  45 |     await page.fill('#email', 'platform@abidebylaw.com');
  46 |     await page.fill('#password', 'password123');
  47 |     await page.click('button[type="submit"]');
  48 |     await page.waitForURL('**/platform**', { timeout: 10000 });
  49 |     expect(page.url()).toContain('/platform');
  50 |   });
  51 | });
  52 | 
  53 | test.describe('MFA Challenge Page', () => {
  54 |   test('MFA page loads and has code inputs', async ({ page }) => {
  55 |     await page.goto('/login/mfa');
  56 |     await expect(page.locator('h1')).toContainText('Two-Factor Authentication');
  57 |   });
  58 | 
  59 |   test('MFA page has recovery code toggle', async ({ page }) => {
  60 |     await page.goto('/login/mfa');
  61 |     const toggle = page.getByText('Use a recovery code');
  62 |     await expect(toggle).toBeVisible();
  63 |     await toggle.click();
> 64 |     await expect(page.locator('#recovery-code')).toBeVisible();
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  65 |   });
  66 | });
  67 | 
```