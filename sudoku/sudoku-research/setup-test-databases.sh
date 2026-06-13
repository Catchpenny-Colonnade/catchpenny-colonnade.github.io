#!/bin/bash
# Setup script for sudoku-research test databases
# Creates both live and test databases if they don't exist

set -e

DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME_LIVE="sudoku_research"
DB_NAME_TEST="sudoku_research_test"

echo "Setting up sudoku-research databases..."
echo "Database user: $DB_USER"
echo "Database host: $DB_HOST:$DB_PORT"
echo ""

# Function to check if database exists
db_exists() {
    PGPASSWORD=$DB_PASSWORD psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -tc "SELECT 1 FROM pg_database WHERE datname = '$1'" | grep -q 1
}

# Create live database if it doesn't exist
if db_exists "$DB_NAME_LIVE"; then
    echo "✓ Live database '$DB_NAME_LIVE' already exists"
else
    echo "Creating live database '$DB_NAME_LIVE'..."
    PGPASSWORD=$DB_PASSWORD createdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -E UTF8 "$DB_NAME_LIVE"
    echo "✓ Created live database '$DB_NAME_LIVE'"
fi

# Create test database if it doesn't exist
if db_exists "$DB_NAME_TEST"; then
    echo "✓ Test database '$DB_NAME_TEST' already exists"
else
    echo "Creating test database '$DB_NAME_TEST'..."
    PGPASSWORD=$DB_PASSWORD createdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -E UTF8 "$DB_NAME_TEST"
    echo "✓ Created test database '$DB_NAME_TEST'"
fi

echo ""
echo "Database setup complete!"
echo ""
echo "To run tests:"
echo "  lein with-profile integration-test test"
echo ""
echo "To drop test database later:"
echo "  dropdb -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME_TEST"
