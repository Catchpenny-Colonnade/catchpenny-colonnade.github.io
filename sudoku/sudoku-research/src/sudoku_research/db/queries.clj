(ns sudoku-research.db.queries
  (:require [sudoku-research.db.helpers :as db-helpers]))

(defn- execute-many-safe
  [db label param-map]
  (db-helpers/execute-safe db label param-map :many))

(defn- extract-total-count
  "Extract total count from a result row (handles standard column name conversion).
   Checks both :total-count (kebab-case) and :total_count (snake_case) keys."
  [row]
  (or (:total-count row) (:total_count row) 0))

(defn count-original-puzzles-by-clue-count
  "Count original puzzles grouped by clue count"
  [db]
  (execute-many-safe db :count-original-puzzles-by-clue-count {}))

(defn get-first-canonical-candidate
  "Get the first original puzzle for a given clue count"
  [db clue-count]
  (first (execute-many-safe db :get-first-canonical-candidate {:clue-count clue-count})))

(defn get-first-unmapped-puzzle-by-clue-count
  "Get first original puzzle not yet in any equivalence class (canonical form)"
  [db clue-count]
  (first (execute-many-safe db :get-first-unmapped-puzzle-by-clue-count {:clue-count clue-count})))

(defn get-canonical-form
  "Retrieve canonical form by puzzle string"
  [db puzzle]
  (first (execute-many-safe db :get-canonical-form {:puzzle puzzle})))

(defn count-canonical-by-clue-count
  "Count canonical forms by clue count"
  [db]
  (execute-many-safe db :count-canonical-by-clue-count {}))

(defn find-permutation
  "Find a permutation by result puzzle string.
   Returns the first matching row if found, nil otherwise."
  [db result-puzzle]
  (first (execute-many-safe db :find-permutations-for-result {:result-puzzle result-puzzle})))

(defn find-permutations-for-result
  "Find all permutations that generate a given result puzzle"
  [db result-puzzle]
  (execute-many-safe db :find-permutations-for-result {:result-puzzle result-puzzle}))

(defn find-equivalence
  "Find equivalence mapping for an original puzzle"
  [db original-puzzle-id]
  (first (execute-many-safe db :find-equivalence {:original-puzzle-id original-puzzle-id})))

(defn get-equivalences-for-canonical
  "Get all original puzzles mapped to a specific canonical form"
  [db canonical-id]
  (execute-many-safe db :get-equivalences-for-canonical {:canonical-id canonical-id}))

(defn count-equivalences-by-canonical
  "Count how many original puzzles are mapped to each canonical form"
  [db]
  (execute-many-safe db :count-equivalences-by-canonical {}))

(defn is-puzzle-processed?
  "Check if an original puzzle has been mapped to a canonical form"
  [db original-puzzle-id]
  (let [result (first (execute-many-safe db :is-puzzle-processed {:original-puzzle-id original-puzzle-id}))]
    (> (extract-total-count result) 0)))

(defn count-total-equivalences
  "Count total number of original->canonical mappings"
  [db]
  (let [result (first (execute-many-safe db :count-total-equivalences {}))]
    (extract-total-count result)))

(defn get-equivalence-class-stats
  "Get statistics on equivalence classes by clue count"
  [db]
  (execute-many-safe db :get-equivalence-class-stats {}))

(defn find-originals-for-result
  "Find all original puzzles matching a specific puzzle string.
   Used during equivalence discovery to find all originals that match a permutation result."
  [db puzzle-string]
  (execute-many-safe db :find-originals-for-result {:result-puzzle puzzle-string}))

(defn get-all-transforms
  "Get all transforms in the database.
   Useful for debugging and verification."
  [db]
  (execute-many-safe db :get-all-transforms {}))

;; ============================================================================
;; SOURCE FILE TRACKING QUERIES
;; ============================================================================

(defn get-files-by-status
  "Get all source files with a given status (pending, processing, completed, failed)"
  [db status]
  (execute-many-safe db :get-files-by-status {:status status}))

(defn get-next-file-to-process
  "Get the next file to process (oldest pending or processing file)"
  [db]
  (first (execute-many-safe db :get-next-file-to-process {})))

(defn get-loading-progress
  "Get file loading progress statistics"
  [db]
  (first (execute-many-safe db :get-loading-progress {})))

(defn count-files-by-status
  "Count source files by status"
  [db]
  (execute-many-safe db :count-files-by-status {}))

(defn get-all-source-files
  "Get all source files (useful for progress reports)"
  [db]
  (execute-many-safe db :get-all-source-files {}))
