<#
.SYNOPSIS
    Voicebox TTS Auto-Installer for Windows
    Path: D:\AI_projectS\Voicebox
    Port: 17493
#>

$InstallPath = "D:\AI_projectS\Voicebox"
$ApiPort = 17493
$MaxWaitMinutes = 30
$RepoUrl = "https://github.com/jamiepine/voicebox.git"
$LogFile = "$InstallPath\install-log.txt"

# ============================================================
# LOG + UI FUNCTIONS
# ============================================================
function Log($msg) {
    $ts = Get-Date -Format "HH:mm:ss"
    $line = "[$ts] $msg"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line -Encoding UTF8 -ErrorAction SilentlyContinue
}

function Log-OK($msg)   { Log "[ OK ] $msg" }
function Log-ERR($msg)  { Log "[ERR ] $msg" }
function Log-INFO($msg) { Log "[INFO] $msg" }

function Write-Header($text) {
    Log ""
    Log "========================================"
    Log "  $text"
    Log "========================================"
}

# Init log
if (-not (Test-Path $InstallPath)) {
    New-Item -Path $InstallPath -ItemType Directory -Force | Out-Null
}
"" | Set-Content -Path $LogFile -Encoding UTF8
Log "Voicebox Installer started at $(Get-Date)"

# ============================================================
# STEP 0 - CHECK PREREQUISITES
# ============================================================
Write-Header "STEP 0: CHECKING PREREQUISITES"

# Git
Log "Checking Git..."
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Log-ERR "Git NOT FOUND. Install from: https://git-scm.com/download/win"
    exit 1
}
Log-OK "Git found: $($gitCmd.Source)"

# Docker
Log "Checking Docker..."
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Log-ERR "Docker NOT FOUND. Install from: https://www.docker.com/products/docker-desktop/"
    exit 1
}
try {
    $dv = & docker version --format '{{.Server.Version}}' 2>&1
    if ($LASTEXITCODE -ne 0) {
        Log-ERR "Docker daemon is NOT running. Start Docker Desktop and retry."
        exit 1
    }
    Log-OK "Docker running (v$dv)"
} catch {
    Log-ERR "Cannot connect to Docker: $_"
    exit 1
}

# Docker Compose
Log "Checking Docker Compose..."
try {
    $cv = & docker compose version --short 2>&1
    Log-OK "Docker Compose: $cv"
} catch {
    Log-ERR "Docker Compose NOT FOUND"
    exit 1
}

# Disk space
Log "Checking disk space..."
try {
    $disk = Get-PSDrive -Name "D" -ErrorAction Stop
    $freeGB = [math]::Round($disk.Free / 1GB, 1)
    if ($freeGB -lt 30) {
        Log-ERR "Only $freeGB GB free on D: (need 30+ GB)"
        exit 1
    }
    Log-OK "D: has $freeGB GB free"
} catch {
    Log-INFO "Cannot check D: drive, continuing..."
}

# ============================================================
# STEP 1 - PREPARE DIRECTORY
# ============================================================
Write-Header "STEP 1: PREPARING DIRECTORY"

if (Test-Path $InstallPath) {
    $items = Get-ChildItem -Path $InstallPath -ErrorAction SilentlyContinue
    if ($items) {
        Log-INFO "Directory exists and is NOT empty:"
        $items | ForEach-Object { Log-INFO "  $($_.Name)" }
        $r = Read-Host "  Clear directory and continue? (y/n)"
        if ($r -ne 'y') { Log-INFO "Cancelled."; exit 0 }
        Remove-Item -Path "$InstallPath\*" -Recurse -Force
        Log-OK "Directory cleared"
    } else {
        Log-OK "Directory exists and is empty"
    }
} else {
    New-Item -Path $InstallPath -ItemType Directory -Force | Out-Null
    Log-OK "Directory created: $InstallPath"
}

# ============================================================
# STEP 2 - CLONE REPOSITORY
# ============================================================
Write-Header "STEP 2: CLONING REPOSITORY"

$repoDir = Join-Path $InstallPath "voicebox"

