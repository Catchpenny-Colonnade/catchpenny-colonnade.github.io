(ns word-tools.analysis
  (:require [word-tools.util :as util]))

(defn get-words-for-charsets
  "Get all words from wordgroups for a list of character sets"
  [charsets wordgroups]
  (let [charset-keys (map keyword charsets)]
    (reduce concat (keep #(get wordgroups %) charset-keys))))

(defn group-and-count-by-length
  "Group words by length and return map of length -> count"
  [words]
  (reduce (fn [acc word]
            (let [len (count word)]
              (update acc len (fn [c] (inc (or c 0))))))
          {}
          words))

(defn analyze-word-counts
  "Load wordsets and wordgroups, analyze word counts by length for each charset"
  [letter-count wordsets-file wordgroups-file]
  (println (str "Reading from: " wordsets-file))
  (println (str "Reading from: " wordgroups-file))
  (let [wordsets (util/read-json wordsets-file)
        wordgroups (util/read-json wordgroups-file)
        
        ;; For each key in wordsets, get the word counts by length
        counts-per-key (into {}
                         (map (fn [[charset subsets]]
                                (let [all-charsets (conj subsets charset)
                                      words (get-words-for-charsets all-charsets wordgroups)
                                      counts (group-and-count-by-length words)]
                                  (println (str "  " charset ": " (count words) " words"))
                                  [charset counts]))
                              wordsets))
        
        ;; Aggregate max count for each word length across all charsets
        all-lengths (set (mapcat keys (vals counts-per-key)))
        aggregated (into (sorted-map)
                        (map (fn [len]
                               [len (apply max (map #(get % len 0) (vals counts-per-key)))])
                             all-lengths))]
    aggregated))

(defn generate-word-count-analysis
  "Analyze and output word count statistics"
  [letter-count wordsets-file wordgroups-file output-file]
  (let [analysis (analyze-word-counts letter-count wordsets-file wordgroups-file)]
    (println (str "Found " (count analysis) " word lengths"))
    (util/output-json output-file analysis)
    (println (str "Output written to: " output-file))))
