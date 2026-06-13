(ns sudoku-research.analysis
  "Orchestration layer for equivalence class discovery workflow.
   
   Core Workflow:
   1. Load original puzzles from files into database
   2. For each clue count, process puzzles systematically
   3. Pick unprocessed puzzle by clue count
   4. If it matches an existing permutation → record equivalence to that canonical
   5. If it's new → promote to canonical, generate all perms, record equivalences
   6. Track progress and statistics"
  (:require [sudoku-research.db.mutations :as db-mut]
            [sudoku-research.db.queries :as db-qry]
            [sudoku-research.permutations :as perms]))

;; ============================================================================
;; CORE WORKFLOW FUNCTIONS
;; ============================================================================

(defn process-as-canonical!
  "Promote a puzzle to canonical form and generate all permutations.
   
   Steps:
   1. Insert puzzle as canonical form
   2. Generate all permutations and insert into database
   3. For each permutation result, find matches in original_puzzles and record equivalences
   4. Record original puzzle as processed via puzzle_equivalences
   
   Returns map with:
   - :canonical-id (inserted canonical form ID)
   - :permutations-generated (count of perm records created)
   - :matches-found (count of original puzzles that matched perms)"
  [db original-id original-puzzle original-solution clue-count]
  (let [;; Step 1: Insert as canonical
        canonical (db-mut/insert-canonical-form! db
                                                  {:puzzle original-puzzle
                                                   :solution original-solution
                                                   :clue-count clue-count})
        canonical-id (:id canonical)]
    
    (if-not canonical-id
      {:error :failed-to-insert-canonical :puzzle original-puzzle}
      
      (try
        (println (format "\n[NEW CANONICAL] %s" original-puzzle))
        (println (format "                (inserted as canonical form #%d)" canonical-id))
        
        (println "                [STEP 1/3] Generating permutations (this may take several minutes)...")
        (let [;; Step 2: Generate all permutations and insert into DB
              perm-stats (perms/generate-permutations db canonical-id original-puzzle)
              perms-inserted (:new perm-stats)
              match-count (atom 0)]
          
          (println (format "                [STEP 1 COMPLETE] Generated %d permutations" perms-inserted))
          
          ;; Step 3: For each new permutation, find matching originals
          (when (pos? perms-inserted)
            (println "                [STEP 2/3] Scanning permutations for matches...")
            (let [perm-records (db-qry/find-permutations-for-result db original-puzzle)]
              (doseq [perm perm-records]
                (try
                  (let [matches (db-qry/find-originals-for-result db (:result perm))]
                    (doseq [match matches]
                      (when (not= (:id match) original-id)
                        (db-mut/insert-equivalence! db {:original-puzzle-id (:id match)
                                                        :canonical-id canonical-id
                                                        :permutation-id (:id perm)})
                        (swap! match-count inc))))
                  (catch Exception e
                    (println (format "[WARN] Error finding matches for perm %d: %s"
                                    (:id perm) (.getMessage e)))))))
            (println (format "                [STEP 2 COMPLETE] Found %d equivalence(s)" @match-count)))
          
          ;; Record that the original itself maps to this canonical (marks it as processed)
          (println "                [STEP 3/3] Recording original puzzle as processed...")
          (let [equivalence-result (db-mut/insert-equivalence! db {:original-puzzle-id original-id
                                                                   :canonical-id canonical-id
                                                                   :permutation-id nil})]
            (if equivalence-result
              (println (format "                [STEP 3 COMPLETE] Done. (equivalence id: %d)" (:id equivalence-result)))
              (println "[WARN] [STEP 3] insert-equivalence! returned nil or empty result. Puzzle may not be marked as processed!")))
          
          {:canonical-id canonical-id
           :permutations-generated perms-inserted
           :matches-found @match-count})
        
        (catch Exception e
          (println (format "[ERROR] Error in process-as-canonical! for canonical %d: %s"
                          canonical-id (.getMessage e)))
          {:canonical-id canonical-id
           :permutations-generated 0
           :matches-found 0
           :error (.getMessage e)})))))

(defn process-as-equivalent!
  "Record that a puzzle matches an existing permutation.
   
   Returns the equivalence mapping."
  [db original-id perm-record]
  (let [canonical-id (:canonical_id perm-record)
        perm-id (:id perm-record)]
    (db-mut/insert-equivalence! db {:original-puzzle-id original-id
                                    :canonical-id canonical-id
                                    :permutation-id perm-id})
    {:canonical-id canonical-id
     :permutation-id perm-id}))

