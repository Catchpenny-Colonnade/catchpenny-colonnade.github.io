# Test Database Setup

## Overview
Tests now use a **separate, isolated database** (`sudoku_research_test`) to ensure they never interact with live data. This provides complete test isolation and safety.

A **schema verification test** automatically ensures both databases have matching schemas on every test run.

## Database Separation

| Database | Purpose | Used By |
|----------|---------|---------|
| `sudoku_research` | Development/live data | Application code, manual queries |
| `sudoku_research_test` | Testing only | All test suites (integration & external) |

## Quick Start

### 1. Run Setup Script

**Windows (PowerShell):**
```powershell
.\setup-test-databases.ps1
```

**Linux/macOS (Bash):**
```bash
bash setup-test-databases.sh
```

Or set database credentials:
```powershell
# PowerShell
.\setup-test-databases.ps1 -DbUser postgres -DbHost localhost -DbPort 5432

# Bash
DB_USER=postgres DB_HOST=localhost DB_PORT=5432 bash setup-test-databases.sh
```

### 2. Run Tests

```bash
lein with-profile integration-test test
```

Tests will automatically:
- Connect to `sudoku_research_test`
- Initialize schema from `schema.sql`
- Run schema verification (compares both databases)
- Execute all tests in isolation
- Truncate tables after each test run

## Schema Verification

The `schemas-match-test` runs automatically before integration tests and verifies:

✅ Both databases have the same tables  
✅ All tables have identical column names  
✅ All columns have identical data types  
✅ Primary keys and constraints match  

If schemas diverge, tests fail with a clear error message showing the differences.

## Setup Instructions (Manual)

If you prefer to create databases manually:

### 1. Create Live Database

```sql
CREATE DATABASE sudoku_research
  WITH ENCODING 'UTF8'
       OWNER postgres;
```

### 2. Create Test Database

```sql
CREATE DATABASE sudoku_research_test
  WITH ENCODING 'UTF8'
       OWNER postgres;
```

### 3. Verify Setup

```bash
lein with-profile integration-test test
```

You should see:
```
✓ Live database 'sudoku_research' already exists
✓ Test database 'sudoku_research_test' already exists
[OK] Database schema initialized
Testing sudoku-research.schema-verification-test
  schemas-match-test ✓
```

## Connection Details

### Development Code
```clojure
(db-conn/initialize-db!)  ; Uses sudoku_research
```

### Integration Tests
```clojure
(db-conn/initialize-db! {:dbname "sudoku_research_test"})  ; Uses sudoku_research_test
```

Or via fixture helpers:
```clojure
(fixtures/initialize-db-once)  ; Automatically uses sudoku_research_test
```

## Cleanup

The test database can be safely dropped at any time without affecting live data:

**PowerShell:**
```powershell
.\setup-test-databases.ps1  # Shows how to drop it
dropdb -U postgres sudoku_research_test
```

**Bash:**
```bash
dropdb -U postgres sudoku_research_test
```

It will be automatically recreated on the next test run.

## Why This Matters

✅ **Safety**: Tests can never corrupt production/development data  
✅ **Confidence**: Tests run in complete isolation  
✅ **Repeatability**: Tests can be run repeatedly without side effects  
✅ **Schema Sync**: Automatic verification ensures test and live schemas always match  
✅ **Debugging**: You can examine test data separately from live data  

## Troubleshooting

### "Connection refused" Error
Make sure PostgreSQL is running on the configured host and port:
```bash
# Verify PostgreSQL is running
pg_isready -h localhost -p 5432
```

### "FATAL: Ident authentication failed"
Set the `PGPASSWORD` environment variable or create a `.pgpass` file with credentials.

### Schema Mismatch Error
Run migrations on both databases to sync schemas:
```bash
lein migrate  ; or your migration tool
```

Both databases are initialized from the same `schema.sql` on every test run, so mismatches usually indicate a database-specific change that needs to be reflected in the schema file.

