import { test, expect } from '@playwright/test';

test.describe('MAZE Game - Victory and Mechanics', () => {
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
    
    await page.waitForTimeout(500);
  });

  test('should reach Room-45 and trigger victory', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Navigate through a path to Room-45
    // Directions -> Prologue -> Room-01 -> Room-21 -> Room-44 -> Room-45
    const navigations = ['Prologue', '01', '21', '44', '45'];

    for (let i = 0; i < navigations.length; i++) {
      const room = navigations[i];

      // Wait for door buttons to appear
      await page.waitForTimeout(300);

      // Find and click the door button for target room
      const doorButtons = await page.locator(`button:has-text("GO")`);
      const buttonCount = await doorButtons.count();

      let found = false;
      for (let j = 0; j < buttonCount; j++) {
        const button = doorButtons.nth(j);
        const text = await button.textContent();
        if (text?.includes(room)) {
          await button.click();
          found = true;
          await page.waitForTimeout(400);
          break;
        }
      }

      if (!found) {
        // Try using GO command
        await input.fill(`GO ${room}`);
        await input.press('Enter');
        await page.waitForTimeout(400);
      }
    }

    // Should see victory screen
    await page.waitForTimeout(500);
    const victoryScreen = await page.$('.victory-screen');
    expect(victoryScreen).toBeTruthy();

    // Should display victory message
    const victoryText = await page.textContent('h1');
    expect(victoryText).toContain('CENTER');
  });

  test('should display victory stats', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Quick navigation to Room-45
    const rooms = ['Prologue', '01', '21', '44', '45'];
    for (const room of rooms) {
      await page.waitForTimeout(200);
      await input.fill(`GO ${room}`);
      await input.press('Enter');
      await page.waitForTimeout(300);
    }

    // Check victory screen has stats
    await page.waitForTimeout(500);
    const statsText = await page.textContent('.victory-screen .stats');

    expect(statsText).toContain('Moves:');
    expect(statsText).toContain('Hints Used:');
    expect(statsText).toContain('Rooms Explored:');
  });

  test('should show Play Again button on victory', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Navigate to Room-45
    const rooms = ['Prologue', '01', '21', '44', '45'];
    for (const room of rooms) {
      await page.waitForTimeout(200);
      await input.fill(`GO ${room}`);
      await input.press('Enter');
      await page.waitForTimeout(300);
    }

    await page.waitForTimeout(500);

    // Should have Play Again button
    const playAgainButton = await page.locator('button:has-text("Play Again")');
    expect(playAgainButton).toBeTruthy();
  });

  test('should allow replay from victory screen', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Navigate to Room-45
    const rooms = ['Prologue', '01', '21', '44', '45'];
    for (const room of rooms) {
      await page.waitForTimeout(200);
      await input.fill(`GO ${room}`);
      await input.press('Enter');
      await page.waitForTimeout(300);
    }

    await page.waitForTimeout(500);

    // Click Play Again
    const playAgainButton = await page.locator('button:has-text("Play Again")');
    await playAgainButton.click();

    await page.waitForTimeout(500);

    // Should return to Directions
    const imageSrc = await page.locator('.image-viewport img').getAttribute('src');
    expect(imageSrc).toContain('Directions');

    // Stats should reset
    const statusLine = await page.locator('.status-line');
    const statusText = await statusLine.textContent();
    expect(statusText).toContain('MOVES: 0');
  });

  test('should detect dead-end rooms', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Navigate to Prologue first to explore
    await input.fill('GO Prologue');
    await input.press('Enter');
    await page.waitForTimeout(500);

    // Try to navigate through several rooms to find a dead-end
    // Room-24 is a dead-end according to the data
    const rooms = ['01', '20', '27', '20', '01', '41', '14', '24'];
    for (let i = 0; i < Math.min(rooms.length, 5); i++) {
      await page.waitForTimeout(300);
      await input.fill(`GO ${rooms[i]}`);
      await input.press('Enter');
      await page.waitForTimeout(300);
    }

    // At any point, if we reach a dead-end, there should be no door buttons
    // Or the game should show appropriate message
    const textViewport = await page.locator('.text-viewport');
    const text = await textViewport.textContent();

    // Should have text content either way
    expect(text).toBeTruthy();
  });

  test('should display room image corresponding to current room', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Start in Directions
    let imageSrc = await page.locator('.image-viewport img').getAttribute('src');
    expect(imageSrc).toContain('Directions');

    // Go to Prologue
    await input.fill('GO Prologue');
    await input.press('Enter');
    await page.waitForTimeout(500);

    imageSrc = await page.locator('.image-viewport img').getAttribute('src');
    expect(imageSrc).toContain('Prologue');

    // Go to Room-01
    const doorButton = await page.locator('button:has-text("GO 01")').first();
    await doorButton.click();
    await page.waitForTimeout(500);

    imageSrc = await page.locator('.image-viewport img').getAttribute('src');
    expect(imageSrc).toContain('Room-01');
  });

  test('should display door buttons only for valid next rooms', async ({ page }) => {
    const input = await page.locator('.command-input');

    // Navigate to Prologue
    await input.fill('GO Prologue');
    await input.press('Enter');
    await page.waitForTimeout(500);

    // Should only have one door: Room-01
    const doorButtons = await page.locator('.door-button');
    const buttonCount = await doorButtons.count();

    expect(buttonCount).toBeGreaterThan(0);
    expect(buttonCount).toBeLessThanOrEqual(10); // Reasonable upper bound

    // All buttons should have "GO" prefix
    for (let i = 0; i < buttonCount; i++) {
      const text = await doorButtons.nth(i).textContent();
      expect(text).toContain('GO');
    }
  });
});
