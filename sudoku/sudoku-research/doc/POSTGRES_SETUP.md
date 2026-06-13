# Local PostgreSQL Setup for Sudoku Research

## Prerequisites

- PostgreSQL 15 or later installed and running
- Clojure and Leiningen available on your machine
- A database named `sudoku_research`

## Default connection settings

The current code loads database settings in this order:

1. `resources/db-config.local.edn`
2. `resources/db-config.edn`
3. Built-in defaults in `src/sudoku_research/db.clj`

```clojure
{:dbtype "postgresql"
 :host "localhost"
 :port 5432
 :user "postgres"
 :password "sudoku_research_dev"
 :dbname "sudoku_research"}
```

Update `resources/db-config.edn` to match your local PostgreSQL instance.
If you want machine-specific settings that do not get committed, copy the shape from `resources/db-config.local.example.edn` into `resources/db-config.local.edn` and keep only the keys you want to override.

## Quick start

### 1. Create the database

```powershell
createdb -U postgres sudoku_research
```

If `createdb` is not on your `PATH`, create the database with pgAdmin or the PostgreSQL installer tools instead.

### 2. Initialize the schema

In a REPL:

```clojure
(require '[sudoku-research.db :as db])
(db/initialize-db)
```

This loads `resources/schema.sql`, creates the tables and views, and populates the reference tables.

If you changed credentials or host settings, update `resources/db-config.edn` before running `initialize-db`.

Example local override file:

```clojure
{:user "your-local-user"
 :password "your-local-password"
 :dbname "your-local-db"}
```

That same example is committed in `resources/db-config.local.example.edn`.

### 3. Verify the connection

```clojure
(db/count-original-puzzles-by-clue-count)
```

An empty result is fine on a fresh database. Connection errors mean PostgreSQL is not reachable with the configured credentials.

## Manual connection example

```clojure
(require '[sudoku-research.db :as db])

(def ds
  (db/connect
    {:host "localhost"
     :port 5432
     :user "postgres"
     :password "sudoku_research_dev"
     :dbname "sudoku_research"}))

(binding [db/*db* ds]
  (db/count-canonical-by-clue-count))
```

## Troubleshooting

### Connection refused

- Confirm PostgreSQL is running
- Confirm it is listening on `localhost:5432`
- Confirm the database `sudoku_research` exists

### Authentication failed

- Check the username and password in `resources/db-config.local.edn` first, then `resources/db-config.edn`
- If your local PostgreSQL uses a different host, port, or database name, update the config file before calling `initialize-db`

### Schema initialization fails

- Confirm `resources/schema.sql` is present
- Confirm the configured user can create tables, views, and indexes

## Next steps

1. Load source puzzles into `original_puzzles`
2. Create canonical forms from unmapped puzzles
3. Generate permutations and map equivalence classes
