(ns sudoku-clj.analysis-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.analysis :as analysis]))

(deftest collect-difficulty-stats-test
  (testing "Collects statistics from puzzle batch"
    (let [easy-puzzles ["534678912672195348198342567859761423426853791713924856961537284287419635345286179"
                       "003020008800004006060309010304051087007805039018076203010609700700200100800710400"]
          stats (analysis/collect-difficulty-stats easy-puzzles)]
      (is (= 2 (:total stats)))
      (is (map? (:by-tier stats))))))

(deftest load-and-analyze-file-test
  (testing "Loads and analyzes a puzzle file"
    (let [result (analysis/load-and-analyze-file "resources/puzzles/index00.json")]
      (is (not (nil? result)))
      (is (> (:total result) 500)))))

(deftest analyze-limited-test
  (testing "Analyzes a limited number of files"
    (let [stats (analysis/analyze-all-files 1)]
      (is (> (:total-files stats) 0))
      (is (> (:total-puzzles stats) 500)))))
