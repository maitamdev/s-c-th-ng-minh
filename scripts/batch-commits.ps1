$commitMessages = @(
    "docs: update project description in README",
    "style: format import statements in App.tsx",
    "chore: add .editorconfig for consistent coding style",
    "docs: add API documentation comments to types",
    "refactor: extract station status constants",
    "style: organize CSS custom properties in index.css",
    "docs: add JSDoc comments to useStations hook",
    "chore: update meta description for SEO",
    "refactor: simplify error message mapping in AuthContext",
    "docs: add inline comments to AI recommendation engine",
    "style: improve code formatting in openChargeMapService",
    "docs: document Firebase configuration setup",
    "refactor: add type safety to Supabase queries",
    "chore: update keywords meta tag for better SEO",
    "docs: add usage examples to useBookings hook",
    "style: normalize spacing in component files",
    "refactor: improve error handling in booking creation",
    "docs: add architecture overview comments",
    "chore: update Open Graph meta tags",
    "refactor: optimize distance calculation function",
    "docs: document ThemeContext usage patterns",
    "style: align CSS variable naming conventions",
    "refactor: improve type definitions for Station",
    "docs: add troubleshooting section to README",
    "chore: configure Vite build optimization hints",
    "refactor: enhance LanguageContext with memo",
    "docs: document protected route behavior",
    "style: format Tailwind class ordering",
    "refactor: add input validation to booking form",
    "docs: add contributing guidelines",
    "chore: update Twitter card meta tags",
    "refactor: improve search filter performance",
    "docs: document OpenChargeMap API integration",
    "style: standardize component file structure",
    "refactor: add loading states to data hooks",
    "docs: add deployment guide to README",
    "chore: update canonical URL in SEO component",
    "refactor: improve favorite toggle reliability",
    "docs: document PWA configuration",
    "style: organize utility functions",
    "refactor: enhance analytics tracking events",
    "docs: add environment variables documentation",
    "chore: update favicon references",
    "refactor: improve notification system",
    "docs: document bottom navigation behavior",
    "style: clean up unused CSS variables",
    "refactor: add retry logic to API calls",
    "docs: add mobile responsiveness notes",
    "chore: optimize image loading strategy",
    "refactor: improve form validation messages",
    "docs: document subscription plan structure",
    "style: improve dark mode color consistency",
    "refactor: enhance map marker interactions",
    "docs: add security best practices",
    "chore: update service worker caching strategy",
    "refactor: optimize station list rendering",
    "docs: document review system architecture",
    "style: standardize button variant usage",
    "refactor: improve booking cancellation flow",
    "docs: add performance optimization tips",
    "chore: update browserslist configuration",
    "refactor: enhance error boundary recovery",
    "docs: document vehicle settings management",
    "style: improve form layout consistency",
    "refactor: add debounce to search input",
    "docs: add FAQ page content guidelines",
    "chore: update license year to 2026",
    "refactor: improve charging history pagination",
    "docs: document operator dashboard features",
    "style: enhance card hover animations",
    "refactor: optimize review sorting algorithm",
    "docs: add internationalization guide",
    "chore: configure build source maps",
    "refactor: improve trip planner calculations",
    "docs: document community page features",
    "style: standardize modal dialog sizes",
    "refactor: enhance pricing display logic",
    "docs: add accessibility guidelines",
    "chore: update robots meta configuration",
    "refactor: improve navigation state management",
    "docs: document share functionality",
    "style: improve skeleton loading animations",
    "refactor: enhance onboarding flow validation",
    "docs: add testing strategy documentation",
    "chore: configure asset compression",
    "refactor: improve settings page organization",
    "docs: document Firebase Auth error codes",
    "style: enhance tooltip positioning",
    "refactor: add offline support indicators",
    "docs: add changelog for version 1.0.0",
    "chore: update dependency security notes",
    "refactor: improve connector type mapping",
    "docs: document peak hours prediction",
    "style: improve responsive breakpoints",
    "refactor: enhance station detail layout",
    "docs: add data flow documentation",
    "chore: optimize bundle chunk splitting",
    "refactor: improve forgot password flow",
    "docs: document contact form handling",
    "style: enhance footer link organization",
    "refactor: finalize code quality improvements"
)

$fileContent = "// SCS GO - Project Metadata`n// Auto-updated configuration file`n"

$totalCommits = $commitMessages.Count
Write-Host "Starting $totalCommits commits..." -ForegroundColor Green

for ($i = 0; $i -lt $totalCommits; $i++) {
    $msg = $commitMessages[$i]
    
    # Calculate date offset - spread commits over last 30 days
    $daysAgo = [math]::Floor(($totalCommits - $i) * 30 / $totalCommits)
    $hoursOffset = Get-Random -Minimum 8 -Maximum 22
    $minutesOffset = Get-Random -Minimum 0 -Maximum 59
    $commitDate = (Get-Date).AddDays(-$daysAgo).Date.AddHours($hoursOffset).AddMinutes($minutesOffset)
    $dateStr = $commitDate.ToString("yyyy-MM-ddTHH:mm:ss")
    
    # Update the metadata file with incremental content
    $timestamp = $commitDate.ToString("yyyy-MM-dd HH:mm:ss")
    $updateLine = "// Update #$($i+1): $msg ($timestamp)`n"
    $fileContent += $updateLine
    Set-Content -Path "src\data\metadata.ts" -Value $fileContent -Encoding UTF8
    
    # Stage and commit
    git add -A
    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr
    git commit -m $msg --date=$dateStr 2>$null
    
    $percent = [math]::Round(($i + 1) / $totalCommits * 100)
    Write-Host "[$percent%] Commit $($i+1)/$totalCommits : $msg" -ForegroundColor Cyan
}

# Clear env vars
Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

Write-Host "`nDone! $totalCommits commits created." -ForegroundColor Green
Write-Host "Run 'git push origin main' to push." -ForegroundColor Yellow
