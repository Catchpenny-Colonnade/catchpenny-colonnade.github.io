(ns sudoku-clj.core-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.core :refer :all]))

;; Tests for core module entry points
(deftest main-runs
  (testing "Main function can be called without errors"
    (is (nil? (-main)))))

