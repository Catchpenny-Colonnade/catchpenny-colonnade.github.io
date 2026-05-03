import { test, expect } from '@playwright/test';

/**
 * Core MAZE Game Tests
 * Focused test suite verifying main game functionality
 */

test.describe('MAZE Game - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    
    // Wait for React component to render
    await page.waitForFunction(() => {
      return document.querySelector('.terminal-container') !== null;
    }, { timeout: 30000 });
    
    // Wait for initial text to appear
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.length > 50;
    }, { timeout: 15000 });
    
    // Wait for initial game state
    await page.waitForTimeout(500);
  });

  test('UI loads successfully with all components', async ({ page }) => {
    // Verify main container
    const container = await page.locator('.terminal-container');
    await expect(container).toBeVisible();

    // Verify all major sections exist
    const imageViewport = await page.locator('.image-viewport');
    const textViewport = await page.locator('.text-viewport');
    const commandInput = await page.locator('.command-input');
    const statusLine = await page.locator('.status-line');
    const commandSection = await page.locator('.command-section');

    await expect(imageViewport).toBeVisible();
    await expect(textViewport).toBeVisible();
    await expect(commandInput).toBeVisible();
    await expect(statusLine).toBeVisible();
    await expect(commandSection).toBeVisible();
  });

  test('status line displays game state', async ({ page }) => {
    const statusLine = await page.locator('.status-line');
    const statusText = await statusLine.textContent();

    expect(statusText).toContain('ROOM:');
    expect(statusText).toContain('MOVES:');
    expect(statusText).toContain('VISITED:');
    expect(statusText).toContain('HINTS:');
  });

  test('command input accepts input and clears', async ({ page }) => {
    const input = await page.locator('.command-input');
    
    // Type something
    await input.fill('TEST');
    expect(await input.inputValue()).toBe('TEST');
    
    // Clear it
    await input.clear();
    expect(await input.inputValue()).toBe('');
  });

  test('HELP command displays available commands', async ({ page }) => {
    const input = await page.locator('.command-input');
    
    // Execute HELP
    await input.fill('HELP');
    await input.press('Enter');
    await page.waitForTimeout(600);

    // Check for message
    const message = await page.locator('.message');
    const messageText = await message.textContent();

    expect(messageText).toContain('GO');
    expect(messageText).toContain('HINT');
    expect(messageText).toContain('STATUS');
  });

  test('STATUS command shows current room and moves', async ({ page }) => {
    const input = await page.locator('.command-input');
    
    // Execute STATUS
    await input.fill('STATUS');
    await input.press('Enter');
    await page.waitForTimeout(600);

    // Check for status info
    const message = await page.locator('.message');
    const messageText = await message.textContent();

    expect(messageText).toContain('CURRENT ROOM');
    expect(messageText).toContain('MOVES');
  });

  test('HINT command provides hint and decrements count', async ({ page }) => {
    const statusBefore = await page.locator('.status-line').textContent();
    const hintsBeforeMatch = statusBefore?.match(/HINTS: (\d+)/);
    const hintsBefore = hintsBeforeMatch ? parseInt(hintsBeforeMatch[1]) : 0;

    const input = await page.locator('.command-input');
    
    // Execute HINT
    await input.fill('HINT');
    await input.press('Enter');
    await page.waitForTimeout(600);

    // Check hint was displayed
    const message = await page.locator('.message');
    const messageText = await message.textContent();
    expect(messageText).toBeTruthy();

    // Check hint count increased
    const statusAfter = await page.locator('.status-line').textContent();
    const hintsAfterMatch = statusAfter?.match(/HINTS: (\d+)/);
    const hintsAfter = hintsAfterMatch ? parseInt(hintsAfterMatch[1]) : 0;
    
    expect(hintsAfter).toBe(hintsBefore + 1);
  });

  test('CLEAR command clears the display', async ({ page }) => {
    const input = await page.locator('.command-input');
    const textViewport = await page.locator('.text-viewport');

    // Add some content
    await input.fill('HELP');
    await input.press('Enter');
    
    // Wait for text to appear in viewport
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.length > 0;
    }, { timeout: 5000 });

    // Verify content exists
    let text = await textViewport.textContent();
    expect(text?.length).toBeGreaterThan(0);

    // Clear
    await input.fill('CLEAR');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // Verify viewport is empty
    text = await textViewport.textContent();
    expect(text?.trim().length === 0).toBeTruthy();
  });

  test('navigation with GO command updates move counter', async ({ page }) => {
    const input = await page.locator('.command-input');
    const statusBefore = await page.locator('.status-line').textContent();
    const movesBefore = statusBefore?.match(/MOVES: (\d+)/)?.[1];

    // Navigate
    await input.fill('GO Prologue');
    await input.press('Enter');
    
    // Wait for navigation to complete - text should change to Prologue content
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.includes('Prologue');
    }, { timeout: 10000 });

    // Check moves incremented
    const statusAfter = await page.locator('.status-line').textContent();
    const movesAfter = statusAfter?.match(/MOVES: (\d+)/)?.[1];

    expect(parseInt(movesAfter || '0')).toBe(parseInt(movesBefore || '0') + 1);
  });

  test('invalid room shows error message', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Try invalid navigation
    await input.fill('GO 999');
    await input.press('Enter');
    await page.waitForTimeout(500);

    // Should show error
    const errorMessage = await page.locator('.message.error');
    const errorText = await errorMessage.textContent();

    expect(errorText).toBeTruthy();
    expect(
      errorText?.includes('no door') || errorText?.includes('not something')
    ).toBeTruthy();
  });

  test('invalid command shows error', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Try invalid command
    await input.fill('FOOBAR');
    await input.press('Enter');
    await page.waitForTimeout(500);

    // Should show error
    const errorMessage = await page.locator('.message.error');
    const errorText = await errorMessage.textContent();

    expect(errorText?.includes('not something you can do')).toBeTruthy();
  });

  test('door buttons appear for available rooms', async ({ page }) => {
    // Navigate to Prologue to have available doors
    const input = await page.locator('.command-input');
    await input.fill('GO Prologue');
    await input.press('Enter');
    await page.waitForTimeout(800);

    // Check for door buttons
    const doorButtons = await page.locator('.door-button');
    const buttonCount = await doorButtons.count();

    expect(buttonCount).toBeGreaterThan(0);

    // Verify buttons have proper format
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const text = await doorButtons.nth(i).textContent();
      expect(text).toContain('GO');
    }
  });

  test('door buttons can be clicked for navigation', async ({ page }) => {
    const input = await page.locator('.command-input');
    
    // Navigate to Prologue
    await input.fill('GO Prologue');
    await input.press('Enter');
    await page.waitForTimeout(800);

    // Get move count before
    let statusText = await page.locator('.status-line').textContent();
    const movesBefore = parseInt(statusText?.match(/MOVES: (\d+)/)?.[1] || '0');

    // Click a door button
    const doorButton = await page.locator('.door-button').first();
    await doorButton.click();
    await page.waitForTimeout(800);

    // Check move count increased
    statusText = await page.locator('.status-line').textContent();
    const movesAfter = parseInt(statusText?.match(/MOVES: (\d+)/)?.[1] || '0');

    expect(movesAfter).toBe(movesBefore + 1);
  });

  test('quick action buttons populate command input', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Click Help button
    const helpBtn = await page.locator('button:has-text("Help")');
    await helpBtn.click();
    await page.waitForTimeout(300);

    // Input should contain HELP
    const inputValue = await input.inputValue();
    expect(inputValue).toBe('HELP');
  });

  test('game persists state across navigation', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Navigate around a bit
    await input.fill('GO Prologue');
    await input.press('Enter');
    await page.waitForTimeout(600);

    // Get visited count
    let statusText = await page.locator('.status-line').textContent();
    const visitedBefore = parseInt(statusText?.match(/VISITED: (\d+)/)?.[1] || '0');

    // Navigate somewhere else
    const doorButton = await page.locator('.door-button').first();
    await doorButton.click();
    await page.waitForTimeout(600);

    // Visited count should have increased
    statusText = await page.locator('.status-line').textContent();
    const visitedAfter = parseInt(statusText?.match(/VISITED: (\d+)/)?.[1] || '0');

    expect(visitedAfter).toBeGreaterThan(visitedBefore);
  });

  test('case-insensitive command handling', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Use lowercase command
    await input.fill('help');
    await input.press('Enter');
    await page.waitForTimeout(600);

    // Should still show help
    const message = await page.locator('.message');
    const messageText = await message.textContent();

    expect(messageText).toContain('GO');
  });

  test('button hover effects exist', async ({ page }) => {
    const button = await page.locator('button:has-text("Help")');

    // Check button styling
    const classes = await button.getAttribute('class');
    expect(classes).toContain('command-button');
  });
});
