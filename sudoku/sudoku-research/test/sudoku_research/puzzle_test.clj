(ns sudoku-research.puzzle-test
  (:require [clojure.test :refer :all]
            [clojure.string :as str]
            [sudoku-research.puzzle :as puzzle]))

;; Test puzzle: simple valid sudoku with known properties
(def test-puzzle "530070000600195000098000060800060003400803001700020006060000280000419005000080079")
(def test-solution "534678912672195348198342567821564793459783621763921456316457289287419635945286174")

;; ============================================================================
;; UNIT TESTS - PUZZLE TRANSFORMATION FUNCTIONS
;; ============================================================================

(deftest ^:unit puzzle-string->grid-test
  (testing "Convert puzzle string to 9x9 grid"
    (let [grid (puzzle/puzzle-string->grid test-puzzle)]
      (is (= (count grid) 9))
      (is (every? #(= (count %) 9) grid))
      ;; First row should be [5 3 0 0 7 0 0 0 0]
      (is (= (first grid) [5 3 0 0 7 0 0 0 0]))
      ;; Check some known positions
      (is (= (get-in grid [0 0]) 5))
      (is (= (get-in grid [0 1]) 3))
      (is (= (get-in grid [0 2]) 0)))))

(deftest ^:unit grid->puzzle-string-test
  (testing "Convert 9x9 grid back to puzzle string"
    (let [grid (puzzle/puzzle-string->grid test-puzzle)
          result (puzzle/grid->puzzle-string grid)]
      (is (= result test-puzzle)))))

(deftest ^:unit apply-rotation-identity-test
  (testing "Identity rotation (0°) returns same puzzle"
    (let [result (puzzle/apply-rotation test-puzzle 0)]
      (is (= result test-puzzle)))))

(deftest ^:unit apply-rotation-90-test
  (testing "90° clockwise rotation produces valid 81-char string"
    (let [result (puzzle/apply-rotation test-puzzle 1)]
      (is (= (count result) 81))
      ;; After 4 rotations of 90°, should get back original
      (let [rotated-4x (-> test-puzzle
                           (puzzle/apply-rotation 1)
                           (puzzle/apply-rotation 1)
                           (puzzle/apply-rotation 1)
                           (puzzle/apply-rotation 1))]
        (is (= rotated-4x test-puzzle))))))

(deftest ^:unit apply-rotation-180-test
  (testing "180° rotation"
    (let [result (puzzle/apply-rotation test-puzzle 2)]
      (is (= (count result) 81))
      ;; Two 180° rotations should give back original
      (let [rotated-2x (-> test-puzzle
                           (puzzle/apply-rotation 2)
                           (puzzle/apply-rotation 2))]
        (is (= rotated-2x test-puzzle))))))

(deftest ^:unit apply-rotation-270-test
  (testing "270° clockwise rotation (90° CCW)"
    (let [result (puzzle/apply-rotation test-puzzle 3)]
      (is (= (count result) 81))
      ;; 270° + 90° should give 360° = original
      (let [rotated-full (-> test-puzzle
                             (puzzle/apply-rotation 3)
                             (puzzle/apply-rotation 1))]
        (is (= rotated-full test-puzzle))))))

(deftest ^:unit apply-row-ordering-identity-test
  (testing "Identity row ordering returns same puzzle"
    (let [result (puzzle/apply-row-ordering test-puzzle [0 1 2 3 4 5 6 7 8])]
      (is (= result test-puzzle)))))

(deftest ^:unit apply-row-ordering-swap-test
  (testing "Swap rows 0 and 1"
    (let [grid (puzzle/puzzle-string->grid test-puzzle)
          row0 (first grid)
          row1 (second grid)
          result (puzzle/apply-row-ordering test-puzzle [1 0 2 3 4 5 6 7 8])
          result-grid (puzzle/puzzle-string->grid result)]
      ;; After swap, row 0 should be at position 1
      (is (= (get result-grid 1) row0))
      (is (= (get result-grid 0) row1)))))

(deftest ^:unit apply-row-ordering-permutation-test
  (testing "Complex row permutation"
    (let [result (puzzle/apply-row-ordering test-puzzle [8 7 6 5 4 3 2 1 0])]
      (is (= (count result) 81))
      ;; Reverse permutation twice should give original
      (let [twice-reversed (puzzle/apply-row-ordering result [8 7 6 5 4 3 2 1 0])]
        (is (= twice-reversed test-puzzle))))))

(deftest ^:unit apply-column-ordering-identity-test
  (testing "Identity column ordering returns same puzzle"
    (let [result (puzzle/apply-column-ordering test-puzzle [0 1 2 3 4 5 6 7 8])]
      (is (= result test-puzzle)))))

(deftest ^:unit apply-column-ordering-swap-test
  (testing "Swap columns 0 and 1"
    (let [result (puzzle/apply-column-ordering test-puzzle [1 0 2 3 4 5 6 7 8])
          grid (puzzle/puzzle-string->grid test-puzzle)
          result-grid (puzzle/puzzle-string->grid result)]
      ;; Check that column 0 and 1 are swapped in result
      ;; Original col 0: [5 6 0 8 4 7 0 0 0] at positions (r, 0)
      ;; Should now be at column 1
      (let [orig-col0 (vec (for [r (range 9)] (get-in grid [r 0])))]
        (is (= (vec (for [r (range 9)] (get-in result-grid [r 1]))) orig-col0))))))

(deftest ^:unit apply-symbol-translation-identity-test
  (testing "Identity symbol translation returns same puzzle"
    (let [result (puzzle/apply-symbol-translation test-puzzle [1 2 3 4 5 6 7 8 9])]
      (is (= result test-puzzle)))))

(deftest ^:unit apply-symbol-translation-swap-test
  (testing "Swap digits 1 and 2"
    (let [result (puzzle/apply-symbol-translation test-puzzle [2 1 3 4 5 6 7 8 9])
          orig-grid (puzzle/puzzle-string->grid test-puzzle)
          result-grid (puzzle/puzzle-string->grid result)]
      ;; Verify position-by-position swap
      (doseq [r (range 9) c (range 9)]
        (let [orig-val (get-in orig-grid [r c])
              result-val (get-in result-grid [r c])]
          (cond
            (= orig-val 1) (is (= result-val 2))
            (= orig-val 2) (is (= result-val 1))
            :else (is (= result-val orig-val)))))
      ;; Applying twice should give back original
      (let [twice-translated (puzzle/apply-symbol-translation result [2 1 3 4 5 6 7 8 9])]
        (is (= twice-translated test-puzzle))))))

(deftest ^:unit apply-symbol-translation-preserves-zeros-test
  (testing "Symbol translation preserves 0s (empty cells)"
    (let [result (puzzle/apply-symbol-translation test-puzzle [9 8 7 6 5 4 3 2 1])]
      ;; Count of 0s should be same as original
      (let [orig-zeros (count (filter #(= % \0) test-puzzle))
            result-zeros (count (filter #(= % \0) result))]
        (is (= orig-zeros result-zeros))))))

(deftest ^:unit apply-all-transforms-test
  (testing "Apply all transformations together"
    (let [result (puzzle/apply-all-transforms
                   test-puzzle
                   0  ;; No rotation
                   [0 1 2 3 4 5 6 7 8]  ;; No row reordering
                   [0 1 2 3 4 5 6 7 8]  ;; No column reordering
                   [1 2 3 4 5 6 7 8 9])]  ;; No symbol translation
      (is (= result test-puzzle))))
  
  (testing "Apply rotation and symbol translation"
    (let [result (puzzle/apply-all-transforms
                   test-puzzle
                   1  ;; 90° rotation
                   [0 1 2 3 4 5 6 7 8]
                   [0 1 2 3 4 5 6 7 8]
                   [1 2 3 4 5 6 7 8 9])]
      (is (= (count result) 81))))
  
  (testing "Transformation chain produces valid puzzle format"
    (let [result (puzzle/apply-all-transforms
                   test-puzzle
                   2  ;; 180° rotation
                   [8 7 6 5 4 3 2 1 0]  ;; Reverse rows
                   [8 7 6 5 4 3 2 1 0]  ;; Reverse columns
                   [2 1 3 4 5 6 7 8 9])]  ;; Swap 1 and 2
      (is (= (count result) 81))
      ;; Should contain only digits 0-9
      (is (every? #(Character/isDigit %) result)))))
