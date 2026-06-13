(ns sudoku-research.puzzle
  (:require [clojure.string :as str]))

;; ============================================================================
;; PUZZLE TRANSFORMATION FUNCTIONS
;; ============================================================================

(defn puzzle-string->grid
  "Convert 81-char string to 2D vector of digits (9x9)"
  [puzzle-str]
  (let [chars (vec puzzle-str)]
    (vec (for [r (range 9)]
           (vec (for [c (range 9)]
                  (Character/digit (chars (+ (* r 9) c)) 10)))))))

(defn grid->puzzle-string
  "Convert 9x9 2D vector back to 81-char string"
  [grid]
  (str/join (for [r (range 9)
                  c (range 9)]
              (get-in grid [r c]))))

(defn apply-rotation
  "Apply rotation transformation to puzzle string
   rotation-id: 0 = identity, 1 = 90° CW, 2 = 180°, 3 = 270° CW (or 90° CCW)"
  [puzzle-str rotation-id]
  (if (= rotation-id 0)
    puzzle-str
    (let [grid (puzzle-string->grid puzzle-str)
          rotated-grid (case rotation-id
                         1 ;; 90° clockwise: (r,c) -> (c, 8-r)
                         (vec (for [c (range 9)]
                                (vec (for [r (range 8 -1 -1)]
                                       (get-in grid [r c])))))
                         
                         2 ;; 180°: (r,c) -> (8-r, 8-c)
                         (vec (for [r (range 8 -1 -1)]
                                (vec (for [c (range 8 -1 -1)]
                                       (get-in grid [r c])))))
                         
                         3 ;; 270° clockwise (90° CCW): (r,c) -> (8-c, r)
                         (vec (for [c (range 8 -1 -1)]
                                (vec (for [r (range 9)]
                                       (get-in grid [r c]))))))]
      (grid->puzzle-string rotated-grid))))

(defn apply-row-ordering
  "Apply row reordering to puzzle string
   ordering: 9-element vector indicating which row goes where
   e.g., [0 1 2 3 4 5 6 7 8] = identity, [1 0 2 3 4 5 6 7 8] = swap rows 0 and 1"
  [puzzle-str ordering]
  (let [grid (puzzle-string->grid puzzle-str)
        reordered-grid (vec (for [old-row-idx (range 9)]
                              ;; Find which new position this row goes to
                              (let [new-row-idx (.indexOf (vec ordering) old-row-idx)]
                                (get grid new-row-idx))))]
    (grid->puzzle-string reordered-grid)))

(defn apply-column-ordering
  "Apply column reordering to puzzle string
   ordering: 9-element vector indicating which column goes where
   e.g., [0 1 2 3 4 5 6 7 8] = identity, [1 0 2 3 4 5 6 7 8] = swap cols 0 and 1"
  [puzzle-str ordering]
  (let [grid (puzzle-string->grid puzzle-str)
        reordered-grid (vec (for [r (range 9)]
                              (vec (for [old-col-idx (range 9)]
                                     (let [new-col-idx (.indexOf (vec ordering) old-col-idx)]
                                       (get-in grid [r new-col-idx]))))))]
    (grid->puzzle-string reordered-grid)))

(defn apply-symbol-translation
  "Apply digit remapping to puzzle string
   translation: 9-element vector where position i maps digit (i+1) to translation[i]
   e.g., [1 2 3 4 5 6 7 8 9] = identity, [2 1 3 4 5 6 7 8 9] = swap digits 1 and 2"
  [puzzle-str translation]
  (let [translation-map (into {} (map-indexed (fn [idx val]
                                                 [(inc idx) val])
                                               translation))]
    (str/join (for [ch puzzle-str]
                (if (= ch \0)
                  \0  ;; Keep empty cells as 0
                  (let [digit (Character/digit ch 10)]
                    (Character/forDigit (get translation-map digit digit) 10)))))))

(defn apply-all-transforms
  "Apply rotation, row ordering, column ordering, and symbol translation
   Returns transformed puzzle string"
  [puzzle-str rotation-id row-ordering column-ordering symbol-translation]
  (-> puzzle-str
      (apply-rotation rotation-id)
      (apply-row-ordering row-ordering)
      (apply-column-ordering column-ordering)
      (apply-symbol-translation symbol-translation)))
