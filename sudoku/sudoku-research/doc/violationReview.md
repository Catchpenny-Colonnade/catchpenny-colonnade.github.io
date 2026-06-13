# Violation review

I'm reading thru the specific list of violations as listed in the "TEST_PRECISION_VIOLATION.md" file. This document will advise on any issues that I have with those specified violations.

## Violation 2.1 `count-clues-test`

You're right to identify this as multiple scenarios, but this is the perfect case for using multiple 'testing' calls within a single 'deftest'. This also takes care of documentation for this test:

```clojure
(deftest ^:unit count-clues-test
  (testing "Counting clues for an empty puzzle"
    (is (= 0 (loaders/count-clues "000..."))))
  (testing "Counting the clues for a solution"
    (is (= 81 (loaders/count-clues "123..."))))
  (testing "Counting the clues for a valid puzzle"
    (is (= 30 (loaders/count-clues "530..."))))
```

## Violation 2.2: `count-clues-only-counts-nonzero-test`

Looking at the code as shown, the second assertion is obviously redundant, since 30 < 81. but more than that, the entire test is reduntant, since we're already testing the same thing in the test in "Violation 2.1".

This violation also shows me that you need to take a holistic view of these violations, both within the test as a whole, and across tests within the namespace to be able to see both assertions and tests which may be redundant. In this particular case, the recommendation of replacing the `<` assertion with an exact equality not only places an additional redundant assertion, it leaves in place a redundant test.

## Violation 2.3: `insert-puzzles-batch-success-test`

In a case like this, exact equality of a map gets tricky because if the map is bigger, it makes the failure message harder to read. A better way would be as follows:

```clojure
(let [result (loaders/insert-puzzles-batch db 1 puzzles)
      {:keys [inserted skipped errors]} result]
  (is (= #{:inserted :skipped :errors} (set (keys result))))
  (is (= 2 inserted))
  (is (= 0 skipped))
  (is (= 0 errors)))
```

## Violation 2.4: `insert-puzzles-batch-with-errors-test`

The use of `every?` in this case is valid because we're asserting the exact count in the previous assertion, and the predicate for the `every?` is an `=`, so it is still exact. This approach also prioritizes the brevity and readability while still maintaining absolute precision.

## Violation 3.3: `stream-permutations-shape-test`

Follow the same pattern as I suggested for Violation 2.3 above.

## Violation 4.1-3: `apply-rotation-90-test`, `apply-rotation-180-test`, `apply-rotation-270-test`

Your interpretation of the test as shown "Test has two distinct scenarios (90° rotation and 4x rotation round trip)" is more or less valid, but what I would say is that the nature of the tests for "apply-rotation" should take a more holistic view and create a single "deftest" declaration of "apply-rotation-tests" with a "let" block the listed values followed by multiple "testing" blocks for each of the following scenarios:

* Let
  * "puzzle-rotated-90"
  * "puzzle-rotated-180"
  * "puzzle-rotated-270"
* "testing" scenarios
  * "Identity test - (apply rotation 0)"
    * -- tests that each of the values above are the result of applying "apply-rotation 0" to themselves
  * "Rotate 90 - tests (apply-rotation 1)"
    * (is (= puzzle-rotated-90 (puzzle/apply-rotation test-puzzle 1)))
    * (is (= puzzle-rotated-180 (puzzle/apply-rotation puzzle-rotated-90 1)))
    * etc.
    * (is (= puzzle-rotated-180 (=> test-puzzle (puzzle/apply-rotation 1) (puzzle/apply-rotation 1))))
    * (is (= puzzle-rotated-270 (=> puzzle-rotated-90 (puzzle/apply-rotation 1) (puzzle/apply-rotation 1))))
    * etc.
    * -- walks thru all possible iterations of applying "apply-rotation 1" up to 4 times
  * "Rotate 180"
    * -- walks thru all possible iterations of applying "apply-rotation 2" once or twice
    * -- shows that applying "apply-rotation 1" twice results in the same value as applying "apply-rotation 2" once
    * -- shows that applying "apply-rotation 1" then "apply-rotation 2" results in the same value as applying "apply-rotation 2" followed by "apply-rotation 1"
  * "Rotate 270"
    * -- walks thru each of the values above applying "apply-rotation" once
    * -- shows that applying "apply-rotation 1" three times results in the same value as "apply-rotation 3" once
    * -- shows that applying "apply-rotation 1" once and apply-rotation 2" once results in the same value as applying "apply-rotation 3"

## Violation 6.1: `count-original-puzzles-by-clue-count-test`

Just as in Violation 2.3, exact equality of an array of maps gets tricky because it makes the failure message harder to read.

We should do an exact match on the count, like we are, and then follow the pattern from Violation 2.3 for each "nth" value in result.

Then we could do the following for any potentially extra values:
`(is (= [] (drop 3 result)))`

## Violation 7.1: `valid-transform-key-order-permutations-test`

This is the type of test where "comprehensive" needs to allow for a looser definition, as there are billions of valid values, and near infinite invalid values. Our best approach is to test each "block" of the transform key with a handful of both valid and invalid scenarios.

Test for the following scenarios:

* valid and invalid rotation values:
  * '00' - true
  * '90' - true
  * '0' - false
  * '37' - false
* valid and invalid orderings for both row order and column order (with parity between testing those scenarios for row order and column order)
  * valid band/stack permutations
  * rotating order:
    * "123456780" -- false
    * "234567801" -- false
    * "345678012" -- true
  * mirror
    * "876543210" -- true
  * odds/evens
    * "246801357" -- false
  * suggestions?
* All permutations for the last "block" are valid, so no scenarios are specific to this block
* general scenarios
  * invalid length
  * alpha characters
  * repeated digits (other than "00" for rotation)
  * non-alphanumeric characters
  * missing / invalid block separators

all of these should be under a single "deftest", but can be organized within separate "testing" blocks

## Violation 10.1: `execute-jdbc-call-mode-dispatch-test`

Follow the same pattern as I suggested for Violation 2.3 above.

## Violation 12.1: `capture-logs`

Low hanging fruit - lowest priority

## Violation 13.1: Same as 12.1

Low hanging fruit - lowest priority

## Violation 14.1: 

"initialize-db-once" is badly structured in general

1. returning an array instead of a map -- BAD
2. wrapping and swallowing the exception instead of letting it bubble up -- BAD (initialize-db! already prints the error and throws the exception)
3. Making these changes makes the use of "@db-available" moot, so we should just be retuning the connection (as the connection itself, not an atom), and actual-db-name

This is a ***MAJOR OVERHAUL*** and should therefore be the ***VERY TOP PRIORITY***

this also makes the whole (is @db-available? ...) issue moot as well.

## Violation 17.2: `insert-and-find-equivalence-test`

"insert, then find, then validate" is not multiple scenarios, it's a single scenario with multiple steps. This is especially valid for an "integration" level test. That being said, this test is thoroughly violating rule #4. Re-examine the test thru the lens of rule #4.

## Violation 17.3: `equivalence-aggregates-test`

This is an odd test, and illustrates multiple violations, including lack of documentation and vague assertions. Since we can't really tell what this test is trying to do, lets just remove the test itself.

## 18. db_test.clj

all of the violations within this file should be able to be handled using patterns established above

## 19. external/diagnostic_test.clj - Not Reviewed (Skipped)

## 20. external/schema_verification_test.clj - Not Reviewed (Skipped)

Why were these skipped? you should at least document reasoning. "Not Reviewed (Skipped)" tells me nothing. Either provide a reason or do the review.