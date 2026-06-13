(ns sudoku-research.external.permutations-integration-test
  (:require [clojure.test :refer [deftest is testing]]
            [sudoku-research.permutations :as perms]
            [sudoku-research.db.mutations :as db-mut]
            [sudoku-research.db.queries :as db-qry]
            [sudoku-research.utilities.db-fixtures :as fixtures]))

(def test-puzzle-str "530070000600195000098000060800060003400803001700020006060000280000419005000080079")
(def identity-order [0 1 2 3 4 5 6 7 8])
(def identity-symbols [1 2 3 4 5 6 7 8 9])

(defn ensure-canonical-id!
  "Create a canonical form in the test database"
  [conn]
  (let [inserted (db-mut/insert-canonical-form! conn {:puzzle test-puzzle-str
                                                       :solution nil
                                                       :clue-count 25})]
    (or (fixtures/row-id inserted)
        (fixtures/row-id (db-qry/get-canonical-form conn test-puzzle-str)))))

(deftest ^:integration insert-permutation!-transform-key-test
  (testing "Inserts permutation through transform-key workflow"
    (fixtures/with-isolated-db
      (fn [conn _]
        (let [canonical-id (ensure-canonical-id! conn)
              result (perms/insert-permutation! conn canonical-id test-puzzle-str 0 identity-order identity-order identity-symbols)]
        (is (some? canonical-id))
          (is (or (nil? result) (contains? result :id))))))))

(deftest ^:integration generate-permutations-limited-test
  (testing "Bounded generation returns stats map"
    (fixtures/with-isolated-db
      (fn [conn _]
        (let [canonical-id (ensure-canonical-id! conn)
              stats (perms/generate-permutations conn canonical-id test-puzzle-str
                                                 {:max-permutations 2
                                                  :rotation-ids [0 1]
                                                  :row-orderings [identity-order]
                                                  :column-orderings [identity-order]
                                                  :symbol-translations [identity-symbols]})]
        ;; Only 1 candidate (rotation 1) after filtering identity transform (rotation 0)
        (is (= (:total stats) 1))
        (is (contains? stats :new))
        (is (contains? stats :existing))
          (is (contains? stats :errors)))))))

(deftest ^:integration find-permutation-not-found-test
  (testing "Query for non-existent permutation returns nil"
    (fixtures/with-isolated-db
      (fn [conn _]
        (is (nil? (db-qry/find-permutation conn "000000000000000000000000000000000000000000000000000000000000000000000000000000000")))))))
