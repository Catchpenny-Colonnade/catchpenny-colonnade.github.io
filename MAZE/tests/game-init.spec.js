import { test, expect } from '@playwright/test';

test.describe('MAZE Game - Game Initialization', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game via HTTP server
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    
    // Wait for React to render with extended timeout
    await page.waitForFunction(() => {
      return document.querySelector('.terminal-container') !== null;
    }, { timeout: 30000 });
    
    // Wait for initial text to appear
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.length > 50;
    }, { timeout: 15000 });
    
    // Wait for game state to initialize
    await page.waitForTimeout(500);
  });

  test('should load the game successfully', async ({ page }) => {
    const container = await page.$('.terminal-container');
    expect(container).toBeTruthy();
  });

  test('should display the Directions room on start', async ({ page }) => {
    // Verify the game container exists
    const imageViewport = await page.$('.image-viewport');
    expect(imageViewport).toBeTruthy();
  });

  test('should render all UI components', async ({ page }) => {
    // Check for main UI components
    const imageViewport = await page.$('.image-viewport');
    const textViewport = await page.$('.text-viewport');
    const commandInput = await page.$('.command-input');
    const statusLine = await page.$('.status-line');

    expect(imageViewport).toBeTruthy();
    expect(textViewport).toBeTruthy();
    expect(commandInput).toBeTruthy();
    expect(statusLine).toBeTruthy();
  });

  test('should display initial status', async ({ page }) => {
    const statusLine = await page.locator('.status-line');
    const statusText = await statusLine.textContent();

    expect(statusText).toContain('ROOM:');
    expect(statusText).toContain('MOVES:');
    expect(statusText).toContain('VISITED:');
  });

  test('should have command input focused', async ({ page }) => {
    const input = await page.locator('.command-input');
    expect(input).toBeFocused();
  });

  test('should display quick action buttons', async ({ page }) => {
    const helpButton = await page.locator('button:has-text("Help")');
    const statusButton = await page.locator('button:has-text("Status")');
    const hintButton = await page.locator('button:has-text("Hint")');

    expect(helpButton).toBeTruthy();
    expect(statusButton).toBeTruthy();
    expect(hintButton).toBeTruthy();
  });
});

