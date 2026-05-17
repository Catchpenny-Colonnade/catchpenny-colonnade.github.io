(ns sudoku-clj.patterns.transformations-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.patterns.transformations :as trans]))

; Create a simple test grid for verification
; Using pattern where position = digit for easy verification
; Grid: 
; 1 2 3 | 4 5 6 | 7 8 9
; 0 1 2 | 3 4 5 | 6 7 8
; 0 0 1 | 2 3 4 | 5 6 7
; ---
; 0 0 0 | 1 2 3 | 4 5 6
; 0 0 0 | 0 1 2 | 3 4 5
; 0 0 0 | 0 0 1 | 2 3 4
; ---
; 0 0 0 | 0 0 0 | 1 2 3
; 0 0 0 | 0 0 0 | 0 1 2
; 0 0 0 | 0 0 0 | 0 0 1

(deftest test-rotate-90
  (testing "Rotate 90 degrees clockwise"
    (let [grid "123456789012345678001234567000123456000012345000001234000000123000000012000000001"
          rotated (trans/rotate-90 grid)]
      ; After 90° clockwise, bottom-left becomes top-left
      (is (= 81 (count rotated))))))

(deftest test-rotate-180
  (testing "Rotate 180 degrees"
    (let [grid "123456789012345678001234567000123456000012345000001234000000123000000012000000001"
          rotated (trans/rotate-180 grid)
          back (trans/rotate-180 rotated)]
      (is (= grid back)))))

(deftest test-rotate-270
  (testing "Rotate 270 degrees (3x 90)"
    (let [grid "123456789012345678001234567000123456000012345000001234000000123000000012000000001"
          r90 (trans/rotate-90 grid)
          r180 (trans/rotate-90 r90)
          r270 (trans/rotate-90 r180)
          r270-direct (trans/rotate-270 grid)]
      (is (= r270 r270-direct)))))

(deftest test-flip-horizontal
  (testing "Flip horizontally"
    (let [grid "123456789012345678001234567000123456000012345000001234000000123000000012000000001"
          flipped (trans/flip-horizontal grid)
          back (trans/flip-horizontal flipped)]
      (is (= grid back)))))

(deftest test-flip-vertical
  (testing "Flip vertically"
    (let [grid "123456789012345678001234567000123456000012345000001234000000123000000012000000001"
          flipped (trans/flip-vertical grid)
          back (trans/flip-vertical flipped)]
      (is (= grid back)))))

(deftest test-transpose
  (testing "Transpose"
    (let [grid "123456789012345678001234567000123456000012345000001234000000123000000012000000001"
          transposed (trans/transpose grid)
          back (trans/transpose transposed)]
      (is (= grid back)))))

(deftest test-anti-transpose
  (testing "Anti-transpose"
    (let [grid "123456789012345678001234567000123456000012345000001234000000123000000012000000001"
          anti (trans/anti-transpose grid)]
      (is (= 81 (count anti))))))

(deftest test-all-geometric-transforms
  (testing "Generate all 8 geometric transforms"
    (let [grid "123456789012345678001234567000123456000012345000001234000000123000000012000000001"
          transforms (trans/all-geometric-transforms grid)]
      (is (<= 1 (count transforms) 8) "Should have 1-8 unique transforms"))))

(deftest test-lexicographic-order
  (testing "Find lexicographically smallest"
    (let [grids ["999999999999999999999999999999999999999999999999999999999999999999999999999999999"
                 "111111111111111111111111111111111111111111111111111111111111111111111111111111111"
                 "555555555555555555555555555555555555555555555555555555555555555555555555555555555"]
          smallest (trans/find-lexicographically-smallest grids)]
      (is (= smallest "111111111111111111111111111111111111111111111111111111111111111111111111111111111")))))
