# Sudoku Patterns

I'm having a realization about the nature of Sudoku and the nature of the puzzles and it has to do with reflections, rotations and transpositions.

I know you think about a Sudoku board. Every Sudoku pattern has four variations based on rotation. It is a square so it can be rotated four times so it has four variations. But then each of those variations can be reflected on either the vertical or horizontal axis. So all together we have a total of eight eight variations when considering rotations and reflections.
And then I got to thinking about transposition, that is swapping two of the numerical values. So say we swap the twos and the threes in a particular puzzle, so that all the twos become threes and all the threes become twos - the puzzle is logically the same just with the values transposed. And you could do the same with any combination of values, so the number of potential variations becomes 9 factorial.
So when we take that all into consideration, The rotations reflections in transpositions gives us 9 factorial times 8 possible combinations off of a single pattern. However, that's not taking into account the possibility that a transposition of a pattern rotated and or reflected could result in another existing transposition depending on the nature of the existing pattern.
I guess this leads me to the question of can we reduce the nature of the puzzles as we develop them down into a pattern or a template?
What would it take to brute Force through all the possible valid uniquely solvable Sudoku boards and then reduce them down to unique pattern taking into consideration reflections, rotations and transposition?
Is there already documented thought around this idea?
Could we then just reduce difficulty down to the nature of a given pattern and then generates random variation of that pattern?
