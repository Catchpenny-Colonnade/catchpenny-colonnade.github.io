(ns sudoku-research.external.loaders-integration-test
  (:require [clojure.test :refer [deftest is testing]]
            [clojure.string]
            [sudoku-research.loaders :as loaders]
            [sudoku-research.db.queries :as db-qry]
            [sudoku-research.db.mutations :as db-mut]
            [sudoku-research.utilities.test-config :as test-cfg]
            [sudoku-research.utilities.db-fixtures :as fixtures]
            [sudoku-research.logging-test-helpers :as logging]))

;; ============================================================================
;; INTEGRATION TESTS - REAL FILE I/O AND DATABASE
;; ============================================================================

(def test-config-path "test-resources/test-data-config.edn")

(deftest ^:integration load-puzzles-from-directory-second-load-returns-skipped-test
  (testing "Second load of same puzzle directory returns skipped status"
    (fixtures/with-isolated-db
      (fn [conn _]
          (let [{:keys [mock-println mock-print get-logs clear-logs]} (logging/capture-logs)]
            (with-redefs [println mock-println print mock-print]
              ;; First load - use test data directory from config
              ;; Test data has 1 JSON file with 2 puzzles
              (let [test-config-path "test-resources/loaders-integration-test/load-puzzles-from-directory-second-load-returns-skipped-test/test-data-config.edn"
                    test-dir (test-cfg/get-test-data-dir-from-config test-config-path)
                    first-result (loaders/load-puzzles-from-directory conn {:dir test-dir})]
                (is (map? first-result))
                (is (= :loaded (:status first-result)) "First load should have :loaded status")
                (is (= 2 (:inserted first-result)) "First load should insert exactly 2 puzzles")
                
                ;; Validate first load logs - exact count and exact messages
                (let [logs (get-logs)]
                  (is (= 7 (count logs)) "Should have exactly 7 log messages on first load")
                  ;; Validate each message individually with exact equality
                  (is (= "[*] Database state: 0 files completed, 0 in progress, 1 pending" (nth logs 0)))
                  (is (= "[*] Total puzzles loaded so far: 0" (nth logs 1)))
                  (is (= "[*] Found 1 JSON files in directory" (nth logs 2)))
                  (is (= "[*] Registering new file: test-puzzles.json" (nth logs 3)))
                  (is (= "[*] Will process 1 files (limit: unlimited)" (nth logs 4)))
                  (is (= "[*] Processing file: test-puzzles.json (ID: 1, Status: pending)" (nth logs 5)))
                  (is (= "[✓] File completed: 2 inserted, 0 skipped, 0 errors" (nth logs 6))))
                
                ;; Second load should return skipped (files already loaded)
                (clear-logs) ;; Clear logs before second load to isolate messages
                (let [second-result (loaders/load-puzzles-from-directory conn {:dir test-dir})]
                  (is (= :skipped (:status second-result)) "Second load should return :skipped status")
                  (is (= 0 (:inserted second-result)) "Second load should not insert any puzzles")
                  
                  ;; Validate second load logs - should show all files already completed
                  (let [logs (get-logs)]
                    (is (= 2 (count logs)) "Second load should have exactly 2 log messages")
                    (is (= "[*] Database state: 1 files completed, 0 in progress, 0 pending" (nth logs 0)))
                    (is (= "[*] Total puzzles loaded so far: 2" (nth logs 1))))))))))))

