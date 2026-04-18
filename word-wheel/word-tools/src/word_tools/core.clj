(ns word-tools.core
  (:gen-class)
  (:require [word-tools.grouping :as grouping]
            [word-tools.subsets :as subsets]
            [word-tools.analysis :as analysis]))

(defn -main
  "Main entry point for the word-tools CLI
   
   Mode 1 - Generate word groups from wordlist:
     lein run [input-file] [output-file]
     Defaults: input=resources/wordlist.txt, output=resources/wordgroups.json
   
   Mode 2 - Generate subset map:
     lein run <5|6|7> [input-file] [output-file]
     Finds all character sets of the given length and maps them to their subsets.
     Defaults: input=resources/wordgroups.json, 
               output=resources/wordsets-<letter-count>.json
   
   Mode 3 - Analyze word counts by length:
     lein run analyze <5|6|7> [wordsets-file] [wordgroups-file] [output-file]
     Analyzes word counts grouped by length for each charset.
     Defaults: wordsets=resources/wordsets-<letter-count>.json,
               wordgroups=resources/wordgroups.json,
               output=resources/wordcounts-<letter-count>.json"
  [& args]
  (let [first-arg (first args)
        second-arg (second args)]
    (cond
      ;; Analyze word counts mode
      (= first-arg "analyze")
      (let [letter-count (Integer/parseInt second-arg)
            wordsets-file (or (nth args 2 nil) (str "resources/wordsets-" letter-count ".json"))
            wordgroups-file (or (nth args 3 nil) "resources/wordgroups.json")
            output-file (or (nth args 4 nil) (str "resources/wordcounts-" letter-count ".json"))]
        (analysis/generate-word-count-analysis letter-count wordsets-file wordgroups-file output-file))
      
      ;; Subset map generation mode (letter count: 5, 6, or 7)
      (and first-arg (re-matches #"[567]" first-arg))
      (let [letter-count (Integer/parseInt first-arg)
            [input-file output-file] (rest args)
            input-file (or input-file "resources/wordgroups.json")
            output-file (or output-file (str "resources/wordsets-" letter-count ".json"))]
        (subsets/generate-subset-map letter-count input-file output-file))
      
      ;; Original wordlist processing mode
      :else
      (let [input-file (or first-arg "resources/wordlist.txt")
            output-file (or (second args) "resources/wordgroups.json")]
        (grouping/process-wordlist input-file output-file)))))

