(ns sudoku-research.utilities.db-fixtures
  (:require [next.jdbc :as jdbc]
            [sudoku-research.db.connection :as db-conn]
            [clojure.string :as str])
  (:import [java.util UUID]))

;; ============================================================================
;; ROW EXTRACTION UTILITIES
;; ============================================================================

(defn row-id
  "Extract ID from a result row, handling various key shapes."
  [row]
  (or (:id row)
      (:canonical_forms/id row)
      (:original_puzzles/id row)
      (:permutations/id row)
      (:puzzle_equivalences/id row)))

(defn canonical-id
  "Extract canonical_id from a result row, handling various key shapes."
  [row]
  (or (:canonical_id row)
      (:puzzle_equivalences/canonical_id row)))

(defn original-id
  "Extract original_puzzle_id from a result row, handling various key shapes."
  [row]
  (or (:original_puzzle_id row)
      (:puzzle_equivalences/original_puzzle_id row)))

;; ============================================================================
;; DATABASE NAME GENERATION - Unique per test namespace (no race conditions)
;; ============================================================================

(defn generate-test-db-name
  "Generate a unique test database name using UUID.
   Format: sudoku_test_<24-char-uuid>
   
   Each test namespace gets its own isolated database, allowing:
   - Parallel test execution without conflicts
   - No race conditions on database creation
   - Complete isolation between test suites
   
   This approach mirrors C# test patterns where each test class
   gets a unique database (with GUID-based names)."
  []
  (let [uuid-str (-> (UUID/randomUUID) str (str/replace "-" ""))
        short-uuid (subs uuid-str 0 24)]  ;; Truncate to keep PostgreSQL name reasonable
    (str "sudoku_test_" short-uuid)))

;; ============================================================================
;; DATABASE LIFECYCLE - Per-namespace isolation
;; ============================================================================

(defn ensure-test-db-exists-with-name
  "Create a fresh test database with a specific name.
   Drops if exists, then creates fresh.
   
   This is the core function for namespace-isolated databases.
   Each test namespace calls this with a unique database name.
   
   Parameters:
   - db-name (optional): specific database name, or auto-generate UUID-based one
   
   Returns: {:db-name \"...\", :success true/false}"
  ([] (ensure-test-db-exists-with-name (generate-test-db-name)))
  ([db-name]
   ;; Create a fresh test database using a Postgres admin connection.
   ;; Fail loudly on unexpected errors so test failures are visible to CI.
   (let [admin-conn (db-conn/connect {:dbname "postgres"})]
     (try
       ;; Drop database if it exists
       (jdbc/execute! admin-conn [(str "DROP DATABASE IF EXISTS " db-name)])
       (println (str "[SETUP] Dropped existing test database: " db-name))

       ;; Create fresh test database
       (jdbc/execute! admin-conn [(str "CREATE DATABASE " db-name " ENCODING 'UTF8'")])
       (println (str "[SETUP] Created fresh test database: " db-name))

       {:db-name db-name :success true}
       (finally
         (db-conn/close-db! admin-conn))))))

(defn initialize-db-once
  "Initialize an isolated test database for a single test namespace.
   
   Creates a unique database with UUID-based name to avoid race conditions.
   Each test namespace gets completely isolated database.
   
   Optional parameter:
   - db-name: specific database name (usually auto-generated UUID-based one)
   
   Returns: database connection object"
  ([] (initialize-db-once (generate-test-db-name)))
  ([db-name]
   (ensure-test-db-exists-with-name db-name)
   (db-conn/initialize-db! {:dbname db-name})))

(defn cleanup-db-and-drop
  "Close database connection AND drop the isolated test database.
   
   Call this in fixture cleanup for initialize-db-once or with-isolated-db.
   Ensures proper cleanup of per-namespace databases.
   
   Parameters:
   - conn: database connection object (not an atom)
   - db-name: name of the database to drop"
  [conn db-name]
  (when conn
    (db-conn/close-db! conn))
  
  ;; Drop the isolated database
  (try
    (let [admin-conn (db-conn/connect {:dbname "postgres"})]
      (try
        (jdbc/execute! admin-conn [(str "DROP DATABASE IF EXISTS " db-name)])
        (println (str "[CLEANUP] Dropped test database: " db-name))
        (catch Exception e
          (println (str "[WARNING] Failed to drop database " db-name ": " (.getMessage e))))
        (finally
          (db-conn/close-db! admin-conn))))
    (catch Exception e
      (println (str "[WARNING] Cleanup failed for database " db-name ": " (.getMessage e))))))

(defn with-isolated-db
  "Test helper: Create isolated test database, run test function, cleanup.
   
   Creates unique UUID-based database for each test to avoid race conditions
   and allow parallel test execution. Database is automatically cleaned up
   after test completes.
   
   Passes two parameters to test-fn:
   - conn: database connection object
   - db-name: name of the isolated database (useful for diagnostics)
   
   Usage:
   (with-isolated-db (fn [conn db-name]
     ;; run test with conn
     ))"
  [test-fn]
  (let [db-name (generate-test-db-name)
        conn (initialize-db-once db-name)]
    (try
      (test-fn conn db-name)
      (finally
        (cleanup-db-and-drop conn db-name)))))

(defn cleanup-db
  "Close database connection only (legacy function).
   
   DEPRECATED: Use cleanup-db-and-drop for proper cleanup of isolated databases.
   This function is maintained for backward compatibility with older test fixtures
   that use the shared sudoku_research_test database."
  [conn]
  (when @conn
    (db-conn/close-db! @conn)))

;; `ensure-test-db-exists` removed — no longer needed. Use
;; `ensure-test-db-exists-with-name` for namespace-isolated databases.

(defn clean-db-each
  "Truncate all tables in a test database before each test.
   
   Use this in :each fixture for tests that need a clean slate
   but don't need a completely fresh database."
  [conn]
  (jdbc/execute! @conn
                 ["TRUNCATE TABLE
                     puzzle_equivalences,
                     permutations,
                     transforms,
                     canonical_forms,
                     original_puzzles,
                     analysis_progress
                   RESTART IDENTITY CASCADE"]))
