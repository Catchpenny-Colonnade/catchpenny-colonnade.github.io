# PostgreSQL + Docker Setup for Sudoku Research

## Prerequisites

- **Windows 10/11** with PowerShell
- **Docker Desktop** (free community edition): https://www.docker.com/products/docker-desktop
  - Install and run normally - no special configuration needed
- **Clojure** and **Leiningen** (already set up in your environment)

## Quick Start (5 minutes)

### Step 1: Install Docker Desktop (if not already installed)
```powershell
# Download from: https://www.docker.com/products/docker-desktop
# Run installer, accept defaults, restart your computer
```

### Step 2: Start PostgreSQL Container
```powershell
cd C:\Users\dajoh\Documents\code\catchpenny-colonnade.github.io\sudoku\sudoku-research

# Run as Administrator in PowerShell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\docker-init.ps1
```

This will:
- Download PostgreSQL 15 image (~200MB)
- Create and start container named `sudoku-postgres-research`
- Initialize database `sudoku_research`
- Display connection details

**Output should look like:**
```
================================
Initializing PostgreSQL Container
================================
[OK] Created data volume directory: C:\Users\{username}\AppData\Local\sudoku-postgres-data
[*] Pulling PostgreSQL image...
[OK] Container created and started

Connection Details:
  Host: localhost
  Port: 5432
  Database: sudoku_research
  User: postgres
  Password: sudoku_research_dev

[*] Waiting for PostgreSQL to be ready...
[OK] PostgreSQL is ready!
```

### Step 3: Initialize Database Schema from Clojure
```powershell
cd sudoku-research

# In a REPL or script:
(require '[sudoku-research.db :as db])
(db/initialize-db)
```

Or use the provided initialization function in any Clojure code:
```clojure
(db/initialize-db)
```

**What this does:**
- Connects to PostgreSQL container
- Executes `resources/schema.sql`
- Creates all tables and indexes
- Prints `[OK] Database schema initialized`

---

## Detailed Setup

### Docker Container Management

**View container status:**
```powershell
docker ps -a
```

**Stop container (preserves data):**
```powershell
.\docker-init.ps1 -Stop
```

**Restart container:**
```powershell
.\docker-init.ps1 -Start
```

**Complete cleanup (deletes data):**
```powershell
.\docker-init.ps1 -Cleanup
```

**View logs:**
```powershell
docker logs sudoku-postgres-research
docker logs sudoku-postgres-research -f  # Follow logs in real-time
```

---

## Connection from Clojure

### Auto-initialization (recommended)

In your `-main` or startup code:
```clojure
(require '[sudoku-research.db :as db])

(defn -main [& args]
  ;; Initialize database connection
  (db/initialize-db)
  
  ;; Now use db functions
  (db/count-canonical-by-clue-count)
  
  ;; Clean up when done
  (db/close-db))
```

### Manual connection

```clojure
(require '[sudoku-research.db :as db])

;; Connect with default settings
(def ds (db/connect))

;; Or customize connection
(def ds (db/connect 
  :host "localhost"
  :port 5432
  :user "postgres"
  :password "sudoku_research_dev"
  :dbname "sudoku_research"))

;; Bind to dynamic var for use in db functions
(binding [db/*db* ds]
  ;; Use db functions here
  (db/count-canonical-by-clue-count))
```

---

## Database Schema

### Tables

**`canonical_forms`** - Unique puzzle representatives
- `id`: Auto-generated ID
- `puzzle`: 81-char string (the clues)
- `solution`: 81-char string (the solution)
- `clue_count`: Number of clues in puzzle
- `discovered_at`: Timestamp when added

**`permutations`** - Generated variations from canonical forms
- `id`: Auto-generated ID
- `canonical_id`: Foreign key to `canonical_forms`
- `result`: 81-char string (the permuted result)
- `rotation_id`: Reference to rotation (0°, 90°, 180°, 270°)
- `row_order_id`: Foreign key to row reordering
- `column_order_id`: Foreign key to column reordering
- `symbol_translation_id`: Foreign key to digit mapping
- Unique constraint prevents duplicate transform combinations

