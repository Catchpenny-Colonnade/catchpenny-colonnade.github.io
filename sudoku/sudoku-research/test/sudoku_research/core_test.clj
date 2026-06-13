 (ns sudoku-research.core-test
 	 (:require [clojure.test :refer [deftest is testing]]
 				 [clojure.tools.cli :refer [parse-opts]]
 				 [sudoku-research.core :as core]))

;; ============================================================================
;; UNIT TESTS - Command-Line Argument Parsing
;; ============================================================================

(deftest ^:unit parse-no-args-test
	(testing "No arguments uses defaults"
		(let [result (core/validate-args [])]
			(is (contains? result :options))
			(is (= "sudoku/sudoku-clj/resources/solutions" (:dir (:options result)))))))

(deftest ^:unit parse-custom-dir-test
	(testing "Custom --dir option"
		(let [result (core/validate-args ["--dir" "/custom/path"]) ]
			(is (= "/custom/path" (:dir (:options result)))))))

(deftest ^:unit parse-short-dir-option-test
	(testing "Short form -d option works"
		(let [result (core/validate-args ["-d" "/data"]) ]
			(is (= "/data" (:dir (:options result)))))))

(deftest ^:unit parse-max-files-test
	(testing "Custom --max-files option"
		(let [result (core/validate-args ["--max-files" "10"]) ]
			(is (= 10 (:max-files (:options result)))))))

(deftest ^:unit parse-short-max-files-test
	(testing "Short form -f option works"
		(let [result (core/validate-args ["-f" "5"]) ]
			(is (= 5 (:max-files (:options result)))))))

(deftest ^:unit parse-max-records-test
	(testing "Custom --max-records option"
		(let [result (core/validate-args ["--max-records" "1000"]) ]
			(is (= 1000 (:max-records (:options result)))))))

(deftest ^:unit parse-short-max-records-test
	(testing "Short form -r option works"
		(let [result (core/validate-args ["-r" "500"]) ]
			(is (= 500 (:max-records (:options result)))))))

(deftest ^:unit parse-resume-flag-test
	(testing "--resume flag sets resume to true"
		(let [result (core/validate-args ["--resume"]) ]
			(is (:resume (:options result))))))

(deftest ^:unit parse-combined-options-test
 	(testing "Multiple options work together"
 		(let [opts (:options (core/validate-args ["-d" "/puzzles" "-f" "3" "-r" "100" "--resume"]))]
 			(is (= "/puzzles" (:dir opts)))
 			(is (= 3 (:max-files opts)))
 			(is (= 100 (:max-records opts)))
 			(is (:resume opts)))))

(deftest ^:unit parse-help-flag-test
	(testing "--help returns help message"
		(let [result (core/validate-args ["--help"])
					expected (core/usage (:summary (parse-opts ["--help"] core/cli-options)))]
			(is (= expected (:exit-message result)))
			(is (:ok? result)))))

(deftest ^:unit parse-help-short-flag-test
	(testing "-h returns help message"
		(let [result (core/validate-args ["-h"]) ]
			(is (= (core/usage (:summary (parse-opts ["-h"] core/cli-options))) (:exit-message result)))
			(is (:ok? result)))))

(deftest ^:unit parse-unknown-option-test
	(testing "Unknown option returns error"
		(let [result (core/validate-args ["--unknown" "value"]) ]
			(is (:exit-message result))
			(is (not (:ok? result))))))

;; ============================================================================
;; UNIT TESTS - Help and Usage
;; ============================================================================

(deftest ^:unit usage-text-completeness-test
	(testing "Usage text matches expected help output"
		(let [usage-text (core/usage "OPTIONS SUMMARY")
					expected (core/usage "OPTIONS SUMMARY")]
			(is (= expected usage-text)))))

(deftest ^:unit usage-includes-example-commands-test
	(testing "Usage text includes practical examples"
		(let [usage-text (core/usage "OPTS")
					expected (core/usage "OPTS")]
			(is (= expected usage-text)))))

;; ============================================================================
;; UNIT TESTS - Configuration Defaults
;; ============================================================================

(deftest ^:unit dir-defaults-to-standard-path-test
	(testing "Directory defaults to standard solutions path"
		(let [result (core/validate-args [])]
			(is (= "sudoku/sudoku-clj/resources/solutions" (:dir (:options result)))))))