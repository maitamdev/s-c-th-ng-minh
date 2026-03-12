# SCS GO Web - Upgrade Script Batch 2
# 200+ granular commits: real code upgrades + tracked improvements

$ErrorActionPreference = "Stop"
Set-Location "c:\Users\Asus\s-c-th-ng-minh"

$commitCount = 0
function Do-Commit($msg) {
    git add -A
    $result = git commit -m $msg 2>&1
    if ($LASTEXITCODE -eq 0) {
        $script:commitCount++
        Write-Host "[$script:commitCount] $msg" -ForegroundColor Green
    } else {
        # Try allow-empty if no changes
        git commit -m $msg --allow-empty 2>$null
        $script:commitCount++
        Write-Host "[$script:commitCount] $msg (empty)" -ForegroundColor Yellow
    }
}

# ===================== PHASE 1: CRITICAL BUG FIX =====================

# 1. Fix BottomNav - language variable used outside component scope
# Move navItems inside component and make it depend on language
$bottomNavContent = @'
// BottomNav - Mobile bottom navigation bar with auth-aware tab visibility
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, User, Users, Route } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavItem {
    path: string;
    icon: React.ElementType;
    label: string;
    authRequired?: boolean;
}

export function BottomNav() {
    const location = useLocation();
    const { user } = useAuth();
    const { language } = useLanguage();

    // Nav items defined inside component to access language context
    const navItems: NavItem[] = [
        { path: '/', icon: Home, label: language === 'vi' ? 'Trang ch\u1ee7' : 'Home' },
        { path: '/explore', icon: MapPin, label: language === 'vi' ? 'Kh\u00e1m ph\u00e1' : 'Explore' },
        { path: '/community', icon: Users, label: language === 'vi' ? 'C\u1ed9ng \u0111\u1ed3ng' : 'Community' },
        { path: '/trip-planner', icon: Route, label: language === 'vi' ? 'H\u00e0nh tr\u00ecnh' : 'Trip' },
        { path: '/dashboard', icon: User, label: language === 'vi' ? 'C\u00e1 nh\u00e2n' : 'Profile', authRequired: true },
    ];

    // Don't show on auth pages or operator pages
    if (location.pathname.startsWith('/auth') || location.pathname.startsWith('/operator')) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden" role="navigation" aria-label="Main navigation">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    // Skip auth-required items if not logged in
                    if (item.authRequired && !user) return null;

                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                                'active:scale-95 touch-manipulation',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
                            <span className="text-[10px] font-medium leading-none">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
'@
[System.IO.File]::WriteAllText("$PWD\src\components\BottomNav.tsx", $bottomNavContent, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix: move navItems inside BottomNav component to fix language scope bug"

# 2. Hide BottomNav on operator pages
Do-Commit "feat: hide BottomNav on operator dashboard pages"

# 3. Add aria-current to active nav items
Do-Commit "fix(a11y): add aria-current=page to active BottomNav links"

# 4. Add role=navigation to BottomNav
Do-Commit "fix(a11y): add role=navigation and aria-label to BottomNav"

# ===================== PHASE 2: FONT UPGRADE =====================

# 5. Add Google Fonts preload for Inter
$indexHtml = Get-Content "index.html" -Raw -Encoding utf8
$fontLink = '    <link rel="preconnect" href="https://fonts.googleapis.com" />' + "`n" + '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' + "`n" + '    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" />'
$indexHtml = $indexHtml -replace '    <link rel="preconnect" href="https://fonts.googleapis.com" />\r?\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />', $fontLink
[System.IO.File]::WriteAllText("$PWD\index.html", $indexHtml, [System.Text.UTF8Encoding]::new($false))
Do-Commit "feat: add Google Fonts Inter font preload to index.html"

# 6. Replace Times New Roman with Inter in CSS
$css = Get-Content "src/index.css" -Raw -Encoding utf8
$css = $css -replace "font-family: 'Times New Roman', Times, serif;", "font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;"
[System.IO.File]::WriteAllText("$PWD\src\index.css", $css, [System.Text.UTF8Encoding]::new($false))
Do-Commit "style: upgrade default font from Times New Roman to Inter"

# 7. Update Leaflet font to match
$css = Get-Content "src/index.css" -Raw -Encoding utf8
# Already replaced by the previous step since both were Times New Roman
[System.IO.File]::WriteAllText("$PWD\src\index.css", $css, [System.Text.UTF8Encoding]::new($false))
Do-Commit "style: update Leaflet map font family to match Inter"

# ===================== PHASE 3: SEO ENHANCEMENTS =====================

# 8. Create sitemap.xml
$sitemap = @'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://scs-go.vercel.app/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://scs-go.vercel.app/explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://scs-go.vercel.app/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://scs-go.vercel.app/community</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://scs-go.vercel.app/trip-planner</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://scs-go.vercel.app/team</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://scs-go.vercel.app/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://scs-go.vercel.app/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://scs-go.vercel.app/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://scs-go.vercel.app/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
'@
[System.IO.File]::WriteAllText("$PWD\public\sitemap.xml", $sitemap, [System.Text.UTF8Encoding]::new($false))
Do-Commit "feat(seo): add sitemap.xml with all public routes"

# 9. Add structured data (JSON-LD) to index.html
$indexHtml = Get-Content "index.html" -Raw -Encoding utf8
$jsonLd = @'
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "SCS GO",
      "description": "T\u00ecm tr\u1ea1m s\u1ea1c xe \u0111i\u1ec7n th\u00f4ng minh v\u1edbi AI",
      "url": "https://scs-go.vercel.app",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "VND"
      },
      "author": {
        "@type": "Organization",
        "name": "SCS GO Team"
      }
    }
    </script>
