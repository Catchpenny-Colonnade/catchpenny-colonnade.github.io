(ns sudoku-clj.patterns.sample-analysis
  "Sample-based analysis: Load pre-generated samples and analyze with full F&J.
   
   This script loads sample files (previously generated via generate-samples)
   and runs performance analysis on each sample.
   
   Usage: lein run -m sudoku-clj.patterns.sample-analysis [sample-dir]
   Default: samples/")

(require '[clojure.java.io :as io]
         '[clojure.edn :as edn]
         '[clojure.string]
         '[sudoku-clj.patterns.canonical :as canonical])

(defn load-sample-file
  "Load a single sample file (EDN format)"
  [filepath]
  (try
    (let [content (slurp filepath)]
      (edn/read-string content))
    (catch Exception e
      (println "Error loading" filepath ":" (.getMessage e))
      [])))

(defn list-sample-files
  "List all sample files in a directory, sorted numerically"
  [sample-dir]
  (let [dir (io/file sample-dir)]
    (if (.isDirectory dir)
      (->> (file-seq dir)
           (filter #(.endsWith (.getName %) ".edn"))
           (sort-by (fn [f]
                      (let [name (.getName f)
                            match (re-find #"sample_(\d+)" name)]
                        (if match (Integer/parseInt (second match)) 999)))))
      [])))

(defn analyze-sample
  "Analyze a single sample with timing"
  [puzzles mode]
  (let [start (System/nanoTime)
        error-count (atom 0)
        results (reduce (fn [acc puzzle-data]
                          (try
                            (let [grid (if (map? puzzle-data) 
                                        (:grid puzzle-data) 
                                        puzzle-data)
                                  canonical-form (canonical/canonical-form grid mode)
                                  _ (assoc acc :last-canonical canonical-form)]
                              (update acc :count inc))
                            (catch Exception e
                              (do
                                (swap! error-count inc)
                                (when (< @error-count 3)
                                  (println "  Error:" (.getMessage e)))
                                acc))))
                        {:count 0 :errors 0}
                        puzzles)
        elapsed-ms (/ (- (System/nanoTime) start) 1e6)
        elapsed-s (/ elapsed-ms 1000)
        puzzles-per-sec (if (> elapsed-s 0) (/ (count puzzles) elapsed-s) 0)]
    (assoc results
           :elapsed-ms (double elapsed-ms)
           :elapsed-s (double elapsed-s)
           :puzzles-per-sec (double puzzles-per-sec)
           :puzzle-count (count puzzles)
           :errors @error-count)))

(defn run-analysis
  "Run analysis on all sample files in a directory"
  [sample-dir mode]
  (let [sample-files (list-sample-files sample-dir)]
    (if (empty? sample-files)
      (println (str "ERROR: No .edn sample files found in " sample-dir))
      (do
        (println "\n" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=")
        (println "SAMPLE-BASED PERFORMANCE ANALYSIS")
        (println (format "Sample directory: %s" sample-dir))
        (println (format "Mode: %s" mode))
        (println (format "Number of samples: %d" (count sample-files)))
        (println "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "\n")
        
        (let [pass-results (for [sample-file sample-files]
                             (do
                               (let [sample-num (-> (.getName sample-file)
                                                    (clojure.string/replace #"sample_" "")
                                                    (clojure.string/replace #".edn" ""))]
                                 (print (str "  Sample " sample-num "..."))
                                 (flush)
                                 (let [puzzles (load-sample-file (.getAbsolutePath sample-file))
                                       result (analyze-sample puzzles mode)]
                                   (println (format " %d puzzles in %.2fs (%.1f p/s)"
                                                   (:puzzle-count result)
                                                   (:elapsed-s result)
                                                   (:puzzles-per-sec result)))
                                   (assoc result :sample-num sample-num)))))]
          
          ; Calculate statistics
          (let [timings (map :elapsed-s pass-results)
                speeds (map :puzzles-per-sec pass-results)
                avg-time (double (/ (reduce + timings) (count timings)))
                avg-speed (double (/ (reduce + speeds) (count speeds)))
                min-time (double (apply min timings))
                max-time (double (apply max timings))
                min-speed (double (apply min speeds))
                max-speed (double (apply max speeds))
                total-time (reduce + timings)
                total-puzzles (reduce + (map :puzzle-count pass-results))
                total-errors (reduce + (map :errors pass-results))]
            
            (println "\n" "STATISTICS:")
            (println (format "  Total samples: %d" (count pass-results)))
            (println (format "  Total puzzles analyzed: %d" total-puzzles))
            (println (format "  Total time: %.2f seconds" total-time))
            (println (format "  Average time per sample: %.2f seconds" avg-time))
            (println (format "  Min/Max time: %.2f - %.2f seconds" min-time max-time))
            (println (format "  Average speed: %.1f puzzles/second" avg-speed))
            (println (format "  Min/Max speed: %.1f - %.1f puzzles/second" min-speed max-speed))
            (if (> total-errors 0)
              (println (format "  Total errors: %d" total-errors)))
            (println (format "  Estimated time for 1M puzzles: %.0f seconds (~%.1f hours)"
                            (/ 1000000 avg-speed)
                            (/ 1000000 avg-speed 3600)))
            (println "\n")))))))

(defn -main
  "Entry point: Analyze pre-generated sample files
   Usage: lein run -m sudoku-clj.patterns.sample-analysis [sample-dir] [mode]
   sample-dir: directory with .edn sample files (default: samples/)
   mode: :full, :band-stack, or :geometric-only (default: :full)"
  [& args]
  (let [sample-dir (if (> (count args) 0) (first args) "samples")
        mode (if (> (count args) 1) 
              (keyword (second args))
              :full)]
    (run-analysis sample-dir mode)))
