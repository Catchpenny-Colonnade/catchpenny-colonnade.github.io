#!/bin/bash
# Run Playwright tests for MAZE game

cd "$(dirname "$0")" || exit 1

echo "=========================================="
echo "MAZE Game - Playwright Test Suite"
echo "=========================================="
echo ""
echo "Starting http-server on port 8080..."
npx http-server . -p 8080 -s 2>/dev/null &
SERVER_PID=$!

# Give server time to start
sleep 3

echo "Starting Playwright tests..."
echo ""

npx playwright test --reporter=html

TEST_RESULT=$?

# Kill the server
kill $SERVER_PID 2>/dev/null

if [ $TEST_RESULT -eq 0 ]; then
  echo ""
  echo "=========================================="
  echo "✅ All tests passed!"
  echo "=========================================="
  echo "View detailed results:"
  echo "  playwright show-report"
else
  echo ""
  echo "=========================================="
  echo "❌ Some tests failed"
  echo "=========================================="
  echo "View detailed results:"
  echo "  playwright show-report"
fi

exit $TEST_RESULT
