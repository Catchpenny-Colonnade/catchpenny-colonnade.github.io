(ns sudoku-clj.difficulty
  (:require [sudoku-clj.solver :refer :all]
            [clojure.set :as set]))

;; Puzzle difficulty analysis and classification

(defn count-initial-clues
  "Count the number of initial clues (non-zero values) in a puzzle"
  [puzzle-str]
  (count (filter #(not= \0 %) puzzle-str)))

(defn measure-solve-complexity
  "Measure the complexity of solving a puzzle
   Returns map with metrics about the solve process"
  [puzzle-str]
  (let [grid (parse-puzzle puzzle-str)
        start-time (System/nanoTime)]
    (loop [current-grid grid
           iterations 0
           max-iterations 1000]
      (if (>= iterations max-iterations)
        {:error "Max iterations reached (likely unsolvable)"}
        (let [constrained (apply-constraints current-grid)]
          (if (= constrained current-grid)
            ;; No more constraint propagation possible
            (let [empty-cells (->> (for [r (range 9) c (range 9)] [r c])
                                   (filter (fn [[r c]] (= (nth (nth constrained r) c) 0)))
                                   count)]
              (if (= empty-cells 0)
                ;; Solved by constraint propagation alone
                {:solved true
                 :method :constraint-propagation
                 :iterations iterations
                 :empty-cells 0
                 :requires-search false}
                ;; Needs backtracking
                {:solved false
                 :method :needs-backtracking
                 :iterations iterations
                 :empty-cells empty-cells
                 :requires-search true}))
            ;; Continue constraint propagation
            (recur constrained (inc iterations) max-iterations)))))))

(def difficulty-levels
  "Difficulty classification scheme based on clue count and solve metrics"
  {:trivial {:clues-min 50 :clues-max 81}
   :easy {:clues-min 40 :clues-max 49}
   :medium {:clues-min 30 :clues-max 39}
   :hard {:clues-min 20 :clues-max 29}
   :extreme {:clues-min 0 :clues-max 19}})

(defn classify-difficulty
  "Classify puzzle difficulty based on clue count"
  [puzzle-str]
  (let [clue-count (count-initial-clues puzzle-str)]
    (cond
      (>= clue-count 50) :trivial
      (>= clue-count 40) :easy
      (>= clue-count 30) :medium
      (>= clue-count 20) :hard
      :else :extreme)))

(defn- generate-candidates-for-puzzle
  "Generate all possible candidates for a puzzle using solver's get-candidates"
  [puzzle-str]
  (let [grid (parse-puzzle puzzle-str)]
    (reduce
     (fn [acc [r c]]
       (assoc-in acc [r c] (get-candidates grid r c)))
     (vec (repeat 9 (vec (repeat 9 #{}))))
     (for [r (range 9) c (range 9)] [r c]))))

(defn calculate-difficulty-score
  "Calculate a numerical difficulty score (0-100) based on multiple factors"
  [puzzle-str]
  (let [clues (count-initial-clues puzzle-str)
        complexity (measure-solve-complexity puzzle-str)
        requires-search (:requires-search complexity)
        
        ;; Clue-based score: fewer clues = harder
        clue-score (int (* 100 (/ (- 81 clues) 81)))
        
        ;; Search-based score: requires search = harder
        search-score (if requires-search 50 0)
        
        ;; Empty cells score: more empty after constraint propagation = harder
        empty-cells (:empty-cells complexity)
        empty-score (int (* 40 (/ empty-cells 81)))]
    
    ;; Weighted average
    (int (+ (* clue-score 0.5)
             (* search-score 0.3)
             (* empty-score 0.2)))))

(defn analyze-puzzle
  "Comprehensive puzzle analysis returning all difficulty metrics"
  [puzzle-str]
  (let [clues (count-initial-clues puzzle-str)
        classification (classify-difficulty puzzle-str)
        complexity (measure-solve-complexity puzzle-str)
        difficulty-score (calculate-difficulty-score puzzle-str)]
    {:puzzle puzzle-str
     :clues clues
     :classification classification
     :difficulty-score difficulty-score
     :requires-search (:requires-search complexity)
     :empty-cells-after-propagation (:empty-cells complexity)
     :constraint-propagation-iterations (:iterations complexity)}))
