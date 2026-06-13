(ns sudoku-research.db.mutations-test
  (:require [clojure.test :refer [deftest is testing]]
            [next.jdbc :as jdbc]
            [sudoku-research.db.mutations :as db-mut]
            [sudoku-research.db-test-helpers :as test-helpers]))

;; ============================================================================
;; UNIT TESTS - Mutations with Mocking
;; ============================================================================

(deftest ^:unit insert-original-puzzle-test
  (testing "insert-original-puzzle! constructs and executes insert correctly"
    (with-redefs [jdbc/execute-one!
                  (fn [& _] (test-helpers/mock-puzzle-row :id 42 :clue-count 25))]
      
      (let [result (db-mut/insert-original-puzzle!
                     :mock-db
                     {:puzzle "530070000600195000098000060800060003400803001700020006060000280000419005000080079"
                      :solution "534678912672195348198342567821564793459783621763921456316457289287419635945286174"
                      :clue-count 25
                      :source-file-id 1})]
        (is (= (:id result) 42))
        (is (= (:clue-count result) 25))
        (is (= (:source-file-id result) 1))))))

(deftest ^:unit insert-original-puzzle-ignores-duplicates-test
  (testing "insert-original-puzzle! returns nil on duplicate (ignored by ON CONFLICT)"
    (with-redefs [jdbc/execute-one!
                  (fn [& _] nil)]  ;; ON CONFLICT DO NOTHING returns nil
      
      (let [result (db-mut/insert-original-puzzle!
                     :mock-db
                     {:puzzle "530070000..."
                      :solution "534678912..."
                      :clue-count 25
                      :source-file-id 1})]
        (is (nil? result))))))

(deftest ^:unit insert-canonical-form-test
  (testing "insert-canonical-form! executes insert correctly"
    (with-redefs [jdbc/execute-one!
                  (fn [& _] (test-helpers/mock-canonical-row :id 99 :clue-count 25))]
      
      (let [result (db-mut/insert-canonical-form!
                     :mock-db
                     {:puzzle "530070000..."
                      :solution nil
                      :clue-count 25})]
        (is (= (:id result) 99))
        (is (= (:clue-count result) 25))))))

(deftest ^:unit insert-permutation-test
  (testing "insert-permutation! executes insert correctly"
    (with-redefs [jdbc/execute-one!
                  (fn [& _] (test-helpers/mock-permutation-row :id 5 :canonical-id 1))]
      
      (let [result (db-mut/insert-permutation!
                     :mock-db
                     {:canonical-id 1
                      :result "530070000..."
                      :transform-id 1})]
        (is (= (:id result) 5))
        (is (= (:canonical-id result) 1))))))

(deftest ^:unit insert-or-get-transform-test
  (testing "insert-or-get-transform! executes insert correctly"
    (with-redefs [jdbc/execute-one!
                  (fn [& _] (test-helpers/mock-transform-row :id 7))]
      
      (let [result (db-mut/insert-or-get-transform!
                     :mock-db
                     {:transform-key "00-012345678-012345678-123456789"})]
        (is (= (:id result) 7))))))

(deftest ^:unit insert-equivalence-test
  (testing "insert-equivalence! executes insert correctly"
    (with-redefs [jdbc/execute-one!
                  (fn [& _] (test-helpers/mock-equivalence-row :id 100
                                                               :original-puzzle-id 1
                                                               :canonical-id 1
                                                               :permutation-id 1))]
      
      (let [result (db-mut/insert-equivalence!
                     :mock-db
                     {:original-puzzle-id 1
                      :canonical-id 1
                      :permutation-id 1})]
        (is (= (:id result) 100))
        (is (= (:original-puzzle-id result) 1))))))

;; ============================================================================
;; UNIT TESTS - Mutation Error Handling
;; ============================================================================

(deftest ^:unit insert-original-puzzle-param-validation-test
  (testing "insert-original-puzzle! validates parameters"
    (with-redefs [jdbc/execute-one! (fn [& _] (test-helpers/mock-puzzle-row))]
      ;; Missing required parameters should fail
      (is (thrown-with-msg? Exception #"Parameter mismatch"
            (db-mut/insert-original-puzzle!
              :mock-db
              {:puzzle "530070000..."}))))))  ;; Missing solution, clue-count, source-file-id

(deftest ^:unit insert-original-puzzle-jdbc-error-test
  (testing "insert-original-puzzle! propagates JDBC errors"
    (with-redefs [jdbc/execute-one!
                  (fn [& _] (throw (Exception. "Connection refused")))]
      
      (is (thrown-with-msg? Exception #"Error executing insert-original-puzzle!"
            (db-mut/insert-original-puzzle!
              :mock-db
              {:puzzle "530070000..."
               :solution "534678912..."
               :clue-count 25
               :source-file-id 1}))))))
