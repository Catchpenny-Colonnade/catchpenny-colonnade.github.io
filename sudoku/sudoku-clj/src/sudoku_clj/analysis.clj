(ns sudoku-clj.analysis
  "Batch analysis of the 1 million puzzle dataset to compute difficulty statistics"
  (:require [clojure.java.io :as io]
            [clojure.data.json :as json]
            [sudoku-clj.difficulty :as diff]
            [sudoku-clj.puzzle :as puzzle]))

;; Statistics collection

(defn collect-difficulty-stats
  "Analyze all puzzles in a batch and collect difficulty statistics"
  [puzzles]
  (let [analyses (map diff/analyze-puzzle puzzles)
        ;; Group by difficulty classification
        by-tier (group-by :classification analyses)
        clue-counts (map :clues analyses)
        scores (map :difficulty-score analyses)]
    {:total (count analyses)
     :by-tier (into {} (map (fn [[tier puzzles]]
                             [tier (count puzzles)])
                           by-tier))
     :avg-clues (if (seq clue-counts) 
                  (double (/ (reduce + clue-counts) (count clue-counts)))
                  0.0)
     :avg-score (if (seq scores)
                  (double (/ (reduce + scores) (count scores)))
                  0.0)
     :needs-search (count (filter :requires-search analyses))
     :all-analyses analyses}))

(defn load-and-analyze-file
  "Load a single puzzle file and analyze all puzzles in it"
  [file-path]
  (try
    (let [data (json/read-str (slurp file-path))
          puzzles (if (vector? data) data [data])]
      (collect-difficulty-stats puzzles))
    (catch Exception e
      (println "Error processing" file-path ":" (.getMessage e))
      nil)))

(defn analyze-all-files
  "Analyze all 1,296 puzzle files in the dataset. Optionally limit to first N files for testing."
  ([]
   (analyze-all-files nil))  ; Analyze all files
  
  ([file-limit]
   (let [;; Get all index keys
         all-indices (puzzle/get-indicies)
         indices (if file-limit (take file-limit all-indices) all-indices)
         ;; Load and analyze each file
         file-results (map (fn [idx]
                            (let [file-path (str "resources/puzzles/index" idx ".json")]
                              (println "Analyzing" file-path "...")
                              (let [result (load-and-analyze-file file-path)]
                                (if result
                                  (assoc result :index-key idx)
                                  nil))))
                          indices)
         ;; Filter out nils
         valid-results (filter identity file-results)]
     
     ;; Aggregate statistics
     (if (seq valid-results)
       {:total-files (count valid-results)
        :total-puzzles (reduce + (map :total valid-results))
        :by-tier (let [all-tiers (reduce (fn [acc result]
                                           (reduce (fn [a [tier count]]
                                                     (update a tier (fnil + 0) count))
                                                   acc
                                                   (:by-tier result)))
                                         {}
                                         valid-results)]
                   all-tiers)
        :avg-clues-overall (if (seq valid-results)
                            (double (/ (reduce + (map :avg-clues valid-results))
                                      (count valid-results)))
                            0.0)
        :avg-score-overall (if (seq valid-results)
                            (double (/ (reduce + (map :avg-score valid-results))
                                      (count valid-results)))
                            0.0)
        :total-needs-search (reduce + (map :needs-search valid-results))
        :file-results valid-results}
       ;; Return empty result structure if no valid files
       {:total-files 0
        :total-puzzles 0
        :by-tier {}
        :avg-clues-overall 0.0
        :avg-score-overall 0.0
        :total-needs-search 0
        :file-results []}))))


(defn print-distribution-report
  "Print a formatted difficulty distribution report"
  [stats]
  (println "\n" (apply str (repeat 50 "=")))
  (println "SUDOKU DIFFICULTY DISTRIBUTION ANALYSIS")
  (println (apply str (repeat 50 "=")))
  
  (println "\nDataset Overview:")
  (println "  Total Files Analyzed:" (:total-files stats))
  (println "  Total Puzzles:" (:total-puzzles stats))
  
  (println "\nDifficulty Distribution:")
  (let [by-tier (:by-tier stats)
        total (:total-puzzles stats)
        tiers [:trivial :easy :medium :hard :extreme]]
    (doseq [tier tiers]
      (let [count (get by-tier tier 0)
            pct (if (> total 0) (double (/ count total)) 0)]
        (println (format "  %-10s: %7d puzzles (%5.1f%%)"
                        (name tier) count (* pct 100))))))
  
  (println "\nStatistics:")
  (println (format "  Average Clues: %.1f" (:avg-clues-overall stats)))
  (println (format "  Average Difficulty Score: %.1f" (:avg-score-overall stats)))
  (println (format "  Puzzles Requiring Search: %d (%.1f%%)"
                   (:total-needs-search stats)
                   (double (/ (:total-needs-search stats) (:total-puzzles stats) 0.01))))
  
  (println "\nFile-by-File Breakdown:")
  (doseq [result (:file-results stats)]
    (println (format "  index%s: %d puzzles, avg score: %.1f"
                    (:index-key result) (:total result) (:avg-score result))))
  
  (println "\n" (apply str (repeat 50 "="))))

(defn analyze-full-dataset
  "Complete analysis of entire 1M puzzle dataset"
  []
  (println "Starting full dataset analysis...")
  (let [start-time (System/currentTimeMillis)
        stats (analyze-all-files)
        end-time (System/currentTimeMillis)
        elapsed (/ (- end-time start-time) 1000.0)]
    
    (print-distribution-report stats)
    (println (format "\nAnalysis completed in %.1f seconds\n" elapsed))
    stats))

;; Export utilities

(defn export-puzzles-by-difficulty
  "Export puzzle sets organized by difficulty tier"
  [analysis-results output-dir]
  (println "Exporting puzzles by difficulty to" output-dir)
  
  ;; Create output directory if it doesn't exist
  (io/make-parents (str output-dir "/trivial.json"))
  
  ;; Group all puzzles by difficulty tier from the analysis results
  (let [all-puzzles (mapcat :all-analyses (:file-results analysis-results))
        by-tier (group-by :difficulty-tier all-puzzles)]
    
    (doseq [[tier puzzles] by-tier]
      (let [file-path (str output-dir "/" (name tier) ".json")
            puzzle-strings (map :puzzle puzzles)]
        (spit file-path (json/write-str puzzle-strings))
        (println (format "  Exported %d %s puzzles to %s"
                        (count puzzles) (name tier) file-path)))))
  
  (println "Export complete"))
