# Claude Copilot Instructions

This file contains custom instructions and skill references for GitHub Copilot.

## Skills

- [Import Namespace Skill](https://gizmo-atheneum.github.io/structure/importnamespace/SKILL.md)

## Principles

- **An ounce of prevention is worth a pound of cure** — Preventive effort upfront (testing, design, planning) is more valuable than reactive fixes later. Apply this to code quality, architecture, and debugging strategies.
- Prefer descriptive naming for counts and totals. Never use the abbreviation "cnt" in SQL aliases, variable names, or API keys; use names like `count`, `total_count`, or `item_count` instead.

## Clojure Best Practices

**Singular Function Purpose** — Each function should do one thing and do it well. If a function has multiple responsibilities, extract them.
- ❌ Bad: `insert-permutation!` validates transform keys, conditionally calls insert-or-get-transform, then inserts
- ✅ Good: `insert-permutation!` accepts a resolved param-map and inserts; `resolve-transform-id` handles the validation and resolution logic

**Separation of Concerns Across Namespaces** — Organize by what functions do, not by how they do it.
- **Data access layer** (mutations.clj, queries.clj): Pure JDBC wrappers that accept param-maps and execute. No business logic, no validation.
- **Business logic layer** (transforms.clj, permutations.clj): Orchestrate workflows, validate inputs, transform data, compose lower-level functions.
- This makes code traceable: to understand a workflow, read the business logic file; to understand how data is persisted, read the data access file.

**Extract Duplicate Code via Composition** — When similar patterns repeat across namespaces (e.g., parameter validation + JDBC execution in both mutations and queries), create a generic helper that both use.
- `execute-safe` in helpers.clj: Validates parameters and wraps JDBC execution for all callers.
- Thin wrappers in mutations/queries: `execute-one-safe` and `execute-many-safe` call the generic helper with namespace-specific options (builder functions, return-keys).
- Result: One source of truth for validation logic; minimal per-namespace boilerplate.

**Brevity Through Composition** — Clojure's strength is combining small, composable functions. Leverage this to keep code short and clear.
- Instead of embedding logic (transforms + insertion in one function), compose: `(mutations/insert-permutation! db {:canonical-id cid :result res :transform-id (transforms/resolve-transform-id db {:transform-key tk})})`
- Each piece is simple enough to understand at a glance; the composition tells the story.

## Clojure Testing Policy

**Unit Tests** — Test individual namespaces in isolation
- **1:1 Namespace Mapping**: `src/<project>/domain/user.clj` ↔ `test/<project>/domain/user_test.clj`
- **Mock All Dependencies**: Mock any imports from other namespaces to isolate the unit
- **Granular Coverage**: Simple wrappers (1–2 tests); complex logic (comprehensive tests)
- **Metadata Tag**: Each deftest should be tagged with `^:unit` for filtering
- Located in: `test/<project_name>/`

**Integration Tests** — Test multiple namespaces and external resources working together
- **External Resource Tests** (`integration-test/<project_name>/external/`): Real file I/O, databases, APIs. Smoke tests + sanity checks that mocks match reality.
- **End-to-End Tests** (`integration-test/<project_name>/end_to_end/`): Multi-namespace workflows with mocked externals. Practical user stories and realistic application flows.
- **Metadata Tag**: Each deftest should be tagged with `^:integration` for filtering

**Test Filtering** via Leiningen `:test-selectors` and deftest metadata:
- `lein test` — Runs unit tests only (default, excludes `^:integration`)
- `lein test :unit` — Runs unit tests explicitly (all `^:unit` tagged tests)
- `lein test :integration` — Runs integration tests only (all `^:integration` tagged tests)

**Coverage** via lein-cloverage with selector filtering:
- `lein cloverage` — Unit test coverage (default)
- `lein cloverage --selector :unit` — Unit test coverage (explicit)
- `lein cloverage --selector :integration` — Integration test coverage

For full guidelines, see: `sudoku/sudoku-research/doc/clojureTestingPolicy.md`
