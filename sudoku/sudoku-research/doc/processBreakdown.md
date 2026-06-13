# Sudoku Research Process Breakdown

As we get closer to building the top layer of the sudoku research command line interface, I started thinking about just how big and long this process is going to be and I'm thinking about how we need to ensure the ability to pick up where we've left off in case the process gets interrupted.

Considering the nature of what we're trying to do, I'm also wondering if it's possible to create joins across both the runtime database and the test database?

My reasoning behind this is I'm wondering if what we want to do is load the puzzle data from the files first in one process. Then as a subsequent process, generate the transforms and then finally do the actual permutations of the data and analysis.

My thinking on this is this. I don't really care how long the process takes. I know it's going to take a long time. The point of all of this is not timer efficiency. I want it to be as efficient as possible obviously but this is a one-time experiment. It's not done until it's done. This is not going to be an ongoing repeated use application. It's an experiment. What I'm wondering is if we were to pull in all of our resources into the live database, we could then use real live data for properly testing the permutation process. If we can query across both databases, we could work through the data loading process and ensure its quality, then work through the transform generation process and ensure its quality and then work through the permutation process and ensure its quality keeping the pieces that we're working on smaller and therefore less difficult to debug and ensure quality.