if (Test-Path (Join-Path $repoDir ".git")) {
    Log-INFO "Repository already cloned. Updating..."
    Set-Location $repoDir
    & git pull origin main 2>&1 | ForEach-Object { Log-INFO "  $_" }
    Log-OK "Repository updated"
} else {
    Log-INFO "Cloning $RepoUrl ..."
    & git clone $RepoUrl $repoDir 2>&1 | ForEach-Object { Log-INFO "  $_" }
    if (-not (Test-Path (Join-Path $repoDir ".git"))) {
        Log-ERR "Clone FAILED!"
        exit 1
    }
    Log-OK "Repository cloned successfully"
}

Set-Location $repoDir
Log-INFO "Working dir: $(Get-Location)"

# Show what we got
Log-INFO "Repository contents:"
Get-ChildItem $repoDir -Name | ForEach-Object { Log-INFO "  $_" }

# ============================================================
# STEP 3 - SETUP .env
# ============================================================
Write-Header "STEP 3: CONFIGURATION"

$envFile = Join-Path $repoDir ".env"
if (Test-Path $envFile) {
    Log-OK ".env already exists"
    Log-INFO ".env contents:"
    Get-Content $envFile | ForEach-Object { Log-INFO "  $_" }
} else {
    if (Test-Path (Join-Path $repoDir ".env.example")) {
        Copy-Item (Join-Path $repoDir ".env.example") $envFile
        Log-OK ".env created from .env.example"
    } else {
        "PORT=17493" | Set-Content -Path $envFile -Encoding UTF8
        Log-OK ".env created (minimal)"
    }
}

# Check for docker-compose.yml or compose.yml
$composeFile = $null
foreach ($candidate in @("docker-compose.yml", "compose.yml", "docker-compose.yaml", "compose.yaml")) {
    $candidatePath = Join-Path $repoDir $candidate
    if (Test-Path $candidatePath) {
        $composeFile = $candidatePath
        Log-OK "Found compose file: $candidate"
        break
    }
}

if (-not $composeFile) {
    # Search recursively
    $found = Get-ChildItem -Path $repoDir -Filter "*.yml" -Recurse -Depth 1 -ErrorAction SilentlyContinue
    if ($found) {
        Log-INFO "YML files found:"
        $found | ForEach-Object { Log-INFO "  $($_.FullName)" }
    }
    Log-ERR "No docker-compose.yml or compose.yml found in $repoDir"
    Log-INFO "You may need to create one manually. Check the repo README."
    exit 1
}

# Show compose file contents
Log-INFO "Compose file content (first 50 lines):"
Get-Content $composeFile -TotalCount 50 | ForEach-Object { Log-INFO "  $_" }

# ============================================================
# STEP 4 - LAUNCH DOCKER COMPOSE
# ============================================================
Write-Header "STEP 4: LAUNCHING VOICEBOX"

Log ""
Log "!!! FIRST RUN: models download ~10-20 GB, takes 10-30 min !!!"
Log ""

$r = Read-Host "  Start Docker Compose? (y/n)"
if ($r -ne 'y') { Log-INFO "Cancelled."; exit 0 }

Log-INFO "Running: docker compose -f $composeFile up -d --build"
Log-INFO "See detailed log: $InstallPath\compose-log.txt"

$composeOutput = & docker compose -f $composeFile up -d --build 2>&1
$composeOutput | ForEach-Object { Log-INFO "[COMPOSE] $_" }
$composeOutput | Out-File -FilePath "$InstallPath\compose-log.txt" -Encoding UTF8

if ($LASTEXITCODE -ne 0) {
    Log-ERR "Docker compose exited with code $LASTEXITCODE"
    Log-INFO "Check logs: docker compose logs --tail 100"
    exit 1
}

Log-OK "Containers started!"

# Show running containers
Log-INFO "Running containers:"
& docker compose -f $composeFile ps 2>&1 | ForEach-Object { Log-INFO "  $_" }

# ============================================================
# STEP 5 - WAIT FOR MODELS TO LOAD
# ============================================================
Write-Header "STEP 5: WAITING FOR MODEL LOADING"

$apiUrl = "http://127.0.0.1:$ApiPort"
$startTime = Get-Date
$ready = $false
$attempt = 0
$checkInterval = 15

Log "Waiting for API at $apiUrl"
Log "Check every $checkInterval sec, timeout $MaxWaitMinutes min"

