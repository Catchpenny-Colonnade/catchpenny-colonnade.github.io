(ns word-tools.subsets
  (:require [word-tools.util :as util]))

(defn build-subset-map
  "For each key with length = letter-count, map to all keys that are subsets"
  [wordgroups letter-count]
  (let [all-keys (map name (keys wordgroups))
        filtered-keys (filter #(= (count %) letter-count) all-keys)]
    (into {}
          (map
           (fn [key]
             (println (str "Processing key: " key))
             [key (vec (filter #(and (> (count key) (count %))
                                     (util/is-subset? % key))
                               all-keys))])
           filtered-keys))))

(defn generate-subset-map
  "Loads wordgroups and generates subset map, outputs to JSON"
  [letter-count input-file output-file]
  (println (str "Reading from: " input-file))
  (let [wordgroups (util/read-json input-file)
        subset-map (build-subset-map wordgroups letter-count)]
    (println (str "Found " (count subset-map) " groups with " letter-count " unique characters"))
    (util/output-json output-file subset-map)
    (println (str "Output written to: " output-file))))
