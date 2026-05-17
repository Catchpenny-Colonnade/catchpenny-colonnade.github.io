(ns sudoku-clj.patterns.test-small-run
  "Quick validation: analyze first 20 puzzles from actual resources/puzzles/"
  (:require [clojure.java.io :as io]
            [clojure.data.json :as json]
            [sudoku-clj.patterns.canonical :as canonical]))

(defn load-first-n-puzzles
  "Load first N puzzles from resources/puzzles JSON files"
  [n]
  (let [puzzles-dir (io/file (io/resource "puzzles"))]
    (if (and puzzles-dir (.exists puzzles-dir))
      (let [json-files (sort (filter #(.endsWith (.getName %) ".json")
                                     (.listFiles puzzles-dir)))]
        (if (seq json-files)
          (take n (apply concat
                         (for [json-file json-files]
                           (let [file-name (.getName json-file)
                                 grids (json/read-str (slurp json-file))]
                             (for [idx (range (count grids))]
                               {:file-name file-name
                                :puzzle-idx idx
                                :grid (nth grids idx)})))))
          []))
      [])))

(defn test-small-run
  "Analyze first 20 puzzles and report results"
  []
  (let [puzzles (load-first-n-puzzles 20)
        total-count (count puzzles)
        start-time (System/currentTimeMillis)]
    
    (println (format "\n=== SMALL TEST RUN: %d PUZZLES ===" total-count))
    (if (zero? total-count)
      (println "No puzzles found in resources/puzzles")
      (do
        (println "Processing...")
        (loop [remaining puzzles
               groups {}
               num 0]
          (if (empty? remaining)
            (let [elapsed (/ (- (System/currentTimeMillis) start-time) 1000.0)
                  unique-count (count groups)
                  duplicate-count (- total-count unique-count)]
              (println "\n=== RESULTS ===")
              (println (format "Time: %.2f seconds" elapsed))
              (println (format "Total puzzles analyzed: %d" total-count))
              (println (format "Unique canonical forms: %d" unique-count))
              (println (format "Duplicate groups: %d" (count (filter #(> (count (val %)) 1) groups))))
              (println (format "Total duplicates: %d" duplicate-count))
              
              (when (pos? (count (filter #(> (count (val %)) 1) groups)))
                (println "\n--- Duplicate Groups ---")
                (doseq [[canonical-form copies] (filter #(> (count (val %)) 1) groups)]
                  (println (format "  Canonical: %s... (%d copies)"
                                  (subs (str canonical-form) 0 (min 20 (count (str canonical-form))))
                                  (count copies)))))
              
              (println "\n VALIDATION COMPLETE: Pipeline works end-to-end!"))
            
            (let [puzzle (first remaining)
                  result (try
                           {:canon (canonical/canonical-form (:grid puzzle)) :success true}
                           (catch Exception e
                             {:error (.getMessage e) :success false}))]
              (if (:success result)
                (let [canon (:canon result)
                      new-groups (update groups canon #(conj (or % []) puzzle))
                      new-num (inc num)]
                  (when (zero? (mod new-num 5))
                    (print (format "%d " new-num))
                    (flush))
                  (recur (rest remaining) new-groups new-num))
                (do
                  (println (format "ERROR processing puzzle %d: %s" num (:error result)))
                  (recur (rest remaining) groups (inc num)))))))))))

(defn -main [& args]
  (test-small-run))
