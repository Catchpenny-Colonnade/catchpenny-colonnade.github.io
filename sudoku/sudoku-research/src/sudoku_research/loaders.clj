(ns sudoku-research.loaders
  (:require [sudoku-research.db.mutations :as db-mut]
            [sudoku-research.db.queries :as db-qry]
            [sudoku-research.file.io :as file-io])
  (:import [java.io File]))


(defn load-all-puzzles
  "Load all puzzle-solution pairs from JSON files.
   Handles both array format (puzzles only) and map format (puzzle->solution).
   Returns a lazy sequence of puzzle strings or [puzzle solution] pairs.
   
   Parameters:
   - files: sequence of file paths to load"
  [files]
  (->> files
       (mapcat (fn [file-path]
                 (try
                   (let [data (file-io/read-json-file file-path)]
                     (cond
                       ;; Map format: keys are puzzles, values are solutions
                       (map? data)
                       (map (fn [[puzzle solution]]
                              [puzzle solution])
                            data)
                       ;; Array format: just puzzle strings
                       (coll? data)
                       data
                       ;; Single puzzle string
                       :else
                       [data]))
                   (catch Exception e
                     (println (format "[WARN] Skipping %s: %s" file-path (.getMessage e)))
                     []))))))

(defn load-all-puzzles-strings
  "Load all puzzle strings from JSON files (for backward compatibility).
   Extracts only puzzle strings, ignoring solutions.
   
   Parameters:
   - files: sequence of file paths to load"
  [files]
  (->> (load-all-puzzles files)
       (map (fn [item]
              (if (vector? item)
                (first item)  ;; Extract puzzle from [puzzle solution] pair
                item)))))     ;; Already a string

