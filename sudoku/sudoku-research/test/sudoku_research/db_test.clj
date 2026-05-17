(ns sudoku-research.db-test
  (:require [clojure.test :refer :all]
            [sudoku-research.db :as db]))

;; ============================================================================
;; UNIT TESTS - FUNCTION SIGNATURES & DEFINITIONS
;; ============================================================================
;; These tests verify that functions exist and are callable without database

(deftest function-definitions-test
  (testing "All required database functions are defined"
    (is (fn? db/connect))
    (is (fn? db/close-db))
    (is (fn? db/initialize-db))
    (is (fn? db/insert-original-puzzle))
    (is (fn? db/count-original-puzzles-by-clue-count))
    (is (fn? db/get-first-canonical-candidate))
    (is (fn? db/get-first-unmapped-puzzle-by-clue-count))
    (is (fn? db/get-canonical-form))
    (is (fn? db/insert-canonical-form))
    (is (fn? db/count-canonical-by-clue-count))
    (is (fn? db/insert-permutation))
    (is (fn? db/find-permutations-for-result))
    (is (fn? db/insert-or-get-row-order))
    (is (fn? db/insert-or-get-column-order))
    (is (fn? db/insert-or-get-symbol-translation))))

(deftest db-config-test
  (testing "Database config exists"
    (is (map? db/db-config))
    (is (= (:dbtype db/db-config) "postgresql"))
    (is (= (:host db/db-config) "localhost"))
    (is (= (:port db/db-config) 5432))
    (is (= (:user db/db-config) "postgres"))
    (is (= (:dbname db/db-config) "sudoku_research"))))

(deftest connect-function-test
  (testing "connect function can be called with no args"
    (is (not (nil? (db/connect)))))
  
  (testing "connect function can be called with config"
    (is (not (nil? (db/connect {:host "localhost"}))))))

;; ============================================================================
;; INTEGRATION TESTS - REQUIRE RUNNING DATABASE
;; ============================================================================

(defmacro db-test
  "Define a test that only runs if database is available"
  [name & body]
  `(deftest ~name
     (try
       (let [ds# (db/connect)]
         ~@body)
       (catch Exception e#
         (println "⚠️  SKIPPED test (no database): " (.getMessage e#))))))

(db-test insert-original-puzzle-test
  (testing "Insert single original puzzle"
    (binding [db/*db* (db/connect)]
      (db/initialize-db)
      
      (let [puzzle "123456789456789123789123456214365897365897214897214365531642978642978531978531642"
            solution "123456789456789123789123456214365897365897214897214365531642978642978531978531642"
            result (db/insert-original-puzzle
                     {:puzzle puzzle
                      :solution solution
                      :clue-count 25
                      :source-file "index00.json"})]
        (is (some? result))
        (is (contains? result :id))
        (is (number? (:id result))))
      
      (db/close-db))))

(db-test insert-canonical-form-test
  (testing "Insert canonical form"
    (binding [db/*db* (db/connect)]
      (db/initialize-db)
      
      (let [puzzle "123456789456789123789123456214365897365897214897214365531642978642978531978531642"
            solution "123456789456789123789123456214365897365897214897214365531642978642978531978531642"
            result (db/insert-canonical-form
                     {:puzzle puzzle :solution solution :clue-count 25})]
        (is (some? result))
        (is (contains? result :id))
        (is (= (:puzzle result) puzzle)))
      
      (db/close-db))))

(db-test count-original-puzzles-test
  (testing "Count original puzzles by clue count"
    (binding [db/*db* (db/connect)]
      (db/initialize-db)
      
      ;; Insert test data
      (db/insert-original-puzzle 
        {:puzzle "123456789456789123789123456214365897365897214897214365531642978642978531978531642"
         :solution "123456789456789123789123456214365897365897214897214365531642978642978531978531642"
         :clue-count 25
         :source-file "f1.json"})
      
      (let [results (db/count-original-puzzles-by-clue-count)]
        (is (vector? results))
        (is (> (count results) 0)))
      
      (db/close-db))))

;; NOTE: Integration tests (those using db-test macro) require Docker + PostgreSQL
;; These will be skipped if database is not available
;; When Docker is installed, run: docker-init.ps1 -Init (in sudoku-research directory)
