(ns sudoku-research.logging-test-helpers
  (:require [clojure.string :as str]))

;; ========== Logging Capture Helper ==========
;; Utility for capturing and validating logged output in tests.
;; Mocks println and print to capture arguments while still printing them.

(defn capture-logs
  "Capture println and print calls during test execution.
   
   Returns a map with:
   - :logs - atom containing vector of captured log entries
   - :mock-println - mock println function 
   - :mock-print - mock print function
   
   Each log entry is a map with:
   - :type - :println or :print
   - :args - vector of arguments passed
   - :output - the stringified output
   
   Usage:
   (let [{:keys [logs mock-println mock-print]} (capture-logs)
         result (with-redefs [println mock-println
                             print mock-print]
                  (my-function-with-logging))]
     (is (some #(str/includes? (:output %) \"[OK]\") @logs)))"
  []
  (let [logs (atom [])
        original-println println
        original-print print]
    {:logs logs
     :get-logs (fn [] (map :output @logs))
     :clear-logs (fn [] (reset! logs []))
     :mock-println (fn [& args]
                     (let [output (str/join " " args)]
                       (swap! logs conj {:type :println :args args :output output})
                       (apply original-println args)))
     :mock-print (fn [& args]
                   (let [output (str/join "" args)]
                     (swap! logs conj {:type :print :args args :output output})
                     (original-print output)))}))