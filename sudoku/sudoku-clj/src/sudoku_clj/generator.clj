(ns sudoku-clj.generator
  "Sudoku puzzle generation with controlled difficulty"
  (:require [sudoku-clj.solver :refer :all]
            [sudoku-clj.difficulty :as diff]))

;; Puzzle generation by clue removal

(defn generate-solved-grid
  "Generate a random valid solved sudoku using diagonal-based approach"
  []
  (let [;; Fill main diagonal with 1-9
        grid (vec (for [i (range 9)]
                   (vec (for [j (range 9)]
                          (cond
                            (= i j) (inc i)  ;; Diagonal 1-9
                            :else 0)))))]
    
    ;; Use solver to fill the rest
    (let [puzzle-str (->> grid (apply concat) (map str) (apply str))
          solution (solve puzzle-str)]
      (if solution
        (parse-puzzle solution)
        (recur)))))  ;; Retry if failed

(defn grid-to-puzzle
  "Convert grid to puzzle string representation"
  [grid]
  (->> grid
       (apply concat)
       (map str)
       (apply str)))

(defn puzzle-to-grid
  "Convert puzzle string to grid"
  [puzzle-str]
  (parse-puzzle puzzle-str))

(defn can-remove-clue?
  "Check uniqueness: verify puzzle has exactly 1 solution after removing clue
   Returns true only if removing clue maintains exactly 1 solution"
  [puzzle-str idx]
  (try
    (let [modified (str (subs puzzle-str 0 idx) \0 (subs puzzle-str (inc idx)))
          solution-count (count-solutions modified)]
      (= solution-count 1))
    (catch Exception _
      false)))

(defn remove-clues-greedily
  "Remove clues from puzzle to reach target clue count while maintaining uniqueness
   Uses greedy approach: remove random clues until target reached
   Enforces exactly 1 solution per puzzle (uses count-solutions for validation)"
  [puzzle-str target-clues max-attempts]
  (let [initial-clues (count (filter #(not= % \0) puzzle-str))]
    (if (<= initial-clues target-clues)
      puzzle-str
      (loop [current-puzzle puzzle-str
             attempts 0
             removed 0]
        (let [current-clues (count (filter #(not= % \0) current-puzzle))]
          (cond
            ;; Reached target
            (<= current-clues target-clues)
            current-puzzle
            
            ;; Hit attempt limit
            (>= attempts max-attempts)
            current-puzzle
            
            ;; Try to remove another clue
            :else
            (let [clue-indices (vec (for [i (range 81) :when (not= (nth current-puzzle i) \0)] i))
                  idx-to-remove (rand-nth clue-indices)]
              (if (can-remove-clue? current-puzzle idx-to-remove)
                (let [new-puzzle (str (subs current-puzzle 0 idx-to-remove)
                                     \0
                                     (subs current-puzzle (inc idx-to-remove)))]
                  (recur new-puzzle (inc attempts) (inc removed)))
                (recur current-puzzle (inc attempts) removed)))))))))

(defn generate-puzzle
  "Generate a puzzle with target number of clues and guaranteed uniqueness
   Parameters:
   - target-clues: Target number of clues (30-39 for medium)
   - max-attempts: Max attempts to remove clues (default 1000, increased for uniqueness checking)"
  [target-clues & {:keys [max-attempts] :or {max-attempts 1000}}]
  (try
    (let [solved-grid (generate-solved-grid)
          initial-puzzle (grid-to-puzzle solved-grid)
          
          ;; Remove clues to reach target
          final-puzzle (remove-clues-greedily initial-puzzle target-clues max-attempts)]
      final-puzzle)
    (catch Exception e
      (println "Error generating puzzle:" (.getMessage e))
      nil)))

(defn generate-puzzles
  "Generate multiple puzzles with target difficulty
   Options:
   - :count: Number of puzzles to generate (default 10)
   - :target-clues: Target number of clues (default 34)
   - :difficulty-tier: :trivial/:easy/:medium/:hard/:extreme (default :medium)
   - :max-attempts: Max attempts per puzzle (default 1000, increased for uniqueness)"
  [& {:keys [count target-clues difficulty-tier max-attempts]
      :or {count 10
           target-clues 34
           difficulty-tier :medium
           max-attempts 1000}}]
  
  ;; Determine clue range from difficulty tier if target not specified
  (let [clue-ranges {:trivial [50 81]
                    :easy [40 49]
                    :medium [30 39]
                    :hard [20 29]
                    :extreme [0 19]}
        [min-clues max-clues] (clue-ranges difficulty-tier [30 39])
        actual-target (if (= target-clues 34)  ;; Default value
                       (int (+ min-clues (/ (- max-clues min-clues) 2)))
                       target-clues)]
    
    ;; Generate puzzles
    (keep (fn [n]
            (println (format "Generating puzzle %d/%d (target: %d clues)..." (inc n) count actual-target))
            (let [puzzle (generate-puzzle actual-target :max-attempts max-attempts)]
              (if puzzle
                (assoc (diff/analyze-puzzle puzzle)
                       :generated true
                       :target-clues actual-target)
                nil)))
          (range count))))

(defn batch-generate
  "Generate multiple batches of puzzles for performance analysis
   Now uses uniqueness checking - increased attempts for validation"
  [batch-size difficulty-tier & {:keys [batches max-attempts]
                                  :or {batches 1
                                       max-attempts 1000}}]
  
  (let [clue-ranges {:medium [30 39]
                    :hard [20 29]
                    :easy [40 49]}
        [min-clues max-clues] (clue-ranges difficulty-tier [30 39])
        target-clues (int (+ min-clues (/ (- max-clues min-clues) 2)))]
    
    (loop [batch-num 0
           all-puzzles []]
      (if (>= batch-num batches)
        all-puzzles
        (do
          (println (format "\n=== Batch %d/%d ===" (inc batch-num) batches))
          (let [start (System/currentTimeMillis)
                batch (vec (generate-puzzles :count batch-size
                                            :target-clues target-clues
                                            :difficulty-tier difficulty-tier
                                            :max-attempts max-attempts))
                end (System/currentTimeMillis)
                elapsed (/ (- end start) 1000.0)]
            
            (if (seq batch)
              (println (format "Generated %d puzzles in %.1f seconds (%.2f sec/puzzle)"
                              (count batch) elapsed (/ elapsed (count batch))))
              (println "No puzzles generated"))
            
            (recur (inc batch-num) (concat all-puzzles batch))))))))