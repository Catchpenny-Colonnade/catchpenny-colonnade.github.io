# Moving Forward

The current state of Catchpenny-Colonnade's Sudoku game is such it pulls from a pre-constructed set of puzzles. It does this because when I created it, I didn't have a proper understanding of Sudoku solvers and Sudoku builders to be able to build a custom and just found the data available online. I have no way of rating the difficulty of the puzzles that I already have and would, as I understand require a Sudoku solver to do so. I would like at some point be able to programmatically generate puzzles of either a given difficulty or generate the puzzle and then detect the difficulty. I would then like to be able to do two different things with this generatable collection of puzzles: 
  A) deploy them out to the current Sudoku game
  B) produce printable PDFs to be published as books via Amazon self-publishing

My understanding is that we will first need a Sudoku solar. We would then need a difficulty detector and then a generator. I would want to develop these tools in either closure or C#, whichever would be more readable, more concise, and easier to maintain and update. Once these other tools are developed, we'll need to then develop a tool for publishing the books, having some sort of initial template as well as difficulty distribution, along with some sort of way to programmatically generate a cover.

Some future time it would also be nice to Branch out into Sudoku variations that involve more complex puzzles or math or any number of other potential variations.
