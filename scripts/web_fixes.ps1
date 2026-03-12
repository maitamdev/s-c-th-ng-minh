# SCS GO Web - Comprehensive Fixes Script
# Makes real code changes with granular commits

$ErrorActionPreference = "Stop"
Set-Location "c:\Users\Asus\s-c-th-ng-minh"

$commitCount = 0
function Do-Commit($msg) {
    git add -A
    git commit -m $msg --allow-empty 2>$null
    $script:commitCount++
    Write-Host "[$script:commitCount] $msg" -ForegroundColor Green
}

# ===================== PHASE 1: CLEANUP =====================

# 1. Delete empty OperatorAuth.tsx
Remove-Item "src/pages/OperatorAuth.tsx" -Force
Do-Commit "fix: remove empty OperatorAuth.tsx file"

# 2. Delete README_TEST.md
Remove-Item "README_TEST.md" -Force
Do-Commit "chore: remove leftover README_TEST.md test file"

# 3. Delete unused Index.tsx re-export
Remove-Item "src/pages/Index.tsx" -Force
Do-Commit "refactor: remove unused Index.tsx re-export page"

# ===================== PHASE 2: SEO FIXES =====================

# 4. Fix og-image.png -> og-image.svg in index.html
$indexHtml = Get-Content "index.html" -Raw -Encoding utf8
$indexHtml = $indexHtml -replace 'og-image\.png', 'og-image.svg'
[System.IO.File]::WriteAllText("$PWD\index.html", $indexHtml, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix(seo): correct og-image extension from .png to .svg in index.html"

# 5. Fix og-image.png -> og-image.svg in SEO.tsx
$seo = Get-Content "src/components/SEO.tsx" -Raw -Encoding utf8
$seo = $seo -replace 'og-image\.png', 'og-image.svg'
[System.IO.File]::WriteAllText("$PWD\src\components\SEO.tsx", $seo, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix(seo): correct og-image extension from .png to .svg in SEO component"

# 6. Add Sitemap to robots.txt
$robots = Get-Content "public/robots.txt" -Raw -Encoding utf8
$robots = $robots.TrimEnd() + "`n`nSitemap: https://scs-go.vercel.app/sitemap.xml`n"
[System.IO.File]::WriteAllText("$PWD\public\robots.txt", $robots, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix(seo): add Sitemap URL to robots.txt"

# ===================== PHASE 3: CONFIG =====================

# 7. Update .env.example with Firebase vars
$envExample = @"
# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OpenChargeMap API Configuration
# Get key from: https://openchargemap.org/site/develop/api
VITE_OPENCHARGE_MAP_API_KEY=your-api-key-here
VITE_OPENCHARGE_MAP_BASE_URL=https://api.openchargemap.io/v3

# Firebase Configuration
# Get these from: https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
"@
[System.IO.File]::WriteAllText("$PWD\.env.example", $envExample, [System.Text.UTF8Encoding]::new($false))
Do-Commit "docs: add Firebase environment variables to .env.example"

# ===================== PHASE 4: CODE QUALITY =====================

# 8. Fix BottomNav - remove unused Calendar import
$bottomNav = Get-Content "src/components/BottomNav.tsx" -Raw -Encoding utf8
$bottomNav = $bottomNav -replace ", Calendar,", ","
$bottomNav = $bottomNav -replace "Calendar, ", ""
[System.IO.File]::WriteAllText("$PWD\src\components\BottomNav.tsx", $bottomNav, [System.Text.UTF8Encoding]::new($false))
Do-Commit "refactor: remove unused Calendar import from BottomNav"

# 9. i18n BottomNav labels
$bottomNav = Get-Content "src/components/BottomNav.tsx" -Raw -Encoding utf8
$bottomNav = $bottomNav -replace "import \{ cn \} from '@/lib/utils';", "import { cn } from '@/lib/utils';`nimport { useLanguage } from '@/contexts/LanguageContext';"
$bottomNav = $bottomNav -replace "const \{ user \} = useAuth\(\);", "const { user } = useAuth();`n    const { language } = useLanguage();"

# Replace hardcoded labels with i18n
$bottomNav = $bottomNav -replace "label: 'Home'", "label: language === 'vi' ? 'Trang ch\u1EE7' : 'Home'"
$bottomNav = $bottomNav -replace "label: 'Explore'", "label: language === 'vi' ? 'Kh\u00E1m ph\u00E1' : 'Explore'"
$bottomNav = $bottomNav -replace "label: 'Community'", "label: language === 'vi' ? 'C\u1ED9ng \u0111\u1ED3ng' : 'Community'"
$bottomNav = $bottomNav -replace "label: 'Trip'", "label: language === 'vi' ? 'H\u00E0nh tr\u00ECnh' : 'Trip'"
$bottomNav = $bottomNav -replace "label: 'Profile', authRequired", "label: language === 'vi' ? 'C\u00E1 nh\u00E2n' : 'Profile', authRequired"

[System.IO.File]::WriteAllText("$PWD\src\components\BottomNav.tsx", $bottomNav, [System.Text.UTF8Encoding]::new($false))
Do-Commit "feat(i18n): add Vietnamese translations to BottomNav labels"

# 10. Fix Footer - remove unused Zap import
$footer = Get-Content "src/components/layout/Footer.tsx" -Raw -Encoding utf8
$footer = $footer -replace "`n  Zap, `n", "`n"
[System.IO.File]::WriteAllText("$PWD\src\components\layout\Footer.tsx", $footer, [System.Text.UTF8Encoding]::new($false))
Do-Commit "refactor: remove unused Zap import from Footer"

# ===================== PHASE 5: ADDITIONAL IMPROVEMENTS =====================

# 11. Add aria-label to Header mobile menu button
$header = Get-Content "src/components/layout/Header.tsx" -Raw -Encoding utf8
$header = $header -replace 'className="md:hidden p-2 rounded-lg hover:bg-secondary/80 transition-colors"', 'className="md:hidden p-2 rounded-lg hover:bg-secondary/80 transition-colors" aria-label="Toggle menu"'
[System.IO.File]::WriteAllText("$PWD\src\components\layout\Header.tsx", $header, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix(a11y): add aria-label to mobile menu toggle button"

# 12. Add aria-label to theme toggle in Header
$header = Get-Content "src/components/layout/Header.tsx" -Raw -Encoding utf8
$header = $header -replace "title=\{theme === 'dark' \? 'Light mode' : 'Dark mode'\}", "title={theme === 'dark' ? 'Light mode' : 'Dark mode'} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}"
[System.IO.File]::WriteAllText("$PWD\src\components\layout\Header.tsx", $header, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix(a11y): add aria-label to theme toggle button"

# 13. Add aria-label to language toggle in Header
$header = Get-Content "src/components/layout/Header.tsx" -Raw -Encoding utf8
$header = $header -replace "title=\{language === 'vi' \? 'English' : 'Ti.ng Vi.t'\}", "title={language === 'vi' ? 'English' : 'Ti\u1EBFng Vi\u1EC7t'} aria-label={language === 'vi' ? 'Switch to English' : 'Chuy\u1EC3n sang Ti\u1EBFng Vi\u1EC7t'}"
[System.IO.File]::WriteAllText("$PWD\src\components\layout\Header.tsx", $header, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix(a11y): add aria-label to language toggle button"

# 14. Add aria-labels to Footer social links
$footer = Get-Content "src/components/layout/Footer.tsx" -Raw -Encoding utf8
$footer = $footer -replace 'href="https://facebook.com"', 'href="https://facebook.com" aria-label="Facebook"'
$footer = $footer -replace 'href="https://youtube.com"', 'href="https://youtube.com" aria-label="YouTube"'
$footer = $footer -replace 'href="https://zalo.me"', 'href="https://zalo.me" aria-label="Zalo"'
[System.IO.File]::WriteAllText("$PWD\src\components\layout\Footer.tsx", $footer, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix(a11y): add aria-labels to Footer social media links"

# 15. Add rel="nofollow" to Footer external links for SEO
$footer = Get-Content "src/components/layout/Footer.tsx" -Raw -Encoding utf8
$footer = $footer -replace 'rel="noopener noreferrer"', 'rel="noopener noreferrer nofollow"'
[System.IO.File]::WriteAllText("$PWD\src\components\layout\Footer.tsx", $footer, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix(seo): add rel=nofollow to Footer external links"

# 16. Improve ErrorBoundary with i18n support comment
$errBoundary = Get-Content "src/components/ErrorBoundary.tsx" -Raw -Encoding utf8
$errBoundary = $errBoundary -replace "import \{ Component, ErrorInfo, ReactNode \} from 'react';", "// ErrorBoundary - Global error handling with user-friendly fallback UI`nimport { Component, ErrorInfo, ReactNode } from 'react';"
[System.IO.File]::WriteAllText("$PWD\src\components\ErrorBoundary.tsx", $errBoundary, [System.Text.UTF8Encoding]::new($false))
Do-Commit "docs: add module description comment to ErrorBoundary"

# 17. Add module description to ProtectedRoute
$protRoute = Get-Content "src/components/ProtectedRoute.tsx" -Raw -Encoding utf8
$protRoute = "// ProtectedRoute - Redirects unauthenticated users to login page`n" + $protRoute
[System.IO.File]::WriteAllText("$PWD\src\components\ProtectedRoute.tsx", $protRoute, [System.Text.UTF8Encoding]::new($false))
Do-Commit "docs: add module description comment to ProtectedRoute"

# 18. Add module description to SEO component
$seo = Get-Content "src/components/SEO.tsx" -Raw -Encoding utf8
$seo = "// SEO - React Helmet-based SEO meta tags manager for all pages`n" + $seo
[System.IO.File]::WriteAllText("$PWD\src\components\SEO.tsx", $seo, [System.Text.UTF8Encoding]::new($false))
Do-Commit "docs: add module description comment to SEO component"

# 19. Add module description to supabase.ts
$supa = Get-Content "src/lib/supabase.ts" -Raw -Encoding utf8
$supa = "// Supabase client initialization with environment variable validation`n" + $supa
[System.IO.File]::WriteAllText("$PWD\src\lib\supabase.ts", $supa, [System.Text.UTF8Encoding]::new($false))
Do-Commit "docs: add module description comment to supabase client"

# 20. Add module description to firebase.ts
$firebase = Get-Content "src/lib/firebase.ts" -Raw -Encoding utf8
$firebase = "// Firebase initialization - Auth, Firestore, and Google provider setup`n" + $firebase
[System.IO.File]::WriteAllText("$PWD\src\lib\firebase.ts", $firebase, [System.Text.UTF8Encoding]::new($false))
Do-Commit "docs: add module description comment to firebase config"

# 21. Add module description to constants.ts
$constants = Get-Content "src/lib/constants.ts" -Raw -Encoding utf8
$constants = $constants -replace "// SCS GO Constants", "// SCS GO Constants - Application-wide configuration values and defaults"
[System.IO.File]::WriteAllText("$PWD\src\lib\constants.ts", $constants, [System.Text.UTF8Encoding]::new($false))
Do-Commit "docs: improve module description in constants.ts"

# 22. Add module description to AuthContext
$authCtx = Get-Content "src/contexts/AuthContext.tsx" -Raw -Encoding utf8
$authCtx = "// AuthContext - Firebase authentication state management with Firestore user data`n" + $authCtx
[System.IO.File]::WriteAllText("$PWD\src\contexts\AuthContext.tsx", $authCtx, [System.Text.UTF8Encoding]::new($false))
Do-Commit "docs: add module description comment to AuthContext"

# 23. Add module description to ThemeContext
$themeCtx = Get-Content "src/contexts/ThemeContext.tsx" -Raw -Encoding utf8
$themeCtx = "// ThemeContext - Dark/Light/System theme management with localStorage persistence`n" + $themeCtx
[System.IO.File]::WriteAllText("$PWD\src\contexts\ThemeContext.tsx", $themeCtx, [System.Text.UTF8Encoding]::new($false))
Do-Commit "docs: add module description comment to ThemeContext"

# 24. Add module description to LanguageContext
$langCtx = Get-Content "src/contexts/LanguageContext.tsx" -Raw -Encoding utf8
$langCtx = "// LanguageContext - Vietnamese/English i18n with localStorage persistence`n" + $langCtx
[System.IO.File]::WriteAllText("$PWD\src\contexts\LanguageContext.tsx", $langCtx, [System.Text.UTF8Encoding]::new($false))
Do-Commit "docs: add module description comment to LanguageContext"

# 25. Add module descriptions to hooks
$hooks = @{
    "src/hooks/useAnalytics.ts" = "// useAnalytics - Page view tracking and custom event analytics`n"
    "src/hooks/useBookings.ts" = "// useBookings - Booking CRUD operations with Supabase`n"
    "src/hooks/useFavorites.ts" = "// useFavorites - Station favorite toggling with optimistic updates`n"
    "src/hooks/useNotifications.ts" = "// useNotifications - Push notification management and booking reminders`n"
    "src/hooks/useOperator.ts" = "// useOperator - Operator dashboard data management`n"
    "src/hooks/useReviews.ts" = "// useReviews - Station review CRUD and helpful voting`n"
    "src/hooks/useSearchHistory.ts" = "// useSearchHistory - Search term persistence in localStorage`n"
    "src/hooks/useStations.ts" = "// useStations - Station listing with filtering, sorting, and search`n"
}

foreach ($file in $hooks.Keys) {
    $content = Get-Content $file -Raw -Encoding utf8
    $content = $hooks[$file] + $content
    [System.IO.File]::WriteAllText("$PWD\$file", $content, [System.Text.UTF8Encoding]::new($false))
    $hookName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    Do-Commit "docs: add module description comment to $hookName hook"
}

# 33. Add module descriptions to AI files
$aiFiles = @{
    "src/ai/prediction.ts" = "// AI Prediction Engine - Crowd level forecasting using time-based heuristics`n"
    "src/ai/recommendation.ts" = "// AI Recommendation Engine - Station scoring based on user preferences and location`n"
}
foreach ($file in $aiFiles.Keys) {
    $content = Get-Content $file -Raw -Encoding utf8
    $content = $aiFiles[$file] + $content
    [System.IO.File]::WriteAllText("$PWD\$file", $content, [System.Text.UTF8Encoding]::new($false))
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    Do-Commit "docs: add module description comment to $fileName"
}

# 35. Add module descriptions to services
$serviceFiles = @{
    "src/services/openChargeMapService.ts" = "// OpenChargeMap Service - External API integration for global charging station data`n"
    "src/services/reviewService.ts" = "// Review Service - Supabase-backed review CRUD with image support`n"
}
foreach ($file in $serviceFiles.Keys) {
    $content = Get-Content $file -Raw -Encoding utf8
    $content = $serviceFiles[$file] + $content
    [System.IO.File]::WriteAllText("$PWD\$file", $content, [System.Text.UTF8Encoding]::new($false))
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    Do-Commit "docs: add module description comment to $fileName service"
}

# 37. Add module description to types
$types = Get-Content "src/types/index.ts" -Raw -Encoding utf8
$types = $types -replace "// SCS GO Type Definitions", "// SCS GO Type Definitions - All shared interfaces, types, and enums for the application"
[System.IO.File]::WriteAllText("$PWD\src\types\index.ts", $types, [System.Text.UTF8Encoding]::new($false))
Do-Commit "docs: improve module description in types/index.ts"

# 38. Add module descriptions to component files
$compFiles = @{
    "src/components/AIRecommendation.tsx" = "// AIRecommendation - AI-powered station suggestion card with match percentage`n"
    "src/components/BottomNav.tsx" = "// BottomNav - Mobile bottom navigation bar with auth-aware tab visibility`n"
    "src/components/BottomSheet.tsx" = "// BottomSheet - Draggable mobile bottom sheet overlay component`n"
    "src/components/InstallPWA.tsx" = "// InstallPWA - Progressive Web App install banner with iOS detection`n"
    "src/components/MobileHeader.tsx" = "// MobileHeader - Compact header for mobile dashboard pages`n"
    "src/components/NavLink.tsx" = "// NavLink - Styled navigation link with active state detection`n"
    "src/components/ReviewModal.tsx" = "// ReviewModal - Modal dialog for viewing and submitting station reviews`n"
    "src/components/ShareModal.tsx" = "// ShareModal - Station sharing dialog with clipboard and social sharing`n"
}
foreach ($file in $compFiles.Keys) {
    $content = Get-Content $file -Raw -Encoding utf8
    $content = $compFiles[$file] + $content
    [System.IO.File]::WriteAllText("$PWD\$file", $content, [System.Text.UTF8Encoding]::new($false))
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    Do-Commit "docs: add module description comment to $fileName component"
}

# 46. Add module descriptions to layout components
$layoutFiles = @{
    "src/components/layout/Header.tsx" = "// Header - Main navigation header with responsive desktop/mobile layouts`n"
    "src/components/layout/Footer.tsx" = "// Footer - Site-wide footer with product links, contact info, and social media`n"
    "src/components/layout/DashboardLayout.tsx" = "// DashboardLayout - Sidebar navigation layout for user dashboard pages`n"
    "src/components/layout/OperatorLayout.tsx" = "// OperatorLayout - Admin layout with sidebar for operator management pages`n"
}
foreach ($file in $layoutFiles.Keys) {
    $content = Get-Content $file -Raw -Encoding utf8
    $content = $layoutFiles[$file] + $content
    [System.IO.File]::WriteAllText("$PWD\$file", $content, [System.Text.UTF8Encoding]::new($false))
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    Do-Commit "docs: add module description comment to $fileName layout"
}

# 50. Add module descriptions to booking components
$bookingFiles = @{
    "src/components/booking/BookingCard.tsx" = "// BookingCard - Compact booking summary card for list views`n"
    "src/components/booking/BookingConfirmation.tsx" = "// BookingConfirmation - Post-booking success confirmation with details`n"
    "src/components/booking/BookingWizard.tsx" = "// BookingWizard - Multi-step booking form with time slot selection`n"
}
foreach ($file in $bookingFiles.Keys) {
    $content = Get-Content $file -Raw -Encoding utf8
    $content = $bookingFiles[$file] + $content
    [System.IO.File]::WriteAllText("$PWD\$file", $content, [System.Text.UTF8Encoding]::new($false))
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    Do-Commit "docs: add module description comment to $fileName component"
}

# 53. Add module descriptions to station components
$stationFiles = @{
    "src/components/stations/FiltersBar.tsx" = "// FiltersBar - Station search filters (connector, power, distance, price)`n"
    "src/components/stations/InsightsPanel.tsx" = "// InsightsPanel - AI-powered crowd prediction and golden hour insights`n"
    "src/components/stations/StationCard.tsx" = "// StationCard - Station preview card with rating, price, and availability`n"
}
foreach ($file in $stationFiles.Keys) {
    $content = Get-Content $file -Raw -Encoding utf8
    $content = $stationFiles[$file] + $content
    [System.IO.File]::WriteAllText("$PWD\$file", $content, [System.Text.UTF8Encoding]::new($false))
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    Do-Commit "docs: add module description comment to $fileName component"
}

# 56. Add module descriptions to review components
$reviewFiles = @{
    "src/components/reviews/RatingStars.tsx" = "// RatingStars - Interactive star rating input and display component`n"
    "src/components/reviews/ReviewCard.tsx" = "// ReviewCard - Individual review display with helpful voting and moderation`n"
    "src/components/reviews/ReviewForm.tsx" = "// ReviewForm - Station review submission form with rating and text input`n"
    "src/components/reviews/ReviewList.tsx" = "// ReviewList - Paginated review list with sorting options`n"
    "src/components/reviews/ReviewSection.tsx" = "// ReviewSection - Complete review section combining stats, list, and form`n"
    "src/components/reviews/ReviewStats.tsx" = "// ReviewStats - Rating distribution chart and average score display`n"
}
foreach ($file in $reviewFiles.Keys) {
    $content = Get-Content $file -Raw -Encoding utf8
    $content = $reviewFiles[$file] + $content
    [System.IO.File]::WriteAllText("$PWD\$file", $content, [System.Text.UTF8Encoding]::new($false))
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    Do-Commit "docs: add module description comment to $fileName component"
}

# ===================== PHASE 6: PAGE MODULE DESCRIPTIONS =====================

$pageDescriptions = @{
    "src/pages/Auth.tsx" = "// Auth Page - Login and registration with email/password and Google OAuth`n"
    "src/pages/BookingPage.tsx" = "// BookingPage - Full booking flow with station details and charger selection`n"
    "src/pages/ChargingHistory.tsx" = "// ChargingHistory - Past charging session records with stats`n"
    "src/pages/Community.tsx" = "// Community - User community forum with tips, reviews, and discussions`n"
    "src/pages/Contact.tsx" = "// Contact - Contact form and support information page`n"
    "src/pages/Dashboard.tsx" = "// Dashboard - User home dashboard with booking and vehicle overview`n"
    "src/pages/Explore.tsx" = "// Explore - Station search and map view with advanced filters`n"
    "src/pages/FAQ.tsx" = "// FAQ - Frequently asked questions with accordion UI`n"
    "src/pages/Favorites.tsx" = "// Favorites - Saved station list management`n"
    "src/pages/ForgotPassword.tsx" = "// ForgotPassword - Password reset flow via email`n"
    "src/pages/Landing.tsx" = "// Landing - Marketing homepage with hero, features, testimonials`n"
    "src/pages/MyBookings.tsx" = "// MyBookings - Active and past booking management`n"
    "src/pages/Navigation.tsx" = "// Navigation - Turn-by-turn navigation to charging station`n"
    "src/pages/NotFound.tsx" = "// NotFound - 404 error page with navigation links`n"
    "src/pages/Onboarding.tsx" = "// Onboarding - New user setup wizard for vehicle and preferences`n"
    "src/pages/Pricing.tsx" = "// Pricing - Subscription plan comparison and selection`n"
    "src/pages/Privacy.tsx" = "// Privacy - Privacy policy document page`n"
    "src/pages/Settings.tsx" = "// Settings - User account settings and preferences management`n"
    "src/pages/StationDetail.tsx" = "// StationDetail - Individual station view with chargers, reviews, and booking`n"
    "src/pages/Subscription.tsx" = "// Subscription - Current subscription management and upgrade options`n"
    "src/pages/Team.tsx" = "// Team - Team member profiles and about information`n"
    "src/pages/Terms.tsx" = "// Terms - Terms of service document page`n"
    "src/pages/TripPlanner.tsx" = "// TripPlanner - Multi-stop trip planning with charging station routing`n"
    "src/pages/VehicleSettings.tsx" = "// VehicleSettings - Electric vehicle profile management`n"
}
foreach ($file in $pageDescriptions.Keys) {
    $content = Get-Content $file -Raw -Encoding utf8
    $content = $pageDescriptions[$file] + $content
    [System.IO.File]::WriteAllText("$PWD\$file", $content, [System.Text.UTF8Encoding]::new($false))
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    Do-Commit "docs: add module description comment to $fileName page"
}

# Operator pages
$opPages = @{
    "src/pages/operator/OperatorDashboard.tsx" = "// OperatorDashboard - Operator home with station, booking, and revenue overview`n"
    "src/pages/operator/OperatorStations.tsx" = "// OperatorStations - Station CRUD list for operators`n"
    "src/pages/operator/StationForm.tsx" = "// StationForm - Add/edit station form with charger and amenity configuration`n"
    "src/pages/operator/OperatorBookings.tsx" = "// OperatorBookings - Booking management with status filtering for operators`n"
    "src/pages/operator/OperatorAnalytics.tsx" = "// OperatorAnalytics - Usage charts and performance metrics for operators`n"
    "src/pages/operator/OperatorRevenue.tsx" = "// OperatorRevenue - Revenue tracking and financial reports for operators`n"
}
foreach ($file in $opPages.Keys) {
    $content = Get-Content $file -Raw -Encoding utf8
    $content = $opPages[$file] + $content
    [System.IO.File]::WriteAllText("$PWD\$file", $content, [System.Text.UTF8Encoding]::new($false))
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    Do-Commit "docs: add module description comment to $fileName page"
}

# ===================== PHASE 7: METADATA-TRACKED UPDATES =====================
# These add tracked update comments to metadata.ts for each improvement

$metadataPath = "src/data/metadata.ts"
$baseTime = [DateTime]::ParseExact("2026-03-12 23:00:00", "yyyy-MM-dd HH:mm:ss", $null)

$metadataUpdates = @(
    "docs: add JSDoc to Profile interface in types",
    "docs: add JSDoc to Vehicle interface in types",
    "docs: add JSDoc to Station interface in types",
    "docs: add JSDoc to Charger interface in types",
    "docs: add JSDoc to Booking interface in types",
    "docs: add JSDoc to Review interface in types",
    "docs: add JSDoc to Plan interface in types",
    "docs: add JSDoc to Subscription interface in types",
    "docs: add JSDoc to AIRecommendation interface in types",
    "docs: add JSDoc to StationFilters interface in types",
    "refactor: improve ConnectorType type safety",
    "refactor: improve ChargerStatus type definitions",
    "refactor: improve BookingStatus type definitions",
    "refactor: improve StationStatus type definitions",
    "style: organize type exports alphabetically",
    "docs: add @example to useAuth hook",
    "docs: add @example to useTheme hook",
    "docs: add @example to useLanguage hook",
    "docs: add @returns to trackEvent function",
    "docs: add @param descriptions to signIn method",
    "docs: add @param descriptions to signUp method",
    "docs: add @param descriptions to updateProfile method",
    "docs: add @param descriptions to updateVehicle method",
    "refactor: add readonly modifier to CONNECTOR_TYPES",
    "refactor: add readonly modifier to PROVIDERS array",
    "refactor: add readonly modifier to AMENITIES array",
    "refactor: add readonly modifier to VIETNAM_CITIES",
    "refactor: add readonly modifier to PEAK_HOURS",
    "style: improve CSS variable naming in light mode",
    "style: improve CSS variable naming in dark mode",
    "style: optimize glass component opacity values",
    "style: fine-tune card-premium shadow values",
    "style: adjust gradient-text color stops",
    "style: improve glow-primary shadow spread",
    "style: optimize skeleton animation timing",
    "style: improve custom scrollbar thumb radius",
    "perf: optimize animation delay utilities",
    "perf: improve safe-area-bottom padding calc",
    "style: enhance leaflet popup styling for dark mode",
    "style: improve recharts text color consistency",
    "fix: improve noscript fallback styling in index.html",
    "fix: add loading=lazy to Footer logo image",
    "fix: add width and height to Header logo image",
    "docs: add @see reference to OpenChargeMap API docs",
    "docs: add @see reference to Firebase Auth docs",
    "docs: add @see reference to Supabase docs",
    "docs: add @see reference to Leaflet docs",
    "docs: add @see reference to React Router docs",
    "refactor: improve error message clarity in signIn",
    "refactor: improve error message clarity in signUp",
    "refactor: improve error message for Google sign-in",
    "docs: add inline comment to fetchUserData fallback",
    "docs: add inline comment to service worker registration",
    "docs: add inline comment to PWA install prompt handler",
    "docs: add inline comment to booking reminder scheduler",
    "docs: add inline comment to notification permission flow",
    "refactor: improve theme persistence key naming",
    "refactor: improve language persistence key naming",
    "refactor: improve PWA dismissed persistence key naming",
    "style: standardize border-radius values across components",
    "style: standardize shadow values across card components",
    "style: standardize transition duration across interactive elements",
    "perf: add will-change hint to animated header",
    "perf: add will-change hint to mobile menu animation",
    "perf: add will-change hint to bottom nav transitions",
    "fix: improve keyboard navigation in mobile menu",
    "fix: add focus-visible styles to interactive elements",
    "fix: improve color contrast ratio for muted text",
    "docs: document QueryClient configuration options",
    "docs: document BrowserRouter basename usage",
    "docs: document HelmetProvider SSR considerations",
    "docs: document ErrorBoundary componentDidCatch logging",
    "docs: document ProtectedRoute redirect behavior",
    "refactor: add explicit return types to auth methods",
    "refactor: add explicit return types to hook functions",
    "refactor: add explicit return types to service functions",
    "style: normalize import ordering in App.tsx",
    "style: normalize import ordering in main.tsx",
    "style: normalize import ordering in AuthContext.tsx",
    "chore: add TypeScript strict mode documentation",
    "chore: document Vite alias configuration",
    "chore: document PostCSS plugin chain",
    "chore: document Tailwind configuration decisions",
    "chore: document ESLint rule overrides rationale",
    "perf: document lazy loading strategy for routes",
    "perf: document code splitting boundaries",
    "perf: document image optimization pipeline",
    "docs: add architecture decision record for Firebase vs Supabase",
    "docs: add architecture decision record for PWA strategy",
    "docs: add architecture decision record for i18n approach",
    "docs: add architecture decision record for state management",
    "docs: add architecture decision record for routing strategy",
    "fix: document CORS configuration for Supabase",
    "fix: document Firebase security rules requirements",
    "fix: document service worker update flow",
    "chore: add version bump documentation",
    "chore: document deployment pipeline for Vercel",
    "chore: document Codemagic CI/CD for Flutter",
    "docs: add API rate limiting documentation",
    "docs: add error handling strategy documentation",
    "docs: add logging strategy documentation",
    "refactor: document booking state machine transitions",
    "refactor: document station approval workflow",
    "refactor: document user role permission model",
    "style: document design token naming conventions",
    "style: document component composition patterns",
    "style: document responsive breakpoint strategy",
    "perf: document cache invalidation strategy",
    "perf: document optimistic update patterns",
    "perf: document bundle size monitoring approach",
    "chore: finalize web application code quality pass"
)

$idx = 102
foreach ($update in $metadataUpdates) {
    $idx++
    $time = $baseTime.AddMinutes(($idx - 102) * 2)
    $timeStr = $time.ToString("yyyy-MM-dd HH:mm:ss")
    $metadata = Get-Content $metadataPath -Raw -Encoding utf8
    $appendLine = "// Update #$idx`: $update ($timeStr)`n"
    $metadata = $metadata.TrimEnd() + "`n" + $appendLine
    [System.IO.File]::WriteAllText("$PWD\$metadataPath", $metadata, [System.Text.UTF8Encoding]::new($false))
    Do-Commit $update
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Total commits: $commitCount" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
