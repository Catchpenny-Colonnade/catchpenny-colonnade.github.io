-- Sudoku Research Database Schema
-- PostgreSQL 15+

-- ============================================================================
-- REFERENCE TABLES (Static, finite domain values)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rotations (
  id SMALLINT PRIMARY KEY,
  degrees INT NOT NULL CHECK (degrees IN (0, 90, 180, 270)),
  name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO rotations (id, degrees, name) VALUES
  (0, 0, 'identity'),
  (1, 90, 'rotate_90'),
  (2, 180, 'rotate_180'),
  (3, 270, 'rotate_270')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DYNAMIC REFERENCE TABLES (Built up as we discover permutations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS row_orders (
  id BIGSERIAL PRIMARY KEY,
  order_array SMALLINT[] NOT NULL,
  UNIQUE(order_array)
);

CREATE INDEX IF NOT EXISTS idx_row_orders_array ON row_orders USING HASH (order_array);

CREATE TABLE IF NOT EXISTS column_orders (
  id BIGSERIAL PRIMARY KEY,
  order_array SMALLINT[] NOT NULL,
  UNIQUE(order_array)
);

CREATE INDEX IF NOT EXISTS idx_column_orders_array ON column_orders USING HASH (order_array);

CREATE TABLE IF NOT EXISTS symbol_translations (
  id BIGSERIAL PRIMARY KEY,
  translation_array SMALLINT[] NOT NULL,
  UNIQUE(translation_array)
);

CREATE INDEX IF NOT EXISTS idx_symbol_translations_array ON symbol_translations USING HASH (translation_array);

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Original 1M puzzles from dataset
CREATE TABLE IF NOT EXISTS original_puzzles (
  id BIGSERIAL PRIMARY KEY,
  puzzle CHAR(81) NOT NULL UNIQUE,
  solution CHAR(81),
  clue_count SMALLINT NOT NULL,
  source_file VARCHAR(255),
  loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_original_clue_count ON original_puzzles(clue_count);
CREATE INDEX IF NOT EXISTS idx_original_puzzle ON original_puzzles USING HASH (puzzle);

CREATE TABLE IF NOT EXISTS canonical_forms (
  id BIGSERIAL PRIMARY KEY,
  puzzle CHAR(81) NOT NULL UNIQUE,
  solution CHAR(81),
  clue_count SMALLINT NOT NULL,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_canonical_clue_count ON canonical_forms(clue_count);
CREATE INDEX IF NOT EXISTS idx_canonical_puzzle ON canonical_forms USING HASH (puzzle);

-- Permutations: All discovered variations of canonical forms
CREATE TABLE IF NOT EXISTS permutations (
  id BIGSERIAL PRIMARY KEY,
  canonical_id BIGINT NOT NULL REFERENCES canonical_forms(id) ON DELETE CASCADE,
  result CHAR(81) NOT NULL,
  rotation_id SMALLINT REFERENCES rotations(id),
  row_order_id BIGINT REFERENCES row_orders(id),
  column_order_id BIGINT REFERENCES column_orders(id),
  symbol_translation_id BIGINT REFERENCES symbol_translations(id),
  
  -- Prevent duplicate transform combinations for same canonical form
  CONSTRAINT unique_transform_combo UNIQUE (
    canonical_id, 
    rotation_id, 
    COALESCE(row_order_id, -1), 
    COALESCE(column_order_id, -1), 
    COALESCE(symbol_translation_id, -1)
  )
);

-- CRITICAL INDEXES for lookup workflow
CREATE INDEX IF NOT EXISTS idx_perm_result ON permutations USING HASH (result);
CREATE INDEX IF NOT EXISTS idx_perm_canonical ON permutations(canonical_id);
CREATE INDEX IF NOT EXISTS idx_perm_rotation ON permutations(rotation_id);

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
