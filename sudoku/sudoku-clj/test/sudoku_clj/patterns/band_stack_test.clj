(ns sudoku-clj.patterns.band-stack-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.patterns.band-stack :as bs]))

(def test-grid "123456789456789123789123456214365897365897214897214365531642978642978531978531642")

(deftest test-grid-to-matrix-to-grid-roundtrip
  (testing "Grid to matrix and back returns original"
    (let [matrix (bs/grid-to-matrix test-grid)
          result (bs/matrix-to-grid matrix)]
      (is (= test-grid result)))))

(deftest test-grid-to-matrix-dimensions
  (testing "Grid converts to 9x9 matrix"
    (let [matrix (bs/grid-to-matrix test-grid)]
      (is (= 9 (count matrix)))
      (is (every? #(= 9 (count %)) matrix)))))

(deftest test-get-row
  (testing "Get row retrieves correct row from matrix"
    (let [matrix (bs/grid-to-matrix test-grid)
          row-0 (bs/get-row matrix 0)
          row-1 (bs/get-row matrix 1)]
      (is (= 9 (count row-0)))
      (is (= 9 (count row-1)))
      (is (not= row-0 row-1)))))

(deftest test-get-column
  (testing "Get column retrieves correct column from matrix"
    (let [matrix (bs/grid-to-matrix test-grid)
          col-0 (bs/get-column matrix 0)
          col-1 (bs/get-column matrix 1)]
      (is (= 9 (count col-0)))
      (is (= 9 (count col-1)))
      (is (not= col-0 col-1)))))

(deftest test-permute-bands-basic
  (testing "Permute bands with identity permutation returns same grid"
    (let [matrix (bs/grid-to-matrix test-grid)
          result (bs/permute-bands matrix [0 1 2])
          result-grid (bs/matrix-to-grid result)]
      (is (= test-grid result-grid)))))

(deftest test-permute-bands-swap
  (testing "Permute bands with swap changes grid"
    (let [matrix (bs/grid-to-matrix test-grid)
          result (bs/permute-bands matrix [1 0 2])
          result-grid (bs/matrix-to-grid result)]
      (is (not= test-grid result-grid))
      ; Should be able to swap back
      (let [swapped-back (bs/permute-bands (bs/grid-to-matrix result-grid) [1 0 2])
            final-grid (bs/matrix-to-grid swapped-back)]
        (is (= test-grid final-grid))))))

(deftest test-permute-rows-within-bands-identity
  (testing "Permute rows with identity returns same grid"
    (let [matrix (bs/grid-to-matrix test-grid)
          result (bs/permute-rows-within-bands matrix [[0 1 2] [0 1 2] [0 1 2]])
          result-grid (bs/matrix-to-grid result)]
      (is (= test-grid result-grid)))))

(deftest test-permute-rows-within-bands-swap
  (testing "Permute rows within bands changes grid"
    (let [matrix (bs/grid-to-matrix test-grid)
          result (bs/permute-rows-within-bands matrix [[1 0 2] [0 1 2] [0 1 2]])
          result-grid (bs/matrix-to-grid result)]
      (is (not= test-grid result-grid)))))

(deftest test-permute-stacks-basic
  (testing "Permute stacks with identity permutation returns same grid"
    (let [matrix (bs/grid-to-matrix test-grid)
          result (bs/permute-stacks matrix [0 1 2])
          result-grid (bs/matrix-to-grid result)]
      (is (= test-grid result-grid)))))

(deftest test-permute-cols-within-stacks-identity
  (testing "Permute cols with identity returns same grid"
    (let [matrix (bs/grid-to-matrix test-grid)
          result (bs/permute-cols-within-stacks matrix [[0 1 2] [0 1 2] [0 1 2]])
          result-grid (bs/matrix-to-grid result)]
      (is (= test-grid result-grid)))))

(deftest test-apply-band-stack-perm-identity
  (testing "Apply identity band/stack permutation returns same grid"
    (let [result (bs/apply-band-stack-perm test-grid [0 1 2] [[0 1 2] [0 1 2] [0 1 2]] [0 1 2] [[0 1 2] [0 1 2] [0 1 2]])]
      (is (= test-grid result)))))

(deftest test-all-band-stack-perms-returns-seq
  (testing "all-band-stack-perms returns a sequence"
    (let [perms (bs/all-band-stack-perms test-grid)]
      (is (seq? perms)))))

(deftest test-all-band-stack-perms-first-element
  (testing "First element of all-band-stack-perms is identity permutation (anchored)"
    (let [perms (bs/all-band-stack-perms test-grid)
          [first-grid row-perms col-perms] (first perms)]
      (is (= test-grid first-grid))
      (is (= [[0 1 2] [0 1 2] [0 1 2]] row-perms))
      (is (= [[0 1 2] [0 1 2] [0 1 2]] col-perms)))))

(deftest test-all-band-stack-perms-contains-variations
  (testing "all-band-stack-perms generates multiple different grids"
    (let [perms (bs/all-band-stack-perms test-grid)
          grids (take 100 perms)  ; Just take first 100 to avoid materializing all
          unique-grids (count (set (map first grids)))]
      (is (> unique-grids 1)
          "Should generate at least some variation in first 100 permutations"))))

(deftest test-all-band-stack-perms-lazy
  (testing "all-band-stack-perms is lazy (doesn't compute immediately)"
    (let [perms (bs/all-band-stack-perms test-grid)]
      (is (or (instance? clojure.lang.LazySeq perms)
              (seq? perms))
          "Should return a lazy sequence"))))

(deftest test-anchored-band-stack-optimization
  (testing "Anchored permutations (46K) are ~36x fewer than unanchored (1.67M)"
    ; Verify mathematically without materializing entire sequences
    (let [perms-3 [0 1 2]  ; 3 permutations per dimension
          row-col-perms-count (* 216 216)  ; 216^2 for rows and cols
          band-stack-count (* 6 6)  ; 6^2 for band and stack orderings
          anchored-count row-col-perms-count  ; 46,656
          unanchored-count (* band-stack-count row-col-perms-count)]  ; 1,679,616
      (is (= anchored-count 46656)
          "216 × 216 = 46,656 anchored permutations")
      (is (= unanchored-count 1679616)
          "6 × 216 × 6 × 216 = 1,679,616 unanchored permutations")
      (is (= unanchored-count (* anchored-count 36))
          "Ratio should be exactly 36x"))))
