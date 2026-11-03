$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $projectRoot '.local'
$mongoExe = Join-Path $runtimeRoot 'mongodb\bin\mongod.exe'
$backendRoot = Join-Path $projectRoot 'backend'
$nodeExe = (Get-Command node.exe -ErrorAction Stop).Source

function Test-LocalPort([int]$Port) {
    $client = [System.Net.Sockets.TcpClient]::new()
    try { $client.Connect('127.0.0.1', $Port); return $true }
    catch { return $false }
    finally { $client.Dispose() }
}

if (!(Test-Path -LiteralPath $mongoExe)) { throw 'Local MongoDB is missing. See backend/LOCAL-DEVELOPMENT.md.' }
if (!(Test-Path -LiteralPath (Join-Path $backendRoot 'node_modules\express\package.json'))) {
    throw 'Install backend dependencies first: cd backend; npm.cmd ci --ignore-scripts'
}

$dataRoot = Join-Path $runtimeRoot 'data'
$logsRoot = Join-Path $runtimeRoot 'logs'
New-Item -ItemType Directory -Path $dataRoot, $logsRoot -Force | Out-Null
$envPath = Join-Path $backendRoot '.env'
if (!(Test-Path -LiteralPath $envPath)) {
    $secret = & $nodeExe -e "process.stdout.write(require('crypto').randomBytes(48).toString('hex'))"
    @(
        'NODE_ENV=development'
        'PORT=5050'
        'MONGO_URI=mongodb://127.0.0.1:27017/binzDB'
        'CLIENT_ORIGIN=http://127.0.0.1:5173,http://localhost:5173'
        'COOKIE_SAME_SITE=lax'
        "JWT_SECRET=$secret"
    ) | Set-Content -LiteralPath $envPath -Encoding ascii
}

if (!(Test-LocalPort 27017)) {
    $mongoArgs = '--dbpath "{0}" --bind_ip 127.0.0.1 --port 27017 --logpath "{1}" --logappend' -f $dataRoot, (Join-Path $logsRoot 'mongodb.log')
    Start-Process -FilePath $mongoExe -ArgumentList $mongoArgs -WorkingDirectory $runtimeRoot -WindowStyle Hidden | Out-Null
}
for ($attempt = 0; $attempt -lt 60 -and !(Test-LocalPort 27017); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-LocalPort 27017)) { throw "MongoDB did not start. Check $logsRoot\mongodb.log" }

if (!(Test-LocalPort 5050)) {
    Start-Process -FilePath $nodeExe -ArgumentList 'server.js' -WorkingDirectory $backendRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logsRoot 'backend.log') -RedirectStandardError (Join-Path $logsRoot 'backend-error.log') | Out-Null
}
for ($attempt = 0; $attempt -lt 45 -and !(Test-LocalPort 5050); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-LocalPort 5050)) { throw "Backend did not start. Check $logsRoot\backend-error.log" }

if (!(Test-LocalPort 5173)) {
    $viteEntry = Join-Path $projectRoot 'node_modules\vite\bin\vite.js'
    $viteArgs = '"{0}" --host 127.0.0.1 --port 5173 --strictPort' -f $viteEntry
    Start-Process -FilePath $nodeExe -ArgumentList $viteArgs -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logsRoot 'frontend.log') -RedirectStandardError (Join-Path $logsRoot 'frontend-error.log') | Out-Null
}
for ($attempt = 0; $attempt -lt 30 -and !(Test-LocalPort 5173); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-LocalPort 5173)) { throw "Website did not start. Check $logsRoot\frontend-error.log" }

$health = $null
for ($attempt = 0; $attempt -lt 45; $attempt++) {
    try {
        $health = Invoke-RestMethod -Uri 'http://127.0.0.1:5050/health' -TimeoutSec 5
        if ($health.status -eq 'ok' -and $health.database -eq 'connected') { break }
    } catch { }
    Start-Sleep -Seconds 1
}
if ($health.status -ne 'ok' -or $health.database -ne 'connected') { throw "Database readiness check failed. Check $logsRoot\backend-error.log" }
Write-Output 'BinZ website: http://127.0.0.1:5173/#home'
Write-Output 'BinZ backend: http://127.0.0.1:5050/health'
Write-Output "Local database files and logs: $runtimeRoot"
