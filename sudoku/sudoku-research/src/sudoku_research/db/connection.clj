(ns sudoku-research.db.connection
  (:require [next.jdbc :as jdbc]
            [clojure.edn :as edn]
            [clojure.java.io :as io]
            [clojure.string :as str]))

(def default-db-config
  {:dbtype "postgresql"
   :host "localhost"
   :port 5432
   :user "postgres"
   :password "sudoku_research_dev"
   :dbname "sudoku_research"})

(defn- read-config-resource
  "Read an EDN config resource when present, otherwise return nil."
  [resource-name]
  (when-let [config-url (io/resource resource-name)]
    (edn/read-string (slurp config-url))))

(defn load-db-config
  "Load database configuration from resources/db-config.local.edn first,
   then resources/db-config.edn, and finally default-db-config."
  []
  (try
    (merge default-db-config
           (or (read-config-resource "db-config.edn") {})
           (or (read-config-resource "db-config.local.edn") {}))
    (catch Exception e
      (println "[WARN] Failed to load database config, using defaults:" (.getMessage e))
      default-db-config)))

(def db-config
  "Resolved database config from resource files with default fallback.
   Preference order: db-config.local.edn > db-config.edn > built-in defaults."
  (load-db-config))

(defn connect
  "Create a connection to the database.
   
   Optional parameters:
   - :dbname - override database name (default: from config)
   
   Examples:
   (connect) ; uses configured database
   (connect {:dbname \"sudoku_research_test\"}) ; uses test database"
  ([] (connect {}))
  ([config]
   ;; Re-read config on each connect so local file updates are picked up.
   (jdbc/get-datasource (merge (load-db-config) config))))

(defn connect-test-db
  "Create a connection to the test database.
   Always uses sudoku_research_test database regardless of config."
  []
  (connect {:dbname "sudoku_research_test"}))

(defn close-db!
  "Close database connection"
  [db]
  (when (and db (instance? java.io.Closeable db))
    (.close db)))

(defn run-schema!
  "Load and execute schema.sql statements. Ignores already-exists failures."
  [db]
  (let [schema-path "schema.sql"
        schema-url (io/resource schema-path)]
    (if-not schema-url
      (println "Error: schema.sql not found in resources")
      (let [schema-sql (slurp schema-url)]
        (doseq [statement (str/split schema-sql #";")
                :let [trimmed (str/trim statement)]
                :when (not (empty? trimmed))]
          (try
            (jdbc/execute! db [statement])
            (catch Exception e
              (if (str/includes? (.getMessage e) "already exists")
                nil
                (throw e)))))
        (println "[OK] Database schema initialized")))))

(defn initialize-db!
  "Create a database connection, run schema initialization, and return the connection."
  ([] (initialize-db! {}))
  ([opts]
   (let [db (connect opts)]
     (try
       (run-schema! db)
       db
       (catch Exception e
         (close-db! db)
         (println "[ERROR] initializing database:" (.getMessage e))
         (throw e))))))