(defn count-clues
  "Count the number of non-zero digits in a puzzle string."
  [puzzle-str]
  (count (filter #(not= % \0) puzzle-str)))

(defn insert-puzzles-batch
  "Insert a batch of puzzle strings or [puzzle solution] pairs into the database.
   
   Parameters:
   - db: database connection
   - source-file-id: source file ID from source_files table
   - puzzles: collection of puzzle strings or [puzzle solution] pairs
   
   Returns map with {:inserted count :skipped count :errors count}."
  [db source-file-id puzzles]
  (let [stats (reduce (fn [acc item]
                        (try
                          (let [[puzzle solution] (if (vector? item)
                                                    item
                                                    [item nil])
                                clue-count (count-clues puzzle)
                                result (db-mut/insert-original-puzzle! db
                                                                     {:puzzle puzzle
                                                                      :solution solution
                                                                      :clue-count clue-count
                                                                      :source-file-id source-file-id})]
                            (if result
                              (update acc :inserted inc)
                              (update acc :skipped inc)))
                          (catch Exception e
                            (println (format "[ERROR] Inserting puzzle: %s" (.getMessage e)))
                            (update acc :errors inc))))
                      {:inserted 0 :skipped 0 :errors 0}
                      puzzles)]
    stats))

(defn load-puzzles-from-directory
  "Load puzzles and solutions from JSON files with processing control.
   
   State-aware: checks database to determine:
   - Which files are already loaded (completed status)
   - Which files are in progress (processing status)  
   - Which files need to be loaded (pending status or not yet discovered)
   
   Discovers JSON files from disk and reconciles with database state.
   Supports resuming in-progress files and limiting files/records processed.
   
   Returns map with load statistics including files-processed.
   
   Optional opts:
   - :dir - directory path (default: solutions directory)
   - :max-files - limit number of files to process
   - :max-records - limit total records to process
   - :resume - resume a file currently in-progress status"
  [db & [{:keys [dir max-files max-records resume]
          :or {dir "sudoku/sudoku-clj/resources/solutions"}}]]
  (try
    ;; Step 1: Check current database state
    (let [completed-count (db-qry/count-original-puzzles-by-clue-count db)
          total-completed (reduce + (map :count completed-count))
          
          ;; Check if we already have completed files
          all-files-in-db (db-qry/get-all-source-files db)
          completed-files (filter #(= (:status %) "completed") all-files-in-db)
          processing-files (filter #(= (:status %) "processing") all-files-in-db)
          pending-files (filter #(= (:status %) "pending") all-files-in-db)]
      
      (println (format "[*] Database state: %d files completed, %d in progress, %d pending"
                      (count completed-files) (count processing-files) (count pending-files)))
      (println (format "[*] Total puzzles loaded so far: %d" total-completed))
      
      ;; Step 2: Discover files from disk using file/io wrapper
      (let [json-file-paths (file-io/list-json-files dir)
              _ (println (format "[*] Found %d JSON files in directory" (count json-file-paths)))
              
              ;; Step 3: Reconcile disk files with database - create missing source_files records
              _ (doseq [file-path json-file-paths]
                  (let [file-obj (File. file-path)
                        filename (.getName file-obj)
                        file-size (.length file-obj)
                        ;; Check if this file is already in database
                        existing (first (filter #(= (:filename %) filename) all-files-in-db))]
                    ;; Only create if not already in database
                    (when (nil? existing)
                      (println (format "[*] Registering new file: %s" filename))
                      (db-mut/insert-source-file! db
                                                 {:filename filename
                                                  :file-path file-path
                                                  :file-size-bytes file-size
                                                  :puzzle-count-expected 0}))))
              
              ;; Step 4: Re-query database after creating new source_files
              updated-files-in-db (db-qry/get-all-source-files db)
              updated-processing (filter #(= (:status %) "processing") updated-files-in-db)
              updated-pending (filter #(= (:status %) "pending") updated-files-in-db)
              
              ;; Step 5: Determine which files to process based on state and options
              files-to-process (cond
                                 ;; If resume flag set, include both processing and pending
                                 resume (vec (concat updated-processing updated-pending))
                                 ;; Otherwise, only process pending files
                                 :else (vec updated-pending))
              
              files-limit (or max-files Integer/MAX_VALUE)
              files-to-load (take files-limit files-to-process)
              
              _ (println (format "[*] Will process %d files (limit: %s)"
                                (count files-to-load)
                                (if (= files-limit Integer/MAX_VALUE) "unlimited" files-limit)))
              
              ;; Step 6: Load all puzzle data from disk once
              disk-puzzles (load-all-puzzles json-file-paths)
              records-limit (or max-records Integer/MAX_VALUE)
              
              ;; Step 7: Process each file with state awareness
              result (reduce (fn [acc source-file]
                                 (let [current-inserted (:inserted acc)]
                                   (if (>= current-inserted records-limit)
                                     ;; Stop if we've hit the record limit
                                     (do
                                       (println (format "[*] Record limit (%d) reached, stopping processing" records-limit))
                                       acc)
                                     
                                     (do
                                       (println (format "[*] Processing file: %s (ID: %d, Status: %s)"
                                                       (:filename source-file)
                                                       (:id source-file)
                                                       (:status source-file)))
                                       
                                       ;; Update file status to processing if not already
                                       (when (not= (:status source-file) "processing")
                                         (db-mut/update-file-status! db (:id source-file) "processing")
                                         (db-mut/update-file-processing-started! db (:id source-file)))
                                       
                                       ;; Calculate remaining capacity
                                       (let [remaining-records (- records-limit current-inserted)
                                             puzzles-to-insert (take remaining-records disk-puzzles)
                                             stats (insert-puzzles-batch db (:id source-file) puzzles-to-insert)]
                                         
                                         ;; Mark file as completed
                                         (db-mut/update-file-status! db (:id source-file) "completed")
                                         (db-mut/update-file-processing-completed! db (:id source-file) (:inserted stats))
                                         
                                         (println (format "[✓] File completed: %d inserted, %d skipped, %d errors"
                                                         (:inserted stats) (:skipped stats) (:errors stats)))
                                         
                                         ;; Accumulate stats
                                         (-> acc
                                             (update :inserted + (:inserted stats))
                                             (update :skipped + (:skipped stats))
                                             (update :errors + (:errors stats))
                                             (update :files-processed inc)))))))
                               {:inserted 0 :skipped 0 :errors 0 :files-processed 0}
                               files-to-load)]
            
            (if (> (:files-processed result) 0)
              (do
                (println (format "[✓] Loading complete: %d files processed, %d puzzles inserted"
                                (:files-processed result) (:inserted result)))
                (assoc result :status :loaded))
              (do
                (println "[*] No files needed processing (all completed or no pending files)")
                (assoc result :status :skipped)))))
    
    (catch Exception e
      (println (format "[ERROR] Loading puzzles: %s" (.getMessage e)))
      {:status :error :message (.getMessage e) :files-processed 0})))


