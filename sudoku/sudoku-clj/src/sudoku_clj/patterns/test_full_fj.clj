(ns sudoku-clj.patterns.test-full-fj
  (:require [sudoku-clj.patterns.canonical :as canonical]
            [clojure.data.json :as json]
            [clojure.java.io :as io]))

(defn test-full-fj-single []
  "Test full Felgenhauer-Jarvis on a single grid to isolate LazySeq error"
  (let [; Load first puzzle
        puzzles-dir (io/file (io/resource "puzzles"))
        first-file (first (sort (filter #(.endsWith (.getName %) ".json")
                                       (.listFiles puzzles-dir))))
        grids (json/read-str (slurp first-file))
        test-grid (first grids)]
    
    (println "Testing full F&J on grid:" (subs test-grid 0 20) "...")
    
    (try
      (let [result (canonical/canonical-form test-grid :full)]
        (println "SUCCESS: Got result" (subs result 0 20) "..."))
      (catch Exception e
        (println "ERROR:" (.getMessage e))
        (println "Stack trace:")
        (.printStackTrace e)))))

(defn -main [& args]
  (test-full-fj-single))
