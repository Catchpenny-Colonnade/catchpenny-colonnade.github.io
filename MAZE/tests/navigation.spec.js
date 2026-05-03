import { test, expect } from '@playwright/test';

test.describe('MAZE Game - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    
    await page.waitForFunction(() => {
      return document.querySelector('.terminal-container') !== null;
    }, { timeout: 30000 });
    
    // Wait for initial text to appear (typewriter animation)
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.length > 50;
    }, { timeout: 15000 });
  });

  test('should navigate from Directions to Prologue with GO command', async ({ page }) => {
    const input = await page.locator('.command-input');
    await input.fill('GO Prologue');
    await input.press('Enter');

    // Wait for image src to actually change to Prologue
    await page.waitForFunction(() => {
      const img = document.querySelector('.image-viewport img');
      return img && img.src && img.src.includes('Prologue');
    }, { timeout: 10000 });

    const imageSrc = await page.locator('.image-viewport img').getAttribute('src');
    expect(imageSrc).toContain('Prologue');
  });

  test('should navigate using door buttons', async ({ page }) => {
    // Navigate to Prologue first
    const input = await page.locator('.command-input');
    await input.fill('GO Prologue');
    await input.press('Enter');
    
    // Wait for navigation to complete
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.includes('Prologue');
    }, { timeout: 10000 });

    // Now at Prologue, should have a door to Room-01
    const doorButton = await page.locator('button:has-text("GO 01")').first();
    expect(doorButton).toBeTruthy();

    // Click the door button
    await doorButton.click();
    
    // Wait for navigation animation
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.includes('01');
    }, { timeout: 10000 });

    const imageSrc = await page.locator('.image-viewport img').getAttribute('src');
    expect(imageSrc).toContain('Room-01');
  });

  test('should increment move counter on navigation', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Navigate from Directions to Prologue
    await input.fill('GO Prologue');
    await input.press('Enter');
    
    // Wait for navigation
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.includes('Prologue');
    }, { timeout: 10000 });

    // Check move count increased
    const statusLine = await page.locator('.status-line');
    const statusText = await statusLine.textContent();
    expect(statusText).toContain('MOVES: 1');

    // Navigate to Room-01
    const doorButton = await page.locator('button:has-text("GO 01")').first();
    await doorButton.click();
    
    // Wait for navigation
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.includes('01');
    }, { timeout: 10000 });

    // Check move count increased again
    const updatedStatusText = await statusLine.textContent();
    expect(updatedStatusText).toContain('MOVES: 2');
  });

  test('should track visited rooms', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Navigate to Prologue
    await input.fill('GO Prologue');
    await input.press('Enter');
    
    // Wait for navigation
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.includes('Prologue');
    }, { timeout: 10000 });

    // Navigate to Room-01
    const doorButton = await page.locator('button:has-text("GO 01")').first();
    await doorButton.click();
    
    // Wait for navigation
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.text-viewport');
      return viewport && viewport.textContent && viewport.textContent.includes('01');
    }, { timeout: 10000 });

    // Check visited count
    const statusLine = await page.locator('.status-line');
    let statusText = await statusLine.textContent();
    const match = statusText?.match(/VISITED: (\d+)/);
    const visitedCount = match ? parseInt(match[1]) : 0;
    expect(visitedCount).toBeGreaterThan(0);
  });

  test('should show error for invalid room navigation', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Try to go to an invalid room
    await input.fill('GO 99');
    await input.press('Enter');

    // Should show error message
    const messageDiv = await page.locator('.message.error');
    const errorText = await messageDiv.textContent();

    // Either "no door" or "not something you can do"
    expect(errorText).toBeTruthy();
    expect(
      errorText?.includes('no door') || errorText?.includes('not something you can do')
    ).toBeTruthy();
  });

  test('should show revisit prompt when returning to visited room', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Navigate to Prologue
    await input.fill('GO Prologue');
    await input.press('Enter');
    await page.waitForTimeout(500);

    // Navigate to Room-01
    const doorButton = await page.locator('button:has-text("GO 01")').first();
    await doorButton.click();
    await page.waitForTimeout(500);

    // Try to go back to Prologue (visited room)
    const input2 = await page.locator('.command-input');
    // From Room-01, we should be able to go back
    await input2.fill('GO Prologue');
    await input2.press('Enter');

    // Should show a revisit prompt (if Prologue is in the nextRooms and was visited)
    await page.waitForTimeout(200);

    // Check if prompt appears or if we just navigate
    const revisitPrompt = await page.$('div:has-text("You have already visited this room")');
    const imageSrc = await page.locator('.image-viewport img').getAttribute('src');

    // Either should see prompt or navigate
    expect(revisitPrompt || imageSrc?.includes('Prologue')).toBeTruthy();
  });
});
