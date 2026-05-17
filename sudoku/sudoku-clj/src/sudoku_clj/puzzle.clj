(ns sudoku-clj.puzzle
  "Puzzle data, transformation, and difficulty analysis"
  (:require
   [clojure.java.io :as io]
   [clojure.data.json :as json]
   [clojure.string :as s]))

;; Data utilities
(defn get-indicies []
  "Load the index mapping from resources/indicies.json"
  (json/read-str (slurp "resources/indicies.json")))

;; Transformation functions
(defn break-up-mega-file []
  "Distribute CSV rows from resources/sudoku.csv round-robin into indexed bucket files"
  (let [indicies (get-indicies)
        index-count (count indicies)]
    (doseq [index indicies]
      (spit (format "resources/puzzle-csv/index%s.csv" index) ""))
    (loop [lines (rest (line-seq (io/reader "resources/sudoku.csv")))
           index 0]
      (when-not (empty? lines)
        (spit
         (format "resources/puzzle-csv/index%s.csv" (nth indicies index))
         (format "%s\n" (first lines))
         :append true))
      (recur (rest lines) (mod (inc index) index-count)))))

(defn build-json-puzzles []
  "Convert puzzle CSV files to JSON arrays indexed by bucket"
  (let [indicies (get-indicies)]
    (doseq [index indicies]
      (let [csv (line-seq (io/reader (format "resources/puzzle-csv/index%s.csv" index)))
            content (map #(first (s/split % #",")) csv)]
        (spit 
         (format "resources/puzzles/index%s.json" index)
         (with-out-str
           (json/pprint content)))))))

(defn build-solutions-maps []
  "Convert puzzle-solution CSV files to JSON maps of puzzle->solution indexed by bucket"
  (let [indicies (get-indicies)]
    (doseq [index indicies]
      (let [csv (line-seq (io/reader (format "resources/puzzle-csv/index%s.csv" index)))
            content (reduce
                     #(let [[puzzle solution] (s/split %2 #",")]
                        (assoc %1 puzzle solution))
                     {}
                     csv)]
        (spit
         (format "resources/solutions/index%s.json" index)
         (with-out-str
           (json/pprint content)))))))

;; Difficulty analysis
(defn is-extreme? [pair]
  "Check if a puzzle-solution pair is 'extreme' (both diagonals have all unique digits)"
  (let [solution-str (-> pair
                         (s/split #",")
                         (second))
        solution (->> solution-str
                      (map #(read-string (str %)))
                      (partition 9))
        backslash (into #{} (map #(get-in solution [% %]) (range 9)))
        slash (into #{} (map #(get-in solution [% (- 8 %)]) (range 9)))]
    (and (= (count slash) 9) (= (count backslash) 9))))

(defn detect-extreme []
  "Find and print all extreme puzzles across all indexed buckets"
  (let [indicies (get-indicies)]
    (doseq [index indicies]
      (let [pairs (-> (format "resources/puzzle-csv/index%s.csv" index)
                      (io/reader)
                      (line-seq))]
        (doseq [pair (filter is-extreme? pairs)]
          (print pair))))))
