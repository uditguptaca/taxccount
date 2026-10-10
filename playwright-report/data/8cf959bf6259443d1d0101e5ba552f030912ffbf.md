# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> login page loads correctly
- Location: tests\auth.spec.ts:4:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Welcome back"
Received string:    "ABIDEBYLAW"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    9 × locator resolved to <h1>ABIDEBYLAW</h1>
      - unexpected value "ABIDEBYLAW"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: A
    - heading "ABIDEBYLAW" [level=1] [ref=e6]
    - paragraph [ref=e7]: Internal Platform Access
  - generic [ref=e8]:
    - generic [ref=e9]:
      - generic [ref=e10]: Email Address
      - generic [ref=e11]:
        - img [ref=e13]
        - textbox "Email Address" [ref=e16]:
          - /placeholder: name@company.com
    - generic [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]: Password
        - link "Forgot password?" [ref=e20] [cursor=pointer]:
          - /url: "#"
      - generic [ref=e21]:
        - img [ref=e23]
        - textbox "Password" [ref=e26]:
          - /placeholder: ••••••••
    - button "Sign In" [ref=e27] [cursor=pointer]:
      - text: Sign In
      - img [ref=e28]
  - generic [ref=e30]:
    - generic [ref=e31]: Demo Accounts (Click to auto-fill)
    - 'button "Super Admin pwd: password123 platform@abidebylaw.com" [ref=e32] [cursor=pointer]':
      - generic [ref=e33]:
        - generic [ref=e34]: Super Admin
        - generic [ref=e35]: "pwd: password123"
      - generic [ref=e36]: platform@abidebylaw.com
    - 'button "Consultant Admin pwd: password123 admin@taxccount.ca" [ref=e37] [cursor=pointer]':
      - generic [ref=e38]:
        - generic [ref=e39]: Consultant Admin
        - generic [ref=e40]: "pwd: password123"
      - generic [ref=e41]: admin@taxccount.ca
    - 'button "Staff Member pwd: password123 emily@taxccount.ca" [ref=e42] [cursor=pointer]':
      - generic [ref=e43]:
        - generic [ref=e44]: Staff Member
        - generic [ref=e45]: "pwd: password123"
      - generic [ref=e46]: emily@taxccount.ca
    - 'button "Standard User pwd: password123 james.personal@email.com" [ref=e47] [cursor=pointer]':
      - generic [ref=e48]:
        - generic [ref=e49]: Standard User
        - generic [ref=e50]: "pwd: password123"
      - generic [ref=e51]: james.personal@email.com
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   test('login page loads correctly', async ({ page }) => {
  5  |     await page.goto('/login');
> 6  |     await expect(page.locator('h1')).toContainText('Welcome back');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
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
  64 |     await expect(page.locator('#recovery-code')).toBeVisible();
  65 |   });
  66 | });
  67 | 
```