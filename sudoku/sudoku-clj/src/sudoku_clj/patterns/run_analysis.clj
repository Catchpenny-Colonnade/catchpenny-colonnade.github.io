#!/usr/bin/env clojure

"Run canonical form analysis on sudoku puzzle data.
Usage:
  lein run -m sudoku-clj.patterns.run-analysis
  lein run -m sudoku-clj.patterns.run-analysis :full true
"

(ns sudoku-clj.patterns.run-analysis
  (:require [sudoku-clj.patterns.analyzer :as analyzer]))

(defn -main
  "Main entry point for analysis
   Args: [--full] (optional flag for full Felgenhauer & Jarvis analysis)
   Default: geometric analysis"
  [& args]
  (let [full? (some #(= % "--full") args)
        results (analyzer/analyze-puzzles :full? full?)]
    (println (str "\n" (apply str (repeat 60 "="))))
    (println "SUDOKU CANONICAL FORM ANALYSIS")
    (println (apply str (repeat 60 "=")))
    
    (println (format "Total puzzles analyzed: %d" (:total results)))
    (println (format "Unique canonical forms: %d" (:unique results)))
    
    (let [duplicates (filter (fn [[_ v]] (> (count v) 1)) (:groups results))]
      (if (seq duplicates)
        (do
          (println "\nDuplicate groups detected:")
          (doseq [[canon group] duplicates]
            (println (format "\nCanonical form: %s" canon))
            (doseq [p group]
              (println (format "  - %s (index %d)" (:file-name p) (:puzzle-idx p))))))
        (println "\nNo duplicates detected!")))))
