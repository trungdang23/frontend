Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$cloudflaredExe = 'C:\Cloudflared\bin\cloudflared.exe'
$cloudflaredConfig = 'C:\Users\dangv\.cloudflared\config.yml'
$wslDistro = 'Ubuntu-20.04'
$deployDirWsl = '/home/trungdang/apps/journey-frontend'
$frontendHealthUrl = 'https://buicojourney.com/health'
$cloudflaredTunnelName = 'journey-backend'

function Test-CloudflaredTunnelProcess {
    $processes = Get-CimInstance Win32_Process -Filter "Name = 'cloudflared.exe'" -ErrorAction SilentlyContinue

    if (-not $processes) {
        return $false
    }

    foreach ($process in $processes) {
        if ($process.CommandLine -and $process.CommandLine.Contains($cloudflaredTunnelName)) {
            return $true
        }
    }

    return $false
}

function Get-CloudflaredTunnelInfo {
    if (-not (Test-Path $cloudflaredExe)) {
        return @{
            ExitCode = 1
            Output = ''
        }
    }

    $output = & $cloudflaredExe tunnel info $cloudflaredTunnelName 2>&1 | Out-String

    return @{
        ExitCode = $LASTEXITCODE
        Output = $output.Trim()
    }
}

function Test-CloudflaredTunnelActiveConnection {
    $info = Get-CloudflaredTunnelInfo

    if ($info.ExitCode -ne 0) {
        return $false
    }

    if (-not $info.Output) {
        return $false
    }

    return -not $info.Output.Contains('does not have any active connection')
}

function Stop-CloudflaredTunnelProcess {
    $processes = Get-CimInstance Win32_Process -Filter "Name = 'cloudflared.exe'" -ErrorAction SilentlyContinue

    if (-not $processes) {
        return
    }

    foreach ($process in $processes) {
        if ($process.CommandLine -and $process.CommandLine.Contains($cloudflaredTunnelName)) {
            Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
        }
    }
}

function Restart-FrontendRuntime {
    $command = "cd $deployDirWsl && bash ./scripts/restart-production.sh"
    wsl -d $wslDistro bash -lc $command
}

function Start-CloudflaredTunnelIfNeeded {
    if (-not (Test-Path $cloudflaredExe)) {
        throw "cloudflared was not found at $cloudflaredExe"
    }

    if (-not (Test-Path $cloudflaredConfig)) {
        throw "cloudflared config was not found at $cloudflaredConfig"
    }

    if (Test-CloudflaredTunnelActiveConnection) {
        return
    }

    if (Test-CloudflaredTunnelProcess) {
        Stop-CloudflaredTunnelProcess
        Start-Sleep -Seconds 1
    }

    $stdoutLog = 'C:\Users\dangv\.cloudflared\cloudflared.out.log'
    $stderrLog = 'C:\Users\dangv\.cloudflared\cloudflared.err.log'

    Start-Process `
        -FilePath $cloudflaredExe `
        -ArgumentList @('tunnel', '--config', $cloudflaredConfig, 'run', $cloudflaredTunnelName) `
        -WindowStyle Hidden `
        -RedirectStandardOutput $stdoutLog `
        -RedirectStandardError $stderrLog | Out-Null
}

function Wait-ForPublicHealth {
    for ($attempt = 1; $attempt -le 30; $attempt++) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $frontendHealthUrl -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                return
            }
        } catch {
            Start-Sleep -Seconds 2
            continue
        }
    }

    throw "Frontend health endpoint did not return 200 at $frontendHealthUrl"
}

Restart-FrontendRuntime
Start-CloudflaredTunnelIfNeeded
Wait-ForPublicHealth