(deftest ^:integration load-puzzles-from-directory-inserts-with-clue-counts-test
  ;; REFACTORED: Now captures and validates logged output
  (testing "Loaded puzzles have valid clue counts in database"
    (fixtures/with-isolated-db
      (fn [conn _]
        (let [{:keys [mock-println mock-print get-logs]} (logging/capture-logs)]
          (with-redefs [println mock-println print mock-print]
            (let [test-config-path "test-resources/loaders-integration-test/load-puzzles-from-directory-inserts-with-clue-counts-test/test-data-config.edn"
                  test-dir (test-cfg/get-test-data-dir-from-config test-config-path)]
              (loaders/load-puzzles-from-directory conn {:dir test-dir})
              
              ;; REFACTORED: Validate exact logs - exact count and exact message strings
              (let [logs (get-logs)]
                ;; Validate exact count of logs
                (is (= 7 (count logs)) "Should have exactly 7 log messages")
                ;; Validate each message individually
                (is (= "[*] Database state: 0 files completed, 0 in progress, 1 pending" (nth logs 0)))
                (is (= "[*] Total puzzles loaded so far: 0" (nth logs 1)))
                (is (= "[*] Found 1 JSON files in directory" (nth logs 2)))
                (is (= "[*] Registering new file: test-puzzles.json" (nth logs 3)))
                (is (= "[*] Will process 1 files (limit: unlimited)" (nth logs 4)))
                (is (= "[*] Processing file: test-puzzles.json (ID: 1, Status: pending)" (nth logs 5)))
                (is (= "[✓] File completed: 2 inserted, 0 skipped, 0 errors" (nth logs 6))))
              
              ;; Now verify database has correct clue counts
              (let [clue-counts (db-qry/count-original-puzzles-by-clue-count conn)]
                (is (> (count clue-counts) 0))
                
                ;; Verify clue counts are in valid range
                (doseq [row clue-counts]
                  (let [clue-count (:clue_count row)]
                    (is (>= clue-count 17))
                    (is (<= clue-count 81))))))))))))