while (-not $ready) {
    $attempt++
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)

    if ($elapsed -gt $MaxWaitMinutes) {
        Log-ERR "TIMEOUT after $MaxWaitMinutes minutes!"
        Log-INFO "Check container logs:"
        Log-INFO "  cd $repoDir"
        Log-INFO "  docker compose logs -f --tail 200"
        exit 1
    }

    $dots = "." * ($attempt % 4)
    Write-Host "`r  Attempt #$attempt | ${elapsed} min | Waiting$dots    " -NoNewline

    try {
        $null = Invoke-WebRequest -Uri "$apiUrl/profiles" -Method GET -TimeoutSec 10 -ErrorAction Stop
        $ready = $true
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 404) {
            $ready = $true
        }
    }

    if (-not $ready) {
        Start-Sleep -Seconds $checkInterval
    }
}

Write-Host ""
Log-OK "API is responding! (attempt #$attempt, ${elapsed} min)"

# ============================================================
# STEP 6 - TEST API
# ============================================================
Write-Header "STEP 6: TESTING API ENDPOINTS"

# Try /profiles
Log "Testing: GET $apiUrl/profiles"
try {
    $profiles = Invoke-RestMethod -Uri "$apiUrl/profiles" -Method GET -TimeoutSec 30
    Log-OK "Got profiles response:"
    $profilesJson = $profiles | ConvertTo-Json -Depth 5
    $profilesJson -split "`n" | ForEach-Object { Log-INFO "  $_" }
} catch {
    Log-ERR "Failed: $($_.Exception.Message)"
}

# Try root endpoint
Log "Testing: GET $apiUrl/"
try {
    $root = Invoke-RestMethod -Uri "$apiUrl/" -Method GET -TimeoutSec 10
    Log-OK "Root response:"
    $rootJson = $root | ConvertTo-Json -Depth 3 -Compress
    $rootJson -split "`n" | ForEach-Object { Log-INFO "  $_" }
} catch {
    Log-INFO "Root endpoint not available: $($_.Exception.Message)"
}

# Try /docs (Swagger)
Log "Testing: GET $apiUrl/docs"
try {
    $null = Invoke-WebRequest -Uri "$apiUrl/docs" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Log-OK "Swagger docs available at: $apiUrl/docs"
} catch {
    Log-INFO "No docs endpoint: $($_.Exception.Message)"
}

# Try /api/profiles (alternative path)
Log "Testing: GET $apiUrl/api/profiles"
try {
    $profiles2 = Invoke-RestMethod -Uri "$apiUrl/api/profiles" -Method GET -TimeoutSec 10
    Log-OK "Alternative path works! Got profiles:"
    $profiles2 | ConvertTo-Json -Depth 5 -split "`n" | ForEach-Object { Log-INFO "  $_" }
} catch {
    Log-INFO "Alternative path not available"
}

# Show all container logs (last 30 lines)
Log ""
Log-INFO "Last 30 lines of container logs:"
& docker compose -f $composeFile logs --tail 30 2>&1 | ForEach-Object { Log-INFO "[LOG] $_" }

# ============================================================
# STEP 7 - RESULT
# ============================================================
Write-Header "INSTALLATION COMPLETE"

Log ""
Log "====================================="
Log "  Voicebox is installed and running!"
Log "====================================="
Log ""
Log "  Project path:      $repoDir"
Log "  API URL:           $apiUrl"
Log "  Full log:          $LogFile"
Log "  Compose log:       $InstallPath\compose-log.txt"
Log ""
Log "  Management commands:"
Log "    docker compose ps              - status"
Log "    docker compose logs -f         - live logs"
Log "    docker compose restart         - restart"
Log "    docker compose down            - stop"
Log "    docker compose up -d           - start again"
Log ""
Log "  Test generation example:"
Log '    $body = @{text="Hello world"; profile_id="YOUR_PROFILE_ID"} | ConvertTo-Json'
Log '    Invoke-RestMethod -Uri "http://127.0.0.1:17493/generate" -Method POST -Body $body -ContentType "application/json" -OutFile "D:\AI_projectS\test-voice.mp3"'
Log ""

# Save result JSON
$result = @{
    installPath = $repoDir
    apiUrl      = $apiUrl
    apiPort     = $ApiPort
    status      = "installed"
    timestamp   = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
} | ConvertTo-Json

$resultPath = Join-Path $InstallPath "install-result.json"
$result | Set-Content -Path $resultPath -Encoding UTF8
Log-OK "Result saved to: $resultPath"
Log ""
Log "NEXT: Share this output to proceed with Phase 2 (voice generation script)."
Log ""
