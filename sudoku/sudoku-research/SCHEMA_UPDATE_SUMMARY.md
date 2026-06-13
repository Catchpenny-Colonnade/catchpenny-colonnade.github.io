# Schema Update Summary

**Date:** May 24, 2026  
**Status:** Schema and data layer updates complete

---

## ✅ Completed Updates

### 1. Database Schema (`resources/schema.sql`)
- ✅ Added `source_files` table for tracking file processing status
- ✅ Updated `original_puzzles` to reference `source_file_id` instead of `source_file` VARCHAR
- ✅ Added indexes for efficient querying (status, filename, created_at)
- ✅ Added `file_loading_progress` view for real-time progress tracking
- ✅ Added constraint validation for status enum

### 2. SQL Queries (`resources/sql/sudoku_research_queries.sql`)
- ✅ Updated `insert-original-puzzle!` to use `source_file_id` parameter
- ✅ Added `insert-source-file!` for creating file tracking records
- ✅ Added `update-file-status!` for status transitions
- ✅ Added `update-file-processing-started!` for marking files in-progress
- ✅ Added `update-file-processing-completed!` for successful completion
- ✅ Added `update-file-processing-failed!` for error tracking
- ✅ Added `get-files-by-status` for querying files by status
- ✅ Added `get-next-file-to-process` for resume logic
- ✅ Added `get-loading-progress` for progress tracking
- ✅ Added `count-files-by-status` for statistics
- ✅ Added `get-all-source-files` for comprehensive file listings

### 3. Query Functions (`src/sudoku_research/db/queries.clj`)
- ✅ Added `get-files-by-status`
- ✅ Added `get-next-file-to-process`
- ✅ Added `get-loading-progress`
- ✅ Added `count-files-by-status`
- ✅ Added `get-all-source-files`

### 4. Mutation Functions (`src/sudoku_research/db/mutations.clj`)
- ✅ Added `insert-source-file!`
- ✅ Added `update-file-status!`
- ✅ Added `update-file-processing-started!`
- ✅ Added `update-file-processing-completed!`
- ✅ Added `update-file-processing-failed!`

---

## 🚀 Next Steps

### Step 1: Update Loaders
**File:** `src/sudoku_research/loaders.clj`

Tasks:
- [ ] Add `discover-puzzle-files` function to scan directory and populate `source_files`
- [ ] Refactor `insert-puzzles-batch` to accept `source_file_id`
- [ ] Add graceful halt handling (catch exceptions, update file status)
- [ ] Add resumability logic (query pending files, continue)
- [ ] Add progress reporting

### Step 2: Update Tests

**Unit Tests:** `test/sudoku_research/loaders_test.clj`
- [ ] Update test for `insert-puzzles-batch` to use new schema
- [ ] Update test mocks to include `source_file_id`
- [ ] Add tests for file discovery
- [ ] Add tests for file status updates
- [ ] Add tests for resumability logic

**Integration Tests:** `integration-test/sudoku_research/external/loaders_integration_test.clj`
- [ ] Update file loading integration tests
- [ ] Add tests for source_files table interactions
- [ ] Add tests for graceful halt and resume
- [ ] Add tests for progress tracking

### Step 3: Database Migration
- [ ] Create migration script to add source_files table to live database
- [ ] Handle existing data (backfill source_file_id for existing puzzles if any)
- [ ] Test migration on test database first
- [ ] Apply to live database

---

## 📋 Detailed Implementation Tasks

### Task: `discover-puzzle-files`
```clojure
(defn discover-puzzle-files [db base-path]
  "Scan directory for JSON files and create source_files records"
  ;; 1. Get all .json files from base-path
  ;; 2. For each file:
  ;;    a. Calculate file size
  ;;    b. Peek at JSON to estimate puzzle count
  ;;    c. Insert into source_files with status='pending'
  ;; 3. Return count of discovered files
  )
```

### Task: Refactor `insert-puzzles-batch`
```clojure
(defn insert-puzzles-batch [db source-file-id puzzles]
  "Insert puzzles with file tracking"
  ;; 1. Track which file they came from
  ;; 2. Gracefully handle errors for individual puzzles
  ;; 3. Return stats: inserted, skipped, errors
  )
```

### Task: Add `load-with-resumability`
```clojure
(defn load-puzzles-with-resumability [db base-path]
  "Load puzzles with halt/resume capability"
  ;; 1. Discover all files (create source_files records)
  ;; 2. While files exist with status='pending' or 'processing':
  ;;    a. Get next file
  ;;    b. Update status to 'processing'
  ;;    c. Load its puzzles
  ;;    d. Update status to 'completed' with count
  ;;    e. If error: update to 'failed' with message
  ;; 3. Return final statistics
  )
```

---

## 🎯 Cross-Database Query Strategy

**Recommendation:** Use application-level joining (Option 3)
- Run queries on live database and test database separately
- Join results in Clojure
- Enables isolation and independent testing
- Full control over join logic

**Example:**
```clojure
(let [live-data (db-qry/get-loading-progress live-db)
      test-data (db-qry/get-loading-progress test-db)]
  {:live live-data :test test-data})
```

---

## ✨ Benefits of New Schema

**Resumability:**
- ✅ Track which file each puzzle came from
- ✅ Query pending files to find where to resume
- ✅ Idempotent: safe to re-run without duplicates

**Traceability:**
- ✅ Audit trail: which file, when, what errors
- ✅ Identify problematic files
- ✅ Debug data quality issues

**Visibility:**
- ✅ Real-time progress via `file_loading_progress` view
- ✅ Statistics per file and overall
- ✅ Error tracking for failed files

**Future Optimizations:**
- Parallel file loading (future enhancement)
- Batch size tuning based on file size
- Performance analysis per file

---

## 🧪 Testing Strategy

### Unit Tests (Isolated)
- Mock database calls
- Test file discovery logic
- Test status transition logic
- Test error handling

### Integration Tests (Real Database)
- Use test database
- Full end-to-end file loading
- Verify source_files and original_puzzles consistency
- Test halt and resume scenarios
- Verify progress tracking

---

## 📝 Implementation Order

1. **Schema & SQL** ✅ (Already done)
2. **Data layer functions** ✅ (Already done)
3. **Update loaders** ← Next
4. **Update tests** ← Next
5. **Database migration** ← Next
6. **Execute on real data** ← Final

