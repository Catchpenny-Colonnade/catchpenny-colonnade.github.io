(ns sudoku-research.db
  (:require [next.jdbc :as jdbc]
            [next.jdbc.result-set :as rs]
            [clojure.java.io :as io]
            [clojure.string :as str]))

;; ============================================================================
;; DATABASE CONFIGURATION & CONNECTION
;; ============================================================================

(def db-config
  {:dbtype "postgresql"
   :host "localhost"
   :port 5432
   :user "postgres"
   :password "sudoku_research_dev"
   :dbname "sudoku_research"})

(def ^:dynamic *db* 
  "Dynamic database connection - set during initialization"
  nil)

(defn connect
  "Create a connection to the database"
  ([] (connect db-config))
  ([config]
   (jdbc/get-datasource (merge db-config config))))

(defn close-db 
  "Close database connection"
  []
  (when (and *db* (instance? java.io.Closeable *db*))
    (.close *db*)))

(defn initialize-db
  "Connect to database and initialize schema if needed"
  ([] (initialize-db {}))
  ([opts]
   (try
     (alter-var-root #'*db* (constantly (connect)))
     
     ;; Load and execute schema
     (let [schema-path "schema.sql"
           schema-url (io/resource schema-path)]
       (if-not schema-url
         (println "Error: schema.sql not found in resources")
         (let [schema-sql (slurp schema-url)]
           ;; Split by semicolons and execute each statement
           (doseq [statement (str/split schema-sql #";")
                   :let [trimmed (str/trim statement)]
                   :when (not (empty? trimmed))]
             (try
               (jdbc/execute! *db* [statement])
               (catch Exception e
                 ;; Ignore "already exists" errors on schema init
                 (if (str/includes? (.getMessage e) "already exists")
                   nil
                   (throw e)))))
           
           (println "[OK] Database schema initialized"))))
     (catch Exception e
       (println "[ERROR] initializing database:" (.getMessage e))
       (throw e)))))

;; ============================================================================
;; ORIGINAL PUZZLES - CRUD OPERATIONS
;; ============================================================================

(defn insert-original-puzzle
  "Insert an original puzzle into the database (ignores duplicates)"
  [{:keys [puzzle solution clue-count source-file]}]
  (try
    (let [result (jdbc/execute-one! *db*
                   ["INSERT INTO original_puzzles (puzzle, solution, clue_count, source_file, loaded_at)
                     VALUES (?, ?, ?, ?, NOW())
                     ON CONFLICT (puzzle) DO NOTHING
                     RETURNING id, puzzle, solution, clue_count, source_file"
                    puzzle solution clue-count source-file]
                   {:return-keys true})]
      result)
    (catch Exception e
      (println "Error inserting original puzzle:" (.getMessage e))
      nil)))

(defn count-original-puzzles-by-clue-count
  "Count original puzzles grouped by clue count"
  []
  (try
    (jdbc/execute! *db*
      ["SELECT clue_count, COUNT(*) as count FROM original_puzzles GROUP BY clue_count ORDER BY clue_count"]
      {:builder-fn rs/as-maps})
    (catch Exception e
      (println "Error counting original puzzles:" (.getMessage e))
      [])))

(defn get-first-canonical-candidate
  "Get the first original puzzle for a given clue count"
  [clue-count]
  (try
    (jdbc/execute-one! *db*
      ["SELECT id, puzzle, solution, clue_count FROM original_puzzles WHERE clue_count = ? LIMIT 1" clue-count]
      {:builder-fn rs/as-maps})
    (catch Exception e
      (println "Error getting first canonical candidate:" (.getMessage e))
      nil)))

(defn get-first-unmapped-puzzle-by-clue-count
  "Get first original puzzle not yet in any equivalence class (canonical form)"
  [clue-count]
  (try
    (jdbc/execute-one! *db*
      ["SELECT op.id, op.puzzle, op.solution, op.clue_count 
        FROM original_puzzles op
        LEFT JOIN permutations p ON op.puzzle = p.result
        WHERE op.clue_count = ? AND p.id IS NULL
        LIMIT 1" clue-count]
      {:builder-fn rs/as-maps})
    (catch Exception e
      (println "Error getting first unmapped puzzle:" (.getMessage e))
      nil)))

;; ============================================================================
;; CANONICAL FORMS - CRUD OPERATIONS
;; ============================================================================

(defn get-canonical-form
  "Retrieve canonical form by puzzle string"
  [puzzle]
  (try
    (jdbc/execute-one! *db*
      ["SELECT id, puzzle, solution, clue_count FROM canonical_forms WHERE puzzle = ?" puzzle]
      {:builder-fn rs/as-maps})
    (catch Exception e
      (println "Error getting canonical form:" (.getMessage e))
      nil)))

(defn insert-canonical-form
  "Insert a canonical form into the database (ignores duplicates)"
  [{:keys [puzzle solution clue-count]}]
  (try
    (let [result (jdbc/execute-one! *db*
                   ["INSERT INTO canonical_forms (puzzle, solution, clue_count, discovered_at)
                     VALUES (?, ?, ?, NOW())
                     ON CONFLICT (puzzle) DO NOTHING
                     RETURNING id, puzzle, solution, clue_count"
                    puzzle solution clue-count]
                   {:return-keys true})]
      result)
    (catch Exception e
      (println "Error inserting canonical form:" (.getMessage e))
      nil)))

(defn count-canonical-by-clue-count
  "Count canonical forms by clue count"
  []
  (try
    (jdbc/execute! *db*
      ["SELECT clue_count, COUNT(*) as count FROM canonical_forms GROUP BY clue_count ORDER BY clue_count"]
      {:builder-fn rs/as-maps})
    (catch Exception e
      (println "Error counting canonical forms:" (.getMessage e))
      [])))

;; ============================================================================
;; PERMUTATIONS - CRUD & QUERY OPERATIONS
;; ============================================================================

(defn insert-permutation
  "Insert a permutation record (ignores duplicates via unique constraint)"
  [{:keys [canonical-id result rotation-id row-order-id column-order-id symbol-translation-id]}]
  (try
    (let [result-val (jdbc/execute-one! *db*
                      ["INSERT INTO permutations (canonical_id, result, rotation_id, row_order_id, column_order_id, symbol_translation_id)
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON CONFLICT (canonical_id, rotation_id, row_order_id, column_order_id, symbol_translation_id) DO NOTHING
                        RETURNING id"
                       canonical-id result rotation-id row-order-id column-order-id symbol-translation-id]
                      {:return-keys true})]
      result-val)
    (catch Exception e
      (println "Error inserting permutation:" (.getMessage e))
      nil)))

(defn find-permutations-for-result
  "Find all permutations that generate a given result puzzle"
  [result-puzzle]
  (try
    (jdbc/execute! *db*
      ["SELECT p.id, p.canonical_id, cf.puzzle as canonical_puzzle, p.result, p.rotation_id,
               p.row_order_id, p.column_order_id, p.symbol_translation_id
        FROM permutations p
        JOIN canonical_forms cf ON p.canonical_id = cf.id
        WHERE p.result = ?"
       result-puzzle]
      {:builder-fn rs/as-maps})
    (catch Exception e
      (println "Error finding permutations:" (.getMessage e))
      [])))

;; ============================================================================
;; REFERENCE DATA - GET OR INSERT OPERATIONS
;; ============================================================================

(defn insert-or-get-row-order
  "Insert or retrieve existing row order (sequence of 9 row indices)"
  [order-seq]
  (try
    (let [order-str (str/join "," (map str order-seq))]
      (if-let [existing (jdbc/execute-one! *db*
                          ["SELECT id FROM row_orders WHERE order_sequence = ?" order-str]
                          {:builder-fn rs/as-maps})]
        (:id existing)
        (let [result (jdbc/execute-one! *db*
                       ["INSERT INTO row_orders (order_sequence) VALUES (?) RETURNING id" order-str]
                       {:return-keys true})]
          (:id result))))
    (catch Exception e
      (println "Error with row order:" (.getMessage e))
      nil)))

(defn insert-or-get-column-order
  "Insert or retrieve existing column order (sequence of 9 column indices)"
  [order-seq]
  (try
    (let [order-str (str/join "," (map str order-seq))]
      (if-let [existing (jdbc/execute-one! *db*
                          ["SELECT id FROM column_orders WHERE order_sequence = ?" order-str]
                          {:builder-fn rs/as-maps})]
        (:id existing)
        (let [result (jdbc/execute-one! *db*
                       ["INSERT INTO column_orders (order_sequence) VALUES (?) RETURNING id" order-str]
                       {:return-keys true})]
          (:id result))))
    (catch Exception e
      (println "Error with column order:" (.getMessage e))
      nil)))

(defn insert-or-get-symbol-translation
  "Insert or retrieve existing symbol translation (mapping of 9 digits)"
  [translation-seq]
  (try
    (let [translation-str (str/join "," (map str translation-seq))]
      (if-let [existing (jdbc/execute-one! *db*
                          ["SELECT id FROM symbol_translations WHERE translation_sequence = ?" translation-str]
                          {:builder-fn rs/as-maps})]
        (:id existing)
        (let [result (jdbc/execute-one! *db*
                       ["INSERT INTO symbol_translations (translation_sequence) VALUES (?) RETURNING id" translation-str]
                       {:return-keys true})]
          (:id result))))
    (catch Exception e
      (println "Error with symbol translation:" (.getMessage e))
      nil)))
