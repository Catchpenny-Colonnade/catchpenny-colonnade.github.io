import { test, expect } from '@playwright/test';

/**
 * MAZE Game - Smoke Tests
 * Minimal tests to verify core game functionality
 */

test.describe('MAZE Game', () => {
  test('should load and display game UI', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for the game container to exist
    await page.waitForSelector('.terminal-container', { timeout: 30000 });
    
    // Verify key elements exist
    await expect(page.locator('.image-viewport')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.text-viewport')).toBeVisible();
    await expect(page.locator('.command-input')).toBeVisible();
    await expect(page.locator('.status-line')).toBeVisible();
  });

  test('should accept command input', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('.command-input', { timeout: 10000 });
    
    const input = page.locator('.command-input');
    await input.focus();
    await input.type('HELP');
    
    const value = await input.inputValue();
    expect(value).toBe('HELP');
  });

  test('should execute HELP command', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('.command-input', { timeout: 10000 });
    
    const input = page.locator('.command-input');
    await input.focus();
    await input.type('HELP', { delay: 50 });
    await input.press('Enter');
    
    // Wait for message to appear
    await page.waitForSelector('.message', { timeout: 5000 });
    const messageText = await page.locator('.message').first().textContent();
    
    expect(messageText).toBeTruthy();
    expect(messageText).toContain('GO');
  });

  test('should navigate between rooms', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('.command-input', { timeout: 10000 });
    
    // Get initial move count
    const statusBefore = await page.locator('.status-line').textContent();
    const movesBefore = parseInt(statusBefore?.match(/MOVES: (\d+)/)?.[1] || '0');
    
    // Execute navigation command
    const input = page.locator('.command-input');
    await input.focus();
    await input.type('GO Prologue', { delay: 30 });
    await input.press('Enter');
    
    // Wait for state update
    await page.waitForTimeout(800);
    
    // Check move count increased
    const statusAfter = await page.locator('.status-line').textContent();
    const movesAfter = parseInt(statusAfter?.match(/MOVES: (\d+)/)?.[1] || '0');
    
    expect(movesAfter).toBe(movesBefore + 1);
  });
});
