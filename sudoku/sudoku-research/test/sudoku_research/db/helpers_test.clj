(ns sudoku-research.db.helpers-test
  (:require [clojure.test :refer [deftest is testing]]
            [clojure.string :as str]
            [next.jdbc :as jdbc]
            [sudoku-research.db.helpers :as db-helpers]
            [sudoku-research.db-test-helpers :as test-helpers]))

;; ============================================================================
;; UNIT TESTS - SQL Metadata Loading
;; ============================================================================

(deftest ^:unit sql-query-function-exists-test
  (testing "query function exists and is callable"
    (is (fn? db-helpers/query))))

(deftest ^:unit query-args-function-exists-test
  (testing "query-args function exists and is callable"
    (is (fn? db-helpers/query-args))))

;; ============================================================================
;; UNIT TESTS - Known Query Labels
;; ============================================================================

(deftest ^:unit insert-original-puzzle-label-test
  (testing "insert-original-puzzle! query is defined"
    (let [sql (db-helpers/query :insert-original-puzzle!)
          args (db-helpers/query-args :insert-original-puzzle!)]
      (is (string? sql))
      (is (= args [:puzzle :solution :clue-count :source-file-id])))))

(deftest ^:unit insert-canonical-form-label-test
  (testing "insert-canonical-form! query is defined"
    (let [sql (db-helpers/query :insert-canonical-form!)
          args (db-helpers/query-args :insert-canonical-form!)]
      (is (string? sql))
      (is (= args [:puzzle :solution :clue-count])))))

(deftest ^:unit insert-permutation-label-test
  (testing "insert-permutation! query is defined"
    (let [sql (db-helpers/query :insert-permutation!)
          args (db-helpers/query-args :insert-permutation!)]
      (is (string? sql))
      (is (= args [:canonical-id :result :transform-id])))))

(deftest ^:unit insert-or-get-transform-label-test
  (testing "insert-or-get-transform! query is defined"
    (let [sql (db-helpers/query :insert-or-get-transform!)
          args (db-helpers/query-args :insert-or-get-transform!)]
      (is (string? sql))
      (is (= args [:transform-key])))))

(deftest ^:unit insert-equivalence-label-test
  (testing "insert-equivalence! query is defined"
    (let [sql (db-helpers/query :insert-equivalence!)
          args (db-helpers/query-args :insert-equivalence!)]
      (is (string? sql))
      (is (= args [:original-puzzle-id :canonical-id :permutation-id])))))

(deftest ^:unit count-original-puzzles-by-clue-count-label-test
  (testing "count-original-puzzles-by-clue-count query is defined"
    (let [sql (db-helpers/query :count-original-puzzles-by-clue-count)
          args (db-helpers/query-args :count-original-puzzles-by-clue-count)]
      (is (string? sql))
      (is (= args [])))))

(deftest ^:unit get-first-canonical-candidate-label-test
  (testing "get-first-canonical-candidate query is defined"
    (let [sql (db-helpers/query :get-first-canonical-candidate)
          args (db-helpers/query-args :get-first-canonical-candidate)]
      (is (string? sql))
      (is (= args [:clue-count])))))

(deftest ^:unit count-total-equivalences-label-test
  (testing "count-total-equivalences query is defined"
    (let [sql (db-helpers/query :count-total-equivalences)
          args (db-helpers/query-args :count-total-equivalences)]
      (is (string? sql))
      (is (= args [])))))

;; ============================================================================
;; UNIT TESTS - Error Handling
;; ============================================================================

(deftest ^:unit query-unknown-label-test
  (testing "query throws on unknown label"
    (is (thrown? Exception (db-helpers/query :unknown-label)))))

(deftest ^:unit query-args-unknown-label-test
  (testing "query-args returns empty vector for unknown label"
    (is (= (db-helpers/query-args :unknown-label) []))))

;; ============================================================================
;; UNIT TESTS - Argument Name Format & Validation
;; ============================================================================

(deftest ^:unit argument-names-are-keywords-test
  (testing "All argument names are keywords"
    (doseq [label [:insert-original-puzzle!
                   :insert-canonical-form!
                   :insert-permutation!
                   :insert-or-get-transform!
                   :insert-equivalence!
                   :get-first-canonical-candidate]]
      (let [args (db-helpers/query-args label)]
        (is (every? keyword? args))))))

