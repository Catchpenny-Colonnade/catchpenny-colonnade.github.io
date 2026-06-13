(ns sudoku-research.permutations
  (:require [sudoku-research.data.validation :as validation]
            [sudoku-research.db.mutations :as db-mut]
            [sudoku-research.db.queries :as db-qry]
            [sudoku-research.puzzle :as puzzle]
            [clojure.math.combinatorics :as combo]))

(defn- apply-band-permutation
  "Apply a band permutation with within-band permutations to produce one ordering vector."
  [band-perm within-perms]
  (let [bands [[0 1 2] [3 4 5] [6 7 8]]
        permuted-bands (mapv #(nth bands %) band-perm)
        within-perm-list (vec within-perms)]
    (vec (mapcat (fn [band-idx band-rows]
                   (let [perm (nth within-perm-list band-idx)]
                     (mapv #(nth band-rows %) perm)))
                 band-perm
                 permuted-bands))))

(defn generate-all-orderings
  "Generate all 1,296 valid orderings (band/stack structure preserved)."
  []
  (let [band-perms (combo/permutations [0 1 2])
        within-perms-seq (fn []
                           (for [p1 (combo/permutations [0 1 2])
                                 p2 (combo/permutations [0 1 2])
                                 p3 (combo/permutations [0 1 2])]
                             [p1 p2 p3]))]
    (mapcat (fn [band-perm]
              (map (fn [within-perms]
                     (apply-band-permutation band-perm within-perms))
                   (within-perms-seq)))
            band-perms)))

(defn generate-symbol-permutations
  "Generate all 9! (362,880) symbol permutations."
  []
  (combo/permutations [1 2 3 4 5 6 7 8 9]))

(defn build-transform-key
  "Build bundled transform key RR-ROWORDER-COLORDER-SYMBOLMAP.
   Returns nil for unsupported rotations."
  [rotation-id row-order column-order symbol-translation]
  (let [rotation-token ({0 "00" 1 "90"} rotation-id)]
    (when rotation-token
      (str rotation-token
           "-" (apply str row-order)
           "-" (apply str column-order)
           "-" (apply str symbol-translation)))))

(defn resolve-transform-id
  "Resolve a transform reference to a transform ID.
   Accepts either:
   - :transform-id - use directly
   - :transform-key - validate and insert/get from database
   Returns the transform ID, or throws if invalid."
  [db {:keys [transform-id transform-key]}]
  (cond
    transform-id
    transform-id
    
    transform-key
    (do
      (when-not (validation/valid-transform-key? transform-key)
        (throw (ex-info "Invalid transform key" {:transform-key transform-key})))
      (:id (db-mut/insert-or-get-transform! db {:transform-key transform-key})))
    
    :else
    (throw (ex-info "Must provide either :transform-id or :transform-key"
                    {:provided-keys (set (keys {:transform-id transform-id :transform-key transform-key}))}))))

(defn insert-permutation!
  "Insert a new permutation via bundled transform_key workflow.
   rotation-id must be 0 or 1 (00 or 90).
   Throws on invalid rotation-id or database errors."
  [db canonical-id result-str rotation-id row-order column-order symbol-translation]
  (when-not (< rotation-id 2)
    (throw (ex-info "Invalid rotation-id (expected 0 or 1)" {:rotation-id rotation-id})))
  (let [transform-key (build-transform-key rotation-id row-order column-order symbol-translation)]
    (when-not transform-key
      (throw (ex-info "Failed to build transform key" {:rotation-id rotation-id})))
    (let [transform-id (resolve-transform-id db {:transform-key transform-key})]
      (db-mut/insert-permutation! db {:canonical-id canonical-id
                                      :result result-str
                                      :transform-id transform-id}))))

(defn- process-candidate
  "Process a single permutation candidate, returning updated stats with error details.
   Captures insertion failures and their error messages for better diagnostics."
  [db canonical-id canonical-puzzle stats [rotation-id row-order col-order symbol-translation]]
  (try
    (let [result-puzzle (puzzle/apply-all-transforms canonical-puzzle rotation-id row-order col-order symbol-translation)]
      (if (db-qry/find-permutation db result-puzzle)
        (-> stats (update :existing inc) (update :total inc))
        (do
          (insert-permutation! db canonical-id result-puzzle rotation-id row-order col-order symbol-translation)
          (-> stats (update :new inc) (update :total inc)))))
    (catch Exception e
      ;; Capture error details for logging
      (let [transform-key (build-transform-key rotation-id row-order col-order symbol-translation)]
        (assoc (-> stats (update :errors inc) (update :total inc))
               :last-error-key transform-key
               :last-error-msg (.getMessage e))))))

(defn generate-permutations
  "Generate permutations using bundled transform keys.
   To keep runtime bounded, default max-permutations is 1000.

   Returns map with:
     - :total: total permutations checked
     - :new: count of newly discovered permutations
     - :existing: count of permutations already in database
     - :errors: count of insertion errors"
  ([db canonical-id canonical-puzzle]
   (generate-permutations db canonical-id canonical-puzzle {:max-permutations 1000}))
  ([db canonical-id canonical-puzzle {:keys [max-permutations rotation-ids row-orderings column-orderings symbol-translations]
                                      :or {max-permutations 1000
                                           rotation-ids [0 1]
                                           row-orderings (generate-all-orderings)
                                           column-orderings (generate-all-orderings)
                                           symbol-translations (generate-symbol-permutations)}}]
  (try
    ;; Calculate estimated total (theoretical max before filtering)
    (let [rot-count (count rotation-ids)
          row-count (count row-orderings)
          col-count (count column-orderings)
          sym-count (count symbol-translations)
          theoretical-max (* rot-count row-count col-count sym-count)
          estimated-total (min max-permutations theoretical-max)]
      
      (println (format "                Generating permutations (estimated: ~%d)..." estimated-total))
      
      (let [candidates (take max-permutations
                             (for [rotation-id rotation-ids
                                   row-order row-orderings
                                   col-order column-orderings
                                   symbol-translation symbol-translations
                                   :let [transform-key (build-transform-key rotation-id row-order col-order symbol-translation)]
                                   :when (and transform-key
                                              (not (validation/identity-transform-key? transform-key)))]
                               [rotation-id row-order col-order symbol-translation]))
            initial-stats {:total 0 :new 0 :existing 0 :errors 0}]
        
        (let [final-stats (reduce (fn [stats candidate]
                                    (let [[rotation-id row-order col-order symbol-translation] candidate
                                          transform-key (build-transform-key rotation-id row-order col-order symbol-translation)
                                          updated (process-candidate db canonical-id canonical-puzzle stats candidate)
                                          status (cond
                                                  (> (:errors updated) (:errors stats)) "ERROR"
                                                  (> (:new updated) (:new stats)) "NEW"
                                                  :else "EXISTS")]
                                      ;; Log only NEW and ERROR permutations (not EXISTS to reduce noise)
                                      (when (= status "NEW")
                                        (println (format "                    [NEW] %s" transform-key)))
                                      (when (= status "ERROR")
                                        (let [error-msg (or (:last-error-msg updated) "Unknown error")]
                                          (println (format "                    [ERROR] %s (%s)"
                                                          transform-key error-msg))))
                                      updated))
                                  initial-stats
                                  candidates)]
          (println (format "                Complete: Generated %d permutations (%d new discoveries, %d already existed, %d errors)"
                          (:total final-stats) (:new final-stats) (:existing final-stats) (:errors final-stats)))
          final-stats)))
    (catch Exception e
      (println (format "[ERROR] generate-permutations: %s" (.getMessage e)))
      {:total 0 :new 0 :existing 0 :errors 1}))))

(defn stream-permutations
  "Stream transform candidates lazily as maps.
   Filters out the identity/origin transform (00-012345678-012345678-123456789)
   since it produces no useful equivalences.
   Optional opts may override finite domains for testing." 
  ([] (stream-permutations {}))
  ([{:keys [rotation-ids row-orderings column-orderings symbol-translations]
     :or {rotation-ids [0 1]
          row-orderings (generate-all-orderings)
          column-orderings (generate-all-orderings)
          symbol-translations (generate-symbol-permutations)}}]
   (for [rotation-id rotation-ids
         row-order row-orderings
         col-order column-orderings
         symbol-translation symbol-translations
         :let [transform-key (build-transform-key rotation-id row-order col-order symbol-translation)]
         :when (and transform-key
                    (not (validation/identity-transform-key? transform-key)))]
     {:rotation-id rotation-id
      :row-order row-order
      :column-order col-order
      :symbol-translation symbol-translation
      :transform-key transform-key})))

(defn count-permutations
  "Count total permutations in the bundled transform-key model.
   Uses 2 rotations (00, 90), 1,296 row orderings, 1,296 column orderings,
   and 362,880 symbol permutations."
  []
  (* 2 1296 1296 362880))
