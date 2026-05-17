# Docker Setup for Sudoku Research Database
# Run this in PowerShell as Administrator

param(
    [switch]$Cleanup,
    [switch]$Stop,
    [switch]$Start,
    [switch]$Init
)

$ContainerName = "sudoku-postgres-research"
$ImageName = "postgres:15-alpine"
$Port = "5432:5432"
$DataVolume = "C:\Users\$env:USERNAME\AppData\Local\sudoku-postgres-data"
$DbPassword = "sudoku_research_dev"
$DbName = "sudoku_research"

function Initialize-Container {
    Write-Host "================================"
    Write-Host "Initializing PostgreSQL Container"
    Write-Host "================================"
    
    # Check if Docker is running
    try {
        docker --version | Out-Null
    }
    catch {
        Write-Error "Docker not found. Install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        exit 1
    }
    
    # Create data directory if it doesn't exist
    if (!(Test-Path $DataVolume)) {
        New-Item -ItemType Directory -Force -Path $DataVolume | Out-Null
        Write-Host "[OK] Created data volume directory: $DataVolume"
    }
    
    # Check if container already exists
    $existing = docker ps -a -q -f "name=$ContainerName"
    if ($existing) {
        Write-Host "[!] Container already exists. Run with -Cleanup to remove it first."
        return
    }
    
    # Pull image
    Write-Host "[*] Pulling PostgreSQL image..."
    docker pull $ImageName
    
    # Create container
    Write-Host "[*] Creating container..."
    docker run `
        --name $ContainerName `
        -e POSTGRES_PASSWORD=$DbPassword `
        -e POSTGRES_DB=$DbName `
        -p $Port `
        -v "${DataVolume}:/var/lib/postgresql/data" `
        -d $ImageName
    
    Write-Host "[OK] Container created and started"
    Write-Host ""
    Write-Host "Connection Details:"
    Write-Host "  Host: localhost"
    Write-Host "  Port: 5432"
    Write-Host "  Database: $DbName"
    Write-Host "  User: postgres"
    Write-Host "  Password: $DbPassword"
    Write-Host ""
    
    # Wait for container to be ready
    Write-Host "[*] Waiting for PostgreSQL to be ready..."
    $ready = $false
    $attempts = 0
    while (-not $ready -and $attempts -lt 30) {
        try {
            docker exec $ContainerName pg_isready -U postgres | Out-Null
            $ready = $true
        }
        catch {
            Start-Sleep -Seconds 1
            $attempts++
        }
    }
    
    if ($ready) {
        Write-Host "[OK] PostgreSQL is ready!"
        Write-Host ""
        Write-Host "Next steps:"
        Write-Host "  1. Run: psql -h localhost -U postgres -d $DbName"
        Write-Host "     (When prompted for password, enter: $DbPassword)"
        Write-Host "  2. Or use this in your Clojure project (see doc/DOCKER_SETUP.md)"
    }
    else {
        Write-Host "[!] Timeout waiting for PostgreSQL. Check logs with:"
        Write-Host "    docker logs $ContainerName"
    }
}

function Stop-Container {
    Write-Host "Stopping PostgreSQL container..."
    docker stop $ContainerName
    Write-Host "[OK] Container stopped"
}

function Start-Container {
    Write-Host "Starting PostgreSQL container..."
    docker start $ContainerName
    Write-Host "[OK] Container started. Give it 5 seconds to initialize..."
    Start-Sleep -Seconds 5
}

function Cleanup-Container {
    Write-Host "================================"
    Write-Host "Cleaning up PostgreSQL Container"
    Write-Host "================================"
    
    $existing = docker ps -a -q -f "name=$ContainerName"
    if (-not $existing) {
        Write-Host "[!] Container not found"
        return
    }
    
    Write-Host "[*] Stopping container..."
    docker stop $ContainerName -ErrorAction SilentlyContinue
    
    Write-Host "[*] Removing container..."
    docker rm $ContainerName
    
    Write-Host "[*] Removing data volume directory: $DataVolume"
    Remove-Item -Recurse -Force -Path $DataVolume -ErrorAction SilentlyContinue
    
    Write-Host "[OK] Cleanup complete"
}

# Main logic
if ($Cleanup) {
    Cleanup-Container
}
elseif ($Stop) {
    Stop-Container
}
elseif ($Start) {
    Start-Container
}
elseif ($Init) {
    Initialize-Container
}
else {
    # Default: initialize
    Initialize-Container
}
