(ns sudoku-research.end-to-end.equivalence-test
  (:require [clojure.test :refer [deftest is testing]]
            [sudoku-research.db.mutations :as db-mut]
            [sudoku-research.db.queries :as db-qry]
            [sudoku-research.utilities.db-fixtures :as fixtures]))

(def puzzle-a "530070000600195000098000060800060003400803001700020006060000280000419005000080079")
(def puzzle-b "530070000600195000098000060800060003400803001700020006060000280000419005000080078")
(def solution-a "534678912672195348198342567821564793459783621763921456316457289287419635945286174")

(defn ensure-original-id! [conn puzzle source-file-name]
  (let [;; Create a source file record first
        source-file (db-mut/insert-source-file! conn {:filename source-file-name
                                                       :file-path (str "/test/" source-file-name)
                                                       :file-size-bytes 1000
                                                       :puzzle-count-expected 1})
        source-file-id (:id source-file)
        ;; Now insert the puzzle with source-file-id
        inserted (db-mut/insert-original-puzzle! conn {:puzzle puzzle
                                                        :solution solution-a
                                                        :clue-count 25
                                                        :source-file-id source-file-id})]
    (or (fixtures/row-id inserted)
        (fixtures/row-id (db-qry/get-first-canonical-candidate conn 25)))))

(defn ensure-canonical-id! [conn puzzle]
  (let [inserted (db-mut/insert-canonical-form! conn {:puzzle puzzle :solution nil :clue-count 25})
        fetched (db-qry/get-canonical-form conn puzzle)]
    (or (fixtures/row-id inserted) (fixtures/row-id fetched))))

(deftest ^:integration insert-and-find-equivalence-test
  (testing "Insert and retrieve equivalence mapping"
    (fixtures/with-isolated-db
      (fn [conn _]
        (let [orig-id (ensure-original-id! conn puzzle-a "equiv-a.json")
              canon-id (ensure-canonical-id! conn puzzle-a)
              inserted (db-mut/insert-equivalence! conn {:original-puzzle-id orig-id :canonical-id canon-id :permutation-id nil})
              found (db-qry/find-equivalence conn orig-id)]
        (is (some? orig-id))
        (is (some? canon-id))
        (is (or (nil? inserted) (some? (fixtures/row-id inserted))))
        (is (some? found))
        (is (= (fixtures/original-id found) orig-id))
          (is (= (fixtures/canonical-id found) canon-id)))))))

(deftest ^:integration find-equivalence-not-found-test
  (testing "Missing mapping returns nil"
    (fixtures/with-isolated-db
      (fn [conn _]
        (is (nil? (db-qry/find-equivalence conn 999999)))))))

(deftest ^:integration equivalence-aggregates-test
  (testing "Aggregate functions return expected shapes"
    (fixtures/with-isolated-db
      (fn [conn _]
        (let [orig-a (ensure-original-id! conn puzzle-a "equiv-b1.json")
              orig-b (ensure-original-id! conn puzzle-b "equiv-b2.json")
              canon-a (ensure-canonical-id! conn puzzle-a)
              _ (db-mut/insert-equivalence! conn {:original-puzzle-id orig-a :canonical-id canon-a :permutation-id nil})
              _ (db-mut/insert-equivalence! conn {:original-puzzle-id orig-b :canonical-id canon-a :permutation-id nil})
              for-canonical (db-qry/get-equivalences-for-canonical conn canon-a)
              by-canonical (db-qry/count-equivalences-by-canonical conn)
              total (db-qry/count-total-equivalences conn)
              class-stats (db-qry/get-equivalence-class-stats conn)]
        (is (vector? for-canonical))
        (is (vector? by-canonical))
        (is (number? total))
          (is (vector? class-stats)))))))

(deftest ^:integration processed-status-test
  (testing "Processing status tracks equivalence presence"
    (fixtures/with-isolated-db
      (fn [conn _]
        (let [orig-id (ensure-original-id! conn puzzle-b "equiv-c.json")
              canon-id (ensure-canonical-id! conn puzzle-b)]
          (is (false? (db-qry/is-puzzle-processed? conn orig-id)))
          (db-mut/insert-equivalence! conn {:original-puzzle-id orig-id :canonical-id canon-id :permutation-id nil})
          (is (true? (db-qry/is-puzzle-processed? conn orig-id))))))))
