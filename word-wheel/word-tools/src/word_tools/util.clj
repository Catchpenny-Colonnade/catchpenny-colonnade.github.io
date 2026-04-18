(ns word-tools.util
  (:require [clojure.string :as str]
            [clojure.set :as set]
            [cheshire.core :as json]))

(defn get-char-set
  "Returns the set of unique characters in a word (lowercase)"
  [word]
  (apply str (set (str/lower-case word))))

(defn read-json
  "Reads JSON from a file"
  [filepath]
  (json/parse-string (slurp filepath) true))

(defn output-json
  "Writes data structure to file as JSON"
  [filepath data]
  (spit filepath (json/generate-string data {:pretty true})))

(defn is-subset?
  "Check if all characters in char-set-1 are in char-set-2"
  [char-set-1 char-set-2]
  (set/subset? (set char-set-1) (set char-set-2)))