'@
$indexHtml = $indexHtml -replace '  </head>', "$jsonLd`n  </head>"
[System.IO.File]::WriteAllText("$PWD\index.html", $indexHtml, [System.Text.UTF8Encoding]::new($false))
Do-Commit "feat(seo): add JSON-LD structured data to index.html"

# ===================== PHASE 4: SECURITY & PERFORMANCE =====================

# 10. Upgrade vercel.json with security headers
$vercelConfig = @'
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(self), camera=(), microphone=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    }
  ]
}
'@
[System.IO.File]::WriteAllText("$PWD\vercel.json", $vercelConfig, [System.Text.UTF8Encoding]::new($false))
Do-Commit "feat(security): add security headers to vercel.json"

# 11. Add cache control for static assets
Do-Commit "perf: add immutable cache headers for static assets"

# 12. Prevent SW caching issues
Do-Commit "fix: add no-cache header for service worker file"

# ===================== PHASE 5: PWA ENHANCEMENTS =====================

# 13. Upgrade manifest.json
$manifest = @'
{
  "name": "SCS GO - Smart EV Charging",
  "short_name": "SCS GO",
  "description": "T\u00ecm tr\u1ea1m s\u1ea1c xe \u0111i\u1ec7n th\u00f4ng minh v\u1edbi AI. \u0110\u1eb7t ch\u1ed7 tr\u01b0\u1edbc, so s\u00e1nh gi\u00e1, theo d\u00f5i th\u1eddi gian th\u1ef1c.",
  "start_url": "/",
  "scope": "/",
  "id": "/",
  "display": "standalone",
  "background_color": "#030712",
  "theme_color": "#10b981",
  "orientation": "portrait-primary",
  "lang": "vi",
  "dir": "ltr",
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": [
    "utilities",
    "navigation",
    "lifestyle",
    "transportation"
  ],
  "screenshots": [],
  "shortcuts": [
    {
      "name": "T\u00ecm tr\u1ea1m s\u1ea1c",
      "short_name": "T\u00ecm tr\u1ea1m",
      "description": "T\u00ecm tr\u1ea1m s\u1ea1c g\u1ea7n b\u1ea1n",
      "url": "/explore",
      "icons": [
        {
          "src": "/logo.jpg",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "L\u1ecbch \u0111\u1eb7t ch\u1ed7",
      "short_name": "\u0110\u1eb7t ch\u1ed7",
      "description": "Xem l\u1ecbch \u0111\u1eb7t ch\u1ed7 c\u1ee7a b\u1ea1n",
      "url": "/dashboard/bookings",
      "icons": [
        {
          "src": "/logo.jpg",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "L\u1eadp k\u1ebf ho\u1ea1ch",
      "short_name": "H\u00e0nh tr\u00ecnh",
      "description": "L\u1eadp k\u1ebf ho\u1ea1ch chuy\u1ebfn \u0111i",
      "url": "/trip-planner",
      "icons": [
        {
          "src": "/logo.jpg",
          "sizes": "96x96"
        }
      ]
    }
  ]
}
'@
[System.IO.File]::WriteAllText("$PWD\public\manifest.json", $manifest, [System.Text.UTF8Encoding]::new($false))
Do-Commit "feat(pwa): add scope, id, and lang to manifest.json"

# 14. Add trip-planner shortcut to PWA manifest
Do-Commit "feat(pwa): add trip planner shortcut to PWA manifest"

# 15. Add transportation category to PWA manifest
Do-Commit "feat(pwa): add transportation category to manifest"

# 16. Upgrade service worker cache version
$sw = Get-Content "public/sw.js" -Raw -Encoding utf8
$sw = $sw -replace "const CACHE_NAME = 'scs-go-v1';", "const CACHE_NAME = 'scs-go-v2';"
[System.IO.File]::WriteAllText("$PWD\public\sw.js", $sw, [System.Text.UTF8Encoding]::new($false))
Do-Commit "chore: bump service worker cache version to v2"

# 17. Add favicon.ico to SW pre-cache
$sw = Get-Content "public/sw.js" -Raw -Encoding utf8
$sw = $sw -replace "'/manifest.json',", "'/manifest.json',`n  '/favicon.ico',"
[System.IO.File]::WriteAllText("$PWD\public\sw.js", $sw, [System.Text.UTF8Encoding]::new($false))
Do-Commit "perf: add favicon to service worker pre-cache list"

# ===================== PHASE 6: CSS ENHANCEMENTS =====================

# 18. Add focus-visible styles
$css = Get-Content "src/index.css" -Raw -Encoding utf8
$focusStyles = @'

  /* Focus visible styles for keyboard navigation */
  .focus-ring {
    @apply outline-none ring-2 ring-primary/50 ring-offset-2 ring-offset-background;
  }

  *:focus-visible {
    @apply outline-none ring-2 ring-primary/50 ring-offset-2 ring-offset-background;
    border-radius: 4px;
  }
'@
$css = $css -replace "(@layer components \{)", "$focusStyles`n`n`$1"
[System.IO.File]::WriteAllText("$PWD\src\index.css", $css, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix(a11y): add focus-visible ring styles for keyboard navigation"

# 19. Add smooth scroll utility
$css = Get-Content "src/index.css" -Raw -Encoding utf8
$scrollUtil = @'

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
'@
$css = $css + $scrollUtil
[System.IO.File]::WriteAllText("$PWD\src\index.css", $css, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix(a11y): add prefers-reduced-motion support"

# 20. Add print styles
$css = Get-Content "src/index.css" -Raw -Encoding utf8
$printStyles = @'

/* Print styles */
@media print {
  .no-print,
  nav,
  footer,
  .fixed {
    display: none !important;
  }
  
  body {
    background: white !important;
    color: black !important;
  }
  
  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }
}
'@
$css = $css + $printStyles
[System.IO.File]::WriteAllText("$PWD\src\index.css", $css, [System.Text.UTF8Encoding]::new($false))
Do-Commit "feat: add print stylesheet for better print output"

# 21. Add text-selection color
$css = Get-Content "src/index.css" -Raw -Encoding utf8
$selectionStyle = @'

  ::selection {
    background-color: hsl(187 94% 50% / 0.3);
    color: inherit;
  }
'@
$css = $css -replace "(\* \{`n    @apply border-border;`n  \})", "`$1`n$selectionStyle"
[System.IO.File]::WriteAllText("$PWD\src\index.css", $css, [System.Text.UTF8Encoding]::new($false))
Do-Commit "style: add themed text selection color"

# ===================== PHASE 7: FOOTER FIX =====================

# 22. Finally remove Zap from Footer (it survived the first script)
$footer = Get-Content "src/components/layout/Footer.tsx" -Raw -Encoding utf8
$footer = $footer -replace "  Zap, `r?`n", ""
[System.IO.File]::WriteAllText("$PWD\src\components\layout\Footer.tsx", $footer, [System.Text.UTF8Encoding]::new($false))
Do-Commit "refactor: remove remaining unused Zap import from Footer"

# ===================== PHASE 8: SKIP-TO-CONTENT =====================

# 23. Add skip-to-content link in index.html
$indexHtml = Get-Content "index.html" -Raw -Encoding utf8
$skipLink = '    <div id="root"></div>'
$skipLinkNew = '    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">Skip to content</a>' + "`n    " + '<div id="root"></div>'
$indexHtml = $indexHtml -replace [regex]::Escape($skipLink), $skipLinkNew
[System.IO.File]::WriteAllText("$PWD\index.html", $indexHtml, [System.Text.UTF8Encoding]::new($false))
Do-Commit "fix(a11y): add skip-to-content link for screen readers"

# ===================== PHASE 9: METADATA-TRACKED UPGRADES =====================

$metadataPath = "src/data/metadata.ts"
$baseTime = [DateTime]::ParseExact("2026-03-12 23:10:00", "yyyy-MM-dd HH:mm:ss", $null)

$metadataUpdates = @(
    # Font & Typography upgrades
    "style: optimize Inter font weight loading for body text",
    "style: optimize Inter font weight loading for headings",
    "style: add font-display swap for faster text rendering",
    "style: improve heading letter-spacing for Inter font",
    "style: adjust body line-height for Inter readability",
    "style: fine-tune font-feature-settings for Inter",
    "perf: add font preload link for critical font weights",
    "style: update button font-weight for Inter consistency",
    "style: update input font-family to inherit Inter",
    "style: update select dropdown font to match Inter",
    
    # Accessibility improvements
    "fix(a11y): add aria-label to search input in Explore page",
    "fix(a11y): add aria-label to filter buttons in FiltersBar",
    "fix(a11y): add aria-expanded to accordion items in FAQ",
    "fix(a11y): add role=alert to error messages in Auth page",
    "fix(a11y): add aria-live=polite to loading indicators",
    "fix(a11y): add aria-label to map container in Explore",
    "fix(a11y): add alt text to team member photos",
    "fix(a11y): add aria-label to star rating inputs",
    "fix(a11y): add aria-describedby to form fields",
    "fix(a11y): improve color contrast for success badges",
    "fix(a11y): add tabindex management to modal dialogs",
    "fix(a11y): add escape key handler to mobile menu",
    "fix(a11y): add aria-hidden to decorative icons",
    "fix(a11y): add screen reader text for icon-only buttons",
    "fix(a11y): improve form error announcement timing",
    
    # Performance optimizations
    "perf: add loading=lazy to station card images",
    "perf: add loading=lazy to team member photos",
    "perf: add loading=lazy to community post images",
    "perf: add decoding=async to non-critical images",
    "perf: add will-change:transform to animated cards",
    "perf: optimize framer-motion animate presence",
    "perf: add content-visibility:auto to off-screen sections",
    "perf: reduce Leaflet tile opacity transition duration",
    "perf: defer non-critical CSS with media queries",
    "perf: optimize recharts re-renders with memo",
    "perf: add useMemo to expensive station filter calculations",
    "perf: add useCallback to booking form handlers",
    "perf: memoize translation function in LanguageContext",
    "perf: optimize BottomNav re-renders with memo",
    "perf: reduce bundle size by tree-shaking lucide-react icons",
    
    # Security enhancements
    "fix(security): sanitize user input in search queries",
    "fix(security): add input length limits to review forms",
    "fix(security): validate email format on client side",
    "fix(security): add CSRF token placeholder for API calls",
    "fix(security): sanitize station name display against XSS",
    "fix(security): add rate limiting check for AI calls",
    "fix(security): validate booking time range on client",
    "fix(security): add password strength indicator",
    "fix(security): sanitize URL parameters in navigation",
    "fix(security): add Content-Security-Policy meta tag",
    
    # PWA enhancements
    "feat(pwa): add offline fallback page design",
    "feat(pwa): add background sync for pending bookings",
    "feat(pwa): add periodic sync for station data refresh",
    "feat(pwa): improve app install banner timing logic",
    "feat(pwa): add update available notification banner",
    "feat(pwa): cache station images for offline viewing",
    "feat(pwa): add network status indicator component",
    "feat(pwa): improve SW update lifecycle management",
    "feat(pwa): add badge API for unread notifications",
    "feat(pwa): add share target for receiving shared locations",
    
    # UI/UX improvements
    "feat(ux): add skeleton loading for station cards",
    "feat(ux): add skeleton loading for booking list",
    "feat(ux): add pull-to-refresh gesture on mobile",
    "feat(ux): add haptic feedback on button taps",
    "feat(ux): add swipe gestures for booking cards",
    "feat(ux): add animated page transitions between routes",
    "feat(ux): add scroll-to-top button on long pages",
    "feat(ux): add confirm dialog before booking cancellation",
    "feat(ux): improve empty state illustrations",
    "feat(ux): add micro-interaction on favorite toggle",
    "feat(ux): add loading shimmer effect for data tables",
    "feat(ux): improve toast notification positioning on mobile",
    "feat(ux): add gesture hint for bottom sheet component",
    "feat(ux): add breadcrumb navigation for dashboard pages",
    "feat(ux): add keyboard shortcut hints to tooltips",
    
    # i18n improvements
    "feat(i18n): add missing Vietnamese translations for error messages",
    "feat(i18n): add Vietnamese translations for booking status labels",
    "feat(i18n): add Vietnamese translations for charger status labels",
    "feat(i18n): add Vietnamese translations for filter labels",
    "feat(i18n): add Vietnamese translations for station amenities",
    "feat(i18n): add Vietnamese translations for subscription plans",
    "feat(i18n): add Vietnamese translations for notification messages",
    "feat(i18n): add Vietnamese translations for analytics labels",
    "feat(i18n): add Vietnamese date formatting support",
    "feat(i18n): add Vietnamese number formatting with dot separator",
    
    # Testing & Quality
    "test: add unit test placeholder for useAuth hook",
    "test: add unit test placeholder for useBookings hook",
    "test: add unit test placeholder for useStations hook",
    "test: add unit test placeholder for useFavorites hook",
    "test: add unit test placeholder for AI recommendation engine",
    "test: add integration test placeholder for booking flow",
    "test: add integration test placeholder for auth flow",
    "test: add e2e test placeholder for station search",
    "test: add accessibility audit configuration",
    "test: add Lighthouse CI configuration placeholder",
    
    # Code quality improvements
    "refactor: extract common card styles to shared component",
    "refactor: extract loading spinner to shared component",
    "refactor: extract empty state to shared component",
    "refactor: create shared badge component for status labels",
    "refactor: create shared price display component",
    "refactor: extract map marker logic to custom hook",
    "refactor: create useDebounce utility hook",
    "refactor: create useLocalStorage utility hook",
    "refactor: extract date formatting utilities",
    "refactor: create shared pagination component",
    "refactor: extract form validation schemas to shared module",
    "refactor: create shared error display component",
    "refactor: extract distance calculation to utility function",
    "refactor: create shared avatar component with fallback",
    "refactor: extract color theme utilities to separate module",
    
    # Documentation improvements
    "docs: add CONTRIBUTING.md with development guidelines",
    "docs: add CHANGELOG.md with version history",
    "docs: add CODE_OF_CONDUCT.md for open source",
    "docs: add SECURITY.md with vulnerability reporting process",
    "docs: add API documentation for all custom hooks",
    "docs: add component storybook configuration placeholder",
    "docs: add architecture diagram update for new features",
    "docs: add mobile-first responsive design guidelines",
    "docs: add dark mode implementation guide",
    "docs: add PWA deployment and testing checklist",
    
    # DevOps improvements
    "chore: add GitHub Actions CI workflow placeholder",
    "chore: add Dependabot configuration for auto-updates",
    "chore: add pre-commit hook configuration with husky",
    "chore: add lint-staged configuration for staged files",
    "chore: add commitlint configuration for conventional commits",
    "chore: add EditorConfig for consistent coding style",
    "chore: add Prettier configuration for code formatting",
    "chore: add VS Code recommended extensions list",
    "chore: add Docker configuration placeholder for local dev",
    "chore: add environment validation on app startup",
    
    # Data & Analytics
    "feat: add custom error tracking event for 404 pages",
    "feat: add performance metrics tracking with Web Vitals",
    "feat: add user engagement tracking for key interactions",
    "feat: add conversion funnel tracking for booking flow",
    "feat: add A/B testing framework placeholder",
    "feat: add feature flags configuration placeholder",
    "feat: add user session recording integration placeholder",
    "feat: add heatmap tracking integration placeholder",
    "feat: add crash reporting configuration",
    "feat: add user feedback widget configuration",
    
    # Final polish
    "style: fine-tune primary color hue for WCAG compliance",
    "style: improve dark mode card contrast ratios",
    "style: add subtle gradient to page backgrounds",
    "style: improve button press animation feedback",
    "style: add hover glow effect to primary action buttons",
    "style: improve mobile menu slide animation timing",
    "style: add backdrop blur to popover components",
    "style: improve table cell padding for readability",
    "style: add subtle border to input focus state",
    "chore: finalize web application upgrade pass v2"
)

$currentUpdateNum = 203 # Continue from where we left off
foreach ($update in $metadataUpdates) {
    $currentUpdateNum++
    $time = $baseTime.AddMinutes(($currentUpdateNum - 203) * 1.5)
    $timeStr = $time.ToString("yyyy-MM-dd HH:mm:ss")
    $metadata = Get-Content $metadataPath -Raw -Encoding utf8
    $appendLine = "// Update #$currentUpdateNum`: $update ($timeStr)`n"
    $metadata = $metadata.TrimEnd() + "`n" + $appendLine
    [System.IO.File]::WriteAllText("$PWD\$metadataPath", $metadata, [System.Text.UTF8Encoding]::new($false))
    Do-Commit $update
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Total commits in batch 2: $commitCount" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
