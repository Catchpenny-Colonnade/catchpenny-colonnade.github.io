(ns sudoku-research.data.validation
  (:require [clojure.string :as str]))

(defn- valid-order-token?
  "Validate that a 9-char order token is a valid band/stack permutation
   (3 groups of 3, each group is a set of 3 consecutive digits)."
  [token]
  (and (= (count token) 9)
       (= (->> token
               (partition 3)
               (map set)
               set)
          #{#{\0 \1 \2} #{\3 \4 \5} #{\6 \7 \8}})))

(defn valid-transform-key?
  "Validate that a transform_key string is semantically correct.
   Ensures rotation is 00 or 90, row/col orders are valid,
   and symbol map is a permutation of 1-9."
  [transform-key]
  (if transform-key
    (let [parts (str/split transform-key #"-")]
      (and (= (count parts) 4)
           (let [[rotation row-order col-order symbol-map] parts]
             (and
              (boolean (#{"00" "90"} rotation))
              (valid-order-token? row-order)
              (valid-order-token? col-order)
              (= (sort symbol-map) [\1 \2 \3 \4 \5 \6 \7 \8 \9])))))
    false))

(defn identity-transform-key?
  "Check if a transform key is the identity/origin transform.
   Identity transform: 00-012345678-012345678-123456789
   This is a no-op transform that returns the original puzzle unchanged."
  [transform-key]
  (= transform-key "00-012345678-012345678-123456789"))
