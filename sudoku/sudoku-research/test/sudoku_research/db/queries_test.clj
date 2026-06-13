(ns sudoku-research.db.queries-test
  (:require [clojure.test :refer [deftest is testing]]
            [next.jdbc :as jdbc]
            [sudoku-research.db.queries :as db-qry]
            [sudoku-research.db-test-helpers :as test-helpers]))

;; ============================================================================
;; UNIT TESTS - Queries with Mocking
;; ============================================================================

(deftest ^:unit count-original-puzzles-by-clue-count-test
  (testing "count-original-puzzles-by-clue-count returns grouped counts"
    (let [expected-rows [{:clue-count 25 :count 100}
                         {:clue-count 27 :count 150}
                         {:clue-count 30 :count 200}]]
      (with-redefs [jdbc/execute!
                    (fn [& _] expected-rows)]
        
        (let [result (db-qry/count-original-puzzles-by-clue-count :mock-db)]
          (is (= (count result) 3))
          (is (= (map :clue-count result) [25 27 30]))
          (is (= (map :count result) [100 150 200])))))))

(deftest ^:unit count-original-puzzles-empty-result-test
  (testing "count-original-puzzles-by-clue-count handles empty result"
    (with-redefs [jdbc/execute!
                  (fn [& _] [])]
      
      (let [result (db-qry/count-original-puzzles-by-clue-count :mock-db)]
        (is (= result []))))))

(deftest ^:unit get-first-canonical-candidate-test
  (testing "get-first-canonical-candidate returns first puzzle with given clue count"
    (let [expected-puzzle (test-helpers/mock-puzzle-row :id 1 :clue-count 25)]
      (with-redefs [jdbc/execute!
                    (fn [& _] [expected-puzzle])]
        
        (let [result (db-qry/get-first-canonical-candidate :mock-db 25)]
          (is (= (:id result) 1))
          (is (= (:clue-count result) 25)))))))

(deftest ^:unit get-first-canonical-candidate-not-found-test
  (testing "get-first-canonical-candidate returns nil when no puzzle found"
    (with-redefs [jdbc/execute!
                  (fn [& _] [])]
      
      (let [result (db-qry/get-first-canonical-candidate :mock-db 99)]
        (is (nil? result))))))

(deftest ^:unit get-first-unmapped-puzzle-by-clue-count-test
  (testing "get-first-unmapped-puzzle-by-clue-count returns unmapped puzzle"
    (let [expected-puzzle (test-helpers/mock-puzzle-row :id 5 :clue-count 28)]
      (with-redefs [jdbc/execute!
                    (fn [& _] [expected-puzzle])]
        
        (let [result (db-qry/get-first-unmapped-puzzle-by-clue-count :mock-db 28)]
          (is (= (:id result) 5))
          (is (= (:clue-count result) 28)))))))

(deftest ^:unit get-canonical-form-test
  (testing "get-canonical-form returns canonical form for puzzle"
    (let [expected-form (test-helpers/mock-canonical-row :id 10 :puzzle "530070000...")]
      (with-redefs [jdbc/execute!
                    (fn [& _] [expected-form])]
        
        (let [result (db-qry/get-canonical-form :mock-db "530070000...")]
          (is (= (:id result) 10)))))))

(deftest ^:unit count-canonical-by-clue-count-test
  (testing "count-canonical-by-clue-count returns counts grouped by clue count"
    (let [expected-rows [{:clue-count 25 :count 50}
                         {:clue-count 27 :count 75}]]
      (with-redefs [jdbc/execute!
                    (fn [& _] expected-rows)]
        
        (let [result (db-qry/count-canonical-by-clue-count :mock-db)]
          (is (= (count result) 2))
          (is (= (map :count result) [50 75])))))))

(deftest ^:unit find-permutations-for-result-test
  (testing "find-permutations-for-result returns permutations for result"
    (let [expected-perms [(test-helpers/mock-permutation-row :id 1 :result "530070000...")
                          (test-helpers/mock-permutation-row :id 2 :result "530070000...")]]
      (with-redefs [jdbc/execute!
                    (fn [& _] expected-perms)]
        
        (let [result (db-qry/find-permutations-for-result :mock-db "530070000...")]
          (is (= (count result) 2)))))))

(deftest ^:unit find-equivalence-test
  (testing "find-equivalence returns equivalence mapping"
    (let [expected-equiv (test-helpers/mock-equivalence-row :id 7
                                                            :original-puzzle-id 1
                                                            :canonical-id 1
                                                            :permutation-id 1)]
      (with-redefs [jdbc/execute!
                    (fn [& _] [expected-equiv])]
        
        (let [result (db-qry/find-equivalence :mock-db
                                             {:original-puzzle-id 1
                                              :canonical-id 1
                                              :permutation-id 1})]
          (is (= (:id result) 7)))))))

(deftest ^:unit count-total-equivalences-test
  (testing "count-total-equivalences returns total count"
    (with-redefs [jdbc/execute!
                  (fn [& _] [{:total-count 1000}])]
      
      (let [result (db-qry/count-total-equivalences :mock-db)]
        (is (= result 1000))))))

(deftest ^:unit count-total-equivalences-empty-test
  (testing "count-total-equivalences returns 0 on no results"
    (with-redefs [jdbc/execute!
                  (fn [& _] [])]
      
      (let [result (db-qry/count-total-equivalences :mock-db)]
        ;; Returns 0 when no row found
        (is (= result 0))))))

(deftest ^:unit get-equivalence-class-stats-test
  (testing "get-equivalence-class-stats returns class statistics"
    (let [expected-stats [{:canonical-id 1 :count 50}
                          {:canonical-id 2 :count 75}]]
      (with-redefs [jdbc/execute!
                    (fn [& _] expected-stats)]
        
        (let [result (db-qry/get-equivalence-class-stats :mock-db)]
          (is (= (count result) 2)))))))

;; ============================================================================
;; UNIT TESTS - Query Error Handling
;; ============================================================================



(deftest ^:unit query-jdbc-error-test
  (testing "Queries propagate JDBC errors"
    (with-redefs [jdbc/execute!
                  (fn [& _] (throw (Exception. "Connection timeout")))]
      
      (is (thrown-with-msg? Exception #"Error executing"
            (db-qry/count-original-puzzles-by-clue-count :mock-db))))))


