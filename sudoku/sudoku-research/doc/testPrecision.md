# Test Precision

The following are rules regarding the nature of how tests should be written and more importantly how tests should not be written.

1. Every test should be testing a single scenario
2. Every test should be explicit with regard to the nature of the inputs given and the outputs expected
3. No test should have conditional events. In other words, no test should have an if block a when block or any other similar conditional blocks of code. Try catch is a valid conditional block of code because of needing to test for error handling
4. No test should be testing for partial expectations. All expectations should be exact. Therefore, no assertion should be using any conditional analysis other than equals.
5. When collections are being validated, the full contents of the collection should be validated. That means that if a count of that collection is expected to be greater than zero, then the exact count of that collection should be asserted and The exact value of each element in that collection should be validated.
6. Ensure that errors are not swallowed by being logged to the console and then not bubbled up by using the mock console pattern to use with redefs on print and print line to capture the log messages to an atom containing in an array and then reprint them.
7. Each test should be documented precisely as to the nature of what is being tested, not only the explicit inputs and expected outputs, but the scenario being tested in natural language terms. Each step of the test should also be noted with comments.
