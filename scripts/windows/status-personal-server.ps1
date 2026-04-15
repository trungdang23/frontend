Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$cloudflaredConfig = 'C:\Users\dangv\.cloudflared\config.yml'
$wslDistro = 'Ubuntu-20.04'
$deployDirWsl = '/home/trungdang/apps/journey-frontend'
$healthUrl = 'https://buicojourney.com/health'
$frontendHostname = 'buicojourney.com'
$deploySshHostname = 'ssh.buicojourney.com'

function Write-Section([string]$title) {
    Write-Host ('=' * 8 + " $title " + '=' * 8)
}

Write-Section 'Frontend (WSL)'
try {
    $command = "cd $deployDirWsl && bash ./scripts/check-production-health.sh"
    wsl -d $wslDistro bash -lc $command
} catch {
    Write-Host "Frontend runtime not healthy or WSL not available."
}

Write-Section 'Cloudflare Tunnel'
$processes = Get-CimInstance Win32_Process -Filter "Name = 'cloudflared.exe'" -ErrorAction SilentlyContinue
if ($processes) {
    $matches = $false
    foreach ($process in $processes) {
        if ($process.CommandLine -and $process.CommandLine.Contains('journey-backend')) {
            $matches = $true
            Write-Host ("PID " + $process.ProcessId + " " + $process.CommandLine)
        }
    }
    if (-not $matches) {
        Write-Host 'cloudflared process found but not the configured tunnel.'
    }
} else {
    Write-Host 'cloudflared process not running.'
}

Write-Section 'Tunnel Routes'
if (-not (Test-Path $cloudflaredConfig)) {
    Write-Host "cloudflared config not found at $cloudflaredConfig"
} else {
    $configContent = Get-Content $cloudflaredConfig -Raw

    if ($configContent.Contains("hostname: $frontendHostname") -and $configContent.Contains('service: http://localhost:3000')) {
        Write-Host "$frontendHostname -> http://localhost:3000 configured."
    } else {
        Write-Host "Frontend root domain route is missing from $cloudflaredConfig."
    }

    if ($configContent.Contains("hostname: $deploySshHostname") -and $configContent.Contains('service: ssh://localhost:22')) {
        Write-Host "$deploySshHostname -> ssh://localhost:22 configured."
    } else {
        Write-Host "Stable SSH route is missing from $cloudflaredConfig."
    }
}

Write-Section 'Public Health'
try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 10
    Write-Host ("HTTP " + $response.StatusCode)
} catch {
    Write-Host "Public health check failed."
}
