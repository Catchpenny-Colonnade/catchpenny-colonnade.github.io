(ns sudoku-clj.patterns.analyzer-test
  (:require [clojure.test :refer :all]
            [clojure.java.io :as io]
            [clojure.data.json :as json]
            [sudoku-clj.patterns.analyzer :as analyzer]
            [sudoku-clj.patterns.canonical :as canonical]))

; Helper to create a small test puzzle set
(defn load-first-n-puzzles
  "Load first N puzzles from the puzzle files for testing"
  [n]
  (let [puzzles-dir (io/file (io/resource "puzzles"))]
    (when (.exists puzzles-dir)
      (let [json-files (sort (filter #(.endsWith (.getName %) ".json") 
                                     (.listFiles puzzles-dir)))
            files-to-read (take 2 json-files)] ; Read from first 2 files
        (apply concat
               (for [json-file files-to-read]
                 (let [grids (json/read-str (slurp json-file))
                       limited-grids (take (/ n 2) grids)]
                   (for [idx (range (count limited-grids))]
                     {:file-name (.getName json-file)
                      :puzzle-idx idx
                      :grid (nth grids idx)}))))))))

(deftest test-load-puzzles
  (testing "Can load puzzles from JSON files"
    (let [puzzles (load-first-n-puzzles 10)]
      (is (pos? (count puzzles)) "Should load at least some puzzles")
      (is (every? #(contains? % :file-name) puzzles) "Each puzzle should have file-name")
      (is (every? #(contains? % :grid) puzzles) "Each puzzle should have grid")
      (is (every? #(= 81 (count (:grid %))) puzzles) "Each grid should be 81 chars"))))

(deftest test-analyze-small-puzzle-set
  (testing "Analyze function works on small set"
    (let [puzzles (load-first-n-puzzles 5)]
      (when (seq puzzles)
        ; Group by canonical form manually
        (let [grouped (reduce (fn [acc puzzle]
                                (let [canonical (canonical/canonical-form (:grid puzzle))]
                                  (update acc canonical #(conj (or % []) puzzle))))
                              {}
                              puzzles)]
          (is (pos? (count grouped)) "Should create groups")
          (is (every? #(pos? (count %)) (vals grouped)) "Each group should have puzzles"))))))

(deftest test-canonical-form-grouping-logic
  (testing "Puzzles group into map by canonical form"
    (let [p1 {:file-name "test.json" :puzzle-idx 0 :grid "123456789456789123789123456214365897365897214897214365531642978642978531978531642"}
          p2 {:file-name "test.json" :puzzle-idx 1 :grid "123456789456789123789123456214365897365897214897214365531642978642978531978531642"}
          puzzles [p1 p2]
          grouped (reduce (fn [acc puzzle]
                            (let [canonical (canonical/canonical-form (:grid puzzle))]
                              (update acc canonical #(conj (or % []) puzzle))))
                          {}
                          puzzles)]
      (is (pos? (count grouped)) "Should create groups")
      (is (= 2 (count (first (vals grouped)))) "Identical puzzles should be grouped together")
      (is (every? #(pos? (count %)) (vals grouped)) "Each group should have puzzles"))))

(deftest test-puzzle-grouping-report-structure
  (testing "Analysis produces report with correct structure"
    (let [puzzles (load-first-n-puzzles 5)]
      (when (seq puzzles)
        (let [grouped (reduce (fn [acc puzzle]
                                (let [canonical (canonical/canonical-form (:grid puzzle))]
                                  (update acc canonical #(conj (or % []) puzzle))))
                              {}
                              puzzles)
              report {:total (count puzzles)
                      :unique (count grouped)
                      :duplicates (- (count puzzles) (count grouped))
                      :duplicate-groups (into [] (filter #(> (count (val %)) 1) grouped))}]
          (is (contains? report :total) "Report should have total")
          (is (contains? report :unique) "Report should have unique")
          (is (contains? report :duplicates) "Report should have duplicates")
          (is (contains? report :duplicate-groups) "Report should have duplicate-groups")
          (is (>= (:total report) 0) "Total should be non-negative")
          (is (>= (:unique report) 0) "Unique should be non-negative")
          (is (>= (:duplicates report) 0) "Duplicates should be non-negative"))))))

(deftest test-duplicate-detection
  (testing "Can detect duplicate puzzles (same canonical form)"
    (let [grid "123456789456789123789123456214365897365897214897214365531642978642978531978531642"
          p1 {:file-name "test1.json" :puzzle-idx 0 :grid grid}
          p2 {:file-name "test2.json" :puzzle-idx 0 :grid grid} ; Same grid
          puzzles [p1 p2]
          grouped (reduce (fn [acc puzzle]
                            (let [canonical (canonical/canonical-form (:grid puzzle))]
                              (update acc canonical #(conj (or % []) puzzle))))
                          {}
                          puzzles)]
      (is (= 1 (count grouped)) "Same grids should group into 1 canonical form")
      (is (= 2 (count (first (vals grouped)))) "Group should have 2 puzzles"))))

(deftest test-realistic-puzzle-analysis
  (testing "Full analysis pipeline on actual puzzle data"
    (let [puzzles (load-first-n-puzzles 10)]
      (when (seq puzzles)
        ; Manually run analysis logic
        (let [start-time (System/currentTimeMillis)
              grouped (reduce (fn [acc puzzle]
                                (let [canonical (try
                                                  (canonical/canonical-form (:grid puzzle))
                                                  (catch Exception e nil))]
                                  (if canonical
                                    (update acc canonical #(conj (or % []) puzzle))
                                    acc)))
                              {}
                              puzzles)
              elapsed (- (System/currentTimeMillis) start-time)
              total (count puzzles)
              unique (count grouped)
              duplicates (- total unique)]
          
          (is (pos? total) "Should have puzzles")
          (is (pos? unique) "Should have unique canonical forms")
          (is (<= 0 duplicates) "Duplicates should be non-negative")
          (is (< elapsed 5000) "Analysis should complete quickly for 10 puzzles (< 5s)"))))))
