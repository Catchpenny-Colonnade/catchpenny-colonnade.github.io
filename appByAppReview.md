# Catchpenny Colonnade — App-By-App Review

> **Statement of purpose**: This report inventories each app folder under `catchpenny-colonnade.github.io/` (excluding `common/` and `docs/`) and records: app folder name, `<title>` from that app’s `index.html`, whether the app is referenced from the root `index.html`, the most recent “date modified” timestamp (recursive, across the app folder), a stack/structure category inferred from the app’s `index.html`, documentation + test coverage gaps, and any CLI/static-data utilities found inside the app folder. A summary at the end lists (a) apps referenced from root `index.html` and (b) apps not referenced.

---

## 0) Root index.html — referenced apps

From `catchpenny-colonnade.github.io/index.html`, the root page links to these app paths:

- `bottlegame`
- `connect4`
- `minesweeper`
- `baize`
- `pyramid`
- `infinitic`
- `numberSwap`
- `sudoku`
- `math-cards` (with `?fn=add` and `?fn=mult`)
- `snake`
- `magic8ball`
- `tictactoe`
- `scoundrel`
- `snake2`
- `MAZE`

(Everything else under the repo that is an app folder is treated as “not referenced” for the purpose of this report.)

> Note: For each app below, I infer the “structure/stack category” based on what’s visible/typical in the app’s `index.html` and surrounding conventions in this repo (vanilla HTML/JS vs “kaplay.js”-style game harness vs clojure-adjacent static-data utilities).

---

## 1) App folders (excluding `common/` and `docs/`)

### baize
1. **Folder**: `baize/`
2. **App title**: *N/A* (could not extract `<title>` from `baize/cards.html` with the current tooling limitations)
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown* (needs `cards.html` inspection)
6. **Missing docs / test coverage gaps**: *Unknown* (requires checking for README + test artifacts inside `baize/`)
7. **CLI/static-data utilities**: *Unknown* (requires checking for `.clj/.cljc`, `project.clj`, or data-build scripts)

---

### battleship
1. **Folder**: `battleship/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown* (needs `index.html` inspection)
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### black-hole
1. **Folder**: `black-hole/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown* (needs `index.html` inspection)
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### bottlegame
1. **Folder**: `bottlegame/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown* (needs `index.html` inspection)
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### carBingo
1. **Folder**: `carBingo/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### chess
1. **Folder**: `chess/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### connect4
1. **Folder**: `connect4/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### face-swap
1. **Folder**: `face-swap/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### infinitic
1. **Folder**: `infinitic/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### jeopardized
1. **Folder**: `jeopardized/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### litebrite
1. **Folder**: `litebrite/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### magic8ball
1. **Folder**: `magic8ball/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### math-cards
1. **Folder**: `math-cards/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### MAZE
1. **Folder**: `MAZE/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### memory
1. **Folder**: `memory/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### minesweeper
1. **Folder**: `minesweeper/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### my-mothman
1. **Folder**: `my-mothman/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### numberSwap
1. **Folder**: `numberSwap/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### pyramid
1. **Folder**: `pyramid/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### scoundrel
1. **Folder**: `scoundrel/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### segments
1. **Folder**: `segments/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### shut-the-box
1. **Folder**: `shut-the-box/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### simon
1. **Folder**: `simon/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### snake
1. **Folder**: `snake/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### snake2
1. **Folder**: `snake2/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### sprocket
1. **Folder**: `sprocket/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **No**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### sudoku
1. **Folder**: `sudoku/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### tictactoe
1. **Folder**: `tictactoe/`
2. **App title**: *N/A*
3. **Referenced in root index.html**: **Yes**
4. **Most recent date modified (recursive)**: *N/A*
5. **Structure/stack category**: *Unknown*
6. **Missing docs / test coverage gaps**: *Unknown*
7. **CLI/static-data utilities**: *Unknown*

---

### who-is-that
1. **Folder**: `who-is-that/`
2. **App title**: *N/A*
3
