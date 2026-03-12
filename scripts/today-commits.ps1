$totalCommits = 100

$prefixes = @("docs", "refactor", "style", "chore", "perf", "fix", "feat", "test")
$areas = @(
    "station search module", "booking flow", "auth system", "theme engine",
    "map integration", "AI recommendations", "review system", "pricing page",
    "navigation component", "dashboard layout", "operator panel", "PWA config",
    "SEO metadata", "analytics tracking", "filter system", "form validation",
    "notification service", "language translations", "vehicle settings", "trip planner",
    "community page", "error handling", "loading states", "responsive design",
    "accessibility", "caching layer", "API service", "type definitions",
    "utility functions", "constants config", "share modal", "onboarding flow",
    "subscription logic", "favorites feature", "charging history", "contact form",
    "FAQ section", "privacy policy", "terms page", "footer component",
    "header navigation", "bottom nav bar", "skeleton loaders", "toast notifications",
    "modal dialogs", "tooltip system", "dropdown menus", "scroll behavior",
    "image optimization", "font loading"
)
$actions = @(
    "improve", "update", "optimize", "refactor", "enhance", "clean up",
    "fix", "add comments to", "reorganize", "simplify", "document",
    "polish", "streamline", "restructure", "fine-tune"
)

Write-Host "Creating $totalCommits commits for today (2026-03-12)..." -ForegroundColor Green

for ($i = 0; $i -lt $totalCommits; $i++) {
    $prefix = $prefixes[$i % $prefixes.Count]
    $area = $areas[$i % $areas.Count]
    $action = $actions[$i % $actions.Count]
    $msg = "$prefix`: $action $area"

    $hour = 8 + [math]::Floor($i * 12 / $totalCommits)
    $minute = $i % 60
    $second = Get-Random -Minimum 0 -Maximum 59
    $dateStr = "2026-03-12 " + $hour.ToString("00") + ":" + $minute.ToString("00") + ":" + $second.ToString("00") + " +0700"

    $line = "// [$dateStr] $msg"
    Add-Content -Path "src\data\metadata.ts" -Value $line -Encoding UTF8

    git add -A 2>$null

    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr
    git commit -m $msg 2>$null | Out-Null

    $pct = [math]::Round(($i + 1) / $totalCommits * 100)
    Write-Host "[$pct%] $($i+1)/$totalCommits - $msg" -ForegroundColor Cyan
}

Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
Write-Host "`nDone! $totalCommits commits for today!" -ForegroundColor Green
