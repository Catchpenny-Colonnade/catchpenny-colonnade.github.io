# MAZE Game - Playwright Test Suite - Quick Reference

## Installation

```bash
cd MAZE
npm install
```

This installs Playwright and all test dependencies.

## Running Tests

### All Tests
```bash
npm test
```
Runs all 50+ tests across all modules. Expected runtime: 5-10 minutes.

### Quick Smoke Tests (Recommended First Run)
```bash
npx playwright test tests/smoke.spec.js
```
4 quick tests to verify game loads and basic features work. Runtime: 30-60 seconds.

### By Category

**Game Initialization** (7 tests)
```bash
npx playwright test tests/game-init.spec.js
```
Verifies React loads, UI components render, initial state.

**Commands System** (9 tests)
```bash
npx playwright test tests/commands.spec.js
```
Tests HELP, STATUS, HINT, CLEAR commands and error handling.

**Navigation** (7 tests)
```bash
npx playwright test tests/navigation.spec.js
```
Tests room transitions, move tracking, visited rooms.

**Victory & Mechanics** (7 tests)
```bash
npx playwright test tests/victory-mechanics.spec.js
```
Tests reaching Room-45, victory screen, game state.

**Core Functionality** (16 tests)
```bash
npx playwright test tests/core.spec.js
```
Comprehensive tests for UI, state, interaction.

### Interactive Modes

**Headed Mode** (see browser)
```bash
npm run test:headed
```
Shows browser window while tests run. Great for debugging.

**Debug Mode**
```bash
npm run test:debug
```
Launches Playwright Inspector with step-by-step execution.

**UI Mode** (test selection interface)
```bash
npm run test:ui
```
Interactive UI to select and run individual tests.

## Viewing Results

### HTML Report
```bash
npx playwright show-report
```
Opens detailed HTML report with:
- Test names and timing
- Pass/fail status
- Screenshots of failures
- Console output
- Network logs

### Command-Line Output
Add `--reporter=list` to see terminal output:
```bash
npx playwright test --reporter=list
```

## Troubleshooting

### "Port 8080 already in use"
```bash
# Find process using port 8080
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill the process
kill <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### "Cannot find module '@playwright/test'"
```bash
npm install @playwright/test --save-dev
```

### Tests hang or timeout
1. Ensure HTTP server started
2. Check localhost:8080 is accessible
3. Increase timeout in `playwright.config.js`
4. Run single test: `npx playwright test tests/smoke.spec.js -g "should load"`

### Game doesn't load in test
1. Verify `index.html` exists
2. Check `scripts/game.js` loads
3. Verify `assets/results.json` path is correct
4. Check browser console for errors: add `await page.on('console', msg => console.log(msg))`

## Individual Test Examples

### Run Single Test by Name
```bash
npx playwright test -g "should navigate from Directions"
```

### Run Tests with Pattern
```bash
npx playwright test -g "navigation"
npx playwright test -g "command"
```

### Run with Specific Browser
```bash
npx playwright test --project=chromium
```

### Verbose Output
```bash
npx playwright test --reporter=verbose
```

## Configuration Options

Edit `playwright.config.js` to customize:

```javascript
module.exports = defineConfig({
  timeout: 60000,           // Per test timeout
  workers: 1,              // Number of parallel workers
  retries: 0,              // Retry failures
  reporter: 'html',        // Report format
  use: {
    screenshot: 'only-on-failure',  // Capture mode
    trace: 'on-first-retry',        // Trace collection
  },
});
```

## Advanced Usage

### Debugging a Single Test
```bash
npx playwright test tests/smoke.spec.js -g "should load" --debug
```

### Run with Video Recording
```bash
npx playwright test --video=on
```

### Run with Network Throttling
Edit config or use CLI option to simulate slow networks.

### Trace Viewer
After test failure:
```bash
npx playwright show-trace path/to/trace.zip
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

### Environment Variable
```bash
CI=true npm test
```

## File Locations

- **Test files**: `tests/*.spec.js`
- **Configuration**: `playwright.config.js`
- **Results**: `test-results/index.html`
- **Game code**: `scripts/game.js`
- **Styles**: `styles.css`
- **Game data**: `assets/results.json`

## Test Structure

Each test file imports:
```javascript
import { test, expect } from '@playwright/test';
```

Basic test structure:
```javascript
test('test name', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForSelector('.terminal-container');
  
  // Test actions
  const element = page.locator('.element-class');
  await element.click();
  
  // Assertions
  expect(await element.textContent()).toBe('expected');
});
```

## Common Assertions

```javascript
// Visibility
await expect(page.locator('.element')).toBeVisible();

// Text content
await expect(page.locator('.element')).toContainText('text');

// Value
expect(await element.inputValue()).toBe('value');

// Count
expect(await page.locator('.item').count()).toBe(3);

// Attribute
expect(await element.getAttribute('href')).toBe('/url');

// Class
expect(await element.getAttribute('class')).toContain('active');
```

## Performance

Typical test suite run times:
- Smoke tests: 1-2 minutes
- Game init: 1-2 minutes  
- Commands: 2-3 minutes
- Navigation: 2-3 minutes
- Victory: 2-3 minutes
- Core: 3-5 minutes
- **Total**: 5-10 minutes

## Support

For issues:
1. Check `TESTS_README.md` for detailed documentation
2. Review test output and screenshots
3. Enable `--debug` mode for step-by-step execution
4. Check Playwright docs: https://playwright.dev/docs/intro

---

**Last updated**: April 27, 2026  
**Playwright version**: 1.44+  
**Test count**: 50+  
**Coverage**: All major game features
