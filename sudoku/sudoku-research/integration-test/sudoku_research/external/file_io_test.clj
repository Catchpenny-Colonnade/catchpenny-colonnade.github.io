(ns sudoku-research.external.file-io-test
  (:require [clojure.test :refer [deftest is testing]]
            [sudoku-research.file.io :as file-io]))

;; ========== Test Resources Path ==========
;; Base path to test-resources directory. Modify this constant to change the root path.
(def ^:private test-resources-path "test-resources")

;; ========== Integration Tests: Real File I/O ==========
;; These tests use actual files from the test-resources directory.
;; They verify the behavior of reading and listing real files on disk.

(deftest ^:integration read-json-file-success-test
  "Test successful reading and parsing of a valid JSON file."
  (testing "Valid JSON file returns parsed data"
    (let [result (file-io/read-json-file (str test-resources-path "/test-data/valid.json"))]
      (is (map? result))
      (is (= "data" (:test result))))))

(deftest ^:integration read-json-file-invalid-json-test
  "Test that reading a file with invalid JSON throws ex-info."
  (testing "Invalid JSON throws ex-info with message and cause"
    (try
      (file-io/read-json-file (str test-resources-path "/test-data/invalid.json"))
      (is false "Should have thrown exception")
      (catch Exception e
        (let [data (ex-data e)]
          (is (string? (ex-message e)))
          (is (= :file-path (-> data keys first)))
          (is (string? (:file-path data)))
          (is (instance? Exception (ex-cause e))))))))

(deftest ^:integration list-json-files-valid-directory-test
  "Test that valid directory returns list of JSON files."
  (testing "Valid directory with JSON files returns sorted list"
    (let [result (file-io/list-json-files (str test-resources-path "/test-data"))]
      (is (sequential? result))
      (is (every? string? result))
      (is (every? #(.endsWith % ".json") result))
      (is (> (count result) 0) "Should have at least one JSON file"))))

(deftest ^:integration list-json-files-empty-directory-test
  "Test that empty directory returns empty list."
  (testing "Empty directory returns empty sequence"
    (let [result (file-io/list-json-files (str test-resources-path "/empty-dir"))]
      (is (sequential? result))
      (is (empty? result)))))

(deftest ^:integration list-json-files-mixed-files-test
  "Test that directory with mixed file types only returns JSON files."
  (testing "Mixed directory returns only .json files, sorted by name"
    (let [result (file-io/list-json-files (str test-resources-path "/test-data"))]
      (is (sequential? result))
      (is (every? #(.endsWith % ".json") result))
      (is (= (sort result) result) "Files should be sorted by name")
      (is (some #(.endsWith % "valid.json") result) "Should include valid.json")
      (is (some #(.endsWith % "z-last.json") result) "Should include z-last.json"))))
