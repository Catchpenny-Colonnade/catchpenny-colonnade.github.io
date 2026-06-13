(ns sudoku-research.file.io-test
  (:require [clojure.test :refer [deftest is testing]]
            [clojure.string :as str]
            [sudoku-research.file.io :as file-io])
  (:import [java.io File FileNotFoundException]))

;; ========== Unit Tests: Error Handling ==========
;; These tests focus on error handling without requiring actual files.
;; File I/O is tested in integration tests (see integration-test/sudoku_research/external/file_io_test.clj)

(deftest ^:unit read-json-file-not-found-test
  "Test that reading a non-existent file throws ex-info with details."
  (testing "Non-existent file throws ex-info with file-path metadata"
    (try
      (file-io/read-json-file "/nonexistent/path/file.json")
      (is false "Should have thrown exception")
      (catch Exception e
        (let [data (ex-data e)]
          (is (string? (ex-message e)))
          (is (= :file-path (-> data keys first)))
          (is (string? (:file-path data))))))))

(deftest ^:unit read-json-file-includes-file-path-in-message-test
  "Test that error message includes the file path."
  (testing "Error message mentions the file path"
    (try
      (file-io/read-json-file "/some/missing/file.json")
      (catch Exception e
        (is (str/includes? (ex-message e) "/some/missing/file.json"))))))

(deftest ^:unit list-json-files-not-directory-test
  "Test that listing files from a file path throws ex-info."
  (testing "File path instead of directory throws ex-info"
    (try
      (file-io/list-json-files "sudoku/sudoku-research/test-resources/test-data/file.txt")
      (catch Exception e
        (let [data (ex-data e)]
          (is (string? (ex-message e)))
          (is (= :path (-> data keys first)))
          (is (string? (:path data))))))))

(deftest ^:unit list-json-files-nonexistent-path-test
  "Test that listing files from non-existent path throws ex-info."
  (testing "Non-existent path throws ex-info with path metadata"
    (try
      (file-io/list-json-files "/completely/nonexistent/path")
      (catch Exception e
        (let [data (ex-data e)]
          (is (string? (ex-message e)))
          (is (= :path (-> data keys first)))
          (is (string? (:path data))))))))

(deftest ^:unit list-json-files-error-message-mentions-path-test
  "Test that error message mentions the path."
  (testing "Error message includes the directory path"
    (try
      (file-io/list-json-files "/some/path/that/is/not/a/directory")
      (catch Exception e
        (is (str/includes? (ex-message e) "not a directory"))))))
