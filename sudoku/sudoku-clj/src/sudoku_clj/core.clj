(ns sudoku-clj.core 
  (:require
   [clojure.java.io :as io]
   [clojure.data.json :as json]
   [clojure.string :as s]))

(defn foo
  "I don't do a whole lot."
  [x]
  (println x "Hello, World!"))

(defn break-up-mega-file []
  (let [indicies (json/read-str (slurp "resources/indicies.json"))
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
  (let [indicies (json/read-str (slurp "resources/indicies.json"))]
    (doseq [index indicies]
      (let [csv (line-seq (io/reader (format "resources/puzzle-csv/index%s.csv" index)))
            content (map #(first (s/split % #",")) csv)]
        (spit 
         (format "resources/puzzles/index%s.json" index)
         (with-out-str
           (json/pprint content)))))))

(defn build-solutions-maps []
  (let [indicies (json/read-str (slurp "resources/indicies.json"))]
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

(defn -main [& _]
  (build-json-puzzles))
