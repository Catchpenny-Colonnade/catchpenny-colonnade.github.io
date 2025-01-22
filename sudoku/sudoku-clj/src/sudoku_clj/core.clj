(ns sudoku-clj.core 
  (:require
   [clojure.java.io :as io]
   [clojure.data.json :as json]))

(defn foo
  "I don't do a whole lot."
  [x]
  (println x "Hello, World!"))

(defn -main [& _]
  (let [indicies (json/read-str (slurp "resources/indicies.json"))
        index-count (count indicies)]
    (loop [lines (rest (line-seq (io/reader "resources/sudoku.csv")))
           index 0]
      (when-not (empty? lines)
        (spit
         (format "resources/puzzles/index%s.json" (nth index indicies))
         (format "%s\n" (first lines))
         :append true))
      (recur (rest lines) (mod (inc index) index-count)))))
