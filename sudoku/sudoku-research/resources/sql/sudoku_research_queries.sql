-- ========================================
-- Mutators
-- ========================================

-- insert-original-puzzle!: puzzle, solution, clue-count, source-file-id
INSERT INTO original_puzzles (puzzle, solution, clue_count, source_file_id, loaded_at)
VALUES (?, ?, ?, ?, NOW())
ON CONFLICT (puzzle) DO NOTHING
RETURNING id, puzzle, solution, clue_count, source_file_id

-- insert-canonical-form!: puzzle, solution, clue-count
INSERT INTO canonical_forms (puzzle, solution, clue_count, discovered_at)
VALUES (?, ?, ?, NOW())
ON CONFLICT (puzzle) DO NOTHING
RETURNING id, puzzle, solution, clue_count

-- insert-permutation!: canonical-id, result, transform-id
INSERT INTO permutations (canonical_id, result, transform_id)
VALUES (?, ?, ?)
ON CONFLICT (canonical_id, transform_id) DO NOTHING
RETURNING id

-- insert-or-get-transform!: transform-key
INSERT INTO transforms (transform_key)
VALUES (?)
ON CONFLICT (transform_key) DO UPDATE SET transform_key = EXCLUDED.transform_key
RETURNING id

-- insert-equivalence!: original-puzzle-id, canonical-id, permutation-id
INSERT INTO puzzle_equivalences (original_puzzle_id, canonical_id, permutation_id, discovered_at)
VALUES (?, ?, ?, NOW())
ON CONFLICT (original_puzzle_id, canonical_id) DO NOTHING
RETURNING id, original_puzzle_id, canonical_id, permutation_id, discovered_at

-- ========================================
-- Selects
-- ========================================

-- count-original-puzzles-by-clue-count
SELECT clue_count, COUNT(*) as count
FROM original_puzzles
GROUP BY clue_count
ORDER BY clue_count

-- get-first-canonical-candidate: clue-count
SELECT id, puzzle, solution, clue_count
FROM original_puzzles
WHERE clue_count = ?
LIMIT 1

-- get-first-unmapped-puzzle-by-clue-count: clue-count
SELECT op.id, op.puzzle, op.solution, op.clue_count
FROM original_puzzles op
LEFT JOIN permutations p ON op.puzzle = p.result
LEFT JOIN puzzle_equivalences pe ON op.id = pe.original_puzzle_id
WHERE op.clue_count = ? AND p.id IS NULL AND pe.id IS NULL
LIMIT 1

-- get-canonical-form: puzzle
SELECT id, puzzle, solution, clue_count
FROM canonical_forms
WHERE puzzle = ?

-- count-canonical-by-clue-count
SELECT clue_count, COUNT(*) as count
FROM canonical_forms
GROUP BY clue_count
ORDER BY clue_count

-- find-permutations-for-result: result-puzzle
SELECT p.id, p.canonical_id, p.result, p.transform_id,
       cf.puzzle as canonical_puzzle, cf.clue_count,
       t.transform_key
FROM permutations p
JOIN canonical_forms cf ON p.canonical_id = cf.id
LEFT JOIN transforms t ON p.transform_id = t.id
WHERE p.result = ?

-- find-equivalence: original-puzzle-id
SELECT pe.id, pe.original_puzzle_id, pe.canonical_id, pe.permutation_id, pe.discovered_at,
       cf.puzzle as canonical_puzzle, cf.clue_count as canonical_clue_count
FROM puzzle_equivalences pe
JOIN canonical_forms cf ON pe.canonical_id = cf.id
WHERE pe.original_puzzle_id = ?

-- get-equivalences-for-canonical: canonical-id
SELECT pe.id, pe.original_puzzle_id, pe.canonical_id, pe.permutation_id, pe.discovered_at,
       op.puzzle as original_puzzle, op.clue_count as original_clue_count
FROM puzzle_equivalences pe
JOIN original_puzzles op ON pe.original_puzzle_id = op.id
WHERE pe.canonical_id = ?
ORDER BY pe.discovered_at

