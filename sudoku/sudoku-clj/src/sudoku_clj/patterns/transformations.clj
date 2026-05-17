(ns sudoku-clj.patterns.transformations
  "Geometric transformations for sudoku grids: rotations, reflections, and transpositions.
   All transformations work on 81-character strings (9x9 grid in row-major order).")

(defn grid-to-matrix
  "Convert 81-char string to 9x9 vector of vectors"
  [grid-str]
  (mapv (fn [i]
          (mapv (fn [j]
                  (get grid-str (+ (* i 9) j)))
                (range 9)))
        (range 9)))

(defn matrix-to-grid
  "Convert 9x9 vector of vectors back to 81-char string"
  [matrix]
  (apply str (flatten matrix)))

(defn rotate-90
  "Rotate grid 90 degrees clockwise"
  [grid-str]
  (let [m (grid-to-matrix grid-str)]
    (->> (mapv (fn [j]
                 (mapv (fn [i]
                         (get-in m [i j]))
                       (range 8 -1 -1)))
               (range 9))
         (matrix-to-grid))))

(defn rotate-180
  "Rotate grid 180 degrees"
  [grid-str]
  (rotate-90 (rotate-90 grid-str)))

(defn rotate-270
  "Rotate grid 270 degrees clockwise"
  [grid-str]
  (rotate-90 (rotate-90 (rotate-90 grid-str))))

(defn flip-horizontal
  "Flip grid left-right"
  [grid-str]
  (let [m (grid-to-matrix grid-str)]
    (->> (mapv (fn [i]
                 (vec (reverse (get m i))))
               (range 9))
         (matrix-to-grid))))

(defn flip-vertical
  "Flip grid top-bottom"
  [grid-str]
  (let [m (grid-to-matrix grid-str)]
    (->> (vec (reverse m))
         (matrix-to-grid))))

(defn transpose
  "Transpose grid (swap rows and columns)"
  [grid-str]
  (let [m (grid-to-matrix grid-str)]
    (->> (mapv (fn [j]
                 (mapv (fn [i]
                         (get-in m [i j]))
                       (range 9)))
               (range 9))
         (matrix-to-grid))))

(defn anti-transpose
  "Anti-transpose (transpose + 180 rotation equivalent)"
  [grid-str]
  (flip-horizontal (flip-vertical (transpose grid-str))))

(defn all-geometric-transforms
  "Apply all 8 geometric transformations, return set of unique results"
  [grid-str]
  (set [grid-str
        (rotate-90 grid-str)
        (rotate-180 grid-str)
        (rotate-270 grid-str)
        (flip-horizontal grid-str)
        (flip-vertical grid-str)
        (transpose grid-str)
        (anti-transpose grid-str)]))

(defn find-lexicographically-smallest
  "Find lexicographically smallest form from set/seq of grids"
  [grids]
  (reduce (fn [min-grid grid]
            (if (< (compare grid min-grid) 0)
              grid
              min-grid))
          grids))
