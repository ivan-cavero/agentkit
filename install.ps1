# AgentKit Installer — Windows Bootstrap (zero-dependency)
$TMP = Join-Path $env:TEMP "agentkit-install-$PID"
New-Item -ItemType Directory -Path $TMP -Force | Out-Null
try {
    Write-Host ""
    Write-Host "  AgentKit Installer" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1/2] Downloading installer..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/ivan-cavero/agentkit/main/install-core.mjs" -OutFile "$TMP\install.mjs" -UseBasicParsing
    Write-Host "  [2/2] Starting installer..." -ForegroundColor Yellow
    Write-Host ""
    node "$TMP\install.mjs"
} finally {
    Remove-Item $TMP -Recurse -Force -ErrorAction SilentlyContinue
}
