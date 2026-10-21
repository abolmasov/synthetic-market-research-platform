Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Synthetic Market Research Platform - Local Runner" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Ensure we run from the script directory
Push-Location $PSScriptRoot

# Check for Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH."
    Pop-Location
    Read-Host "Press Enter to exit..."
    exit 1
}

# Check Docker Daemon
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker Desktop is not running."
    Pop-Location
    Read-Host "Press Enter to exit..."
    exit 1
}

# Check for Node/NPM
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed or not in PATH. Please install Node.js."
    Pop-Location
    Read-Host "Press Enter to exit..."
    exit 1
}

Write-Host ""
Write-Host "[1/4] Starting Database (Docker Compose)..." -ForegroundColor Yellow

# Detect docker compose command
$composeCmd = "docker"
$composeArgs = @("compose")

# Check if 'docker compose' works
docker compose version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    # If not, check for docker-compose
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        $composeCmd = "docker-compose"
        $composeArgs = @()
    }
    else {
        Write-Error "Docker Compose is not available. Install Docker Desktop or docker-compose."
        Pop-Location
        Read-Host "Press Enter to exit..."
        exit 1
    }
}

# Try to bring down existing containers first to clear port conflicts
Write-Host "    - Resetting existing containers..."
& $composeCmd @($composeArgs + "down") > $null 2>&1

# Run the command
& $composeCmd @($composeArgs + "up" + "-d")
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start Docker containers. Please check if port 5445 is used by another application."
    Pop-Location
    Read-Host "Press Enter to exit..."
    exit 1
}

Write-Host ""
Write-Host "[2/4] Checking Environment Files..." -ForegroundColor Yellow

if (-not (Test-Path "backend\.env")) {
    Write-Host "    - Creating backend\.env from .env.example"
    Copy-Item "backend\.env.example" "backend\.env"
}
else {
    Write-Host "    - backend\.env already exists (keeping existing configuration)"
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "    - Creating frontend\.env from .env.example"
    Copy-Item "frontend\.env.example" "frontend\.env"
}

# Start Backend
Write-Host ""
Write-Host "[3/4] Launching Backend Server (NestJS)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList '/k "cd backend && echo Starting Backend... && npm install && npm run start:dev"'

# Start Frontend
Write-Host ""
Write-Host "[4/4] Launching Frontend Client (Vite)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList '/k "cd frontend && echo Starting Frontend... && npm install && npm run dev"'

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  All services are being initialized!"
Write-Host ""
Write-Host "  - Backend API: http://localhost:3003"
Write-Host "  - Frontend UI: http://localhost:5175"
Write-Host "  - Database:    PostgreSQL (Docker) on port 5445"
Write-Host "  - LLM:         mock mode by default (see backend/.env LLM_MODE)"
Write-Host ""
Write-Host "  Close the separate windows to stop the servers."
Write-Host "  Use 'docker compose down' to stop the database."
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to close this launcher..."

Pop-Location
