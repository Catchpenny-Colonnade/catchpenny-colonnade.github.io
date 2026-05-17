(ns sudoku-clj.patterns.canonical-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.patterns.canonical :as canonical]
            [sudoku-clj.patterns.transformations :as trans]))

; Real sudoku puzzle (solution grid format)
(def puzzle-1 "123456789456789123789123456214365897365897214897214365531642978642978531978531642")
(def puzzle-2 "987654321654321987321987654123456789456789123789123456214365897365897214897214365")

(deftest test-canonical-form-geometric-only-returns-string
  (testing "Canonical form returns 81-character string"
    (let [canonical (canonical/canonical-form puzzle-1)]
      (is (string? canonical))
      (is (= 81 (count canonical))))))

(deftest test-canonical-form-is-lexicographically-smallest
  (testing "Canonical form is lexicographically smallest of all transforms"
    (let [transforms (trans/all-geometric-transforms puzzle-1)
          canonical (canonical/canonical-form puzzle-1)]
      (is (every? #(>= (compare % canonical) 0) transforms)
          "Canonical form should be <= all transforms"))))

(deftest test-canonical-form-consistent
  (testing "Canonical form returns same result on repeated calls"
    (let [c1 (canonical/canonical-form puzzle-1)
          c2 (canonical/canonical-form puzzle-1)]
      (is (= c1 c2) "Same input should produce same canonical form"))))

(deftest test-rotations-same-canonical-form
  (testing "Rotated puzzles produce same canonical form"
    (let [c-original (canonical/canonical-form puzzle-1)
          c-90 (canonical/canonical-form (trans/rotate-90 puzzle-1))
          c-180 (canonical/canonical-form (trans/rotate-180 puzzle-1))
          c-270 (canonical/canonical-form (trans/rotate-270 puzzle-1))]
      (is (= c-original c-90) "Original and 90° rotation should have same canonical")
      (is (= c-original c-180) "Original and 180° rotation should have same canonical")
      (is (= c-original c-270) "Original and 270° rotation should have same canonical"))))

(deftest test-reflections-same-canonical-form
  (testing "Reflected puzzles produce same canonical form"
    (let [c-original (canonical/canonical-form puzzle-1)
          c-horiz (canonical/canonical-form (trans/flip-horizontal puzzle-1))
          c-vert (canonical/canonical-form (trans/flip-vertical puzzle-1))]
      (is (= c-original c-horiz) "Original and horizontal flip should have same canonical")
      (is (= c-original c-vert) "Original and vertical flip should have same canonical"))))

(deftest test-transposition-same-canonical-form
  (testing "Transposed puzzle produces same canonical form"
    (let [c-original (canonical/canonical-form puzzle-1)
          c-transpose (canonical/canonical-form (trans/transpose puzzle-1))]
      (is (= c-original c-transpose) "Original and transpose should have same canonical"))))

(deftest test-different-puzzles-different-canonical
  (testing "Different puzzles produce different canonical forms (usually)"
    (let [c1 (canonical/canonical-form puzzle-1)
          c2 (canonical/canonical-form puzzle-2)]
      (is (not= c1 c2) "Different puzzles should (likely) have different canonical forms"))))

(deftest test-inverse-geometric-transform
  (testing "Can identify which transform was applied"
    (let [original puzzle-1
          r90 (trans/rotate-90 original)]
      (is (= (canonical/inverse-geometric-transform original r90) :rotate-90)
          "Should identify 90° rotation")
      (is (= (canonical/inverse-geometric-transform original original) :identity)
          "Should identify identity"))))

(deftest test-canonical-form-all-transforms
  (testing "Canonical form works for all 8 geometric transforms"
    (let [original puzzle-1
          transforms [(trans/rotate-90 original)
                      (trans/rotate-180 original)
                      (trans/rotate-270 original)
                      (trans/flip-horizontal original)
                      (trans/flip-vertical original)
                      (trans/transpose original)
                      (trans/anti-transpose original)]
          canonicals (map #(canonical/canonical-form %) transforms)]
      (is (= 1 (count (set canonicals)))
          "All transforms of same puzzle should have same canonical form"))))
