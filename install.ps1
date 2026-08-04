# AgentKit Installer — Windows Bootstrap
# Downloads the core installer and runs it with Node. The core script
# auto-installs its TUI deps (@clack/prompts, kleur) if missing.
$ErrorActionPreference = 'Stop'
$TMP = Join-Path $env:TEMP "agentkit-install-$PID"
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
    Push-Location $TMP
    try {
        & node "$TMP\install.mjs"
        exit $LASTEXITCODE
    } finally {
        Pop-Location
    }
} finally {
    Remove-Item $TMP -Recurse -Force -ErrorAction SilentlyContinue
}
