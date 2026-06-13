(ns sudoku-research.utilities.test-config
  (:require [clojure.edn :as edn]
            [clojure.java.io :as io]))

(defn load-test-config-from-path
  "Load test data configuration from a given file path.
   Accepts either a string path or java.io.File.
   Returns config map with :test-data-dir key."
  [config-path]
  (try
    (let [config-file (io/file config-path)]
      (if (.exists config-file)
        (with-open [reader (io/reader config-file)]
          (edn/read (java.io.PushbackReader. reader)))
        (do
          (println (format "[WARN] Config file not found at: %s" config-path))
          {:test-data-dir "test-resources/test-data"})))
    (catch Exception e
      (do
        (println (format "[WARN] Failed to load test config from %s: %s" config-path (.getMessage e)))
        {:test-data-dir "test-resources/test-data"}))))

(defn get-test-data-dir-from-config
  "Get the test data directory path from a config file.
   Accepts config file path as parameter for testing flexibility."
  [config-path]
  (:test-data-dir (load-test-config-from-path config-path)))

;; ============================================================================
;; Runtime wrapper (for src/ code that needs test config)
;; ============================================================================

(defn load-test-config
  "Load test data configuration from test-resources/test-data-config.edn.
   For runtime use; test code should use load-test-config-from-path instead."
  []
  (try
    (let [config-file (io/resource "test-data-config.edn")]
      (if config-file
        (with-open [reader (io/reader config-file)]
          (edn/read (java.io.PushbackReader. reader)))
        (do
          (println "[WARN] test-data-config.edn not found in resources")
          {:test-data-dir "test-resources/test-data"})))
    (catch Exception e
      (do
        (println (format "[WARN] Failed to load test config from resources: %s" (.getMessage e)))
        {:test-data-dir "test-resources/test-data"}))))

(defn get-test-data-dir
  "Get the test data directory path from config (runtime).
   For src/ code; test code should use get-test-data-dir-from-config instead."
  []
  (:test-data-dir (load-test-config)))
