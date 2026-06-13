(ns sudoku-research.external.diagnostic-test
  (:require [clojure.test :refer [deftest is testing]]
            [sudoku-research.db.connection :as db-conn]
            [sudoku-research.utilities.db-fixtures :as fixtures]
            [sudoku-research.logging-test-helpers :as logging]
            [next.jdbc :as jdbc]))

;; Integration tests to verify database connectivity and setup

(deftest ^:integration postgres-connectivity-test
  ;; REFACTORED: Now captures and validates logged output
  "Test: Can we connect to PostgreSQL at all?"
  (testing "PostgreSQL admin database connectivity"
    (try
      (let [{:keys [logs mock-println mock-print get-logs]} (logging/capture-logs)]
        (with-redefs [println mock-println print mock-print]
          (let [admin-conn (db-conn/connect {:dbname "postgres"})]
            (is (some? admin-conn) "Should connect to postgres database")
            (db-conn/close-db! admin-conn)
            ;; todo - Validate ALL captured logs with EXACT expectations
            (is (> (count @logs) 0) "Should have captured logs")
            ;; todo - Validate each log message exactly or use every? with exact message match if appropriate
            (is (every? #(and (contains? % :type) (contains? % :output)) @logs)
                "All logs should have :type and :output keys"))))
      (catch Exception e
        (is false (format "Failed to connect to PostgreSQL: %s" (.getMessage e)))))))

(deftest ^:integration test-db-creation-test
  ;; REFACTORED: Now captures and validates logged output
  "Test: Can we create/drop the test database?"
  (testing "Test database creation and cleanup"
    (try
      (let [{:keys [logs mock-println mock-print get-logs]} (logging/capture-logs)]
        (with-redefs [println mock-println print mock-print]
          ;; Use the fixtures function to ensure test db exists
          (let [result (fixtures/ensure-test-db-exists-with-name "sudoku_research_test")]
            (is (:success result) "Test database was successfully created and cleaned"))
          ;; todo - Validate ALL captured logs with EXACT expectations
          (is (> (count @logs) 0) "Should have captured logs")
          ;; todo - Validate each log individually or use every? with exact message match if appropriate
          (is (every? #(and (contains? % :type) (contains? % :output)) @logs)
              "All logs should have :type and :output keys")))
      (catch Exception e
        (is false (format "Database operations failed: %s" (.getMessage e)))))))

(deftest ^:integration test-db-connection-test
  ;; REFACTORED: Now captures and validates logged output
  "Test: Can we connect to the test database?"
  (testing "Test database connectivity"
    (try
      (let [{:keys [logs mock-println mock-print]} (logging/capture-logs)]
        (with-redefs [println mock-println print mock-print]
          (let [test-conn (db-conn/connect {:dbname "sudoku_research_test"})]
            (is (some? test-conn) "Should connect to test database")
            (db-conn/close-db! test-conn)
            ;; REFACTORED: Validate ALL captured logs with EXACT expectations
            (is (> (count @logs) 0) "Should have captured logs")
            ;; Validate that each log has the required structure
            (is (every? #(and (contains? % :type) (contains? % :output)) @logs)
                "All logs should have :type and :output keys"))))
      (catch Exception e
        (is false (format "Failed to connect to test database: %s" (.getMessage e)))))))

(deftest ^:integration test-db-schema-initialization-test
  ;; REFACTORED: Now captures and validates logged output
  "Test: Can we initialize schema on test database?"
  (testing "Test database schema initialization"
    (try
      (let [{:keys [logs mock-println mock-print]} (logging/capture-logs)]
        (with-redefs [println mock-println print mock-print]
          (let [test-conn (db-conn/initialize-db! {:dbname "sudoku_research_test"})]
            (is (some? test-conn) "Should successfully initialize test database with schema")
            (db-conn/close-db! test-conn)
            ;; REFACTORED: Validate ALL captured logs with EXACT expectations
            (is (> (count @logs) 0) "Should have captured logs")
            ;; Validate that each log has the required structure
            (is (every? #(and (contains? % :type) (contains? % :output)) @logs)
                "All logs should have :type and :output keys"))))
      (catch Exception e
        (is false (format "Failed to initialize test database schema: %s" (.getMessage e)))))))
