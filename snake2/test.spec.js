import { test, expect } from '@playwright/test';

test('snake game loads and starts', async ({ page }) => {
  // Enable console logging to see errors
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  // Navigate to the game
  await page.goto('file:///c:/Users/dajoh/Documents/code/catchpenny-colonnade.github.io/snake2/index.html');
  
  // Wait a moment for page to fully load
  await page.waitForTimeout(1000);
  
  // Check if canvas exists
  const canvas = await page.locator('canvas');
  expect(canvas).toBeDefined();
  
  // Take initial screenshot
  await page.screenshot({ path: 'snake-before.png' });
  console.log('Screenshot taken: snake-before.png');
  
  // Press SPACE to start game
  console.log('Pressing SPACE to start game...');
  await page.keyboard.press('Space');
  
  // Wait for game to start
  await page.waitForTimeout(500);
  
  // Check game status
  const status = await page.textContent('#status');
  console.log('Game status:', status);
  
  // Take screenshot after starting
  await page.screenshot({ path: 'snake-after-start.png' });
  
  // Send some input
  console.log('Sending arrow key inputs...');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowRight');
  
  // Wait for moves
  await page.waitForTimeout(1000);
  
  // Take final screenshot
  await page.screenshot({ path: 'snake-final.png' });
  
  // Check final score
  const score = await page.textContent('#score');
  console.log('Final score:', score);
});
