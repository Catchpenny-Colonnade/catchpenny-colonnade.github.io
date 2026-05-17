(ns sudoku-clj.solver-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.solver :refer :all]))

;; Test data: real puzzles and their known solutions from index00
(def test-puzzles
  [
   ;; Puzzle 1
   {:puzzle "004300209005009001070060043006002087190007400050083000600000105003508690042910300"
    :solution "864371259325849761971265843436192587198657432257483916689734125713528694542916378"}
   
   ;; Puzzle 2
   {:puzzle "000290040090007056687000001006028000530009000241003500020400008300700960005031700"
    :solution "153296847492817356687354291976528413538149672241673589729465138314782965865931724"}
   
   ;; Puzzle 3
   {:puzzle "000207500003800061069000480000001070500040003800503046005000320020708000097306150"
    :solution "148267539253894761769135482934681275576942813812573946685419327321758694497326158"}
   
   ;; Puzzle 4
   {:puzzle "590073000017060080000402050061700302840090000703200600605020001000680024008105900"
    :solution "594873216217569483386412759961758342842396175753241698675924831139687524428135967"}
   
   ;; Puzzle 5
   {:puzzle "219007050000400096800015007300800200720500468060040000000700030097032600105080040"
    :solution "219367854573428196846915327354876219721593468968241573682754931497132685135689742"}
   ])

(deftest solve-single-puzzle
  (testing "Solver can solve a simple puzzle"
    (let [test-case (first test-puzzles)
          result (solve (:puzzle test-case))]
      (is (= result (:solution test-case))))))

(deftest solve-multiple-puzzles
  (testing "Solver can solve multiple different puzzles"
    (doseq [test-case test-puzzles]
      (let [result (solve (:puzzle test-case))]
        (is (= result (:solution test-case))
            (str "Failed to solve puzzle: " (:puzzle test-case)))))))

(deftest puzzle-parsing
  (testing "Puzzle string is correctly parsed into a grid"
    (let [puzzle "004300209005009001070060043006002087190007400050083000600000105003508690042910300"
          grid (parse-puzzle puzzle)]
      ;; Should be a 9x9 grid
      (is (= (count grid) 9))
      (is (every? #(= (count %) 9) grid))
      ;; Check first few values from the puzzle string
      ;; Puzzle: 004300209... should give grid[0] = [0 0 4 3 0 0 2 0 9]
      (is (= (first grid) [0 0 4 3 0 0 2 0 9])))))

(deftest solution-validation
  (testing "Solution is a valid complete sudoku"
    (let [test-case (first test-puzzles)
          solution (:solution test-case)]
      ;; Convert solution string back to grid and validate
      (is (valid-solution? solution)))))
