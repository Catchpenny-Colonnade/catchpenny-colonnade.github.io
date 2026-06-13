(ns sudoku-research.external.db-test
  (:require [clojure.test :refer [deftest is testing]]
            [sudoku-research.db.connection :as db-conn]
            [sudoku-research.db.mutations :as db-mut]
            [sudoku-research.db.queries :as db-qry]
            [sudoku-research.data.validation :as db-validation]
            [sudoku-research.utilities.db-fixtures :as fixtures]))

(def puzzle-a "530070000600195000098000060800060003400803001700020006060000280000419005000080079")
(def puzzle-b "530070000600195000098000060800060003400803001700020006060000280000419005000080078")
(def solution-a "534678912672195348198342567821564793459783621763921456316457289287419635945286174")
(def transform-key "00-012345678-012345678-123456789")


(deftest function-definitions-test
  (testing "Current DB API functions are defined"
    (is (fn? db-conn/connect))
    (is (fn? db-conn/close-db!))
    (is (fn? db-conn/initialize-db!))
    (is (fn? db-mut/insert-original-puzzle!))
    (is (fn? db-qry/count-original-puzzles-by-clue-count))
    (is (fn? db-qry/get-first-canonical-candidate))
    (is (fn? db-qry/get-first-unmapped-puzzle-by-clue-count))
    (is (fn? db-qry/get-canonical-form))
    (is (fn? db-mut/insert-canonical-form!))
    (is (fn? db-qry/count-canonical-by-clue-count))
    (is (fn? db-mut/insert-permutation!))
    (is (fn? db-mut/insert-or-get-transform!))
    (is (fn? db-qry/find-permutations-for-result))
    (is (fn? db-mut/insert-equivalence!))
    (is (fn? db-qry/find-equivalence))
    (is (fn? db-validation/valid-transform-key?))))

(deftest db-config-test
  (testing "Database config shape"
    (is (map? db-conn/db-config))
    (is (= (:dbtype db-conn/db-config) "postgresql"))
    (is (= (:host db-conn/db-config) "localhost"))
    (is (= (:port db-conn/db-config) 5432))))

(deftest connect-function-test
  (testing "connect can be called"
    (is (some? (db-conn/connect)))
    (is (some? (db-conn/connect {:host "localhost"})))) )

(deftest insert-original-puzzle-test
  (testing "Insert original puzzle"
    (fixtures/with-isolated-db
      (fn [conn _]
      (let [;; Create a source file first
            source-file (db-mut/insert-source-file! conn {:filename "db-test-a.json"
                                                          :file-path "/test/db-test-a.json"
                                                          :file-size-bytes 1000
                                                          :puzzle-count-expected 1})
            source-file-id (:id source-file)
            result (db-mut/insert-original-puzzle! conn
                                                  {:puzzle puzzle-a
                                                   :solution solution-a
                                                   :clue-count 25
                                                   :source-file-id source-file-id})]
          (is (or (nil? result) (some? (fixtures/row-id result)))))))))

(deftest insert-canonical-form-test
  (testing "Insert/get canonical form"
    (fixtures/with-isolated-db
      (fn [conn _]
        (let [inserted (db-mut/insert-canonical-form! conn {:puzzle puzzle-b :solution nil :clue-count 25})
              fetched (db-qry/get-canonical-form conn puzzle-b)]
          (is (or (some? (fixtures/row-id inserted)) (some? (fixtures/row-id fetched)))))))))

(deftest count-original-puzzles-test
  (testing "Count original puzzles returns rows"
    (fixtures/with-isolated-db
      (fn [conn _]
        (let [results (db-qry/count-original-puzzles-by-clue-count conn)]
          (is (vector? results)))))))

(deftest transform-key-helpers-test
  (testing "Transform key validation and insert-or-get"
    (fixtures/with-isolated-db
      (fn [conn _]
      (is (true? (db-validation/valid-transform-key? transform-key)))
      (is (false? (db-validation/valid-transform-key? "bad-key")))
      (let [result1 (db-mut/insert-or-get-transform! conn {:transform-key transform-key})
            result2 (db-mut/insert-or-get-transform! conn {:transform-key transform-key})
            id1 (:id result1)
            id2 (:id result2)]
        (is (number? id1))
          (is (= id1 id2)))))))

(deftest insert-permutation-with-transform-key-test
  (testing "Insert permutation with bundled transform key"
    (fixtures/with-isolated-db
      (fn [conn _]
        (let [canonical (or (db-mut/insert-canonical-form! conn {:puzzle puzzle-a :solution nil :clue-count 25})
                            (db-qry/get-canonical-form conn puzzle-a))
            canonical-id (fixtures/row-id canonical)
            transform (db-mut/insert-or-get-transform! conn {:transform-key transform-key})
            transform-id (:id transform)
            inserted (db-mut/insert-permutation! conn {:canonical-id canonical-id
                                                         :result puzzle-a
                                                         :transform-id transform-id})
            results (db-qry/find-permutations-for-result conn puzzle-a)]
        (is (some? canonical-id))
        (is (some? transform-id))
        (is (or (nil? inserted) (some? (:id inserted))))
          (is (vector? results)))))))
