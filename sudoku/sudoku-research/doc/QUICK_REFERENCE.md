# Quick Reference: Docker + PostgreSQL Setup

## One-Time Setup (5 minutes)

### 1. Install Docker Desktop
https://www.docker.com/products/docker-desktop → Install → Restart

### 2. Start PostgreSQL
```powershell
cd sudoku-research
.\docker-init.ps1
```

Wait for: `[OK] PostgreSQL is ready!`

### 3. Initialize Schema
```clojure
(require '[sudoku-research.db :as db])
(db/initialize-db)
```

**Done!** Database is ready.

---

## Using the Database

### Start Your REPL/App
```clojure
(require '[sudoku-research.db :as db])
(db/initialize-db)  ; Connects automatically
```

### Load 1M Puzzles
```clojure
(db/insert-original-puzzle 
  {:puzzle "123456789..." 
   :solution "123456789..."
   :clue-count 25
   :source-file "index00.json"})
```

### Check Clue Distribution
```clojure
(db/count-original-puzzles-by-clue-count)
;; [{:clue-count 17, :count 2} 
;;  {:clue-count 18, :count 5}
;;  ...]
```

### Create Canonical Form
```clojure
(db/insert-canonical-form 
  {:puzzle "123456789..."
   :solution "123456789..."
   :clue-count 25})
```

### Add Permutation
```clojure
(db/insert-permutation
  {:canonical-id 1
   :result "987654321..."
   :rotation-id 1
   :row-order-id nil
   :column-order-id nil
   :symbol-translation-id nil})
```

### Find Matches
```clojure
(db/find-permutations-for-result "123456789...")
;; Returns all canonical forms that generate this puzzle
```

### Get Unmatched Puzzles
```clojure
(db/get-first-unmapped-puzzle-by-clue-count 25)
;; Returns next puzzle needing analysis
```

---

## Container Commands

```powershell
# Stop (preserves data)
.\docker-init.ps1 -Stop

# Start (restarts container)
.\docker-init.ps1 -Start

# Cleanup (deletes all data)
.\docker-init.ps1 -Cleanup

# View logs
docker logs sudoku-postgres-research
docker logs sudoku-postgres-research -f  # Follow
```

---

## Connection Details

```
Host:     localhost
Port:     5432
Database: sudoku_research
User:     postgres
Password: sudoku_research_dev
```

---

## Key Tables

| Table | Purpose |
|-------|---------|
| `original_puzzles` | The 1M dataset |
| `canonical_forms` | Unique representatives |
| `permutations` | Generated variations |
| `rotations` | 0°, 90°, 180°, 270° |
| `row_orders` | Row reorderings |
| `column_orders` | Column reorderings |
| `symbol_translations` | Digit mappings |

---

## View Statistics

```clojure
(db/equivalence-class-summary)
;; Clue count distribution of discovered equivalence classes
```

---

## Workflow Loop

```clojure
(db/initialize-db)

;; 1. Load all 1M puzzles
(load-original-puzzles)

;; 2. For each clue count
(doseq [clue-count (range 17 82)]
  
  ;; 3. While unmatched puzzles exist
  (loop []
    (if-let [puzzle (db/get-first-unmapped-puzzle-by-clue-count clue-count)]
      (do
        ;; 4. Create canonical form
        (db/insert-canonical-form puzzle)
        
        ;; 5. Generate & store permutations
        (doseq [perm (generate-perms (:puzzle puzzle))]
          (db/insert-permutation perm))
        
        ;; 6. Repeat
        (recur))
      
      ;; Done with this clue count
      nil)))

;; 7. View results
(db/equivalence-class-summary)

(db/close-db)
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5432 in use | `docker ps` → find conflicting container |
| Connection refused | `.\docker-init.ps1 -Start` → wait 5s |
| Schema initialization fails | Check `docker logs sudoku-postgres-research` |
| Need fresh data | `.\docker-init.ps1 -Cleanup` → `.\docker-init.ps1` |

---

## Files Reference

| File | Purpose |
|------|---------|
| `docker-init.ps1` | Container lifecycle management |
| `resources/schema.sql` | Database schema |
| `src/sudoku_research/db.clj` | Database API |
| `doc/DOCKER_SETUP.md` | Full setup guide |
