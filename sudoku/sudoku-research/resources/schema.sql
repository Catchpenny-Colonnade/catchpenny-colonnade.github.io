-- Sudoku Research Database Schema
-- PostgreSQL 15+

-- ============================================================================
-- TRANSFORMS (Finite domain represented as canonical key strings)
-- ============================================================================

-- transform_key format: RR-ROWORDER-COLORDER-SYMBOLMAP
-- RR is 00 or 90. Example: 90-012345678-876543210-135798642
CREATE TABLE IF NOT EXISTS transforms (
  id BIGSERIAL PRIMARY KEY,
  transform_key VARCHAR(32) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Basic shape validation only. Deep permutation validation is done in Clojure.
  CONSTRAINT chk_transform_key_shape
    CHECK (transform_key ~ '^(00|90)-[0-8]{9}-[0-8]{9}-[1-9]{9}$')
);

CREATE INDEX IF NOT EXISTS idx_transforms_key ON transforms(transform_key);

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Source file tracking for resumable loading
-- Tracks each JSON file and processing status to enable graceful halting/resuming
CREATE TABLE IF NOT EXISTS source_files (
  id BIGSERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  puzzle_count_expected SMALLINT,
  puzzle_count_loaded SMALLINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  processing_started_at TIMESTAMP,
  processing_completed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_source_files_status ON source_files(status);
CREATE INDEX IF NOT EXISTS idx_source_files_filename ON source_files(filename);
CREATE INDEX IF NOT EXISTS idx_source_files_created ON source_files(created_at);

-- Original 1M puzzles from dataset
-- puzzle: 81-char string with 0s for empty cells (the initial clues)
-- solution: 81-char string with all cells filled 1-9 (the complete solution)
CREATE TABLE IF NOT EXISTS original_puzzles (
  id BIGSERIAL PRIMARY KEY,
  puzzle CHAR(81) NOT NULL UNIQUE,
  solution CHAR(81),
  clue_count SMALLINT NOT NULL,
  source_file_id BIGINT REFERENCES source_files(id) ON DELETE CASCADE,
  loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_original_clue_count ON original_puzzles(clue_count);
CREATE INDEX IF NOT EXISTS idx_original_puzzle ON original_puzzles USING HASH (puzzle);
CREATE INDEX IF NOT EXISTS idx_original_source_file ON original_puzzles(source_file_id);

-- Canonical (unique representative) puzzles discovered during analysis
-- puzzle: 81-char string with 0s for empty cells (the initial clues)
-- solution: 81-char string with all cells filled 1-9 (the complete solution)
CREATE TABLE IF NOT EXISTS canonical_forms (
  id BIGSERIAL PRIMARY KEY,
  puzzle CHAR(81) NOT NULL UNIQUE,
  solution CHAR(81),
  clue_count SMALLINT NOT NULL,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_canonical_clue_count ON canonical_forms(clue_count);
CREATE INDEX IF NOT EXISTS idx_canonical_puzzle ON canonical_forms USING HASH (puzzle);

-- Permutations: all discovered variations of canonical forms.
CREATE TABLE IF NOT EXISTS permutations (
  id BIGSERIAL PRIMARY KEY,
  canonical_id BIGINT NOT NULL REFERENCES canonical_forms(id) ON DELETE CASCADE,
  result CHAR(81) NOT NULL,
  transform_id BIGINT REFERENCES transforms(id)
);

-- Migration safety: ensure transform_id exists even if DB was previously split-column based.
ALTER TABLE permutations ADD COLUMN IF NOT EXISTS transform_id BIGINT;

ALTER TABLE permutations
  DROP CONSTRAINT IF EXISTS permutations_transform_id_fkey,
  ADD CONSTRAINT permutations_transform_id_fkey
    FOREIGN KEY (transform_id) REFERENCES transforms(id) ON DELETE SET NULL;

-- Remove split-column indexes if they exist.
DROP INDEX IF EXISTS idx_perm_rotation;
DROP INDEX IF EXISTS idx_perm_row_order;
DROP INDEX IF EXISTS idx_perm_column_order;
DROP INDEX IF EXISTS idx_perm_symbol_translation;

-- Unique transform combination for each canonical form.
DROP INDEX IF EXISTS idx_perm_unique_transform_combo;
CREATE UNIQUE INDEX IF NOT EXISTS idx_perm_unique_transform_combo
  ON permutations (canonical_id, transform_id);

-- Critical indexes for lookup workflow
CREATE INDEX IF NOT EXISTS idx_perm_result ON permutations USING HASH (result);
CREATE INDEX IF NOT EXISTS idx_perm_canonical ON permutations(canonical_id);
CREATE INDEX IF NOT EXISTS idx_perm_transform ON permutations(transform_id);

-- ============================================================================
-- EQUIVALENCE TRACKING (Core for matching original puzzles to canonical forms)
-- ============================================================================

-- Tracks which original puzzles match to which canonical forms via permutations
-- Enables efficient lookup, resume-ability, and equivalence class discovery
CREATE TABLE IF NOT EXISTS puzzle_equivalences (
  id BIGSERIAL PRIMARY KEY,
  original_puzzle_id BIGINT NOT NULL REFERENCES original_puzzles(id) ON DELETE CASCADE,
  canonical_id BIGINT NOT NULL REFERENCES canonical_forms(id) ON DELETE CASCADE,
  permutation_id BIGINT,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Prevent duplicate mappings: each original puzzle maps to each canonical form at most once
  CONSTRAINT unique_puzzle_canonical_mapping UNIQUE (original_puzzle_id, canonical_id)
);

CREATE INDEX IF NOT EXISTS idx_equiv_original ON puzzle_equivalences(original_puzzle_id);
CREATE INDEX IF NOT EXISTS idx_equiv_canonical ON puzzle_equivalences(canonical_id);
CREATE INDEX IF NOT EXISTS idx_equiv_permutation ON puzzle_equivalences(permutation_id);
CREATE INDEX IF NOT EXISTS idx_equiv_discovered ON puzzle_equivalences(discovered_at);

-- Migration safety: older schemas may have a strict FK on permutation_id.
ALTER TABLE puzzle_equivalences
  DROP CONSTRAINT IF EXISTS puzzle_equivalences_permutation_id_fkey;

-- ============================================================================
-- ANALYSIS TABLES (Optional, for tracking progress)
-- ============================================================================

CREATE TABLE IF NOT EXISTS analysis_progress (
  id SERIAL PRIMARY KEY,
  clue_count SMALLINT,
  canonical_id_processed BIGINT,
  puzzles_matched_count INT,
  puzzles_unmatched_count INT,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Find which original puzzles from 1M dataset are NOT yet in any equivalence class
-- (Will need an original_puzzles table first)
CREATE OR REPLACE VIEW unmapped_puzzles AS
SELECT 
  op.id,
  op.puzzle,
  op.clue_count
FROM original_puzzles op
LEFT JOIN permutations p ON op.puzzle = p.result
WHERE p.id IS NULL;

-- Summary of discovered equivalence classes
CREATE OR REPLACE VIEW equivalence_class_summary AS
SELECT 
  cf.clue_count,
  COUNT(DISTINCT cf.id) as num_canonical_forms,
  COUNT(DISTINCT p.result) as total_permutations_found,
  COUNT(DISTINCT p.id) as total_perm_records
FROM canonical_forms cf
LEFT JOIN permutations p ON cf.id = p.canonical_id
GROUP BY cf.clue_count
ORDER BY cf.clue_count;

-- File loading progress summary
CREATE OR REPLACE VIEW file_loading_progress AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending') as files_pending,
  COUNT(*) FILTER (WHERE status = 'processing') as files_processing,
  COUNT(*) FILTER (WHERE status = 'completed') as files_completed,
  COUNT(*) FILTER (WHERE status = 'failed') as files_failed,
  COUNT(*) as files_total,
  COALESCE(SUM(puzzle_count_loaded), 0) as puzzles_loaded,
  COALESCE(SUM(puzzle_count_expected), 0) as puzzles_expected,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2) as completion_percent
FROM source_files;
