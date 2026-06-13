(ns sudoku-research.db-test-helpers)

;; ============================================================================
;; RESULT SET BUILDERS - Mock data factories for testing
;; ============================================================================

(defn mock-puzzle-row
  "Create a mock puzzle row result."
  [& {:keys [id puzzle solution clue-count source-file-id]
      :or {id 1
           puzzle "530070000600195000098000060800060003400803001700020006060000280000419005000080079"
           solution "534678912672195348198342567821564793459783621763921456316457289287419635945286174"
           clue-count 25
           source-file-id 1}}]
  {:id id
   :puzzle puzzle
   :solution solution
   :clue-count clue-count
   :source-file-id source-file-id})

(defn mock-canonical-row
  "Create a mock canonical form row result."
  [& {:keys [id puzzle solution clue-count]
      :or {id 1
           puzzle "530070000600195000098000060800060003400803001700020006060000280000419005000080079"
           solution nil
           clue-count 25}}]
  {:id id
   :puzzle puzzle
   :solution solution
   :clue-count clue-count})

(defn mock-transform-row
  "Create a mock transform row result."
  [& {:keys [id transform-key]
      :or {id 1
           transform-key "00-012345678-012345678-123456789"}}]
  {:id id
   :transform-key transform-key})

(defn mock-permutation-row
  "Create a mock permutation row result."
  [& {:keys [id canonical-id result transform-id]
      :or {id 1
           canonical-id 1
           result "530070000600195000098000060800060003400803001700020006060000280000419005000080079"
           transform-id 1}}]
  {:id id
   :canonical-id canonical-id
   :result result
   :transform-id transform-id})

(defn mock-equivalence-row
  "Create a mock equivalence mapping row result."
  [& {:keys [id original-puzzle-id canonical-id permutation-id]
      :or {id 1
           original-puzzle-id 1
           canonical-id 1
           permutation-id 1}}]
  {:id id
   :original-puzzle-id original-puzzle-id
   :canonical-id canonical-id
   :permutation-id permutation-id})
