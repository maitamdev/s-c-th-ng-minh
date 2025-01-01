# SCS GO - Daily Commits from Jan 2025 to Mar 12 2026
# 1 commit per day to fill GitHub contribution graph

$projectDir = $PSScriptRoot | Split-Path -Parent
Set-Location $projectDir

$metaFile = "src/data/daily-activity.ts"
if (!(Test-Path $metaFile)) { New-Item -Path $metaFile -ItemType File -Force | Out-Null }

# Date range: Jan 1, 2025 -> Mar 12, 2026
$startDate = [datetime]"2025-01-01"
$endDate = [datetime]"2026-03-12"
$totalDays = ($endDate - $startDate).Days + 1

# Commit message templates - rotate through these
$templates = @(
    "docs: update project documentation for {date}",
    "style: refine UI component spacing",
    "refactor: optimize data fetching logic",
    "chore: update configuration settings",
    "docs: add inline code comments",
    "style: improve responsive breakpoints",
    "refactor: enhance error handling patterns",
    "chore: update dependency configurations",
    "docs: improve API documentation",
    "style: adjust color palette values",
    "refactor: simplify state management logic",
    "chore: optimize build performance",
    "docs: update README with new features",
    "style: enhance dark mode styling",
    "refactor: improve form validation flow",
    "chore: clean up unused imports",
    "docs: add component usage examples",
    "style: update typography scale",
    "refactor: optimize search algorithm",
    "chore: configure lint rules",
    "docs: document deployment process",
    "style: improve animation timing",
    "refactor: enhance routing configuration",
    "chore: update environment variables",
    "docs: add accessibility guidelines",
    "style: adjust button hover effects",
    "refactor: optimize image loading",
    "chore: update security headers",
    "docs: improve error message docs",
    "style: refine card shadow values",
    "refactor: enhance auth flow logic",
    "chore: configure caching strategy",
    "docs: update contribution guide",
    "style: improve input field styling",
    "refactor: optimize list rendering",
    "chore: update meta tags",
    "docs: add performance tuning notes",
    "style: enhance modal animations",
    "refactor: improve data mapping logic",
    "chore: update favicon assets",
    "docs: document testing approach",
    "style: adjust grid layout gaps",
    "refactor: enhance notification system",
    "chore: optimize bundle splitting",
    "docs: add troubleshooting guide",
    "style: improve loading skeleton",
    "refactor: enhance bookmark feature",
    "chore: update service worker config",
    "docs: document user flow patterns",
    "style: refine tooltip positioning"
)

Write-Host "=== Daily Commits: $startDate -> $endDate ===" -ForegroundColor Magenta
Write-Host "Total days: $totalDays" -ForegroundColor Green
Write-Host ""

$metaContent = "// SCS GO - Daily Activity Log`n// Auto-generated activity tracking`n`nexport const activityLog: Array<{ day: number; date: string; note: string }> = [`n"

for ($i = 0; $i -lt $totalDays; $i++) {
    $currentDate = $startDate.AddDays($i)
    $dateStr = $currentDate.ToString("yyyy-MM-dd")

    # Pick message from templates (rotating)
    $templateIdx = $i % $templates.Count
    $msg = $templates[$templateIdx] -replace '\{date\}', $dateStr

    # Random hour between 8-22
    $h = Get-Random -Minimum 8 -Maximum 22
    $m = Get-Random -Minimum 0 -Maximum 59
    $s = Get-Random -Minimum 0 -Maximum 59
    $commitDateStr = "${dateStr}T$($h.ToString('00')):$($m.ToString('00')):$($s.ToString('00'))"

    # Update metadata
    $metaContent += "  { day: $($i+1), date: '$dateStr', note: '$msg' },`n"
    $current = $metaContent + "];`nexport const TOTAL_DAYS = $($i+1);`n"
    Set-Content -Path $metaFile -Value $current -Encoding UTF8

    # Commit
    git add -A
    $env:GIT_AUTHOR_DATE = $commitDateStr
    $env:GIT_COMMITTER_DATE = $commitDateStr
    git commit -m $msg --date=$commitDateStr 2>$null

    # Progress
    $percent = [math]::Round(($i + 1) / $totalDays * 100)
    $bar = "#" * [math]::Floor($percent / 2)
    $empty = "-" * (50 - [math]::Floor($percent / 2))
    Write-Host "`r[$bar$empty] $percent% ($($i+1)/$totalDays) $dateStr" -ForegroundColor Cyan -NoNewline
}

Write-Host ""
Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
Write-Host "`n=== DONE! $totalDays daily commits created ===" -ForegroundColor Green
Write-Host "Run: git push origin main --force" -ForegroundColor Yellow
