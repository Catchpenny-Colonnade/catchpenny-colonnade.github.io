(ns sudoku-research.db.mutations
  (:require [sudoku-research.db.helpers :as db-helpers]))

(defn- execute-one-safe
  [db label param-map]
  (db-helpers/execute-safe db label param-map :one {:return-keys true}))

(defn insert-original-puzzle!
  "Insert an original puzzle into the database (ignores duplicates)"
  [db param-map]
  (execute-one-safe db :insert-original-puzzle! param-map))

(defn insert-canonical-form!
  "Insert a canonical form into the database (ignores duplicates)"
  [db param-map]
  (execute-one-safe db :insert-canonical-form! param-map))

(defn insert-permutation!
  "Insert a permutation record (ignores duplicates via unique constraint)"
  [db param-map]
  (execute-one-safe db :insert-permutation! param-map))

(defn insert-or-get-transform!
  "Insert or retrieve an existing transform by bundled transform key.
   Returns the inserted/retrieved transform row."
  [db param-map]
  (execute-one-safe db :insert-or-get-transform! param-map))

(defn insert-equivalence!
  "Insert an equivalence mapping: original puzzle -> canonical form
   Idempotent via unique constraint"
  [db param-map]
  (execute-one-safe db :insert-equivalence! param-map))

;; ============================================================================
;; SOURCE FILE TRACKING MUTATIONS
;; ============================================================================

(defn insert-source-file!
  "Insert a source file record into tracking table"
  [db param-map]
  (execute-one-safe db :insert-source-file! param-map))

(defn update-file-status!
  "Update a source file's status (pending, processing, completed, failed)"
  [db file-id status]
  (execute-one-safe db :update-file-status! {:status status :file-id file-id}))

(defn update-file-processing-started!
  "Mark file as processing and set start time"
  [db file-id]
  (execute-one-safe db :update-file-processing-started! {:file-id file-id}))

(defn update-file-processing-completed!
  "Mark file as completed with puzzle count and end time"
  [db file-id puzzle-count-loaded]
  (execute-one-safe db :update-file-processing-completed! 
                     {:puzzle-count-loaded puzzle-count-loaded :file-id file-id}))

(defn update-file-processing-failed!
  "Mark file as failed with error message"
  [db file-id error-message]
  (execute-one-safe db :update-file-processing-failed! 
                     {:error-message error-message :file-id file-id}))