(defn process-puzzle!
  "Process a single puzzle for equivalence discovery.
   
   Returns result map or nil if no unprocessed puzzles."
  [db clue-count]
  (when-let [puzzle (db-qry/get-first-unmapped-puzzle-by-clue-count db clue-count)]
    (let [puzzle-id (:id puzzle)
          puzzle-str (:puzzle puzzle)
          solution (:solution puzzle)]
      
      (if-let [existing-perm (db-qry/find-permutation db puzzle-str)]
        ;; Already a permutation result → record equivalence to existing canonical
        (do
          (println (format "\n[RECOGNIZED EQUIVALENCE] %s" puzzle-str))
          (println (format "                          (matches existing canonical form #%d)"
                          (:canonical_id existing-perm)))
          (process-as-equivalent! db puzzle-id existing-perm))
        
        ;; New puzzle → promote to canonical and generate perms
        (do
          (println (format "\n[NEW] Puzzle: %s (processing as new canonical)"
                          puzzle-str))
          (process-as-canonical! db puzzle-id puzzle-str solution clue-count))))))

;; ============================================================================
;; ANALYSIS ORCHESTRATION
;; ============================================================================

(defn analyze-clue-count!
  "Process all puzzles for a specific clue count.
   
   Processes puzzles sequentially until all are handled or a reasonable limit is reached.
   Returns summary of work done."
  [db clue-count & {:keys [max-iterations debug] :or {max-iterations 1000 debug false}}]
  (println (format "\n================================================================================"))
  (println (format ">>> PROCESSING PUZZLES WITH %d CLUES (debug: %s)" clue-count debug))
  (when debug
    (println (format ">>> Max iterations: %d" max-iterations)))
  
  (let [summary (atom {:clue-count clue-count
                       :puzzles-processed 0
                       :canonicals-found 0
                       :equivalences-discovered 0
                       :matches-found 0})
        processed-ids (atom #{})]  ;; Track processed puzzle IDs to prevent duplicates
    
    (loop [iteration 0]
      (if (>= iteration max-iterations)
        (println (format "    Reached iteration limit (%d)" max-iterations))
        
        (if-let [puzzle (db-qry/get-first-unmapped-puzzle-by-clue-count db clue-count)]
          (let [puzzle-id (:id puzzle)
                puzzle-str (:puzzle puzzle)]
            (when debug
              (println (format "[DIAG] Iteration %d: Query returned puzzle ID %d | processed-ids count: %d"
                              iteration puzzle-id (count @processed-ids))))
            
            ;; Guard against infinite loops from duplicate processing
            (if (@processed-ids puzzle-id)
              (do
                (when debug
                  (println (format "[DIAG] DUPLICATE DETECTED: Puzzle %d is already in processed-ids!"
                                  puzzle-id)))
                (throw (ex-info "Duplicate puzzle detected during analysis - indicates database sync issue"
                               {:puzzle-id puzzle-id
                                :puzzle-str (subs puzzle-str 0 30)
                                :iteration iteration
                                :clue-count clue-count
                                :processed-ids-count (count @processed-ids)})))
              
              (do
                ;; Mark this puzzle as being processed
                (swap! processed-ids conj puzzle-id)
                (when debug
                  (println (format "[DIAG] Marked puzzle %d as processed | processed-ids now: %d items"
                                  puzzle-id (count @processed-ids))))
                (println (format "    [Iteration %d] Found unmapped puzzle %d" iteration puzzle-id))
                
                ;; Process this specific puzzle
                (let [solution (:solution puzzle)
                      
                      result (if-let [existing-perm (db-qry/find-permutation db puzzle-str)]
                               ;; Already a permutation result → record equivalence to existing canonical
                               (do
                                 (println (format "\n[RECOGNIZED EQUIVALENCE] %s" puzzle-str))
                                 (println (format "                          (matches existing canonical form #%d)"
                                                 (:canonical_id existing-perm)))
                                 (process-as-equivalent! db puzzle-id existing-perm))
                               
                               ;; New puzzle → promote to canonical and generate perms
                               (do
                                 (println (format "\n[NEW] Puzzle: %s (processing as new canonical)"
                                                 puzzle-str))
                                 (process-as-canonical! db puzzle-id puzzle-str solution clue-count)))]
                  
                  ;; Update stats
                  (swap! summary (fn [s]
                                   (-> s
                                       (update :puzzles-processed inc)
                                       (cond-> (:permutations-generated result)
                                         (update :canonicals-found inc))
                                       (update :equivalences-discovered inc)
                                       (update :matches-found + 
                                               (or (:matches-found result) 0)))))
                  
                  ;; Progress report every 50 iterations
                  (when (zero? (mod (inc iteration) 50))
                    (println (format "    Progress: Processed %d puzzles | Found %d canonical forms | Discovered %d equivalences"
                                    (:puzzles-processed @summary)
                                    (:canonicals-found @summary)
                                    (:equivalences-discovered @summary))))
                  
                  ;; Continue to next puzzle
                  (recur (inc iteration))))))
          
          ;; No more unprocessed puzzles for this clue count
          (do
            (println (format "\nCOMPLETE (Clue count %d): Processed %d puzzles | Found %d canonicals | Discovered %d equivalences\n" 
                            clue-count
                            (:puzzles-processed @summary)
                            (:canonicals-found @summary)
                            (:equivalences-discovered @summary)))))))
    
    @summary))

(defn analyze-all-clue-counts!
  "Analyze all clue counts. Main entry point for equivalence discovery.
   
   Options:
   - :debug (boolean) - Enable diagnostic logging to trace execution
   
   Returns comprehensive summary of discovery process."
  ([db]
   (analyze-all-clue-counts! db {:debug false}))
  ([db {:keys [debug] :or {debug false}}]
   (let [clue-counts (db-qry/count-original-puzzles-by-clue-count db)
         overall (atom {:total-puzzles-processed 0
                        :total-canonicals-found 0
                        :total-equivalences-discovered 0
                        :total-matches-found 0
                        :by-clue-count {}})]
     
     (println "\n========================================")
     (println "Starting Equivalence Class Discovery")
     (when debug
       (println "DEBUG MODE ENABLED - Detailed logging active"))
     (println "========================================")
     
     (doseq [{:keys [clue_count count]} clue-counts]
       (println (format "\n[*] %d original puzzles with %d clues" count clue_count))
       
       (try
         (let [result (analyze-clue-count! db clue_count :debug debug)]
           (swap! overall (fn [s]
                            (-> s
                                (assoc-in [:by-clue-count clue_count] result)
                                (update :total-puzzles-processed + (:puzzles-processed result))
                                (update :total-canonicals-found + (:canonicals-found result))
                                (update :total-equivalences-discovered + (:equivalences-discovered result))
                                (update :total-matches-found + (:matches-found result))))))
         
         (catch Exception e
           (println (format "[ERROR] Failed to process clue count %d: %s"
                           clue_count (.getMessage e))))))
     
     (println "\n========================================")
     (println "Analysis Complete")
     (println "========================================\n")
     
     @overall)))

;; ============================================================================
;; PROGRESS AND REPORTING
;; ============================================================================

(defn get-progress
  "Get current analysis progress."
  [db]
  {:original-puzzles (reduce + (map :count (db-qry/count-original-puzzles-by-clue-count db)) [0])
   :canonical-forms (reduce + (map :count (db-qry/count-canonical-by-clue-count db)) [0])
   :total-equivalences (db-qry/count-total-equivalences db)
   :stats (db-qry/get-equivalence-class-stats db)})

(defn print-progress
  "Print formatted progress report."
  [db]
  (let [{:keys [original-puzzles canonical-forms total-equivalences stats]} (get-progress db)]
    (println (format "\nProgress Report:"))
    (println (format "  Original puzzles: %d" original-puzzles))
    (println (format "  Canonical forms: %d" canonical-forms))
    (println (format "  Total equivalences: %d" total-equivalences))
    (println (format "  Coverage: %.1f%%" 
                    (* 100.0 (/ total-equivalences (max 1 original-puzzles)))))
    (when (not-empty stats)
      (println "\n  By clue count:")
      (doseq [{:keys [clue_count num_canonical num_originals total_mappings]} stats]
        (println (format "    [%2d clues] %4d canonicals, %4d originals → %d mappings"
                        clue_count num_canonical num_originals total_mappings))))))
