param(
    [switch]$SkipMigration
)

$ErrorActionPreference = 'Stop'

Write-Host '=== Talibon Phase 1 Verification ===' -ForegroundColor Cyan
Write-Host "Working directory: $(Get-Location)"
Write-Host "Branch: $(git branch --show-current)"
Write-Host "HEAD: $(git rev-parse HEAD)"

if ((git branch --show-current).Trim() -ne 'KIRCH-PHASE1-INTERNAL-OPS-HRIS') {
    throw 'Verification must be run from KIRCH-PHASE1-INTERNAL-OPS-HRIS.'
}

Write-Host "`n=== Git Status ===" -ForegroundColor Cyan
git status --short

if (-not $SkipMigration) {
    Write-Host "`n=== Additive Migrations ===" -ForegroundColor Cyan
    Write-Host 'This script intentionally never runs migrate:fresh or any destructive reset.' -ForegroundColor Yellow
    php artisan migrate
}

Write-Host "`n=== TypeScript ===" -ForegroundColor Cyan
npm run types:check

Write-Host "`n=== Production Build ===" -ForegroundColor Cyan
npm run build

Write-Host "`n=== Feature Suite ===" -ForegroundColor Cyan
php artisan test --testsuite=Feature

Write-Host "`n=== Phase 1 Verification Completed ===" -ForegroundColor Green
Write-Host "Record this exact HEAD and the command output in docs/ENGINEERING_LOG.md before assigning a release-green label."
