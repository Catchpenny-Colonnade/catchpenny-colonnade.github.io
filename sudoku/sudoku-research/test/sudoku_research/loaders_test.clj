(ns sudoku-research.loaders-test
  (:require [clojure.test :refer [deftest is testing]]
            [sudoku-research.loaders :as loaders]
            [sudoku-research.db.mutations :as db-mut]
            [sudoku-research.logging-test-helpers :as logging]))

;; ============================================================================
;; UNIT TESTS - PURE FUNCTIONS
;; ============================================================================

(deftest ^:unit count-clues-test
  (testing "Count non-zero digits in puzzle string"
    (is (= 0 (loaders/count-clues "000000000000000000000000000000000000000000000000000000000000000000000000000000000")))
    (is (= 81 (loaders/count-clues "123456789123456789123456789123456789123456789123456789123456789123456789123456789")))
    (is (= 30 (loaders/count-clues "530070000600195000098000060800060003400803001700020006060000280000419005000080079")))))

(deftest ^:unit count-clues-only-counts-nonzero-test
  (testing "Only count non-zero digits"
    (let [puzzle-with-clues "530070000600195000098000060800060003400803001700020006060000280000419005000080079"]
      (is (= 30 (loaders/count-clues puzzle-with-clues)))
      (is (< (loaders/count-clues puzzle-with-clues) 81)))))

(deftest ^:unit count-clues-single-cell-test
  (testing "Single clue"
    (is (= 1 (loaders/count-clues "100000000000000000000000000000000000000000000000000000000000000000000000000000000")))
    (is (= 1 (loaders/count-clues "000000000000000000000000000000000000000000000000000000000000000000000000000000009")))))

;; ============================================================================
;; UNIT TESTS - MOCKED DEPENDENCIES
;; ============================================================================

(deftest ^:unit insert-puzzles-batch-success-test
  (testing "Insert batch of puzzles with mocked database"
    (let [puzzles ["530070000600195000098000060800060003400803001700020006060000280000419005000080079"
                   "000000000000000000000000000000000000000000000000000000000000000000000000000000000"]
          db :mock-db]
      (with-redefs [db-mut/insert-original-puzzle! (fn [_ {:keys [puzzle source-file-id]}]
                                                      {:id (rand-int 1000) :puzzle puzzle :source-file-id source-file-id})]
        (let [result (loaders/insert-puzzles-batch db 1 puzzles)]
          (is (= 2 (:inserted result)))
          (is (= 0 (:skipped result)))
          (is (= 0 (:errors result))))))))

(deftest ^:unit insert-puzzles-batch-with-duplicates-test
  (testing "Skips duplicate puzzles"
    (let [puzzles ["530070000600195000098000060800060003400803001700020006060000280000419005000080079"
                   "duplicate"]
          db :mock-db]
      (with-redefs [db-mut/insert-original-puzzle! (fn [_ {:keys [puzzle]}]
                                                      (when (= puzzle "530070000600195000098000060800060003400803001700020006060000280000419005000080079")
                                                        {:id 1 :puzzle puzzle}))]
        (let [result (loaders/insert-puzzles-batch db 1 puzzles)]
          (is (= 1 (:inserted result)))
          (is (= 1 (:skipped result)))
          (is (= 0 (:errors result))))))))

(deftest ^:unit insert-puzzles-batch-with-errors-test
  (testing "Counts insertion errors and logs them"
    (let [puzzles ["puzzle1" "puzzle2" "puzzle3"]
          db :mock-db
          {:keys [mock-println mock-print get-logs]} (logging/capture-logs)]
      (with-redefs [db-mut/insert-original-puzzle! (fn [_ _]
                                                     (throw (Exception. "DB error")))
                    println mock-println
                    print mock-print]
        (let [result (loaders/insert-puzzles-batch db 1 puzzles)
              logs (get-logs)]
          (is (= 0 (:inserted result)))
          (is (= 0 (:skipped result)))
          (is (= 3 (:errors result)))
          (is (= 3 (count logs)) "Should have logged exactly 3 error messages")
          (is (every? #(= % "[ERROR] Inserting puzzle: DB error") logs)
              "All logged messages should be the exact error message"))))))

(deftest ^:unit insert-puzzles-batch-counts-clues-correctly-test
  (testing "Inserts puzzle with correct clue count"
    (let [puzzle "530070000600195000098000060800060003400803001700020006060000280000419005000080079"
          puzzles [puzzle]
          db :mock-db
          captured-args (atom nil)]
      (with-redefs [db-mut/insert-original-puzzle! (fn [_ params]
                                                      (reset! captured-args params)
                                                      {:id 1})]
        (loaders/insert-puzzles-batch db 1 puzzles)
        (is (= 30 (:clue-count @captured-args)))
        (is (= puzzle (:puzzle @captured-args)))
        (is (= 1 (:source-file-id @captured-args)))))))

(deftest ^:unit insert-puzzles-batch-with-puzzle-solution-pairs-test
  (testing "Inserts puzzle-solution pairs correctly"
    (let [puzzle "530070000600195000098000060800060003400803001700020006060000280000419005000080079"
          solution "537821694682795431914367528849613257765248319123954786491586372358412965276139845"
          pair [puzzle solution]
          db :mock-db
          captured-args (atom nil)]
      (with-redefs [db-mut/insert-original-puzzle! (fn [_ params]
                                                      (reset! captured-args params)
                                                      {:id 1})]
        (loaders/insert-puzzles-batch db 1 [pair])
        (is (= 30 (:clue-count @captured-args)))
        (is (= puzzle (:puzzle @captured-args)))
        (is (= solution (:solution @captured-args)))
        (is (= 1 (:source-file-id @captured-args)))))))
