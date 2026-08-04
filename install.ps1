# AgentKit Installer — Windows Bootstrap
# Downloads the core installer and runs it with Node.
# IMPORTANT: never call `exit` — when invoked via `irm ... | iex` that would
# kill the entire PowerShell session (looks like a "crash" that closes the terminal).
$ErrorActionPreference = 'Stop'
$TMP = Join-Path $env:TEMP "agentkit-install-$PID"
$prevLocation = Get-Location
New-Item -ItemType Directory -Path $TMP -Force | Out-Null

try {
    Write-Host ""
    Write-Host "  AgentKit Installer" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1/2] Downloading installer..." -ForegroundColor Yellow
    $coreUrl = "https://raw.githubusercontent.com/ivan-cavero/agentkit/main/install-core.mjs"
    Invoke-WebRequest -Uri $coreUrl -OutFile "$TMP\install.mjs" -UseBasicParsing
    Write-Host "  [2/2] Starting installer..." -ForegroundColor Yellow
    Write-Host ""

    # Run from the temp dir so auto-npm-install places node_modules next to the script
    Set-Location $TMP
    & node "$TMP\install.mjs"
    $code = $LASTEXITCODE
    if ($null -ne $code -and $code -ne 0) {
        Write-Host ""
        Write-Host "  Installer exited with code $code" -ForegroundColor Red
        Write-Host "  Tip: from a clone, run:  node install-core.mjs" -ForegroundColor DarkGray
        Write-Host ""
    }
}
catch {
    Write-Host ""
    Write-Host "  Bootstrap failed: $_" -ForegroundColor Red
    Write-Host ""
}
finally {
    Set-Location $prevLocation
    Remove-Item $TMP -Recurse -Force -ErrorAction SilentlyContinue
}
