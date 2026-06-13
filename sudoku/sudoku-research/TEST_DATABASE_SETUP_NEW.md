# Test Database Setup

## Overview
Tests use a **separate, isolated database** (`sudoku_research_test`) to ensure they never interact with live data. The test database is **automatically created** during test setup.

✅ **No manual setup required** — tests handle everything  
✅ **Complete isolation** — separate database from live data  
✅ **Automatic cleanup** — tables truncated before each test run  
✅ **Schema verification** — test and live schemas automatically compared  

## How It Works

### Automatic Setup

When tests run:

1. **Test database creation** (if needed):
   ```clojure
   (fixtures/ensure-test-db-exists)  ; Creates sudoku_research_test if missing
   ```

2. **Schema initialization**:
   - Connects to test database
   - Runs `schema.sql` from resources
   - Creates all tables and indexes

3. **Table cleanup**:
   - Truncates all tables before each test run
   - Resets identity sequences
   - Ensures clean test environment

4. **Schema verification**:
   - Compares table structures between databases
   - Verifies column names, types, and constraints match
   - Fails tests if schemas diverge

## Database Separation

| Database | Purpose | Created By |
|----------|---------|-----------|
| `sudoku_research` | Development/live data | Manual setup or application deployment |
| `sudoku_research_test` | Testing only | Tests (automatic) |

## Running Tests

### Just Run Tests

No setup required! Tests automatically handle everything:

```bash
lein with-profile integration-test test
```

**Expected output:**
```
[SETUP] Test database sudoku_research_test already exists
[OK] Database schema initialized
Testing sudoku-research.schema-verification-test
  schemas-match-test ✓
```

## Under the Hood

### Test Fixture Flow

```clojure
;; 1. Ensure test database exists
(fixtures/ensure-test-db-exists)  

;; 2. Initialize connection with schema
(db-conn/initialize-db! {:dbname "sudoku_research_test"})

;; 3. Truncate tables for clean state
(fixtures/clean-db-each conn)

;; 4. Run tests
;; (test code here)

;; 5. Close connection
(db-conn/close-db! conn)
```

### Key Functions

**In `db_fixtures.clj`:**
- `ensure-test-db-exists` — Creates test database if missing
- `initialize-db-once` — Sets up database once per test run
- `clean-db-each` — Truncates tables before each test
- `cleanup-db` — Closes database connection

**In `connection.clj`:**
- `initialize-db!` — Connects and runs schema
- `connect` — Creates a connection (accepts `:dbname` override)

## Prerequisites

PostgreSQL must be running on the configured host:

```bash
# Verify PostgreSQL is running
pg_isready -h localhost -p 5432
```

If PostgreSQL is not accessible, tests gracefully skip with:
```
[WARNING] Could not connect to PostgreSQL to ensure test database exists
```

## Schema Verification

The `schemas-match-test` automatically runs and verifies:

✅ Both databases have identical table names  
✅ All tables have same column names in same order  
✅ All columns have identical data types  
✅ Primary keys and constraints match  

**If schemas diverge:**
```
FAIL: Table 'original_puzzles' has different column count:
      live=5 test=4
```

This indicates the test database schema wasn't updated. The test will:
1. Show which table differs
2. Show what the difference is  
3. Suggest running migrations if needed

## Cleanup

The test database persists between runs for debugging purposes. If you want to drop it:

```bash
dropdb -U postgres sudoku_research_test
```

It will be automatically recreated on the next test run.

## Why This Approach

✅ **No manual steps** — developers just run tests  
✅ **Guaranteed isolation** — live data is never touched  
✅ **Reproducible** — same test environment every run  
✅ **Self-documenting** — fixture code shows the setup process  
✅ **Fast** — truncate is faster than recreating database  
✅ **Schema safety** — verification prevents divergence  

## Troubleshooting

### Tests fail to find test database

If you see:
```
FATAL: database "sudoku_research_test" does not exist
```

This means either:
1. PostgreSQL isn't running
2. Connection failed

Check PostgreSQL is running:
```bash
pg_isready -h localhost -p 5432
```

### "Connection refused" error

PostgreSQL is not accessible. Check:
```bash
# Is PostgreSQL running?
ps aux | grep postgres

# Is it listening on the right port?
netstat -an | grep 5432
```

### Schema mismatch detected

Test database schema doesn't match live database. This can happen if:
1. Migrations were run on live database only
2. Database files are corrupted

Solution: Drop test database and let it be recreated:
```bash
dropdb -U postgres sudoku_research_test
lein with-profile integration-test test
```
