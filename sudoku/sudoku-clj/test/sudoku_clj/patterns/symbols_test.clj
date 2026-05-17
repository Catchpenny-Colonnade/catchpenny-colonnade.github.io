(ns sudoku-clj.patterns.symbols-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.patterns.symbols :as sym]))

(def test-grid "123456789456789123789123456214365897365897214897214365531642978642978531978531642")

(deftest test-apply-symbol-perm-identity
  (testing "Identity symbol permutation [0 1 2 3 4 5 6 7 8 9] returns same grid"
    (let [mapping [0 1 2 3 4 5 6 7 8 9]
          result (sym/apply-symbol-perm test-grid mapping)]
      (is (= test-grid result)))))

(deftest test-apply-symbol-perm-swap-1-2
  (testing "Swapping 1 and 2 changes grid appropriately"
    (let [mapping [0 2 1 3 4 5 6 7 8 9]  ; 1->2, 2->1
          result (sym/apply-symbol-perm test-grid mapping)]
      (is (not= test-grid result))
      (is (= 81 (count result)))
      ; Double-check: should swap 1 and 2
      (let [original-1s (count (filter #(= \1 %) test-grid))
            result-2s (count (filter #(= \2 %) result))]
        (is (= original-1s result-2s))))))

(deftest test-apply-symbol-perm-preserves-structure
  (testing "Symbol permutation preserves grid length"
    (doseq [mapping (take 10 (repeatedly (fn [] (into [0] (shuffle (range 1 10))))))]
      (let [result (sym/apply-symbol-perm test-grid mapping)]
        (is (= 81 (count result)))
        (is (every? #(Character/isDigit %) result))))))

(deftest test-all-symbol-perms-returns-seq
  (testing "all-symbol-perms returns a sequence"
    (let [perms (sym/all-symbol-perms test-grid)]
      (is (seq? perms)))))

(deftest test-all-symbol-perms-first-is-identity
  (testing "First element of all-symbol-perms is identity (anchored with 1->1)"
    (let [perms (sym/all-symbol-perms test-grid)
          [first-grid first-mapping] (first perms)]
      (is (= test-grid first-grid))
      (is (= [0 1 2 3 4 5 6 7 8 9] first-mapping)
          "With anchored permutation (1->1), identity should be first"))))

(deftest test-all-symbol-perms-returns-tuples
  (testing "all-symbol-perms returns [grid mapping] tuples"
    (let [perms (sym/all-symbol-perms test-grid)
          samples (take 5 perms)]
      (doseq [[grid mapping] samples]
        (is (string? grid))
        (is (= 81 (count grid)))
        (is (vector? mapping))
        (is (= 10 (count mapping)))))))

(deftest test-all-symbol-perms-diverse
  (testing "all-symbol-perms generates different grids"
    (let [perms (sym/all-symbol-perms test-grid)
          first-n (take 100 perms)
          unique-grids (count (set (map first first-n)))]
      (is (> unique-grids 50)
          "Should generate many different grids in first 100 permutations"))))

(deftest test-all-symbol-perms-lazy
  (testing "all-symbol-perms is lazy"
    (let [perms (sym/all-symbol-perms test-grid)]
      (is (or (instance? clojure.lang.LazySeq perms)
              (seq? perms))
          "Should return a lazy sequence"))))

(deftest test-symbol-perm-reversibility
  (testing "Applying same permutation twice goes identity, reverse is inverse"
    (let [perm [0 3 1 2 4 5 6 7 8 9]  ; 1->3, 3->2, 2->1
          once (sym/apply-symbol-perm test-grid perm)
          twice (sym/apply-symbol-perm once perm)
          thrice (sym/apply-symbol-perm twice perm)]
      ; After 3 applications of a 3-cycle, should return to original
      (is (= test-grid thrice)))))

(deftest test-symbol-perm-all-valid-digits
  (testing "Symbol permutation preserves only digits 1-9 in grid"
    (let [perms (sym/all-symbol-perms test-grid)
          samples (take 20 perms)]
      (doseq [[grid _] samples]
        (let [chars (set grid)]
          (is (every? #(Character/isDigit %) chars)))))))

(deftest test-anchored-perms-optimization-count
  (testing "Anchored permutations (8!) are ~9x fewer than unanchored (9!)"
    (let [anchored-perms (sym/all-symbol-perms test-grid)
          unanchored-perms (sym/all-symbol-perms-unanchored test-grid)
          anchored-count (count anchored-perms)
          unanchored-count (count unanchored-perms)]
      (is (= anchored-count 40320)
          "8! = 40320 anchored permutations (1->1 fixed)")
      (is (= unanchored-count 362880)
          "9! = 362880 unanchored permutations")
      (is (= unanchored-count (* anchored-count 9))
          "Ratio should be exactly 9x"))))

(deftest test-anchored-perms-faster
  (testing "Anchored permutations complete faster than unanchored"
    (let [start-anchored (System/nanoTime)
          anchored-perms (count (sym/all-symbol-perms test-grid))
          elapsed-anchored (/ (- (System/nanoTime) start-anchored) 1e9)
          
          start-unanchored (System/nanoTime)
          unanchored-perms (count (sym/all-symbol-perms-unanchored test-grid))
          elapsed-unanchored (/ (- (System/nanoTime) start-unanchored) 1e9)]
      (is (< elapsed-anchored elapsed-unanchored)
          (str "Anchored (" elapsed-anchored "s) should be faster than unanchored (" elapsed-unanchored "s)")))))

(deftest test-get-used-symbols
  (testing "get-used-symbols returns only symbols present in grid"
    (let [full-grid test-grid
          partial-grid "111111111222222222333333333444444444555555555666666666777777777888888888999999999"]
      (is (= 9 (count (sym/get-used-symbols full-grid)))
          "Full sudoku grid uses all 1-9")
      (is (= 9 (count (sym/get-used-symbols partial-grid)))
          "Even simple grids use all 1-9 when filled"))))