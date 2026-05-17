# database entity structure

This document is outlining the structure of the objects in the database, the data to be stored and the purpose of the entity.

## entities

### Original data

I want to store the 1M puzzles currently in the other repo to be easily searched by each of the following properties
* puzzle (the clues)
* solution
* clue count

### Permutations

I want to be able to do a comprehensive analysis of the nature of the permutations, so I want to create a table that we can search to look for duplicates and find the redundancies of various transforms

* original (the puzzle or solution upon which the variation is based)
* result
* rotation ( 0 | 90 | 180 | 270 )
* row order (a list of the indicies of the original rows in the new order)
* column order (a list of the indicies of the original columns in the new order)
* symbol translation (a list of digits 1-9 in the order that they are being mapped to)

Since the rotations, row orders, column orders and symbol translations are each discrete sets, we could create tables with fixed contents for each of them and create a uniqueness constraint of those four columns with the "original" column.

### Cardinal Forms

when we create permutations in the permutations table, I want to create an entry of that puzzle in the cardinal forms table.

As we find unique forms, we will be able to add them to the cardinal forms table.

* puzzle
* clue count

since we're creating this entry in parallel to the permutations, the "original" column in the permutations table could be a foreign key to this table.

## Purpose / next steps

What I want to do is this:
1. populate the "original data" table with the data from the 1M
2. report back the number of unique clue counts
3. take the first puzzle from the 1M and create an entry in the cardinal form table.
4. generate all possible variations for that cardinal form and enter them into the permutations table
5. search the 1M for matches in the permutations results
6. query the same clue count for any that are **not** in the permutations, pick the first, and repeat the process.
7. continue until there are no puzzles in the 1M that cannot be found in either column of the permutations table.
