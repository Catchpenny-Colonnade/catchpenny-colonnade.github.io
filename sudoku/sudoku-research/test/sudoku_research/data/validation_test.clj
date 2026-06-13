(ns sudoku-research.data.validation-test
  (:require [clojure.test :refer [deftest is testing]]
            [sudoku-research.data.validation :as validation]))

;; ============================================================================
;; UNIT TESTS - Transform Key Validation
;; ============================================================================

(deftest ^:unit valid-transform-key-valid-keys-test
  (testing "valid-transform-key? accepts properly formatted transform keys"
    ;; Valid: rotation-index-row-order-column-order-symbol-translation
    (is (true? (validation/valid-transform-key? "00-012345678-012345678-123456789")))
    (is (true? (validation/valid-transform-key? "90-012345678-012345678-123456789")))))

(deftest ^:unit valid-transform-key-invalid-rotation-test
  (testing "valid-transform-key? rejects invalid rotation indices"
    ;; Rotation must be "00" (0°) or "90" (90°) only
    (is (false? (validation/valid-transform-key? "01-012345678-012345678-123456789")))
    (is (false? (validation/valid-transform-key? "91-012345678-012345678-123456789")))
    (is (false? (validation/valid-transform-key? "99-012345678-012345678-123456789")))))

(deftest ^:unit valid-transform-key-invalid-row-order-test
  (testing "valid-transform-key? validates row order section"
    ;; Must be exactly 9 digits 0-8
    (is (false? (validation/valid-transform-key? "00-01234567-012345678-123456789")))  ;; 8 digits
    (is (false? (validation/valid-transform-key? "00-0123456789-012345678-123456789")))  ;; 10 digits
    (is (false? (validation/valid-transform-key? "00-012345679-012345678-123456789")))  ;; digit 9 not allowed
    (is (false? (validation/valid-transform-key? "00-ABCDEFGHI-012345678-123456789")))))  ;; non-digits

(deftest ^:unit valid-transform-key-invalid-column-order-test
  (testing "valid-transform-key? validates column order section"
    (is (false? (validation/valid-transform-key? "00-012345678-01234567-123456789")))  ;; 8 digits
    (is (false? (validation/valid-transform-key? "00-012345678-0123456789-123456789")))  ;; 10 digits
    (is (false? (validation/valid-transform-key? "00-012345678-012345679-123456789")))))  ;; digit 9

(deftest ^:unit valid-transform-key-invalid-symbol-translation-test
  (testing "valid-transform-key? validates symbol translation section"
    ;; Must be exactly 9 digits 1-9
    (is (false? (validation/valid-transform-key? "00-012345678-012345678-12345678")))  ;; 8 digits
    (is (false? (validation/valid-transform-key? "00-012345678-012345678-1234567890")))  ;; 10 digits
    (is (false? (validation/valid-transform-key? "00-012345678-012345678-023456789")))  ;; digit 0 not allowed
    (is (false? (validation/valid-transform-key? "00-012345678-012345678-ABCDEFGHI")))))  ;; non-digits

(deftest ^:unit valid-transform-key-wrong-format-test
  (testing "valid-transform-key? rejects incorrectly formatted keys"
    (is (false? (validation/valid-transform-key? "00012345678012345678123456789")))  ;; missing separators
    (is (false? (validation/valid-transform-key? "00-012345678-012345678-123456789-extra")))  ;; extra section
    (is (false? (validation/valid-transform-key? "00-012345678-012345678")))  ;; missing symbol section
    (is (false? (validation/valid-transform-key? "invalid-key")))
    (is (false? (validation/valid-transform-key? "")))))

(deftest ^:unit valid-transform-key-nil-test
  (testing "valid-transform-key? handles nil gracefully"
    (is (false? (validation/valid-transform-key? nil)))))

;; ============================================================================
;; PROPERTY-BASED TESTS
;; ============================================================================

(deftest ^:unit valid-transform-key-all-valid-rotations-test
  (testing "All valid rotation indices pass validation"
    ;; Rotations: 0 → "00" (0°), 1 → "90" (90°)
    (doseq [[rotation rotation-str] [[0 "00"] [1 "90"]]]
      (is (true? (validation/valid-transform-key?
                   (format "%s-012345678-012345678-123456789" rotation-str)))))))

(deftest ^:unit valid-transform-key-order-permutations-test
  (testing "Valid permutations of rows/columns pass validation"
    ;; Test a few valid permutations with valid rotation values
    ;; Valid band/stack permutations must reorder groups {0,1,2}, {3,4,5}, {6,7,8}
    (is (true? (validation/valid-transform-key? "00-012345678-012345678-123456789")))
    (is (true? (validation/valid-transform-key? "90-345678012-012345678-123456789")))
    (is (true? (validation/valid-transform-key? "00-678012345-345678012-123456789")))))
