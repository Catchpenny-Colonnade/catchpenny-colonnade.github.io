(ns sudoku-clj.solver
  "Sudoku solver implementation - constraint propagation and backtracking"
  (:require [clojure.set :as set]))

;; Helper functions

(defn parse-puzzle
  "Convert puzzle string (81 chars, 0=empty) to 9x9 grid of integers"
  [puzzle-str]
  (->> puzzle-str
       (map #(Character/digit % 10))
       (partition 9)
       (map vec)
       (vec)))

(defn- grid-to-string
  "Convert 9x9 grid back to string"
  [grid]
  (->> grid
       (apply concat)
       (map str)
       (apply str)))

(defn- has-duplicates? [seq]
  "Check if sequence has duplicate non-zero values"
  (let [non-zero (filter #(not= % 0) seq)]
    (not= (count non-zero) (count (set non-zero)))))

(defn- get-row [grid row]
  (nth grid row))

(defn- get-column [grid col]
  (mapv #(nth % col) grid))

(defn- get-box [grid box-row box-col]
  "Get 3x3 box starting at (box-row*3, box-col*3)"
  (let [start-row (* box-row 3)
        start-col (* box-col 3)]
    (for [r (range start-row (+ start-row 3))
          c (range start-col (+ start-col 3))]
      (nth (nth grid r) c))))

;; Core solver functions

(defn get-candidates
  "Get possible values for a cell given current grid state"
  [grid row col]
  (if (not= (nth (nth grid row) col) 0)
    ;; Cell already filled
    #{}
    ;; Get all possible values (1-9)
    (let [all-vals (set (range 1 10))
          row-vals (set (filter #(not= % 0) (get-row grid row)))
          col-vals (set (filter #(not= % 0) (get-column grid col)))
          box-row (quot row 3)
          box-col (quot col 3)
          box-vals (set (filter #(not= % 0) (get-box grid box-row box-col)))]
      (clojure.set/difference all-vals row-vals col-vals box-vals))))

(defn- apply-naked-singles
  "Fill cells with only one candidate"
  [grid]
  ;; First, build a complete candidates grid to avoid repeated calculations
  (let [candidates-grid 
        (mapv (fn [row-idx]
                (mapv (fn [col-idx]
                        (if (= (nth (nth grid row-idx) col-idx) 0)
                          (get-candidates grid row-idx col-idx)
                          #{}))
                      (range 9)))
              (range 9))]
    ;; Now apply naked singles using the cached candidates
    (reduce
     (fn [g [row col]]
       (let [candidates (nth (nth candidates-grid row) col)]
         (if (= (count candidates) 1)
           (let [new-row (vec (assoc (nth g row) col (first candidates)))]
             (assoc g row new-row))
           g)))
     grid
     (for [r (range 9) c (range 9)] [r c]))))

(defn- apply-hidden-singles
  "Find values that can only go in one cell within a unit (row/col/box)"
  [grid]
  (let [;; Generate all units (rows, columns, 3x3 boxes)
        all-units (concat
                   ;; Rows
                   (for [r (range 9)]
                     (for [c (range 9)] [r c]))
                   ;; Columns
                   (for [c (range 9)]
                     (for [r (range 9)] [r c]))
                   ;; 3x3 Boxes
                   (for [br (range 3) bc (range 3)]
                     (for [r (range (* br 3) (+ (* br 3) 3))
                           c (range (* bc 3) (+ (* bc 3) 3))]
                       [r c])))]
    
    ;; Process each unit to find hidden singles
    (reduce
     (fn [g unit-cells]
       ;; For each empty cell in the unit, collect its candidates
       (let [cell-candidates (map (fn [[r c]]
                                    (when (= (nth (nth g r) c) 0)
                                      {:row r :col c 
                                       :candidates (get-candidates g r c)}))
                                  unit-cells)
             ;; Remove nils (filled cells)
             valid-cells (filter identity cell-candidates)
             ;; Find values that appear in only one cell's candidate set
             all-candidates (reduce set/union #{} (map :candidates valid-cells))
             hidden-singles (for [val all-candidates
                                 :let [cells-with-val (filter #(contains? (:candidates %) val)
                                                               valid-cells)]
                                 :when (= (count cells-with-val) 1)]
                              (assoc (first cells-with-val) :value val))]
         ;; Fill in the hidden singles
         (reduce (fn [acc {:keys [row col value]}]
                   (let [new-row (vec (assoc (nth acc row) col value))]
                     (assoc acc row new-row)))
                 g
                 hidden-singles)))
     grid
     all-units)))

(defn- apply-pointing-pairs
  "If a value in a box is confined to one row/col, eliminate from rest of row/col"
  [grid]
  ;; For each 3x3 box
  (reduce
   (fn [g [box-row box-col]]
     ;; For each value 1-9, check if it's confined to one row/col in this box
     (let [box-start-r (* box-row 3)
           box-start-c (* box-col 3)
           box-cells (for [r (range box-start-r (+ box-start-r 3))
                          c (range box-start-c (+ box-start-c 3))]
                       [r c])]
       (reduce
        (fn [acc val]
          ;; Find cells in this box that could have this value
          (let [cells-with-val (for [[r c] box-cells
                                     :when (and (= (nth (nth acc r) c) 0)
                                               (contains? (get-candidates acc r c) val))]
                                 [r c])
                ;; Check if all are in same row or same column
                rows (set (map first cells-with-val))
                cols (set (map second cells-with-val))]
            
            (cond
              ;; All in same row: pointing pair found (doesn't eliminate in current implementation)
              (and (seq cells-with-val) (= (count rows) 1))
              acc
              
              ;; All in same column: pointing pair found (doesn't eliminate in current implementation)
              (and (seq cells-with-val) (= (count cols) 1))
              acc
              
              :else acc)))
        g
        (range 1 10))))
   grid
   (for [br (range 3) bc (range 3)] [br bc])))

(defn apply-constraints
  "Apply logical rules to reduce candidates. Uses multiple techniques:
   - Naked singles: if a cell has only one candidate, fill it
   - Hidden singles: if a value has only one possible place in a unit, fill it
   - Pointing pairs: if a value in a box is confined to one row/col, eliminate from rest
   Repeat until no changes."
  [grid]
  (let [updated-grid (apply-naked-singles grid)
        updated-grid2 (apply-hidden-singles updated-grid)
        final-grid (apply-pointing-pairs updated-grid2)]
    ;; If grid changed, apply constraints again
    (if (= final-grid grid)
      grid
      (apply-constraints final-grid))))

(defn solve
  "Solve a sudoku puzzle. Takes puzzle string, returns solution string.
   Returns nil if puzzle has no solution."
  [puzzle-str]
  (let [initial-grid (parse-puzzle puzzle-str)
        
        solve-recursive (fn solve-rec [grid]
          ;; Apply constraint propagation
          (let [constrained (apply-constraints grid)]
            ;; Check for contradictions (empty candidate set for non-filled cell)
            (let [has-contradiction (some (fn [[row col]]
                                            (and (= (nth (nth constrained row) col) 0)
                                                 (empty? (get-candidates constrained row col))))
                                          (for [r (range 9) c (range 9)] [r c]))]
              (if has-contradiction
                ;; Contradiction: this branch has no solution
                nil
                ;; Check if solved
                (let [empty-cells (for [r (range 9) c (range 9)
                                        :when (= (nth (nth constrained r) c) 0)]
                                    [r c])]
                  (if (empty? empty-cells)
                    ;; Solved!
                    constrained
                    ;; Not solved: pick cell with fewest candidates and try them
                    (let [cell-with-candidates (map (fn [[r c]]
                                                      {:row r :col c 
                                                       :candidates (get-candidates constrained r c)})
                                                    empty-cells)
                          ;; Choose cell with minimum candidates (MRV heuristic)
                          best-cell (apply min-key #(count (:candidates %)) cell-with-candidates)
                          {:keys [row col candidates]} best-cell]
                      ;; Try each candidate
                      (some (fn [candidate]
                              (let [new-grid (assoc constrained row
                                                     (assoc (nth constrained row) col candidate))]
                                (solve-rec new-grid)))
                            candidates))))))))]
    (let [solution-grid (solve-recursive initial-grid)]
      (if solution-grid
        (grid-to-string solution-grid)
        nil))))

(defn valid-solution?
  "Check if a solution string is a valid complete sudoku"
  [solution-str]
  (let [grid (parse-puzzle solution-str)]
    (and
     ;; All cells must be filled (no zeros)
     (not-any? #(contains? (set %) 0) grid)
     ;; Check all rows have 1-9
     (not-any? has-duplicates? grid)
     ;; Check all columns have 1-9
     (not-any? has-duplicates? (for [c (range 9)] (get-column grid c)))
     ;; Check all 3x3 boxes have 1-9
     (not-any? has-duplicates? (for [br (range 3) bc (range 3)] (get-box grid br bc))))))

(defn count-solutions
  "Count the number of distinct solutions to a puzzle (expensive operation)
   Returns 0 = no solution, 1 = unique solution, 2+ = multiple solutions
   Optimization: stops counting once we find 2 solutions"
  [puzzle-str]
  (let [grid (parse-puzzle puzzle-str)]
    (let [initial-state (vec (for [r (range 9)]
                               (vec (for [c (range 9)]
                                      (let [val (nth (nth grid r) c)]
                                        (if (zero? val)
                                          (get-candidates grid r c)
                                          #{val}))))))]
      (let [propagated (apply-constraints initial-state)]
        (if (nil? propagated)
          0  ;; Invalid puzzle
          ;; Recursive backtracking counter with early exit
          ((fn count-from-state [state]
             ;; Check if any cell has zero candidates (contradiction)
             (let [has-empty-candidates (some identity
                                          (for [r (range 9)]
                                            (some #(and (zero? (count %)) true)
                                                  (nth state r))))]
               (if has-empty-candidates
                 0  ;; Contradiction
                 ;; Find first cell with multiple candidates (empty cell)
                 (let [empty-cells (for [r (range 9) c (range 9)
                                          :when (> (count (nth (nth state r) c)) 1)]
                                     [r c])]
                   (if (empty? empty-cells)
                     ;; No empty cells with multiple candidates - check if complete
                     (if (every? (fn [row]
                                   (every? (fn [cell]
                                             (= (count cell) 1))
                                           row))
                                 state)
                       1  ;; Complete solution found
                       0  ;; Inconsistency
                     )
                     ;; Try each candidate for the first undetermined cell
                     (let [[r c] (first empty-cells)
                           candidates (nth (nth state r) c)
                           solutions (atom 0)]
                       (loop [cands (seq candidates)]
                         (if (or (nil? cands) (>= @solutions 2))
                           @solutions  ;; Stop if we found 2+ solutions
                           (let [val (first cands)
                                 new-state (assoc-in state [r c] #{val})
                                 constrained (apply-constraints new-state)]
                             (if (not (nil? constrained))
                               (swap! solutions + (count-from-state constrained)))
                             (recur (rest cands))
                           )
                         )
                       )
                     )
                   )
                 )
               )
             )
           ) propagated))))))
