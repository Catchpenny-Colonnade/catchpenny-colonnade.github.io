(ns sudoku-clj.patterns.canonical-full-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.patterns.canonical :as canonical]))

; Real sudoku puzzle
(def puzzle "123456789456789123789123456214365897365897214897214365531642978642978531978531642")

(deftest test-canonical-full-returns-string
  (testing "canonical-form-full-felgenhauer-jarvis returns valid 81-char string"
    (try
      (let [result (canonical/canonical-form-full-felgenhauer-jarvis puzzle)]
        (is (string? result))
        (is (= 81 (count result)))
        (is (every? #(Character/isDigit %) result)))
      (catch Exception e
        (is false (str "Should not throw exception: " (.getMessage e)))))))

(deftest test-canonical-full-consistent
  (testing "Full canonical form returns same result on repeated calls"
    (try
      (let [c1 (canonical/canonical-form-full-felgenhauer-jarvis puzzle)
            c2 (canonical/canonical-form-full-felgenhauer-jarvis puzzle)]
        (is (= c1 c2)))
      (catch Exception e
        (is false (str "Should not throw exception: " (.getMessage e)))))))

(deftest test-canonical-full-vs-geometric
  (testing "Full and geometric modes return same or different canonical based on equivalence"
    (try
      (let [geo (canonical/canonical-form puzzle :geometric-only)
            full (canonical/canonical-form puzzle :full)]
        (is (string? geo))
        (is (string? full))
        (is (= 81 (count geo)))
        (is (= 81 (count full)))
        ; Full might be smaller due to more variations, but at minimum should be valid
        (is (<= (compare full geo) 0)
            "Full F&J should find same or more minimal form than geometric"))
      (catch Exception e
        (is false (str "Should not throw exception: " (.getMessage e)))))))

(deftest test-all-canonical-modes-work
  (testing "All three canonical form modes are callable"
    (try
      (let [mode-only (canonical/canonical-form puzzle)
            geo-only (canonical/canonical-form puzzle :geometric-only)
            full-fj (canonical/canonical-form puzzle :full)]
        (is (string? mode-only))
        (is (string? geo-only))
        (is (string? full-fj)))
      (catch Exception e
        (is false (str "Should not throw exception: " (.getMessage e)))))))

(deftest test-canonical-full-does-not-throw-lazyseq-error
  (testing "Full F&J mode should not throw LazySeq cast errors"
    (try
      (let [result (canonical/canonical-form puzzle :full)]
        (is (not nil result)))
      (catch ClassCastException e
        (if (.contains (.getMessage e) "LazySeq")
          (is false "Should not throw LazySeq casting error")
          (throw e)))
      (catch Exception e
        (is false (str "Unexpected exception: " (.getMessage e)))))))

(deftest test-canonical-full-reasonable-performance
  (testing "Full F&J mode completes in reasonable time for single puzzle"
    (try
      (let [start (System/nanoTime)
            result (canonical/canonical-form puzzle :full)
            elapsed (/ (- (System/nanoTime) start) 1e9)]
        (is (not nil result))
        (is (< elapsed 60)  ; Should complete in under 60 seconds
            (str "Took " elapsed " seconds - should be faster")))
      (catch Exception e
        (is false (str "Should not throw exception: " (.getMessage e)))))))
