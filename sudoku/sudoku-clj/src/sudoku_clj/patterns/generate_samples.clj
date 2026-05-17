(ns sudoku-clj.patterns.generate-samples
  "Generate and save random puzzle samples for reproducible testing.
   Creates 10 separate sample files with 100 random puzzles each.
   Samples are stored as EDN (Clojure data format) for easy loading.")

(require '[clojure.java.io :as io]
         '[clojure.data.json :as json]
         '[clojure.edn :as edn])

(defn load-all-puzzles
  "Load all puzzles from resources/puzzles/ directory"
  []
  (let [puzzle-dir (io/resource "puzzles")]
    (if puzzle-dir
      (let [files (filter #(.endsWith (.getName %) ".json")
                         (file-seq (io/file puzzle-dir)))
            sorted-files (sort-by #(.getName %) files)]
        (mapcat (fn [file]
                  (try
                    (let [data (json/read-str (slurp file))
                          puzzles (get data "puzzles" [])]
                      (map-indexed (fn [idx puzzle-str]
                                     {:file (.getName file)
                                      :index idx
                                      :grid puzzle-str})
                                   puzzles))
                    (catch Exception e
                      (println "Error loading" (.getName file) ":" (.getMessage e))
                      [])))
                sorted-files))
      [])))

(defn random-sample
  "Select N random items from coll"
  [n coll]
  (let [v (vec coll)
        size (count v)]
    (if (<= n size)
      (take n (shuffle v))
      v)))

(defn save-sample
  "Save a sample to a file as EDN"
  [sample-num puzzles output-dir]
  (let [filename (format "sample_%02d.edn" sample-num)
        filepath (io/file output-dir filename)
        content (pr-str puzzles)]
    (io/make-parents filepath)
    (spit filepath content)
    (println (format "  Saved %s with %d puzzles" filename (count puzzles)))
    filepath))

(defn generate-samples
  "Generate N sample files with M puzzles each, from all available puzzles"
  [num-samples puzzles-per-sample all-puzzles output-dir]
  (println "\n" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=")
  (println "GENERATING RANDOM PUZZLE SAMPLES")
  (println (format "Output directory: %s" output-dir))
  (println (format "Samples: %d | Puzzles per sample: %d | Total puzzles: %d"
                   num-samples puzzles-per-sample (* num-samples puzzles-per-sample)))
  (println "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "\n")
  
  (let [all-puzzles-vec (vec all-puzzles)
        sample-files (for [sample-num (range 1 (inc num-samples))]
                       (do
                         (println (str "Generating sample " sample-num "/" num-samples "..."))
                         (let [sample (vec (random-sample puzzles-per-sample all-puzzles-vec))]
                           (save-sample sample-num sample output-dir))))]
    (println (format "\n✓ Generated %d sample files in %s" num-samples output-dir))))

(defn -main
  "Entry point: Generate N samples of M puzzles each
   Usage: lein run -m sudoku-clj.patterns.generate-samples [num-samples] [puzzles-per-sample] [output-dir]
   Default: 10 samples, 100 puzzles each, samples/ directory"
  [& args]
  (let [num-samples (if (> (count args) 0) (Integer/parseInt (first args)) 10)
        puzzles-per-sample (if (> (count args) 1) (Integer/parseInt (second args)) 100)
        output-dir (if (> (count args) 2) (nth args 2) "samples")
        all-puzzles (load-all-puzzles)
        puzzle-count (count all-puzzles)]
    
    (if (> puzzle-count 0)
      (do
        (println (str "Loaded " puzzle-count " puzzles from resources/puzzles/"))
        (generate-samples num-samples puzzles-per-sample all-puzzles output-dir))
      (println "ERROR: No puzzles found in resources/puzzles/"))))
