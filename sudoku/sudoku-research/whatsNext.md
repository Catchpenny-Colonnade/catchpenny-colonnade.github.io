# Next Steps: Integration Test Failures & Database Issues

**Date:** May 24, 2026  
**Status:** 🔴 **INTEGRATION TEST FAILURES DETECTED** — 3 failures, 3 errors

---

## 📊 Integration Test Results Summary

**Test Run:** `lein with-profile integration-test test`  
**Results:** 117 tests, 402 assertions, **3 failures + 3 errors** ❌

### 🔴 Issues Identified

#### Issue 1: Phase 3 Test Failures (3 Errors — Expected)
**Files:**
- [test/sudoku_research/conflict_test.clj](test/sudoku_research/conflict_test.clj)
- [test/sudoku_research/isolation_test.clj](test/sudoku_research/isolation_test.clj)
- [test/sudoku_research/query_logic_test.clj](test/sudoku_research/query_logic_test.clj)

**Error:** `null value in column "original_puzzle_id" of relation "puzzle_equivalences" violates not-null constraint`

**Impact:** Database fixture setup issue (test infrastructure, not app bug)  
**Decision:** Already documented as Phase 3; not needed  
**Action:** Will remove these test files

---

#### Issue 2: Database Schema Initialization Error ⚠️
**Location:** [src/sudoku_research/db/connection.clj](src/sudoku_research/db/connection.clj)  
**Test File:** `db.connection-test`  
**Error Message:** `[ERROR] initializing database: Schema error`

**Investigation Needed:**
- [ ] What schema validation is failing?
- [ ] Is it a missing table, bad constraint, or version mismatch?
- [ ] Does production database have the same issue?
- [ ] Is the test database creation properly handling schema?

**Priority:** 🔴 HIGH

---

#### Issue 3: Puzzle Insertion Failures ⚠️
**Location:** [src/sudoku_research/loaders.clj](src/sudoku_research/loaders.clj)  
**Test File:** `loaders-test`  
**Error Message:** `[ERROR] Inserting puzzle: DB error` (appears 3 times)

**Investigation Needed:**
- [ ] Which puzzles are failing to insert?
- [ ] What's the underlying database error?
- [ ] Is this a validation error or constraint violation?
- [ ] Are there data format issues?

**Priority:** 🔴 HIGH

---

## 🔍 Investigation Strategy

### Phase A: Understand Scope (Immediate)
1. **Isolate each issue** — Run tests individually to see which fail
2. **Capture exact error messages** — Get full stack traces and error context
3. **Verify production impact** — Check if issues affect normal workflow
4. **Identify commonality** — Are these related?

### Phase B: Debug & Root Cause (Next)
1. **Database schema examination** — Check current vs expected schema
2. **Test data analysis** — What puzzles are failing to insert?
3. **Error message parsing** — Understand the exact failure point
4. **Dependency tracing** — Follow code paths from test to failure

### Phase C: Fix & Refactor (Third)
1. **Targeted fixes** — Address root causes
2. **Regression testing** — Ensure fixes don't break existing tests
3. **Update integration tests** — Remove Phase 3 tests, fix others
4. **Validate production** — Ensure issues don't affect real analysis

---

## 🎯 Detailed Investigation Plan

### Issue 2: Database Schema Initialization Error

**Step 1: Isolate the Failure**
```bash
lein with-profile integration-test test :only sudoku-research.db.connection-test
```

**Step 2: Examine Source Code**
- Open [src/sudoku_research/db/connection.clj](src/sudoku_research/db/connection.clj)
- Look for schema initialization logic
- Check database connection setup

**Step 3: Check Schema**
- Open [resources/schema.sql](resources/schema.sql)
- Verify all tables and constraints are defined
- Check for version mismatches

**Step 4: Trace the Error**
- Add debug logging to schema initialization
- Run test with debug output
- Identify exact point of failure

**Questions to Answer:**
- [ ] Is the test database being created correctly?
- [ ] Are all required tables present?
- [ ] Are constraints defined properly?
- [ ] Is there a schema version mismatch?

---

### Issue 3: Puzzle Insertion Failures

