(ns sudoku-research.core
  (:require [clojure.string :as str]
            [clojure.tools.cli :refer [parse-opts]]
            [sudoku-research.db.connection :as db-conn]
            [sudoku-research.loaders :as loaders]
            [sudoku-research.db.queries :as db-qry])
  (:gen-class))

;; ============================================================================
;; COMMAND-LINE INTERFACE
;; ============================================================================

(def cli-options
  [["-d" "--dir DIR" "Directory containing puzzle JSON files (default: sudoku/sudoku-clj/resources/solutions)"
    :id :dir
    :default "sudoku/sudoku-clj/resources/solutions"]
   ["-f" "--max-files N" "Maximum number of files to process"
    :id :max-files
    :parse-fn #(Integer/parseInt %)]
   ["-r" "--max-records N" "Maximum number of records to process"
    :id :max-records
    :parse-fn #(Integer/parseInt %)]
   [nil "--resume" "Resume processing a file currently in-progress"
    :id :resume]
   ["-h" "--help" "Show this help message"
    :id :help]])

(defn usage [options-summary]
  (->> ["Sudoku Research Puzzle Loader"
        ""
        "USAGE:"
        "  lein run [OPTIONS]"
        ""
        "OPTIONS:"
        options-summary
        ""
        "EXAMPLES:"
        "  # Load from default directory with default database config"
        "  lein run"
        ""
        "  # Load from custom directory"
        "  lein run --dir /path/to/puzzles"
        ""
        "  # Process next 5 files only"
        "  lein run --max-files 5"
        ""
        "  # Process up to 1000 records total"
        "  lein run --max-records 1000"
        ""
        "  # Resume a file currently in-progress, then process next 3 files"
        "  lein run --resume --max-files 3"
        ""
        "DATABASE CONFIG:"
        "  Edit resources/db-config.local.edn to override default database settings."
        "  See resources/db-config.local.example.edn for format."]
       (str/join \newline)))

(defn validate-args [args]
  "Validate command-line arguments. Returns map with :ok/:errors."
  (let [{:keys [options arguments errors summary]} (parse-opts args cli-options)]
    (cond
      (:help options)
      {:exit-message (usage summary) :ok? true}
      
      errors
      {:exit-message (str "The following errors occurred while parsing your command:\n\n"
                         (str/join \newline errors))
       :ok? false}
      
      :else
      {:options options})))

(defn -main [& args]
  "Main entry point for puzzle loading.
   
   Orchestrates:
   1. Command-line argument parsing
   2. Database connection setup
   3. Puzzle file discovery
   4. Batch loading with file tracking
   5. Progress reporting and error handling"
  
  (let [parsed (validate-args args)]
    (cond
      (:exit-message parsed)
      (do
        (println (:exit-message parsed))
        (System/exit (if (:ok? parsed) 0 1)))
      
      :else
      (let [{:keys [dir max-files max-records resume]} (:options parsed)
            db-config (db-conn/load-db-config)
            loader-opts (cond-> {:dir dir}
                          max-files (assoc :max-files max-files)
                          max-records (assoc :max-records max-records)
                          resume (assoc :resume true))]
        
        (try
          (println "")
          (println "======================================")
          (println "  Sudoku Research - Puzzle Loader")
          (println "======================================")
          (println "")
          (println (format "Puzzle Directory: %s" dir))
          (println (format "Database: %s" (:dbname db-config)))
          (when max-files
            (println (format "Max Files: %d" max-files)))
          (when max-records
            (println (format "Max Records: %d" max-records)))
          (when resume
            (println "Resume: Yes (will continue in-progress file)"))
          (println "")
          
          ;; Initialize database connection
          (let [conn (db-conn/initialize-db! db-config)]
            (try
              ;; Check database connectivity
              (println "[*] Connecting to database...")
              (db-qry/count-original-puzzles-by-clue-count conn)
              (println "[✓] Database connection OK")
              (println "")
              
              ;; Load puzzles with processing control options
              (println "[*] Starting puzzle load...")
              (let [result (loaders/load-puzzles-from-directory conn loader-opts)]
                (println "")
                (println "======================================")
                (println "  Load Summary")
                (println "======================================")
                (println (format "  Status:        %s" (str/upper-case (str (:status result)))))
                (println (format "  Inserted:      %s" (:inserted result)))
                (println (format "  Skipped:       %s" (:skipped result)))
                (println (format "  Errors:        %s" (:errors result)))
                (when (:source-file-id result)
                  (println (format "  Source File ID: %s" (:source-file-id result))))
                (when (:files-processed result)
                  (println (format "  Files Processed: %d" (:files-processed result))))
                (println "======================================")
                (println ""))
              
              (catch Exception e
                (println (format "[ERROR] %s" (.getMessage e)))
                (.printStackTrace e)
                (throw e))
              
              (finally
                (db-conn/close-db! conn))))
          
          (catch Exception e
            (println (format "[ERROR] Fatal error: %s" (.getMessage e)))
            (.printStackTrace e)
            (System/exit 1)))))))

;; Allow running as a library too
(comment
  ;; Example usage from REPL:
  (let [conn (db-conn/initialize-db! {:dbname "sudoku_research_test"})]
    (try
      (loaders/load-puzzles-from-directory conn {:dir "path/to/puzzles"})
      (finally
        (db-conn/close-db! conn)))))
