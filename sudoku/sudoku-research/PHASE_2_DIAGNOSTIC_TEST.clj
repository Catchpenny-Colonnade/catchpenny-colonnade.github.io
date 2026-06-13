;; PHASE 2: Diagnostic Test
;; This file can be used to run analysis with debug logging enabled
;; to help identify the root cause of duplicate puzzle issues.
;;
;; Usage:
;;   Copy this file content into your REPL and execute:
;;   (phase-2-diagnostic-test)
;;
;; This will run a small analysis job with debug logging to show:
;; 1. Which puzzle IDs the query returns each iteration
;; 2. Whether duplicates are detected
;; 3. INSERT operation results
;; 4. Connection state and transaction handling

(ns sudoku-research.phase-2-diagnostic
  (:require [sudoku-research.core :as core]
            [sudoku-research.analysis :as analysis]
            [sudoku-research.db.connection :as db-conn]
            [sudoku-research.loaders :as loaders]
            [sudoku-research.utilities.test-config :as test-cfg]))

(defn phase-2-diagnostic-test []
  "Run a small diagnostic analysis with debug logging enabled"
  (println "\n" (apply str (repeat 80 "=")))
  (println "PHASE 2: DIAGNOSTIC TEST - Duplicate Detection Investigation")
  (println (apply str (repeat 80 "=")))
  
  (let [conn (db-conn/connect)]
    (try
      ;; Initialize database
      (println "\n[SETUP] Initializing database...")
      (db-conn/initialize-db conn)
      
      ;; Load small set of test puzzles
      (println "[SETUP] Loading test puzzles...")
      (let [test-dir (test-cfg/get-test-data-dir-from-config "test-resources/test-data-config.edn")
            load-result (loaders/load-puzzles-from-directory conn {:dir test-dir})]
        (println (format "[SETUP] Loaded %d puzzles\n" (:puzzles-inserted load-result))))
      
      ;; Run analysis with debug logging ENABLED
      (println "[ANALYSIS] Running analysis with DEBUG LOGGING enabled...")
      (println (apply str (repeat 80 "-")))
      
      (let [analysis-result (analysis/analyze-all-clue-counts! conn {:debug true})]
        (println (apply str (repeat 80 "-")))
        (println "\n[RESULTS] Analysis completed successfully")
        (println (format "Total puzzles processed: %d" (:total-puzzles-processed analysis-result)))
        (println (format "Total canonicals found: %d" (:total-canonicals-found analysis-result)))
        (println (format "Total equivalences discovered: %d" (:total-equivalences-discovered analysis-result))))
      
      (catch Exception e
        (println (apply str (repeat 80 "-")))
        (println "\n[ERROR] Analysis FAILED with exception:")
        (println (format "  Message: %s" (.getMessage e)))
        (println "\nException data:")
        (when (ex-data e)
          (doseq [[k v] (ex-data e)]
            (println (format "  %s: %s" k v))))
        (println "\nStack trace:")
        (.printStackTrace e))
      
      (finally
        (println "\n[CLEANUP] Closing database connection...")
        (db-conn/close conn)
        (println "\n" (apply str (repeat 80 "="))))))
  
  (println "\n✅ Diagnostic test complete. Check output above for [DIAG] markers.")
  (println "   Look for duplicate detection and INSERT result logs."))

;; To run: (phase-2-diagnostic-test)
