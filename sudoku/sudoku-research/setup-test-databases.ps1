# Setup script for sudoku-research test databases (Windows)
# Creates both live and test databases if they don't exist

param(
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbPassword = $env:PGPASSWORD
)

$DbNameLive = "sudoku_research"
$DbNameTest = "sudoku_research_test"

Write-Host "Setting up sudoku-research databases..." -ForegroundColor Green
Write-Host "Database user: $DbUser"
Write-Host "Database host: $DbHost:$DbPort"
Write-Host ""

# Function to check if database exists
function Database-Exists {
    param([string]$DatabaseName)
    
    $env:PGPASSWORD = $DbPassword
    try {
        $result = psql -U $DbUser -h $DbHost -p $DbPort -tc "SELECT 1 FROM pg_database WHERE datname = '$DatabaseName'" 2>$null
        return $result -match "1"
    } finally {
        $env:PGPASSWORD = $null
    }
}

# Create live database if it doesn't exist
if (Database-Exists $DbNameLive) {
    Write-Host "✓ Live database '$DbNameLive' already exists" -ForegroundColor Green
} else {
    Write-Host "Creating live database '$DbNameLive'..."
    $env:PGPASSWORD = $DbPassword
    createdb -U $DbUser -h $DbHost -p $DbPort -E UTF8 $DbNameLive
    $env:PGPASSWORD = $null
    Write-Host "✓ Created live database '$DbNameLive'" -ForegroundColor Green
}

# Create test database if it doesn't exist
if (Database-Exists $DbNameTest) {
    Write-Host "✓ Test database '$DbNameTest' already exists" -ForegroundColor Green
} else {
    Write-Host "Creating test database '$DbNameTest'..."
    $env:PGPASSWORD = $DbPassword
    createdb -U $DbUser -h $DbHost -p $DbPort -E UTF8 $DbNameTest
    $env:PGPASSWORD = $null
    Write-Host "✓ Created test database '$DbNameTest'" -ForegroundColor Green
}

Write-Host ""
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To run tests:"
Write-Host "  lein with-profile integration-test test"
Write-Host ""
Write-Host "To drop test database later:"
Write-Host "  dropdb -U $DbUser -h $DbHost -p $DbPort $DbNameTest"
