(ns sudoku-clj.difficulty-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.difficulty :refer :all]
            [sudoku-clj.solver :refer :all]
            [clojure.data.json :as json]))

;; Test difficulty analysis functions

(defn load-test-puzzles
  "Load a few test puzzles from resources for testing"
  []
  (json/read-str (slurp "resources/puzzles/index00.json")))

(deftest count-clues-test
  (testing "Count initial clues in puzzles"
    (let [puzzles (load-test-puzzles)
          puzzle1 (first puzzles)
          puzzle2 (second puzzles)]
      (is (integer? (count-initial-clues puzzle1)))
      (is (>= (count-initial-clues puzzle1) 1)))))

(deftest classify-difficulty-test
  (testing "Classify puzzle difficulty based on clue count"
    (let [puzzles (load-test-puzzles)
          classifications (map classify-difficulty (take 10 puzzles))]
      (is (every? #(contains? #{:trivial :easy :medium :hard :extreme} %) classifications)))))

(deftest measure-complexity-test
  (testing "Measure solve complexity"
    (let [puzzles (load-test-puzzles)
          puzzle (first puzzles)
          complexity (measure-solve-complexity puzzle)]
      (is (contains? complexity :method))
      (is (contains? complexity :iterations))
      (is (integer? (:iterations complexity)))
      (is (>= (:iterations complexity) 0)))))

(deftest analyze-puzzle-test
  (testing "Comprehensive puzzle analysis"
    (let [puzzles (load-test-puzzles)
          puzzle (first puzzles)
          analysis (analyze-puzzle puzzle)]
      (is (= puzzle (:puzzle analysis)))
      (is (integer? (:clues analysis)))
      (is (>= (:clues analysis) 0))
      (is (<= (:clues analysis) 81))
      (is (contains? #{:trivial :easy :medium :hard :extreme} (:classification analysis)))
      (is (integer? (:difficulty-score analysis)))
      (is (>= (:difficulty-score analysis) 0))
      (is (<= (:difficulty-score analysis) 100))
      (is (boolean? (:requires-search analysis)))
      (is (integer? (:empty-cells-after-propagation analysis))))))

(deftest analyze-multiple-puzzles-test
  (testing "Analyze multiple puzzles for consistency"
    (let [puzzles (load-test-puzzles)
          analyses (map analyze-puzzle (take 5 puzzles))]
      (is (= 5 (count analyses)))
      (is (every? (fn [a] (contains? a :clues)) analyses))
      (is (every? (fn [a] (contains? a :classification)) analyses)))))

