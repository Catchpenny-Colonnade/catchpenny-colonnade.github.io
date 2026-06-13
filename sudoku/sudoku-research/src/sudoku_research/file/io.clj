(ns sudoku-research.file.io
  (:require [clojure.java.io :as io]
            [clojure.data.json :as json]))

(defn read-json-file
  "Read a JSON file and parse it as Clojure data."
  [file-path]
  (try
    (with-open [reader (io/reader file-path)]
      (json/read reader :key-fn keyword))
    (catch Exception e
      (throw (ex-info (format "Failed to read JSON file: %s" file-path)
                      {:file-path file-path}
                      e)))))

(defn list-json-files
  "List all JSON files in the given directory, sorted by name."
  [dir-path]
  (let [dir (io/file dir-path)]
    (when-not (.isDirectory dir)
      (throw (ex-info "Path is not a directory" {:path dir-path})))
    (->> (.listFiles dir)
         (filter #(.isFile %))
         (filter #(.endsWith (.getName %) ".json"))
         (sort-by #(.getName %))
         (map #(.getAbsolutePath %)))))
