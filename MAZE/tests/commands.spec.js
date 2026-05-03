import { test, expect } from '@playwright/test';

test.describe('MAZE Game - Commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    
    await page.waitForFunction(() => {
      return document.querySelector('.terminal-container') !== null;
    }, { timeout: 30000 });
    
    // Wait for initial text to appear
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.length > 50;
    }, { timeout: 15000 });
  });

  test('should show HELP command output', async ({ page }) => {
    const input = await page.locator('.command-input');
    await input.fill('HELP');
    await input.press('Enter');

    // Should show help message
    const messageDiv = await page.locator('.message');
    const helpText = await messageDiv.textContent();

    expect(helpText).toBeTruthy();
    expect(helpText).toContain('COMMANDS');
    expect(helpText).toContain('GO');
    expect(helpText).toContain('HINT');
    expect(helpText).toContain('STATUS');
  });

  test('should show STATUS command output', async ({ page }) => {
    const input = await page.locator('.command-input');
    await input.fill('STATUS');
    await input.press('Enter');

    // Should show status message
    const messageDiv = await page.locator('.message');
    const statusText = await messageDiv.textContent();

    expect(statusText).toBeTruthy();
    expect(statusText).toContain('CURRENT ROOM');
    expect(statusText).toContain('MOVES');
    expect(statusText).toContain('HINTS USED');
  });

  test('should provide hint about unvisited rooms', async ({ page }) => {
    const input = await page.locator('.command-input');
    await input.fill('HINT');
    await input.press('Enter');

    // Should show hint message
    const messageDiv = await page.locator('.message');
    const hintText = await messageDiv.textContent();

    expect(hintText).toBeTruthy();
    expect(
      hintText?.includes("haven't explored") || hintText?.includes('not been to')
    ).toBeTruthy();
  });

  test('should track hints used', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Use a hint
    await input.fill('HINT');
    await input.press('Enter');
    await page.waitForTimeout(200);

    // Check status line shows hints used
    const statusLine = await page.locator('.status-line');
    let statusText = await statusLine.textContent();

    expect(statusText).toContain('HINTS:');
    expect(statusText).toContain('1/');

    // Use another hint
    await input.fill('HINT');
    await input.press('Enter');
    await page.waitForTimeout(200);

    statusText = await statusLine.textContent();
    expect(statusText).toContain('2/');
  });

  test('should prevent hints after limit reached', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Use all 5 hints
    for (let i = 0; i < 5; i++) {
      await input.fill('HINT');
      await input.press('Enter');
      await page.waitForTimeout(100);
    }

    // Try to use one more hint
    await input.fill('HINT');
    await input.press('Enter');

    // Should show error
    const messageDiv = await page.locator('.message.error');
    const errorText = await messageDiv.textContent();

    expect(errorText).toContain('No more hints');
  });

  test('should clear screen with CLEAR command', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Add some text
    await input.fill('HELP');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // Wait for text to appear in viewport (room description or message)
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.length > 0;
    }, { timeout: 5000 });

    // Check text viewport has content
    let textViewport = await page.locator('.text-viewport');
    let viewportText = await textViewport.textContent();
    expect(viewportText?.length).toBeGreaterThan(0);

    // Clear screen
    await input.fill('CLEAR');
    await input.press('Enter');
    await page.waitForTimeout(200);

    // Text viewport should be empty
    viewportText = await textViewport.textContent();
    expect(viewportText?.trim().length === 0).toBeTruthy();
  });

  test('should handle case-insensitive commands', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Test with lowercase
    await input.fill('help');
    await input.press('Enter');

    // Should show help message
    const messageDiv = await page.locator('.message');
    const helpText = await messageDiv.textContent();

    expect(helpText).toBeTruthy();
    expect(helpText).toContain('COMMANDS');
  });

  test('should reject invalid commands', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Try invalid command
    await input.fill('INVALID');
    await input.press('Enter');

    // Should show error
    const messageDiv = await page.locator('.message.error');
    const errorText = await messageDiv.textContent();

    expect(errorText).toBeTruthy();
    expect(errorText).toContain('not something you can do');
  });

  test('should handle empty input gracefully', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Empty input
    await input.fill('');
    await input.press('Enter');

    // Should not crash, input should be cleared
    const inputValue = await input.inputValue();
    expect(inputValue).toBe('');
  });
});
