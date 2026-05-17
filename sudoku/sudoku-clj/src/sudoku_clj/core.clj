(ns sudoku-clj.core
  (:require
   [sudoku-clj.puzzle :as puzzle]
   [sudoku-clj.analysis :as analysis]
   [sudoku-clj.generator :as gen]))

(defn -main [& args]
  "Entry point. Usage:
   lein run [mode] [args]
   - analyze [n] : Analyze first n puzzle files (default: 10)
   - generate [count] [tier] : Generate puzzles (default: 10 medium)
   - extreme : Detect extreme puzzles (default)"
  (let [mode (first args)
        arg1 (second args)
        arg2 (nth args 2 nil)]
    (cond
      (= mode "analyze")
      (let [file-limit (if arg1 (Integer/parseInt arg1) 10)]
        (println (format "Analyzing first %d puzzle files...\n" file-limit))
        (let [start (System/currentTimeMillis)
              stats (analysis/analyze-all-files file-limit)
              end (System/currentTimeMillis)
              elapsed (/ (- end start) 1000.0)]
          (analysis/print-distribution-report stats)
          (println (format "Analysis completed in %.1f seconds" elapsed))))
      
      (= mode "generate")
      (let [count (if arg1 (Integer/parseInt arg1) 10)
            tier (if arg2 (keyword arg2) :medium)
            start (System/currentTimeMillis)]
        (println (format "\n=== PUZZLE GENERATOR ===" ))
        (println (format "Generating %d %s difficulty puzzles...\n" count (name tier)))
        (let [puzzles (gen/generate-puzzles :count count :difficulty-tier tier)
              end (System/currentTimeMillis)
              elapsed (/ (- end start) 1000.0)
              avg-time (/ elapsed count)]
          (println (format "\nGeneration completed in %.1f seconds (%.2f sec/puzzle)"
                          elapsed avg-time))
          (println (format "\nGenerated puzzles:"))
          (doseq [[idx puzzle] (map-indexed vector puzzles)]
            (println (format "  %d: %s (%d clues, score: %d)"
                            (inc idx)
                            (:puzzle puzzle)
                            (:clues puzzle)
                            (int (:difficulty-score puzzle)))))))
      
      :else
      (do
        (println "Running extreme puzzle detection...")
        (puzzle/detect-extreme)))))