-- count-equivalences-by-canonical
SELECT pe.canonical_id, COUNT(*) as count
FROM puzzle_equivalences pe
GROUP BY pe.canonical_id
ORDER BY count DESC

-- is-puzzle-processed: original-puzzle-id
SELECT COUNT(*) as total_count
FROM puzzle_equivalences
WHERE original_puzzle_id = ?

-- count-total-equivalences
SELECT COUNT(*) as total_count
FROM puzzle_equivalences

-- get-equivalence-class-stats
SELECT cf.clue_count, COUNT(DISTINCT pe.canonical_id) as num_canonical,
       COUNT(DISTINCT pe.original_puzzle_id) as num_originals,
       COUNT(*) as total_mappings
FROM puzzle_equivalences pe
JOIN canonical_forms cf ON pe.canonical_id = cf.id
GROUP BY cf.clue_count
ORDER BY cf.clue_count

-- find-originals-for-result: result-puzzle
SELECT id, puzzle, solution, clue_count
FROM original_puzzles
WHERE puzzle = ?

-- get-all-transforms
SELECT id, transform_key
FROM transforms
ORDER BY id

-- ========================================
-- Source File Tracking
-- ========================================

-- insert-source-file!: filename, file-path, file-size-bytes, puzzle-count-expected
INSERT INTO source_files (filename, file_path, file_size_bytes, puzzle_count_expected, status, created_at, updated_at)
VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())
ON CONFLICT (filename) DO NOTHING
RETURNING id, filename, file_path, file_size_bytes, puzzle_count_expected, status, created_at

-- update-file-status!: status, file-id
UPDATE source_files
SET status = ?, updated_at = NOW()
WHERE id = ?
RETURNING id, filename, status, updated_at

-- update-file-processing-started!: file-id
UPDATE source_files
SET status = 'processing', processing_started_at = NOW(), updated_at = NOW()
WHERE id = ?
RETURNING id, filename, status, processing_started_at

-- update-file-processing-completed!: puzzle-count-loaded, file-id
UPDATE source_files
SET status = 'completed', puzzle_count_loaded = ?, processing_completed_at = NOW(), updated_at = NOW()
WHERE id = ?
RETURNING id, filename, puzzle_count_loaded, processing_completed_at

-- update-file-processing-failed!: error-message, file-id
UPDATE source_files
SET status = 'failed', error_message = ?, updated_at = NOW()
WHERE id = ?
RETURNING id, filename, status, error_message

-- get-files-by-status: status
SELECT id, filename, file_path, file_size_bytes, puzzle_count_expected, puzzle_count_loaded, status, 
       processing_started_at, processing_completed_at, error_message, created_at, updated_at
FROM source_files
WHERE status = ?
ORDER BY created_at ASC

-- get-next-file-to-process
SELECT id, filename, file_path, file_size_bytes, puzzle_count_expected, status
FROM source_files
WHERE status IN ('pending', 'processing')
ORDER BY created_at ASC
LIMIT 1

-- get-loading-progress
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending') as files_pending,
  COUNT(*) FILTER (WHERE status = 'processing') as files_processing,
  COUNT(*) FILTER (WHERE status = 'completed') as files_completed,
  COUNT(*) FILTER (WHERE status = 'failed') as files_failed,
  COUNT(*) as files_total,
  COALESCE(SUM(puzzle_count_loaded), 0) as puzzles_loaded,
  COALESCE(SUM(puzzle_count_expected), 0) as puzzles_expected
FROM source_files

-- count-files-by-status
SELECT status, COUNT(*) as count
FROM source_files
GROUP BY status
ORDER BY status

-- get-all-source-files
SELECT id, filename, file_path, file_size_bytes, puzzle_count_expected, puzzle_count_loaded, status,
       processing_started_at, processing_completed_at, error_message, created_at, updated_at
FROM source_files
ORDER BY created_at ASC
