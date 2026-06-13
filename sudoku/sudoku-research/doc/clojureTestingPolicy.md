# Clojure Testing Policy

This policy establishes guidelines for organizing and writing unit tests and integration tests in Clojure projects.

## Unit Tests

Unit tests verify the logic of individual namespaces in isolation.

**Principles:**
- **1:1 Namespace Mapping** — Each source namespace has a matching test namespace
  - Example: `src/<project>/domain/user.clj` → `test/<project>/domain/user_test.clj`
- **Single Unit Focus** — Test only the public functions of that one namespace
- **Mock All Dependencies** — Mock any imports from other namespaces to isolate the unit from external concerns
- **Granular Coverage** — Adjust test depth based on function complexity
  - Simple wrappers (e.g., thin JDBC abstractions): 1–2 tests to verify inputs/outputs
  - Complex logic (e.g., validation functions, data transforms): comprehensive tests covering edge cases
- **Metadata Tag** — Tag each deftest with `^:unit` for Leiningen test filtering
  - Example: `(deftest ^:unit my-function-test ...)`

**Goal:** Ensure each namespace's logic is correct when used in isolation, independent of how other namespaces behave.

---

## Integration Tests

Integration tests verify that multiple namespaces and external resources work together correctly. We organize integration tests into two categories by concern:

### 1. External Resource Tests

Located in: `integration-test/<project_name>/external/`

Tests that interact with actual file I/O, real database connections, or other external services.

**Characteristics:**
- Smoke tests to verify external resources exist and behave as expected
- Sanity checks to validate that unit test mocks match reality
- Example: If unit tests mock a database query, the external test calls the real database with the same parameters
- File naming: `<resource>_integration_test.clj` (e.g., `database_integration_test.clj`, `file_io_integration_test.clj`)
- Namespace: `<project_name>.external.<resource>_integration_test`
- **Metadata Tag** — Tag each deftest with `^:integration` for Leiningen test filtering
  - Example: `(deftest ^:integration database-connection-test ...)`

**When to use:**
- Testing actual file I/O operations (reading/writing files)
- Testing real database connections and queries
- Verifying third-party API integrations
- Checking that external service contracts match your mocks

### 2. End-to-End Tests

Located in: `integration-test/<project_name>/end_to_end/`

Tests that verify workflows across multiple namespaces with mocked external resources.

**Characteristics:**
- Test practical user stories and realistic application flows
- Mock external resources (file I/O, databases, APIs) to focus on orchestration logic
- Less comprehensive than unit tests but more focused on integration points
- File naming: `<workflow>_integration_test.clj` (e.g., `user_registration_integration_test.clj`, `payment_processing_integration_test.clj`)
- Namespace: `<project_name>.end_to_end.<workflow>_integration_test`
- **Metadata Tag** — Tag each deftest with `^:integration` for Leiningen test filtering
  - Example: `(deftest ^:integration user-workflow-test ...)`

**When to use:**
- Testing multi-namespace workflows (e.g., loading data from file → transforming → storing in database)
- Verifying that function composition works end-to-end
- Testing realistic scenarios that require multiple layers of the application

---

## Coverage Strategy

### Test Filtering via Leiningen :test-selectors

The project.clj configures `:test-selectors` with predicates applied to deftest metadata:

```clojure
:test-selectors {:default (complement :integration)
                 :unit :unit
                 :integration :integration}
```

This enables selective test execution based on metadata tags (`^:unit` and `^:integration`):

```bash
lein test                           # Unit tests only (default)
lein test :unit                     # Unit tests explicitly  
lein test :integration              # Integration tests only
```

### Coverage Reporting via lein-cloverage

Run `lein cloverage` with selector flags for separate coverage reports:

```bash
lein cloverage                      # Unit test coverage (default)
lein cloverage --selector :unit     # Unit test coverage (explicit)
lein cloverage --selector :integration  # Integration test coverage
```

This allows you to:
- Track coverage for pure logic independently (unit tests)
- Track coverage for integration and external resource interactions (integration tests)
- Monitor progress toward threshold goals for each category