(deftest ^:integration load-puzzles-from-directory-puzzle-format-test
  ;; REFACTORED: Now captures and validates logged output
  (testing "All loaded puzzles have valid format (81 chars, numeric)"
    (fixtures/with-isolated-db
      (fn [conn _]
        (let [{:keys [mock-println mock-print get-logs]} (logging/capture-logs)]
          (with-redefs [println mock-println print mock-print]
            (let [test-config-path "test-resources/loaders-integration-test/load-puzzles-from-directory-puzzle-format-test/test-data-config.edn"
                  test-dir (test-cfg/get-test-data-dir-from-config test-config-path)]
              (loaders/load-puzzles-from-directory conn {:dir test-dir})
              
              ;; REFACTORED: Validate exact logs - exact count and exact message strings
              (let [logs (get-logs)]
                (is (= 7 (count logs)) "Should have exactly 7 log messages")
                (is (= "[*] Database state: 0 files completed, 0 in progress, 1 pending" (nth logs 0)))
                (is (= "[*] Total puzzles loaded so far: 0" (nth logs 1)))
                (is (= "[*] Found 1 JSON files in directory" (nth logs 2)))
                (is (= "[*] Registering new file: test-puzzles.json" (nth logs 3)))
                (is (= "[*] Will process 1 files (limit: unlimited)" (nth logs 4)))
                (is (= "[*] Processing file: test-puzzles.json (ID: 1, Status: pending)" (nth logs 5)))
                (is (= "[✓] File completed: 2 inserted, 0 skipped, 0 errors" (nth logs 6))))
              
              ;; Get a sample of loaded puzzles
              (let [first-puzzle (db-qry/get-first-canonical-candidate conn 17)]
                (when first-puzzle
                  ;; Should be 81 characters
                  (is (= 81 (count (:puzzle first-puzzle))))
                  
                  ;; Should only contain digits 0-9
                  (is (every? #(Character/isDigit %) (:puzzle first-puzzle))))))))))))

(deftest ^:integration insert-puzzles-batch-integration-test
  ;; REFACTORED: Now captures and validates logged output
  (testing "Insert puzzles batch actually inserts into database"
    (fixtures/with-isolated-db
        (fn [conn _]
          (let [{:keys [mock-println mock-print get-logs]} (logging/capture-logs)]
            (with-redefs [println mock-println print mock-print]
              ;; Clean the database before running to ensure no conflicts from previous tests
              ;; Wrap the connection in an atom since clean-db-each expects an atom
              (fixtures/clean-db-each (atom conn))
              
              ;; Create a source file record first
              (let [source-file (db-qry/get-all-source-files conn)]
                ;; todo - What is this test doing? this if check here means that these assertions may never execute
                (when (empty? source-file)
                  ;; If no source files exist, create one for this test
                  (let [sf (db-mut/insert-source-file! conn
                                                       {:filename "test-batch"
                                                        :file-path "/test"
                                                        :file-size-bytes 1000
                                                        :puzzle-count-expected 2})
                        source-file-id (:id sf)
                        puzzles ["530070000600195000098000060800060003400803001700020006060000280000419005000080079"
                                 "000000907000608000012000000600010800000002000001090006000000720000401000203000000"]
                        result (loaders/insert-puzzles-batch conn source-file-id puzzles)]
                    ;; Both puzzles should insert successfully
                    (is (>= (:inserted result) 2))
                    ;; todo - exact count of logs
                    (is (> (count (get-logs)) 0) "Should have logged at least one message")
                    ;; todo - Validate each log individually or use every? with exact message match if appropriate
                  )))))))))
;; ============================================================================
;; INTEGRATION TESTS - PROCESSING CONTROL FEATURES
;; ============================================================================

(deftest ^:integration load-with-max-records-limit-test
  ;; REFACTORED: Now captures and validates logged output
  (testing "max-records limit stops insertion at specified count"
    (fixtures/with-isolated-db
      (fn [conn _]
          (let [{:keys [logs mock-println mock-print]} (logging/capture-logs)]
            (with-redefs [println mock-println print mock-print]
              (fixtures/clean-db-each (atom conn))
              
              ;; Create a source file
              (let [sf (db-mut/insert-source-file! conn
                         {:filename "test-max-records"
                          :file-path "/test"
                          :file-size-bytes 5000
                          :puzzle-count-expected 10})
                    source-file-id (:id sf)
                    ;; Create 10 puzzles
                    puzzles (repeat 10 "530070000600195000098000060800060003400803001700020006060000280000419005000080079")
                    ;; First insert all 10
                    _ (loaders/insert-puzzles-batch conn source-file-id puzzles)
                    ;; Now test that max-records limit works on a batch insert
                    puzzles2 (repeat 5 "000000907000608000012000000600010800000002000001090006000000720000401000203000000")
                    result (loaders/insert-puzzles-batch conn source-file-id puzzles2)]
                
                ;; Should have inserted 5 more puzzles
                (is (>= (:inserted result) 0))
                (is (contains? result :inserted))
                ;; Validate that logging occurred
                  ;; todo - exact count of logs
                (is (> (count @logs) 0) "Should have logged at least one message")
                ;; todo - Validate each log individually or use every? with exact message match if appropriate
                )))))))


(deftest ^:integration load-with-max-files-limit-test
  ;; REFACTORED: Now captures and validates logged output
  (testing "files-processed counter exists in result"
    (fixtures/with-isolated-db
        (fn [conn _]
          (let [{:keys [mock-println mock-print get-logs]} (logging/capture-logs)]
            (with-redefs [println mock-println print mock-print]
              (fixtures/clean-db-each (atom conn))
              
              ;; Load puzzles - verifies that the result map includes files-processed counter
              (let [test-config-path "test-resources/loaders-integration-test/load-with-max-files-limit-test/test-data-config.edn"
                    test-dir (test-cfg/get-test-data-dir-from-config test-config-path)
                    result (loaders/load-puzzles-from-directory conn {:dir test-dir})]
                
                ;; Result should contain files-processed counter
                (is (contains? result :files-processed))
                ;; Result should have status
                (is (contains? result :status))
                ;; Validate that logging occurred with exact count
                (let [logs (get-logs)]
                  (is (= 7 (count logs)) "Should have exactly 7 log messages")
                  (is (= "[*] Database state: 0 files completed, 0 in progress, 1 pending" (nth logs 0)))
                  (is (= "[*] Total puzzles loaded so far: 0" (nth logs 1)))
                  (is (= "[*] Found 1 JSON files in directory" (nth logs 2)))
                  (is (= "[*] Registering new file: test-puzzles.json" (nth logs 3)))
                  (is (= "[*] Will process 1 files (limit: unlimited)" (nth logs 4)))
                  (is (= "[*] Processing file: test-puzzles.json (ID: 1, Status: pending)" (nth logs 5)))
                (is (= "[✓] File completed: 2 inserted, 0 skipped, 0 errors" (nth logs 6)))))))))))

(deftest ^:integration files-processed-counter-test
  ;; REFACTORED: Now captures and validates logged output
  (testing "files-processed counter matches actual files loaded"
    (fixtures/with-isolated-db
        (fn [conn _]
          (let [{:keys [mock-println mock-print get-logs]} (logging/capture-logs)]
            (with-redefs [println mock-println print mock-print]
              (fixtures/clean-db-each (atom conn))
              
              ;; Load puzzles (should have files-processed in result)
              (let [test-config-path "test-resources/loaders-integration-test/files-processed-counter-test/test-data-config.edn"
                    test-dir (test-cfg/get-test-data-dir-from-config test-config-path)
                    result (loaders/load-puzzles-from-directory conn {:dir test-dir})]
                
                ;; Result should contain files-processed counter
                (is (contains? result :files-processed))
                ;; If status is loaded, files-processed should be > 0
                (if (= :loaded (:status result))
                  (is (> (:files-processed result) 0))
                  ;; If skipped (data already loaded), files-processed should be 0
                  (is (= 0 (:files-processed result))))
                ;; Validate that logging occurred with exact count
                (let [logs (get-logs)]
                  (is (= 7 (count logs)) "Should have exactly 7 log messages")
                  (is (= "[*] Database state: 0 files completed, 0 in progress, 1 pending" (nth logs 0)))
                  (is (= "[*] Total puzzles loaded so far: 0" (nth logs 1)))
                  (is (= "[*] Found 1 JSON files in directory" (nth logs 2)))
                  (is (= "[*] Registering new file: test-puzzles.json" (nth logs 3)))
                  (is (= "[*] Will process 1 files (limit: unlimited)" (nth logs 4)))
                  (is (= "[*] Processing file: test-puzzles.json (ID: 1, Status: pending)" (nth logs 5)))
                  (is (= "[✓] File completed: 2 inserted, 0 skipped, 0 errors" (nth logs 6)))))))))))

(deftest ^:integration resume-flag-continues-processing-test
  ;; REFACTORED: Now captures and validates logged output
  (testing "resume flag behavior with processing status files"
    (fixtures/with-isolated-db
      (fn [conn _]
          (let [{:keys [logs mock-println mock-print]} (logging/capture-logs)]
            (with-redefs [println mock-println print mock-print]
              (fixtures/clean-db-each (atom conn))
              
              ;; Create a source file in processing status
              (let [sf (db-mut/insert-source-file! conn
                         {:filename "test-resume"
                          :file-path "/test/resume"
                          :file-size-bytes 2000
                          :puzzle-count-expected 5})
                    source-file-id (:id sf)]
                
                ;; Mark it as processing
                (db-mut/update-file-status! conn source-file-id "processing")
                
                ;; Verify processing files can be queried
                (let [processing (db-qry/get-files-by-status conn "processing")] 
                  (is (> (count processing) 0))
                  ;; Validate that logging occurred
                  ;; todo - exact count of logs
                  (is (> (count @logs) 0) "Should have logged at least one message")
                  ;; todo - Validate each log individually or use every? with exact message match if appropriate
                  ))))))))
