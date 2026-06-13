# Todo List

1. ensure our integration and unit tests are properly capturing logs and analyzing them for unexpected errors
2. check coverage and look for critical gaps
3. proceed with a series of live tests of the CLI in the following sequence. As we go, if any refactoring needs to be done, always secure that refactoring with the unit and integration tests to ensure quality.
   1. run with the following args: 1 file  5 records, then run again with the same amount, then check the database manually to verify.
   2. continue doing manual runs of the first file, doubling the number of records each time and then manually verifying the database each time until about half of the file has been processed.
   3. try the --resume command and ensure it works (verify database manually).
   4. try having it run 1 file, and ensure it works.
   5. try multiple files (2, 5, 10)
