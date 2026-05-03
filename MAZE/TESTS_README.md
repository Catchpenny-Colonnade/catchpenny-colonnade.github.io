# MAZE Game - Test Suite

## Overview

Comprehensive Playwright test suite for the MAZE game with 4 test modules covering core functionality, navigation, commands, and victory conditions.

## Test Files

### 1. **smoke.spec.js** (4 tests)
Quick verification tests for game loading and basic functionality:
- ✅ Game UI loads successfully
- ✅ Command input accepts text
- ✅ HELP command executes
- ✅ Navigation updates move counter

### 2. **game-init.spec.js** (7 tests)
Game initialization and UI component verification:
- ✅ Game loads successfully
- ✅ Directions room displays on start
- ✅ All UI components render (image, text, input, status)
- ✅ Initial status displays correctly
- ✅ Command input is focused
- ✅ Quick action buttons present (Help, Status, Hint)

### 3. **commands.spec.js** (9 tests)
Command system testing:
- ✅ HELP command displays available commands
- ✅ STATUS command shows current state
- ✅ HINT command provides unvisited rooms
- ✅ Hints are tracked (max 5)
- ✅ Hint limit enforced
- ✅ CLEAR command empties display
- ✅ Case-insensitive commands
- ✅ Invalid commands show error
- ✅ Empty input handled gracefully

### 4. **navigation.spec.js** (7 tests)
Room navigation testing:
- ✅ GO command navigates between rooms
- ✅ Door buttons trigger navigation
- ✅ Move counter increments
- ✅ Visited rooms tracked
- ✅ Invalid rooms show error
- ✅ Revisit prompts work
- ✅ Visited rooms persist state

### 5. **victory-mechanics.spec.js** (7 tests)
Victory condition and game mechanics:
- ✅ Room-45 triggers victory
- ✅ Victory screen displays stats
- ✅ Play Again button appears
- ✅ Replay resets game state
- ✅ Dead-end detection works
- ✅ Room images update correctly
- ✅ Door buttons show only valid exits

### 6. **core.spec.js** (16 tests)
Comprehensive core functionality tests:
- ✅ UI loads with all components
- ✅ Status line displays game state
- ✅ Command input accepts and clears
- ✅ HELP command output
- ✅ STATUS command output
- ✅ HINT system works
- ✅ CLEAR command works
- ✅ Navigation updates moves
- ✅ Invalid room error
- ✅ Invalid command error
- ✅ Door buttons appear
- ✅ Door buttons clickable
- ✅ Quick buttons work
- ✅ State persists
- ✅ Case insensitivity
- ✅ Button styling

## Total Test Coverage

- **Total Tests**: 50 tests across 6 modules
- **Coverage Areas**:
  - Game initialization and UI rendering
  - Command parsing and execution
  - Room navigation and validation
  - Game state management
  - Victory detection
  - Error handling
  - User interaction (keyboard, mouse)

## Running Tests

### Prerequisites
```bash
npm install
# or
npm install @playwright/test http-server
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npx playwright test tests/smoke.spec.js
npx playwright test tests/core.spec.js
```

### Run in Headed Mode (see browser)
```bash
npm run test:headed
```

### Debug Mode
```bash
npm run test:debug
```

### UI Mode (interactive)
```bash
npm run test:ui
```

## Test Configuration

**playwright.config.js**:
- Browser: Chromium
- Timeout: 60 seconds per test
- Workers: 1 (sequential execution)
- Web Server: http-server on port 8080
- Screenshots: On failure only
- Trace: On first retry
- Reporter: HTML report (test-results/)

## Key Test Patterns

### 1. Game State Verification
Tests verify move counts, visited rooms, hints used, and current room through the status line.

### 2. Command Execution
Tests execute commands via input field, verify output messages, and check state changes.

### 3. Navigation Testing
Tests verify room transitions via both GO commands and door buttons, checking game state updates.

### 4. Error Handling
Tests verify proper error messages for invalid rooms, invalid commands, and boundary conditions.

### 5. UI Responsiveness
Tests verify all UI components render, accept input, and update in response to game actions.

## Common Test Issues & Solutions

### Issue: Tests timeout during navigation
**Solution**: Increase timeout in config, ensure HTTP server is running, wait for state updates with `page.waitForTimeout()`

### Issue: Element not found errors
**Solution**: Add explicit waits for elements before interaction, use `waitForSelector` for dynamic content

### Issue: Stale elements
**Solution**: Re-query locators rather than storing references, use `page.waitForFunction()` for state changes

### Issue: Flaky timing
**Solution**: Use longer waits for typewriter animation completion (~1000ms minimum), avoid relying on fixed timeouts

## Test Results Interpretation

- **PASSED (✓)**: Test completed successfully, all assertions passed
- **FAILED (✗)**: Assertion failed or element not found
- **TIMEOUT**: Test exceeded 60-second limit (usually indicates page not loading)
- **ERROR**: Unexpected runtime error

See `test-results/index.html` for detailed HTML report after each run.

## Continuous Integration

For CI/CD pipelines:
```bash
CI=true npm test
```

This enables:
- Screenshot capture on failure
- Retry on transient failures
- Detailed trace collection
- HTML report generation

## Future Test Enhancements

1. Add visual regression tests for UI consistency
2. Performance tests (load time, navigation speed)
3. Accessibility tests (keyboard navigation, screen reader)
4. Mobile responsiveness tests
5. Stress tests (rapid navigation, repeated commands)
6. Network error simulation tests
