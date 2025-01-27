(ns sudoku-clj.core 
  (:require
   [clojure.java.io :as io]
   [clojure.data.json :as json]
   [clojure.string :as s]))

(defn get-indicies []
  (json/read-str (slurp "resources/indicies.json")))

(defn break-up-mega-file []
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
  (let [indicies (get-indicies)]
    (doseq [index indicies]
      (let [csv (line-seq (io/reader (format "resources/puzzle-csv/index%s.csv" index)))
            content (map #(first (s/split % #",")) csv)]
        (spit 
         (format "resources/puzzles/index%s.json" index)
         (with-out-str
           (json/pprint content)))))))

(defn build-solutions-maps []
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

(defn is-extreme? [pair]
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
  (let [indicies (get-indicies)]
    (doseq [index indicies]
      (let [pairs (-> (format "resources/puzzle-csv/index%s.csv" index)
                      (io/reader)
                      (line-seq))]
        (doseq [pair (filter is-extreme? pairs)]
          (print pair))))))

(defn -main [& _]
  (detect-extreme))
