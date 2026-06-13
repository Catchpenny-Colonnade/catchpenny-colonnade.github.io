# Quick Setup: Test Database

Tests require a separate `sudoku_research_test` database.

## One-Time Setup

```bash
# Create the test database
createdb -U postgres -E UTF8 sudoku_research_test
```

That's it! Tests will then automatically:
- Verify the database exists
- Initialize schema from `schema.sql`
- Truncate tables before each test
- Verify schemas match between databases

## Run Tests

```bash
lein with-profile integration-test test
```

## If Database Needs to be Dropped

```bash
dropdb -U postgres sudoku_research_test
```

Then recreate it with the command above.