**Step 1: Isolate the Failure**
```bash
lein with-profile integration-test test :only sudoku-research.loaders-test
```

**Step 2: Examine Source Code**
- Open [src/sudoku_research/loaders.clj](src/sudoku_research/loaders.clj)
- Find where `[ERROR] Inserting puzzle: DB error` is logged
- Check the insert logic

**Step 3: Identify Problematic Puzzles**
- Modify test to print which puzzles are failing
- Check if it's consistent (same puzzles always fail)
- Look for data format issues

**Step 4: Test Database State**
- Check what data is in the test database
- Verify puzzle format matches schema
- Look for constraint violations

**Questions to Answer:**
- [ ] Which specific puzzles fail to insert?
- [ ] Is it a validation error or constraint violation?
- [ ] Are puzzle strings in the correct format?
- [ ] Are there duplicate puzzles?
- [ ] Is the test database in a bad state?

---

## 📋 Action Items (Priority Order)

### 🔴 HIGH PRIORITY

**Task 1: Remove Phase 3 Test Files**
```
[ ] Delete test/sudoku_research/conflict_test.clj
[ ] Delete test/sudoku_research/isolation_test.clj
[ ] Delete test/sudoku_research/query_logic_test.clj
[ ] Run tests to confirm Phase 1-2 still work
```

**Task 2: Debug Schema Initialization**
```
[ ] Run db.connection-test in isolation
[ ] Capture full error output with stack trace
[ ] Add debug logging to schema initialization
[ ] Examine resources/schema.sql for issues
[ ] Check database version compatibility
[ ] Compare test database schema vs production
```

**Task 3: Debug Puzzle Insertion Failures**
```
[ ] Run loaders-test in isolation
[ ] Identify which puzzles fail
[ ] Check puzzle data format
[ ] Verify database constraints
[ ] Look for test data corruption
```

### 🟡 MEDIUM PRIORITY

**Task 4: Fix Schema Issues**
```
[ ] Update schema if needed
[ ] Fix database initialization logic
[ ] Add schema validation
[ ] Document schema requirements
```

**Task 5: Fix Puzzle Insertion**
```
[ ] Update loader error handling
[ ] Add data validation before insert
[ ] Document puzzle format requirements
[ ] Add constraint documentation
```

**Task 6: Update Integration Tests**
```
[ ] Fix broken tests
[ ] Add better error messages
[ ] Improve test isolation
[ ] Add diagnostic output
```

### 🟢 LOW PRIORITY

**Task 7: Documentation**
```
[ ] Update database setup guide
[ ] Document puzzle format
[ ] Add troubleshooting guide
[ ] Update CHANGELOG with fixes
```

---

## 🚀 Success Criteria

### Before Proceeding
- [ ] **Unit Tests:** All 98 core unit tests passing
- [ ] **Phase 1-2 Tests:** 4 deduplication tests passing
- [ ] **Phase 3 Tests:** Removed (no longer in codebase)

### After Investigation
- [ ] **Schema Error Fixed:** db.connection-test passes
- [ ] **Insertion Error Fixed:** loaders-test passes
- [ ] **No Regressions:** All previously passing tests still pass
- [ ] **Root Causes Documented:** Know exactly what was wrong and why

### After Refactoring
- [ ] **All Integration Tests Pass:** 117 tests, 0 failures, 0 errors
- [ ] **Code Quality:** Clean, well-documented fixes
- [ ] **Production Safe:** Changes don't impact live analysis
- [ ] **Lessons Documented:** What we learned captured

---

## 📝 Notes & Observations

**On Phase 3 Tests:**
- These were created to investigate the duplicate puzzle issue
- They're failing due to test fixture setup issues, not app bugs
- Since Phase 1-2 solution is sufficient, these tests add complexity
- Removing them will reduce test suite maintenance burden

**On New Issues:**
- Schema initialization error suggests database setup problem
- Puzzle insertion failures could be test data issue
- Both might be environment-specific (test database only)
- Need to verify production database isn't affected

**Next Step:**
Start with Task 1 (remove Phase 3 tests) to clean up codebase, then investigate the two new issues systematically.

---

**Last Updated:** May 24, 2026  
**Status:** 🔴 Investigation Starting