**Reference tables** (pre-populated or built as needed):
- `rotations` - Fixed 4 rotation types
- `row_orders` - Dynamically created as discovered
- `column_orders` - Dynamically created as discovered
- `symbol_translations` - Dynamically created as discovered

### Views

**`equivalence_class_summary`** - Statistics by clue count:
```sql
SELECT * FROM equivalence_class_summary;
```

Returns:
```
clue_count | num_canonical_forms | total_permutations_found | total_perm_records
-----------|--------------------|-----------------------|-------------------
    25     |         42          |        5891            |       47128
    26     |         18          |        2104            |       18936
```

---

## Workflow: Your Algorithm

### Step 1: Load 1M puzzles into `original_puzzles`

```clojure
(require '[sudoku-research.db :as db]
         '[clojure.data.json :as json]
         '[clojure.java.io :as io])

(defn load-1m-puzzles []
  (db/initialize-db)
  (println "[*] Loading 1M puzzles from JSON files...")
  
  ;; Read all JSON puzzle files and insert
  (doseq [file (file-seq (io/file "path/to/puzzles/json/files"))
          :when (.endsWith (.getName file) ".json")
          :let [data (json/read-str (slurp file))]
          puzzle data]
    (db/insert-original-puzzle puzzle))
  
  (println "[OK] 1M puzzles loaded"))
```

### Step 2: Analyze clue count distribution

```clojure
(db/count-canonical-by-clue-count)
;; Returns distribution of clue counts in 1M dataset
```

### Step 3: Start equivalence class discovery

```clojure
;; Pick first puzzle for a clue count
(let [first-puzzle (db/get-first-canonical-candidate 25)]
  
  ;; Create canonical form
  (db/insert-canonical-form first-puzzle)
  
  ;; Generate all permutations and store
  (doseq [perm (generate-all-permutations (:puzzle first-puzzle))]
    (db/insert-permutation perm)))

;; Find unmapped puzzles for that clue count
(let [unmapped (db/find-unmapped-by-clue-count 25)]
  (println (format "Still need to map: %d puzzles" (count unmapped))))
```

### Step 4: Repeat until complete

```clojure
(defn discover-all-equivalence-classes []
  (db/initialize-db)
  
  (doseq [clue-count (range 17 82)]
    (loop [iteration 0]
      (if-let [puzzle (db/get-first-unmapped-puzzle-by-clue-count clue-count)]
        (do
          (println (format "[%d] Processing puzzle with %d clues (iteration %d)"
                          clue-count clue-count iteration))
          
          ;; Create canonical form
          (db/insert-canonical-form puzzle)
          
          ;; Generate and store permutations
          (doseq [perm (generate-all-permutations (:puzzle puzzle))]
            (db/insert-permutation perm))
          
          ;; Repeat for next unmapped puzzle
          (recur (inc iteration)))
        
        ;; No more unmapped puzzles for this clue count
        (println (format "[OK] All puzzles with %d clues mapped" clue-count))))))
```

---

## Troubleshooting

### PostgreSQL container won't start

**Check logs:**
```powershell
docker logs sudoku-postgres-research
```

**Common causes:**
- Port 5432 already in use (another database running)
- Docker daemon not running (restart Docker Desktop)
- Data volume corrupted (run with `-Cleanup` and restart)

### Connection refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
- Ensure container is running: `docker ps`
- If not running, restart: `.\docker-init.ps1 -Start`
- Wait 5 seconds after start before connecting

### "Database sudoku_research does not exist"

**The database name in the schema might not match your connection.**

In `docker-init.ps1`, the database is created as:
```
-e POSTGRES_DB=$DbName
```

Where `$DbName = "sudoku_research"`

If you changed the name, update in both places.

### Out of disk space

If your data volume grows too large:
```powershell
# Stop and remove old data
.\docker-init.ps1 -Cleanup

# Restart fresh
.\docker-init.ps1
```

---

## Next Steps

1. **Load 1M puzzles** into `original_puzzles` table
2. **Start discovery loop** - create canonical forms and find matches
3. **Monitor progress** with views and queries
4. **Export results** when complete

See `sudoku-research/src/sudoku_research/analysis.clj` for workflow implementation.
