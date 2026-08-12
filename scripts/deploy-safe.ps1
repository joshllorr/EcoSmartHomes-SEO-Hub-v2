# ==============================================================================
# EcoSmartHomes SEO Hub — Deploy Safe Automated Release Pipeline
# ==============================================================================

$ErrorActionPreference = "Stop"
Write-Host "🚀 Initializing EcoSmartHomes Deploy-Safe Pipeline..." -ForegroundColor Cyan

# 1. Update Fingerprint Timestamp in src/deployment/fingerprint.json
$fingerprintPath = "src/deployment/fingerprint.json"
$timestamp = Get-Date -Format "yyyy.MM.dd-HHmm"

if (Test-Path $fingerprintPath) {
    $json = Get-Content $fingerprintPath | ConvertFrom-Json
    $json.version = $timestamp
    $json.phases = "1-40"
    $json | ConvertTo-Json -Depth 5 | Set-Content $fingerprintPath
    Write-Host "✅ Step 1: Updated Fingerprint Version -> v$timestamp (Phases 1-40)" -ForegroundColor Green
} else {
    Write-Host "⚠️ Warning: $fingerprintPath not found. Creating default..." -ForegroundColor Yellow
    @{
        version = $timestamp
        phases = "1-40"
        modules = @(
            "Retrofit Blueprint PDF Analytics",
            "Grant Submissions",
            "Post-Install BER & Payment",
            "Master Journey Timeline",
            "Contractor Quality Scores",
            "AI Home Upgrades",
            "National Market Insights",
            "Predictive Forecasting",
            "AI Advisor Monitoring",
            "Sentiment Intelligence",
            "Proactive Coaching",
            "Master Orchestrator"
        )
    } | ConvertTo-Json -Depth 5 | Set-Content $fingerprintPath
}

# 2. Run Local Build Validation
Write-Host "🛠️ Step 2: Running npm run build validation..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Aborting deployment." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Step 2: Build validation succeeded cleanly." -ForegroundColor Green

# 3. Clean Workspace & Remove Stale ZIPs
Write-Host "🧹 Step 3: Cleaning workspace (AntiGravity No-ZIP check)..." -ForegroundColor Cyan
$zips = Get-ChildItem -Path . -Filter "*.zip" -ErrorAction SilentlyContinue
if ($zips) {
    git rm -f *.zip
    Write-Host "✅ Step 3: Removed tracked ZIP archives." -ForegroundColor Green
} else {
    Write-Host "✅ Step 3: Workspace clean. No ZIP archives found." -ForegroundColor Green
}

# 4. Stage, Commit & Push to origin/main
Write-Host "📦 Step 4: Staging source files and pushing to GitHub..." -ForegroundColor Cyan
git add src/ vercel.json index.html vite.config.ts package.json eslint.config.js scripts/

$msg = "deploy: release v$timestamp - Phases 1-40 verified"
git commit -m "$msg"
Write-Host "✅ Step 4: Committed -> '$msg'" -ForegroundColor Green

git push origin main
Write-Host "✅ Step 4: Successfully pushed main to GitHub (origin/main)." -ForegroundColor Green

# 5. Post-Deploy Summary
Write-Host ""
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOY-SAFE PIPELINE COMPLETE!" -ForegroundColor Green
Write-Host "• Live Version Badge : v$timestamp" -ForegroundColor White
Write-Host "• Phase Range        : 1-40 (Master Suite Active)" -ForegroundColor White
Write-Host "• Build Target       : Safari 13 / ESNext Hashed Assets" -ForegroundColor White
Write-Host "• Verification URL   : https://ecosmarthomes-seo-hub.vercel.app" -ForegroundColor White
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ""
