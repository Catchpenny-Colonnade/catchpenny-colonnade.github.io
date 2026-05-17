#!/bin/bash

# Run Phase 2 analysis on first N files
cd /c/Users/dajoh/Documents/code/catchpenny-colonnade.github.io/sudoku/sudoku-clj

echo "=== SUDOKU DIFFICULTY DISTRIBUTION ANALYSIS ==="
echo "Analyzing first 10 files..."

lein repl << 'REPL'
(use 'sudoku-clj.analysis)

(let [stats (analyze-all-files 10)]
  (print-distribution-report stats)
  
  ; Also export to JSON
  (let [output-path "analysis-results-10files.json"]
    (require '[clojure.data.json :as json])
    (spit output-path (json/write-str 
                        {:stats stats
                         :timestamp (java.time.Instant/now)}))
    (println "\nResults saved to" output-path)))

(System/exit 0)
REPL
