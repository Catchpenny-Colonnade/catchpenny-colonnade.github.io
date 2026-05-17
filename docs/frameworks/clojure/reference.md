# Clojure Language Reference

A practical reference for Clojure language features, idioms, and core functions. This guide focuses on patterns used in actual projects (e.g., sudoku-clj solver).

**Related:** See [patterns.md](patterns.md) for verified patterns, gotchas, and best practices discovered during development.

**Key Resources:**
- [Official Clojure Docs](https://clojure.org/api/cheatsheet)
- [ClojureDocs](https://clojuredocs.org/) - Community examples

**Table of Contents**
- [Namespaces & Modules](#namespaces--modules)
- [Data Types & Literals](#data-types--literals)
- [Functions & Definitions](#functions--definitions)
- [Sequences & Collections](#sequences--collections)
- [Control Flow](#control-flow)
- [Higher-Order Functions](#higher-order-functions)
- [Destructuring](#destructuring)
- [Immutability & Performance](#immutability--performance)
- [State & Mutation](#state--mutation)
- [Recursion & Loops](#recursion--loops)
- [Set Operations](#set-operations)
- [String Manipulation](#string-manipulation)
- [Testing & Debugging](#testing--debugging)

---

## Namespaces & Modules

### `ns` - Define Namespace
```clojure
(ns sudoku-clj.solver
  (:require [clojure.set :as set]))
```

**Key Points:**
- First form in a file (must come first)
- `:require` imports external namespaces
- `:as` creates an alias for the namespace
- Namespace hierarchy: `project.domain.function`

### `require` - Import at REPL
```clojure
(require '[sudoku-clj.solver :refer :all])    ; Import all public functions
(require '[sudoku-clj.solver :as solver])     ; Import with alias
```

### `use` - Deprecated, Use `:refer` Instead
```clojure
; ❌ Don't use
(use 'namespace.name)

; ✅ Use :refer instead
(require '[namespace.name :refer :all])
```

---

## Data Types & Literals

### Numbers
```clojure
42                 ; Long integer
3.14               ; Double float
1N                 ; BigInt (exact arithmetic)
22/7               ; Ratio (exact fractional arithmetic)
```

### Strings & Characters
```clojure
"hello"            ; String
\h                 ; Character
"multi\nline"      ; Escape sequences: \n, \t, \\, \"
```

### Keywords
```clojure
:key               ; Keyword (like symbol, but used for keys)
:person/name       ; Namespaced keyword
{:name "Alice" :age 30}  ; Keywords as map keys
```

### Collections
```clojure
[1 2 3]            ; Vector (indexed, ordered)
'(1 2 3)           ; List (linked list, different from vector)
{:a 1 :b 2}        ; Map (key-value pairs)
#{1 2 3}           ; Set (unique values, no order)
```

### Symbols
```clojure
'symbol            ; Symbol (name reference)
(quote my-var)     ; Same as 'my-var
```

---

## Functions & Definitions

### `defn` - Define Function
```clojure
(defn greet [name]
  (str "Hello, " name))

(defn add
  "Docstring: adds two numbers"
  [a b]
  (+ a b))

(defn multi-arity
  ([x] (+ x 1))        ; Arity 1
  ([x y] (+ x y)))     ; Arity 2
```

**Key Points:**
- First argument is the function name (symbol)
- Second (optional) is docstring
- Next is parameter vector `[args]`
- Rest is the body
- Can have multiple arities (overloads)

### `defn-` - Private Function
```clojure
(defn- helper []
  "This function is private to the namespace")
```

### `fn` - Anonymous Function
```clojure
(fn [x] (* x 2))           ; Anonymous function
(fn [x y] (+ x y))         ; Multiple arguments
#(* % 2)                   ; Shorthand: % is first arg, %2 is second
```

### `defonce` - Define Once (for REPL)
```clojure
(defonce cached-value (expensive-operation))
; Won't recalculate on reload
```

---

## Sequences & Collections

### Vectors (Indexed Access)
```clojure
[1 2 3]                    ; Create vector
(nth [1 2 3] 0)           ; Access by index (0-based)
([1 2 3] 0)               ; Vectors are functions too
(conj [1 2] 3)            ; Add to end: [1 2 3]
(assoc [1 2 3] 1 99)      ; Update index 1: [1 99 3]
(pop [1 2 3])             ; Remove last: [1 2]
(subvec [1 2 3 4] 1 3)    ; Slice: [2 3]
```

### Lists (Linked Lists)
```clojure
'(1 2 3)                   ; Create list
(conj '(1 2) 3)           ; Add to front: (3 1 2)
(first '(1 2 3))          ; Get first: 1
(rest '(1 2 3))           ; Get rest: (2 3)
```

### Maps (Key-Value)
```clojure
{:a 1 :b 2}                ; Map literal
(get {:a 1} :a)           ; Get value: 1
({:a 1} :a)               ; Maps are functions
(assoc {:a 1} :b 2)       ; Add/update: {:a 1 :b 2}
(update {:a 1} :a inc)    ; Update with function: {:a 2}
(merge {:a 1} {:b 2})     ; Merge maps: {:a 1 :b 2}
(keys {:a 1 :b 2})        ; Keys: (:a :b)
(vals {:a 1 :b 2})        ; Values: (1 2)
```

### Sets (Unique Values)
```clojure
#{1 2 3}                   ; Set literal
(set [1 2 2 3])           ; Convert to set: #{1 2 3}
(conj #{1 2} 3)           ; Add: #{1 2 3}
(disj #{1 2 3} 2)         ; Remove: #{1 3}
(contains? #{1 2 3} 2)    ; Check membership: true
```

### Range (Lazy Sequence)
```clojure
(range 5)                  ; (0 1 2 3 4) - lazy
(range 2 5)                ; (2 3 4) - lazy
(range 0 10 2)             ; (0 2 4 6 8) - every 2nd - lazy
(take 3 (range 100))       ; Take first 3: (0 1 2)
(drop 2 (range 5))         ; Drop first 2: (2 3 4)
```

---

## Control Flow

### `if` - Conditional
```clojure
(if (> x 10)
  "x is large"
  "x is small")

(if (> x 10)
  "x is large")            ; nil if false branch omitted
```

### `if-let` - Conditional Binding
```clojure
(if-let [result (find-value)]
  (use result)
  (default-behavior))
```

### `when` & `when-let` - When True
```clojure
(when (> x 10)
  (println "x is large"))

(when-let [result (find-value)]
  (use result))
```

### `case` - Pattern Matching
```clojure
(case status
  :active "Running"
  :paused "Paused"
  :stopped "Stopped"
  "Unknown")
```

### `cond` - Multiple Conditions
```clojure
(cond
  (> x 100) "Very large"
  (> x 50) "Large"
  (> x 0) "Positive"
  :else "Not positive")
```

### `loop` & `recur` - Tail Recursion
```clojure
(loop [i 0 sum 0]
  (if (>= i 10)
    sum
    (recur (inc i) (+ sum i))))

; Equivalent to:
(reduce + (range 10))
```

---

## Higher-Order Functions

### `map` - Transform Each Element
```clojure
(map inc [1 2 3])                   ; (2 3 4)
(map #(* % 2) [1 2 3])              ; (2 4 6)
(map + [1 2 3] [10 20 30])          ; (11 22 33) - multiple sequences
```

### `filter` - Keep Matching Elements
```clojure
(filter even? [1 2 3 4 5])          ; (2 4)
(filter #(> % 2) [1 2 3 4])         ; (3 4)
```

### `reduce` - Accumulate Value
```clojure
(reduce + 0 [1 2 3 4])              ; 10
(reduce + [1 2 3 4])                ; 10 (uses first as init)
(reduce conj [] [1 2 3])            ; [1 2 3]
```

### `group-by` - Group Elements
```clojure
(group-by even? [1 2 3 4 5])
; {true [2 4], false [1 3 5]}
```

### `partition` & `partition-all`
```clojure
(partition 2 [1 2 3 4 5])           ; ((1 2) (3 4))
(partition-all 2 [1 2 3 4 5])       ; ((1 2) (3 4) (5))
```

### `some` - Find First Match
```clojure
(some #(if (even? %) %) [1 2 3 4]) ; 2 (first even)
(some #{2 4} [1 2 3])               ; 2 (set lookup)
```

### `every?` & `any?`
```clojure
(every? even? [2 4 6])              ; true
(every? even? [2 4 5])              ; false
(any? even? [1 3 5])                ; false
(any? even? [1 2 5])                ; true
```

---

## Destructuring

### Vector Destructuring
```clojure
(let [[a b c] [1 2 3]]
  (+ a b c))                         ; 6

(defn sum-pair [[x y]]
  (+ x y))

(sum-pair [10 20])                   ; 30
```

### Map Destructuring
```clojure
(let [{:keys [a b]} {:a 1 :b 2}]
  (+ a b))                           ; 3

(defn greet [{:keys [name age]}]
  (str name " is " age))

(greet {:name "Alice" :age 30})      ; "Alice is 30"
```

### Rest Destructuring
```clojure
(let [[head & tail] [1 2 3 4]]
  [head tail])                       ; [1 (2 3 4)]

(defn first-rest [& items]
  items)                             ; Variadic function
```

### Default Values
```clojure
(let [{:keys [a b] :or {a 0 b 0}} {:a 1}]
  [a b])                             ; [1 0]
```

---

## Immutability & Performance

### Vectors vs Lists
```clojure
; Vectors: O(log N) access, O(log N) update
[1 2 3]                   ; Use for indexed access
(assoc v 0 99)            ; Fast random access

; Lists: O(N) access, O(1) prepend
'(1 2 3)                  ; Use for prepending or when order matters
(conj lst 0)              ; Fast prepend (adds to front)
```

### Lazy Sequences
```clojure
(range 1000000)           ; LAZY - doesn't generate all values upfront
(take 5 (range 1000000))  ; Only generates first 5

; Be careful: holding onto sequence head prevents garbage collection
(let [s (range 1000000)]
  (count s))              ; This will hold entire sequence in memory!
```

### Transducers (Advanced Performance)
```clojure
; Composable, stateful transformations
(transduce (comp (map inc) (filter even?)) + [1 2 3 4 5])
; Processes in single pass, no intermediate sequences
```

---

## State & Mutation

### `atom` - Mutable Reference
```clojure
(def counter (atom 0))
@counter                   ; Dereference: 0
(swap! counter inc)        ; Update: (inc 0)
(reset! counter 5)         ; Set directly: 5
(swap! counter + 3)        ; Update with args: (+ current 3)
```

### `ref` - Reference for Coordinated Updates
```clojure
(def balance (ref 1000))
(dosync
  (alter balance - 100)    ; Atomic transaction
  (alter balance + 50))
```

---

## Recursion & Loops

### `recur` - Tail Call Optimization
```clojure
(defn factorial [n acc]
  (if (<= n 1)
    acc
    (recur (dec n) (* n acc))))

(factorial 5 1)            ; 120 - tail recursive, no stack buildup
```

### `loop` - Explicit Loop
```clojure
(loop [i 0 sum 0]
  (if (>= i 10)
    sum
    (recur (inc i) (+ sum i))))    ; recur with new bindings
```

### `doseq` - Imperative Loop
```clojure
(doseq [i (range 5)]
  (println i))             ; Side effects for each i
```

### `dotimes` - N Times
```clojure
(dotimes [i 5]
  (println i))             ; i from 0 to 4
```

---

## Set Operations

### Set Functions
```clojure
(def set-a #{1 2 3})
(def set-b #{2 3 4})

(clojure.set/union set-a set-b)          ; #{1 2 3 4}
(clojure.set/intersection set-a set-b)   ; #{2 3}
(clojure.set/difference set-a set-b)     ; #{1}
(clojure.set/subset? #{2 3} set-a)       ; true
(clojure.set/superset? set-a #{2})       ; true
```

### Set as Function
```clojure
(#{1 2 3} 2)               ; 2 (returns value if present)
(#{1 2 3} 5)               ; nil (not present)
```

---

## String Manipulation

### String Operations
```clojure
"hello"                    ; String literal
(str "hello" " " "world")  ; Concatenate: "hello world"
(count "hello")            ; Length: 5
(.length "hello")          ; Java interop: 5
(subs "hello" 0 2)         ; Substring: "he"
```

### Character Conversion
```clojure
(Character/digit \5 10)    ; Char to digit: 5
(int \A)                   ; Char to ASCII: 65
(char 65)                  ; ASCII to char: \A
```

### Regex
```clojure
(re-matches #"[0-9]+" "123")      ; Match pattern: "123"
(re-find #"[0-9]+" "abc123def")   ; Find first: "123"
(clojure.string/split "a,b,c" #",")  ; Split: ["a" "b" "c"]
```

---

## Testing & Debugging

### `println` & Logging
```clojure
(println "Debug value:" x)         ; Print with newline
(print "No newline")               ; Print without newline
(prn x)                            ; Print with quotes (repr)
(pprint x)                         ; Pretty-print
```

### `asserta` - Assertion
```clojure
(assert (> x 0) "x must be positive")
```

### Comments
```clojure
; Single line comment
#_
(block comment - everything after #_ is ignored)

#_(defn foo [])  ; Comment out code
```

### Test Namespace
```clojure
(ns sudoku-clj.solver-test
  (:require [clojure.test :refer :all]))

(deftest test-name
  (testing "description"
    (is (= expected actual))
    (is (thrown? Exception (risky-fn)))))

; Run with: (run-tests)
```
