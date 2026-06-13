(ns sudoku-research.permutations-test
  (:require [clojure.test :refer [deftest is testing]]
            [clojure.string :as str]
            [sudoku-research.permutations :as perms]
            [sudoku-research.puzzle :as puzzle]
            [sudoku-research.data.validation :as db-validation]
            [sudoku-research.db.mutations :as db-mut]
            [sudoku-research.db.queries :as db-qry]))

(def test-puzzle-str "530070000600195000098000060800060003400803001700020006060000280000419005000080079")
(def identity-order [0 1 2 3 4 5 6 7 8])
(def identity-symbols [1 2 3 4 5 6 7 8 9])

(deftest ^:unit build-transform-key-test
  (testing "Builds a valid bundled transform key"
    (let [key (perms/build-transform-key 0 identity-order identity-order identity-symbols)]
      (is (= key "00-012345678-012345678-123456789"))
      (is (db-validation/valid-transform-key? key))))

  (testing "Unsupported rotations return nil"
    (is (nil? (perms/build-transform-key 2 identity-order identity-order identity-symbols)))))

(deftest ^:unit stream-permutations-shape-test
  (testing "Streaming candidates yields transform-key maps"
    (let [stream (perms/stream-permutations {:rotation-ids [0 1]
                                             :row-orderings [identity-order]
                                             :column-orderings [identity-order]
                                             :symbol-translations [identity-symbols]})
          candidates (vec stream)]
      ;; Should have 1 candidate: rotation 1 with identity params
      ;; (rotation 0 with identity params = identity transform, filtered out)
      (is (= 1 (count candidates)))
      ;; First candidate should be rotation 1 (rotation 0 identity is filtered)
      (let [first-cand (first candidates)]
        (is (= 1 (:rotation-id first-cand)))
        (is (= identity-order (:row-order first-cand)))
        (is (= identity-order (:column-order first-cand)))
        (is (= identity-symbols (:symbol-translation first-cand)))
        (is (db-validation/valid-transform-key? (:transform-key first-cand)))))))

(deftest ^:unit stream-permutations-filters-identity-transform-test
  (testing "Identity transform is excluded from stream"
    (let [stream (perms/stream-permutations {:rotation-ids [0]
                                             :row-orderings [identity-order]
                                             :column-orderings [identity-order]
                                             :symbol-translations [identity-symbols]})
          candidates (vec stream)]
      ;; Identity transform filtered out, so empty stream
      (is (= 0 (count candidates))))))

(deftest ^:unit identity-transform-key-test
  (testing "Identifies the identity/origin transform"
    (is (db-validation/identity-transform-key? "00-012345678-012345678-123456789")))
  
  (testing "Rejects non-identity transforms"
    (is (not (db-validation/identity-transform-key? "90-012345678-012345678-123456789")))
    (is (not (db-validation/identity-transform-key? "00-102345678-012345678-123456789")))
    (is (not (db-validation/identity-transform-key? "00-012345678-012345678-213456789")))))

(deftest ^:unit count-permutations-test
  (testing "Uses transform-key domain counts (2 rotations)"
    (is (= (perms/count-permutations) (* 2 1296 1296 362880)))))

(deftest ^:unit identity-transform-baseline-test
  (testing "Applying identity transform returns original puzzle unchanged"
    (let [original test-puzzle-str
          result (puzzle/apply-all-transforms original 0 identity-order identity-order identity-symbols)]
      (is (= result original)))))

;; ============================================================================
;; UNIT TESTS - resolve-transform-id
;; ============================================================================

(deftest ^:unit resolve-transform-id-with-transform-id-test
  (testing "When :transform-id is provided, returns it directly without database lookup"
    (let [mock-db "mock-db"
          result (perms/resolve-transform-id mock-db {:transform-id 42})]
      (is (= 42 result)))))

(deftest ^:unit resolve-transform-id-with-valid-transform-key-test
  (testing "When :transform-key is provided and valid, inserts/gets and returns ID"
    (let [valid-key "90-012345678-012345678-123456789"
          mock-db "mock-db"
          call-log (atom [])]
      (with-redefs [db-mut/insert-or-get-transform! (fn [db param-map]
                                                       (swap! call-log conj {:db db :params param-map})
                                                       {:id 99})]
        (let [result (perms/resolve-transform-id mock-db {:transform-key valid-key})]
          (is (= 99 result))
          (is (= 1 (count @call-log)))
          (is (= "mock-db" (:db (first @call-log))))
          (is (= {:transform-key valid-key} (:params (first @call-log)))))))))

(deftest ^:unit resolve-transform-id-with-invalid-transform-key-test
  (testing "When :transform-key is provided but invalid, throws ex-info"
    (let [invalid-key "invalid-format"
          mock-db "mock-db"]
      (is (thrown? Exception (perms/resolve-transform-id mock-db {:transform-key invalid-key})))
      (try
        (perms/resolve-transform-id mock-db {:transform-key invalid-key})
        (catch Exception e
          (let [data (ex-data e)]
            (is (= (:transform-key data) invalid-key))))))))