(deftest ^:unit argument-names-are-kebab-case-test
  (testing "All argument names use kebab-case convention"
    (let [args (db-helpers/query-args :insert-original-puzzle!)]
      ;; Check that at least one argument uses kebab-case (not snake_case)
      (is (some #(str/includes? (name %) "-") args)))))

;; ============================================================================
;; UNIT TESTS - Query Availability
;; ============================================================================

(deftest ^:unit all-mutation-labels-available-test
  (testing "All expected mutation labels have SQL defined"
    (doseq [label [:insert-original-puzzle!
                   :insert-canonical-form!
                   :insert-permutation!
                   :insert-or-get-transform!
                   :insert-equivalence!]]
      (let [sql (db-helpers/query label)]
        (is (string? sql))
        (is (> (count sql) 0))))))

(deftest ^:unit all-query-labels-available-test
  (testing "All expected query labels have SQL defined"
    (doseq [label [:count-original-puzzles-by-clue-count
                   :get-first-canonical-candidate
                   :get-first-unmapped-puzzle-by-clue-count
                   :get-canonical-form
                   :count-canonical-by-clue-count
                   :find-permutations-for-result
                   :find-equivalence
                   :count-total-equivalences
                   :get-equivalence-class-stats]]
      (let [sql (db-helpers/query label)]
        (is (string? sql))
        (is (> (count sql) 0))))))

;; ============================================================================
;; UNIT TESTS - Parameter Validation
;; ============================================================================

(deftest ^:unit build-param-vector-valid-test
  (testing "Builds parameter vector when all required params provided"
    (let [result (db-helpers/build-param-vector :insert-original-puzzle!
                                               {:puzzle "530070000..."
                                                :solution "534678912..."
                                                :clue-count 25
                                                :source-file-id 1})]
      (is (vector? result))
      (is (= (count result) 4))
      ;; Verify order matches SQL metadata
      (is (= result ["530070000..." "534678912..." 25 1])))))

(deftest ^:unit build-param-vector-missing-params-test
  (testing "Throws when required parameters are missing"
    (is (thrown-with-msg? Exception #"Parameter mismatch"
          (db-helpers/build-param-vector :insert-original-puzzle!
                                        {:puzzle "530070000..."})))))

(deftest ^:unit build-param-vector-extra-params-test
  (testing "Throws when extra unexpected parameters provided"
    (is (thrown-with-msg? Exception #"Parameter mismatch"
          (db-helpers/build-param-vector :insert-original-puzzle!
                                        {:puzzle "530070000..."
                                         :solution "534678912..."
                                         :clue-count 25
                                         :source-file-id 1
                                         :extra-param "should-not-be-here"})))))

;; ============================================================================
;; UNIT TESTS - JDBC Wrappers
;; ============================================================================

;; ============================================================================
;; UNIT TESTS - Multimethod Dispatcher
;; ============================================================================

(deftest ^:unit execute-jdbc-call-mode-dispatch-test
  (testing "execute-jdbc-call dispatches on mode keyword"
    ;; Mock the underlying JDBC functions to track calls
    (let [one-calls (atom [])
          many-calls (atom [])
          mock-one (fn [db params opts]
                     (swap! one-calls conj [db params opts])
                     {:id 1})
          mock-many (fn [db params opts]
                      (swap! many-calls conj [db params opts])
                      [])]
      
      (with-redefs [jdbc/execute-one! mock-one
                    jdbc/execute! mock-many]
        
        ;; Call with :one mode
        (db-helpers/execute-jdbc-call :one :db [:sql :param1] {:opts true})
        (is (= (count @one-calls) 1))
        (is (= (count @many-calls) 0))
        
        ;; Call with :many mode
        (db-helpers/execute-jdbc-call :many :db [:sql :param1] {:opts true})
        (is (= (count @one-calls) 1))
        (is (= (count @many-calls) 1))))))

;; ============================================================================
;; UNIT TESTS - Execute Safe (Integration of components)
;; ============================================================================

(deftest ^:unit execute-safe-mode-one-test
  (testing "execute-safe with :one mode calls jdbc/execute-one!"
    (with-redefs [jdbc/execute-one!
                  (fn [_db _sql-params _opts]
                    (test-helpers/mock-puzzle-row :id 1 :clue-count 25))]
      
      (let [result (db-helpers/execute-safe :mock-db
                                           :insert-original-puzzle!
                                           {:puzzle "530070000..."
                                            :solution "534678912..."
                                            :clue-count 25
                                            :source-file-id 1}
                                           :one
                                           {:return-keys true})]
        (is (= (:id result) 1))
        (is (= (:clue-count result) 25))))))

(deftest ^:unit execute-safe-mode-many-test
  (testing "execute-safe with :many mode calls jdbc/execute!"
    (let [expected-rows [(test-helpers/mock-puzzle-row :id 1 :clue-count 25)
                         (test-helpers/mock-puzzle-row :id 2 :clue-count 27)]]
      (with-redefs [jdbc/execute!
                    (fn [_db _sql-params _opts]
                      expected-rows)]
        
        (let [result (db-helpers/execute-safe :mock-db
                                             :count-original-puzzles-by-clue-count
                                             {}
                                             :many)]
          (is (= (count result) 2))
          (is (= (map :clue-count result) [25 27])))))))

(deftest ^:unit execute-safe-error-handling-test
  (testing "execute-safe wraps exceptions with context"
    (with-redefs [jdbc/execute-one!
                  (fn [& _] (throw (Exception. "SQL error")))]
      
      (is (thrown-with-msg? Exception #"Error executing insert-original-puzzle!"
            (db-helpers/execute-safe :mock-db
                                    :insert-original-puzzle!
                                    {:puzzle "530070000..."
                                     :solution "534678912..."
                                     :clue-count 25
                                     :source-file-id 1}
                                    :one))))))

(deftest ^:unit execute-safe-param-validation-error-test
  (testing "execute-safe catches parameter validation errors"
    (with-redefs [jdbc/execute-one!
                  (fn [& _] (test-helpers/mock-puzzle-row))]
      
      ;; Missing required params should fail before JDBC call
      (is (thrown-with-msg? Exception #"Parameter mismatch"
            (db-helpers/execute-safe :mock-db
                                    :insert-original-puzzle!
                                    {:puzzle "530070000..."}  ;; Missing required params
                                    :one))))))
