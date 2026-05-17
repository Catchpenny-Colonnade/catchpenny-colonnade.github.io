(ns sudoku-clj.patterns.analyzer
  "Load puzzle data from resources/puzzles and analyze for canonical form duplicates."
  (:require [clojure.java.io :as io]
            [clojure.data.json :as json]
            [sudoku-clj.patterns.canonical :as canonical]))

(defn load-puzzle-files []
  "Load all puzzle JSON files from resources/puzzles directory."
  (let [puzzles-dir (io/file (io/resource "puzzles"))]
    (if (.exists puzzles-dir)
      (let [json-files (sort (filter #(.endsWith (.getName %) ".json")
                                     (.listFiles puzzles-dir)))]
        (if (seq json-files)
          (apply concat
                 (for [json-file json-files]
                   (let [file-name (.getName json-file)
                         grids (json/read-str (slurp json-file))]
                     (for [idx (range (count grids))]
                       {:file-name file-name
                        :puzzle-idx idx
                        :grid (nth grids idx)}))))
          []))
      [])))

(defn analyze-puzzles
  "Analyze puzzles for canonical form duplicates."
  [& {:keys [full?] :or {full? false}}]
  (let [all-puzzles (load-puzzle-files)
        total-count (count all-puzzles)
        mode (if full? :full :geometric-only)
        canonical-fn #(canonical/canonical-form % mode)
        start-time (System/currentTimeMillis)
        mode-label (if full? "FULL FELGENHAUER-JARVIS (geometric+band+stack+symbols)" "GEOMETRIC ONLY")]

    (println (format "\n=== Analyzing %d puzzles (%s) ===" total-count mode-label))
    (println (format "Mode: %s" mode))
    (flush)

    (loop [remaining all-puzzles
           groups {}
           num 0]
      (if (empty? remaining)
        (let [elapsed (/ (- (System/currentTimeMillis) start-time) 1000.0)]
          (println (format "\n=== Complete: %.1f seconds ===" elapsed))
          {:total total-count
           :unique (count groups)
           :groups groups})
        (let [puzzle (first remaining)
              new-num (inc num)
              canon (try (canonical-fn (:grid puzzle))
                         (catch Exception e
                           (when (< new-num 5)  ; Log first few errors only
                             (println (format "ERROR on puzzle %s: %s" (:file-name puzzle) (.getMessage e))))
                           nil))]
          
          ; Print progress every 5%
          (when (zero? (mod new-num (max 1 (int (/ total-count 20)))))
            (let [pct (* 100 (/ new-num total-count))
                  elapsed (/ (- (System/currentTimeMillis) start-time) 1000.0)]
              (println (format "[%s%%] Processed %s/%s puzzles in %s seconds (%s puzzles/sec)"
                              pct new-num total-count elapsed (/ new-num elapsed)))))

          (if canon
            (recur (rest remaining)
                   (update groups canon (fn [v] (conj (or v []) puzzle)))
                   new-num)
            (recur (rest remaining) groups new-num)))))))

(defn -main [& args]
  (let [results (analyze-puzzles)]
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
        (println "\nNo duplicates detected.")))))