(deftest ^:unit resolve-transform-id-missing-both-test
  (testing "When neither :transform-id nor :transform-key provided, throws ex-info"
    (let [mock-db "mock-db"]
      (is (thrown? Exception (perms/resolve-transform-id mock-db {})))
      (try
        (perms/resolve-transform-id mock-db {})
        (catch Exception e
          (let [msg (.getMessage e)
                data (ex-data e)]
            (is (str/includes? msg "Must provide"))
            (is (contains? data :provided-keys))))))))

(deftest ^:unit resolve-transform-id-with-database-error-test
  (testing "Propagates database errors when insert-or-get-transform! fails"
    (let [valid-key "90-012345678-012345678-123456789"
          mock-db "mock-db"]
      (with-redefs [db-mut/insert-or-get-transform! (fn [_ _]
                                                       (throw (Exception. "Database connection failed")))]
        (is (thrown? Exception (perms/resolve-transform-id mock-db {:transform-key valid-key})))))))

;; ============================================================================
;; UNIT TESTS - insert-permutation!
;; ============================================================================

(deftest ^:unit insert-permutation-success-test
  (testing "Successfully inserts permutation with valid parameters"
    (let [mock-db "mock-db"
          canonical-id 1
          result-str "result_puzzle"
          rotation-id 0
          row-order [0 1 2 3 4 5 6 7 8]
          col-order [0 1 2 3 4 5 6 7 8]
          symbol-trans [1 2 3 4 5 6 7 8 9]
          insert-perm-calls (atom [])
          insert-transform-calls (atom [])]
      (with-redefs [db-mut/insert-or-get-transform! (fn [db param-map]
                                                       (swap! insert-transform-calls conj {:db db :params param-map})
                                                       {:id 99})
                    db-mut/insert-permutation! (fn [db param-map]
                                                (swap! insert-perm-calls conj {:db db :params param-map})
                                                {:id 1})]
        (perms/insert-permutation! mock-db canonical-id result-str rotation-id row-order col-order symbol-trans)
        (is (= 1 (count @insert-transform-calls)))
        (is (= 1 (count @insert-perm-calls)))
        (let [perm-call (first @insert-perm-calls)]
          (is (= canonical-id (:canonical-id (:params perm-call))))
          (is (= result-str (:result (:params perm-call))))
          (is (= 99 (:transform-id (:params perm-call)))))))))

(deftest ^:unit insert-permutation-invalid-rotation-id-test
  (testing "Throws when rotation-id is not 0 or 1"
    (let [mock-db "mock-db"]
      (is (thrown? Exception (perms/insert-permutation! mock-db 1 "result" 2 [0] [0] [1])))
      (try
        (perms/insert-permutation! mock-db 1 "result" 2 [0] [0] [1])
        (catch Exception e
          (let [data (ex-data e)]
            (is (= 2 (:rotation-id data)))
            (is (str/includes? (.getMessage e) "Invalid rotation-id"))))))))

(deftest ^:unit insert-permutation-transform-key-build-failure-test
  (testing "Throws when transform-key building fails"
    (let [mock-db "mock-db"]
      (with-redefs [perms/build-transform-key (fn [_ _ _ _] nil)]
        (is (thrown? Exception (perms/insert-permutation! mock-db 1 "result" 0 [0] [0] [1])))
        (try
          (perms/insert-permutation! mock-db 1 "result" 0 [0] [0] [1])
          (catch Exception e
            (let [data (ex-data e)]
              (is (str/includes? (.getMessage e) "Failed to build transform key")))))))))

(deftest ^:unit insert-permutation-transform-resolution-error-test
  (testing "Propagates errors from resolve-transform-id"
    (let [mock-db "mock-db"]
      (with-redefs [db-mut/insert-or-get-transform! (fn [_ _]
                                                       (throw (Exception. "DB connection failed")))]
        (is (thrown? Exception (perms/insert-permutation! mock-db 1 "result" 0 [0 1] [0 1] [1 2])))))))

(deftest ^:unit insert-permutation-database-insert-error-test
  (testing "Propagates database errors during permutation insertion"
    (let [mock-db "mock-db"]
      (with-redefs [db-mut/insert-or-get-transform! (fn [db param-map]
                                                       {:id 99})
                    db-mut/insert-permutation! (fn [_ _]
                                                (throw (Exception. "Failed to insert permutation")))]
        (is (thrown? Exception (perms/insert-permutation! mock-db 1 "result" 0 [0 1] [0 1] [1 2])))))))

;; ============================================================================
;; UNIT TESTS - process-candidate (testing via generate-permutations which calls it)
;; ============================================================================

