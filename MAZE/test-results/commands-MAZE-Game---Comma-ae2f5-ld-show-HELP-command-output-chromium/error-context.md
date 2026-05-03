# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: commands.spec.js >> MAZE Game - Commands >> should show HELP command output
- Location: tests\commands.spec.js:18:7

# Error details

```
Test timeout of 120000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForFunction: Test timeout of 120000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - 'img "MAZE: Directions" [ref=e5]'
  - generic [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]: "Available doors:"
      - button "GO Prologue" [ref=e10] [cursor=pointer]
    - generic [ref=e11]:
      - generic [ref=e12]: ">"
      - textbox "Enter command (HELP for commands)" [active] [ref=e13]
    - generic [ref=e14]:
      - button "Help" [ref=e15] [cursor=pointer]
      - button "Status" [ref=e16] [cursor=pointer]
      - button "Hint (0/5)" [ref=e17] [cursor=pointer]
      - button "Clear" [ref=e18] [cursor=pointer]
  - generic [ref=e19]:
    - generic [ref=e20]: "ROOM: Directions"
    - generic [ref=e21]: "MOVES: 0"
    - generic [ref=e22]:
      - text: "VISITED:"
      - generic [ref=e23]: 1/47
    - generic [ref=e24]:
      - text: "HINTS:"
      - generic [ref=e25]: 0/5
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('MAZE Game - Commands', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('/index.html', { waitUntil: 'networkidle' });
  6   |     
  7   |     await page.waitForFunction(() => {
  8   |       return document.querySelector('.terminal-container') !== null;
  9   |     }, { timeout: 30000 });
  10  |     
  11  |     // Wait for initial text to appear
> 12  |     await page.waitForFunction(() => {
      |                ^ Error: page.waitForFunction: Test timeout of 120000ms exceeded.
  13  |       const viewport = document.querySelector('.text-viewport');
  14  |       return viewport && viewport.textContent && viewport.textContent.length > 50;
  15  |     }, { timeout: 15000 });
  16  |   });
  17  | 
  18  |   test('should show HELP command output', async ({ page }) => {
  19  |     const input = await page.locator('.command-input');
  20  |     await input.fill('HELP');
  21  |     await input.press('Enter');
  22  | 
  23  |     // Should show help message
  24  |     const messageDiv = await page.locator('.message');
  25  |     const helpText = await messageDiv.textContent();
  26  | 
  27  |     expect(helpText).toBeTruthy();
  28  |     expect(helpText).toContain('COMMANDS');
  29  |     expect(helpText).toContain('GO');
  30  |     expect(helpText).toContain('HINT');
  31  |     expect(helpText).toContain('STATUS');
  32  |   });
  33  | 
  34  |   test('should show STATUS command output', async ({ page }) => {
  35  |     const input = await page.locator('.command-input');
  36  |     await input.fill('STATUS');
  37  |     await input.press('Enter');
  38  | 
  39  |     // Should show status message
  40  |     const messageDiv = await page.locator('.message');
  41  |     const statusText = await messageDiv.textContent();
  42  | 
  43  |     expect(statusText).toBeTruthy();
  44  |     expect(statusText).toContain('CURRENT ROOM');
  45  |     expect(statusText).toContain('MOVES');
  46  |     expect(statusText).toContain('HINTS USED');
  47  |   });
  48  | 
  49  |   test('should provide hint about unvisited rooms', async ({ page }) => {
  50  |     const input = await page.locator('.command-input');
  51  |     await input.fill('HINT');
  52  |     await input.press('Enter');
  53  | 
  54  |     // Should show hint message
  55  |     const messageDiv = await page.locator('.message');
  56  |     const hintText = await messageDiv.textContent();
  57  | 
  58  |     expect(hintText).toBeTruthy();
  59  |     expect(
  60  |       hintText?.includes("haven't explored") || hintText?.includes('not been to')
  61  |     ).toBeTruthy();
  62  |   });
  63  | 
  64  |   test('should track hints used', async ({ page }) => {
  65  |     const input = await page.locator('.command-input');
  66  | 
  67  |     // Use a hint
  68  |     await input.fill('HINT');
  69  |     await input.press('Enter');
  70  |     await page.waitForTimeout(200);
  71  | 
  72  |     // Check status line shows hints used
  73  |     const statusLine = await page.locator('.status-line');
  74  |     let statusText = await statusLine.textContent();
  75  | 
  76  |     expect(statusText).toContain('HINTS:');
  77  |     expect(statusText).toContain('1/');
  78  | 
  79  |     // Use another hint
  80  |     await input.fill('HINT');
  81  |     await input.press('Enter');
  82  |     await page.waitForTimeout(200);
  83  | 
  84  |     statusText = await statusLine.textContent();
  85  |     expect(statusText).toContain('2/');
  86  |   });
  87  | 
  88  |   test('should prevent hints after limit reached', async ({ page }) => {
  89  |     const input = await page.locator('.command-input');
  90  | 
  91  |     // Use all 5 hints
  92  |     for (let i = 0; i < 5; i++) {
  93  |       await input.fill('HINT');
  94  |       await input.press('Enter');
  95  |       await page.waitForTimeout(100);
  96  |     }
  97  | 
  98  |     // Try to use one more hint
  99  |     await input.fill('HINT');
  100 |     await input.press('Enter');
  101 | 
  102 |     // Should show error
  103 |     const messageDiv = await page.locator('.message.error');
  104 |     const errorText = await messageDiv.textContent();
  105 | 
  106 |     expect(errorText).toContain('No more hints');
  107 |   });
  108 | 
  109 |   test('should clear screen with CLEAR command', async ({ page }) => {
  110 |     const input = await page.locator('.command-input');
  111 | 
  112 |     // Add some text
```