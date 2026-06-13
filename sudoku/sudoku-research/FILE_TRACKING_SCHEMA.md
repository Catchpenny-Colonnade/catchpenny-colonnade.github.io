# File Tracking Schema & Resumability Plan

**Context:** 1,296 JSON files × ~771 puzzles/file = ~1 million puzzles  
**Goal:** Track processing status so we can resume if interrupted

---

## 📊 Proposed Schema

### New Table: `source_files`
Tracks each JSON file and its processing status:

```sql
CREATE TABLE IF NOT EXISTS source_files (
  id BIGSERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  puzzle_count_expected SMALLINT,  -- Estimated from file
  puzzle_count_loaded SMALLINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, completed, failed
  processing_started_at TIMESTAMP,
  processing_completed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_source_files_status ON source_files(status);
CREATE INDEX IF NOT EXISTS idx_source_files_filename ON source_files(filename);
```

### Update: `original_puzzles` Table
Add reference to source file:

```sql
ALTER TABLE original_puzzles 
  ADD COLUMN IF NOT EXISTS source_file_id BIGINT 
    REFERENCES source_files(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_original_source_file 
  ON original_puzzles(source_file_id);
```

---

## 🔄 Processing Workflow

### Step 1: Discovery Phase
```clojure
(defn discover-puzzle-files [base-path]
  "Scan directory, create source_files records for all JSON files"
  ;; For each JSON file:
  ;;  - Calculate file size
  ;;  - Peek at JSON to estimate puzzle count
  ;;  - Insert into source_files with status='pending'
  ;;  - Return list of file IDs to process
  )
```

### Step 2: Processing Phase (Resume-Safe)
```clojure
(defn load-puzzles-from-files [db]
  "Load puzzles from source_files with status='pending' or 'processing'"
  ;; Query: SELECT * FROM source_files WHERE status IN ('pending', 'processing')
  ;; For each file:
  ;;   - Update status='processing'
  ;;   - Load puzzles from file
  ;;   - Insert into original_puzzles with source_file_id
  ;;   - Update status='completed', puzzle_count_loaded
  ;;   - If error: update status='failed', error_message
  )
```

### Step 3: Resume from Failure
```clojure
(defn resume-loading [db]
  "Continue from last successful file or retry failed files"
  ;; Query: SELECT * FROM source_files WHERE status IN ('pending', 'processing')
  ;; Handles:
  ;;   - Files never started (status='pending')
  ;;   - Files interrupted mid-load (status='processing')
  ;;   - Failed files (status='failed') - optional retry
  )
```

---

## 📈 Metrics & Queries

### Current Progress
```clojure
(defn loading-progress [db]
  "Get current loading statistics"
  ;; Files completed
  ;; Files in progress
  ;; Files pending
  ;; Total puzzles loaded
  ;; Total puzzles expected
  ;; Completion percentage
  )
```

### Find Resume Point
```clojure
(defn find-next-file [db]
  "Find next file to process"
  ;; SELECT * FROM source_files 
  ;; WHERE status IN ('pending', 'processing')
  ;; ORDER BY created_at ASC LIMIT 1
  )
```

### Data Quality Check
```clojure
(defn verify-loading-completeness [db]
  "Check if all files were processed"
  ;; Count files with status='pending' or 'processing'
  ;; Compare puzzle_count_loaded vs puzzle_count_expected
  ;; Identify any discrepancies
  )
```

---

## 🚀 Implementation Plan

### Phase 1a: Schema Update
1. Create `source_files` table
2. Add foreign key to `original_puzzles`
3. Migrate existing source_file values (if any)

### Phase 1b: File Discovery
1. Scan `sudoku/sudoku-clj/resources/solutions/`
2. Insert records into `source_files` for each JSON
3. Verify count: should see 1,296 records with status='pending'

### Phase 1c: Loading with Resumability
1. Query pending files
2. For each file:
   - Load JSON
   - Extract puzzles and solutions
   - Insert with source_file_id
   - Update source_files status
3. If interrupted: restart, find next pending file, continue

### Phase 1d: Validation
1. Verify all files processed (status='completed')
2. Check puzzle counts match
3. Validate data integrity
4. Generate loading statistics

---

## ✨ Benefits

**Resumability:**
- ✅ If process crashes, know exactly where to resume
- ✅ No duplicate processing of completed files
- ✅ Can retry failed files individually

**Visibility:**
- ✅ Real-time progress tracking
- ✅ Identify problematic files
- ✅ Metrics on processing time per file

**Traceability:**
- ✅ Audit trail: which puzzle came from which file
- ✅ Reproduce data loads
- ✅ Debug data quality issues

**Optimization:**
- ✅ Parallel file processing (future)
- ✅ Batch size optimization
- ✅ Performance bottleneck identification

---

## 📋 Files to Modify

**New:**
- Schema migration SQL

**Updates:**
- `src/sudoku_research/loaders.clj` — Add file discovery & tracking
- `src/sudoku_research/db/queries.clj` — Add progress queries
- `src/sudoku_research/db/mutations.clj` — Add file status updates
- `resources/schema.sql` — New table definition

---

## 🎯 Next Steps

1. **Review & Approve Schema** — Does this structure work?
2. **Create Migration** — SQL to add tables and update existing ones
3. **Implement File Discovery** — Scan directory, populate source_files
4. **Implement Resume Logic** — Query pending files, continue loading
5. **Add Progress Tracking** — Monitor and report loading metrics
6. **Load Real Data** — Execute with 1,296 files and ~1M puzzles

---

## ❓ Questions

1. Should we track file-level errors separately from puzzle-level errors?
2. Should "failed" files be automatically retried, or require manual intervention?
3. Do we want to parallelize file loading (batch multiple files), or keep it sequential?
4. Should we store file checksums for integrity verification?
5. What's the acceptable data loss threshold (e.g., if 5 files fail, do we proceed or stop)?