(deftest ^:unit process-candidate-existing-permutation-test
  (testing "When permutation already exists in database, increments :existing counter only"
    (let [mock-db "mock-db"
          canonical-id 1
          canonical-puzzle test-puzzle-str
          initial-stats {:total 0 :new 0 :existing 0 :errors 0}
          candidate [0 [0 1 2 3 4 5 6 7 8] [0 1 2 3 4 5 6 7 8] [1 2 3 4 5 6 7 8 9]]]
      (with-redefs [puzzle/apply-all-transforms (fn [_ _ _ _ _] "transformed_puzzle")
                    db-qry/find-permutation (fn [_ _] true)]
        (let [result (#'perms/process-candidate mock-db canonical-id canonical-puzzle initial-stats candidate)]
          (is (= 1 (:total result)))
          (is (= 1 (:existing result)))
          (is (= 0 (:new result)))
          (is (= 0 (:errors result))))))))

(deftest ^:unit process-candidate-new-permutation-test
  (testing "When permutation is new, increments :new counter and calls insert"
    (let [mock-db "mock-db"
          canonical-id 1
          canonical-puzzle test-puzzle-str
          initial-stats {:total 0 :new 0 :existing 0 :errors 0}
          candidate [0 [0 1 2 3 4 5 6 7 8] [0 1 2 3 4 5 6 7 8] [1 2 3 4 5 6 7 8 9]]
          insert-calls (atom [])]
      (with-redefs [puzzle/apply-all-transforms (fn [_ _ _ _ _] "new_puzzle")
                    db-qry/find-permutation (fn [_ _] false)
                    db-mut/insert-or-get-transform! (fn [_ _] {:id 99})
                    db-mut/insert-permutation! (fn [db param-map]
                                                (swap! insert-calls conj param-map)
                                                {:id 1})]
        (let [result (#'perms/process-candidate mock-db canonical-id canonical-puzzle initial-stats candidate)]
          (is (= 1 (:total result)))
          (is (= 0 (:existing result)))
          (is (= 1 (:new result)))
          (is (= 0 (:errors result)))
          (is (= 1 (count @insert-calls))))))))

(deftest ^:unit process-candidate-transform-error-test
  (testing "When transform application fails, increments :errors and captures error details"
    (let [mock-db "mock-db"
          canonical-id 1
          canonical-puzzle test-puzzle-str
          initial-stats {:total 0 :new 0 :existing 0 :errors 0}
          candidate [0 [0 1 2 3 4 5 6 7 8] [0 1 2 3 4 5 6 7 8] [1 2 3 4 5 6 7 8 9]]]
      (with-redefs [puzzle/apply-all-transforms (fn [_ _ _ _ _]
                                                  (throw (Exception. "Transform failed")))]
        (let [result (#'perms/process-candidate mock-db canonical-id canonical-puzzle initial-stats candidate)]
          (is (= 1 (:total result)))
          (is (= 0 (:existing result)))
          (is (= 0 (:new result)))
          (is (= 1 (:errors result)))
          (is (str/includes? (:last-error-msg result) "Transform failed")))))))

(deftest ^:unit process-candidate-database-lookup-error-test
  (testing "When database lookup fails, increments :errors and captures error details"
    (let [mock-db "mock-db"
          canonical-id 1
          canonical-puzzle test-puzzle-str
          initial-stats {:total 0 :new 0 :existing 0 :errors 0}
          candidate [0 [0 1 2 3 4 5 6 7 8] [0 1 2 3 4 5 6 7 8] [1 2 3 4 5 6 7 8 9]]]
      (with-redefs [puzzle/apply-all-transforms (fn [_ _ _ _ _] "puzzle")
                    db-qry/find-permutation (fn [_ _]
                                            (throw (Exception. "Database lookup failed")))]
        (let [result (#'perms/process-candidate mock-db canonical-id canonical-puzzle initial-stats candidate)]
          (is (= 1 (:total result)))
          (is (= 0 (:existing result)))
          (is (= 0 (:new result)))
          (is (= 1 (:errors result)))
          (is (str/includes? (:last-error-msg result) "Database lookup failed"))
          (is (contains? result :last-error-key)))))))

(deftest ^:unit process-candidate-insertion-error-test
  (testing "When permutation insertion fails, increments :errors and captures error details"
    (let [mock-db "mock-db"
          canonical-id 1
          canonical-puzzle test-puzzle-str
          initial-stats {:total 0 :new 0 :existing 0 :errors 0}
          candidate [0 [0 1 2 3 4 5 6 7 8] [0 1 2 3 4 5 6 7 8] [1 2 3 4 5 6 7 8 9]]]
      (with-redefs [puzzle/apply-all-transforms (fn [_ _ _ _ _] "new_puzzle")
                    db-qry/find-permutation (fn [_ _] false)
                    db-mut/insert-or-get-transform! (fn [_ _] {:id 99})
                    db-mut/insert-permutation! (fn [_ _]
                                                (throw (Exception. "Insertion failed")))]
        (let [result (#'perms/process-candidate mock-db canonical-id canonical-puzzle initial-stats candidate)]
          (is (= 1 (:total result)))
          (is (= 0 (:existing result)))
          (is (= 0 (:new result)))
          (is (= 1 (:errors result)))
          (is (str/includes? (:last-error-msg result) "Insertion failed"))
          (is (contains? result :last-error-key)))))))

