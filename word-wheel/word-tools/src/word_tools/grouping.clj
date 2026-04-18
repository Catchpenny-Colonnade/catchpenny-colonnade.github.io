(ns word-tools.grouping
  (:require [clojure.string :as str]
            [clojure.java.io :as io]
            [word-tools.util :as util]))

(defn read-wordlist
  "Reads words from a file, returns seq of non-empty lines"
  [filepath]
  (with-open [reader (io/reader filepath)]
    (doall
      (filter (comp not str/blank?)
              (line-seq reader)))))

(defn group-by-chars
  "Groups words by their character set, filters groups with > 7 unique chars"
  [words]
  (->> words
       (group-by util/get-char-set)
       (filter (fn [[char-set _words]] (<= (count char-set) 7)))
       (into {})))

(defn process-wordlist
  "Processes a wordlist file and outputs word groups as JSON"
  [input-file output-file]
  (println (str "Reading from: " input-file))
  (let [words (read-wordlist input-file)
        grouped (group-by-chars words)]
    (println (str "Found " (count grouped) " groups with <= 7 unique characters"))
    (util/output-json output-file grouped)
    (println (str "Output written to: " output-file))))
