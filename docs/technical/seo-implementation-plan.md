# SEO Implementation Plan

Comprehensive SEO audit findings and phased implementation plan for the Civiti Angular 19 application.

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Audit Findings](#audit-findings)
  - [1. SSR & Deployment](#1-ssr--deployment)
  - [2. Meta Tags & Social Sharing](#2-meta-tags--social-sharing)
  - [3. Crawlability & Indexing](#3-crawlability--indexing)
  - [4. Performance & Core Web Vitals](#4-performance--core-web-vitals)
  - [5. Semantic HTML & Accessibility](#5-semantic-html--accessibility)
- [Implementation Phases](#implementation-phases)
  - [Phase 1: Critical Foundation](#phase-1-critical-foundation)
  - [Phase 2: Meta Tags & Social Sharing](#phase-2-meta-tags--social-sharing)
  - [Phase 3: Performance & Core Web Vitals](#phase-3-performance--core-web-vitals)
  - [Phase 4: Semantic HTML & Accessibility](#phase-4-semantic-html--accessibility)
  - [Phase 5: Advanced Optimizations](#phase-5-advanced-optimizations)
- [Files to Create or Modify](#files-to-create-or-modify)
- [Verification Checklist](#verification-checklist)

---

## Executive Summary

The Civiti application has **critical SEO gaps** that prevent search engine discoverability and social media sharing. While Angular SSR infrastructure exists (`@angular/ssr` installed, `server.ts` present), **it is not deployed correctly** — Vercel serves the client-side SPA build. Combined with zero meta tags, no robots.txt, no sitemap, missing semantic HTML, and no structured data, the app is effectively invisible to search engines.

### Current SEO Score Estimate: ~15/100

| Category | Status | Impact |
| --- | --- | --- |
| SSR deployment | Misconfigured | Search engines see blank HTML |
| Meta tags | Missing entirely | No titles, descriptions, or OG tags |
| robots.txt / sitemap | Missing | Crawlers have no guidance |
| Semantic HTML | Missing | Zero `<main>`, `<nav>`, `<article>` usage |
| ARIA attributes | Missing | Zero ARIA markup in entire app |
| Image optimization | Partial | No NgOptimizedImage, missing width/height |
| Core Web Vitals | Failing | CLS violations, missing preconnects |
| Structured data | Missing | No JSON-LD / schema.org markup |
| Language attribute | Wrong | `lang="en"` but app is Romanian |

---

## Audit Findings

### 1. SSR & Deployment

**Status: CRITICAL — SSR exists but is not deployed**

The app has Angular SSR infrastructure in place:
- `@angular/ssr` v19.2.14 installed
- `server.ts` implements `AngularNodeAppEngine`
- `main.server.ts` and `app.config.server.ts` exist
- `app.routes.server.ts` configures `RenderMode.Prerender` for all routes

However, `vercel.json` is misconfigured:

```json
{
  "outputDirectory": "dist/Civica/browser",    // Points to SPA build, NOT SSR
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]  // SPA fallback
}
```

This means Vercel serves the client-side SPA. Search engine crawlers see:

```html
<html lang="en">
  <head><title>Civiti</title></head>
  <body><app-root></app-root></body>
</html>
```

**Additional issue**: `app.routes.server.ts` prerenders ALL routes including auth-protected pages (`/dashboard`, `/admin/*`, `/auth/*`), which is wasteful and will fail for authenticated content.

---

### 2. Meta Tags & Social Sharing

**Status: CRITICAL — No meta tags, no social sharing previews**

**What exists in `index.html`:**
- `<title>Civiti</title>` (static, never changes per page)
- `<meta charset="utf-8">`
- `<meta name="viewport">`
- `<link rel="icon">`

**What is missing:**
- `<meta name="description">` — no description on any page
- `<meta property="og:title">` — no Open Graph title
- `<meta property="og:description">` — no Open Graph description
- `<meta property="og:image">` — no Open Graph image
- `<meta property="og:url">` — no Open Graph URL
- `<meta property="og:type">` — no Open Graph type
- `<meta name="twitter:card">` — no Twitter card
- `<link rel="canonical">` — no canonical URLs
- `<meta name="robots">` — no robots directives
- `<meta name="theme-color">` — no mobile browser theme

**Angular's `Meta` and `Title` services are not used anywhere in the codebase.** Route `data.headerTitle` is used for UI display only — it does not update the document title.

The app has social sharing methods (`shareOnFacebook`, `shareOnTwitter`, `shareOnLinkedIn`) in the issue detail component, but without OG tags, shared links show generic previews with no issue-specific content.

---

### 3. Crawlability & Indexing

**Status: CRITICAL — No robots.txt, no sitemap, wrong language**

| Item | Status |
| --- | --- |
| `robots.txt` | Missing |
| `sitemap.xml` | Missing |
| `<html lang>` | `"en"` — should be `"ro"` |
| JSON-LD structured data | Missing |
| Canonical URLs | Missing |
| 404 page | Missing — wildcard redirects to `/location` |

The wildcard route `path: '**'` redirects to `/location` instead of showing a proper 404 page with HTTP 404 status. This prevents search engines from identifying dead links.

---

### 4. Performance & Core Web Vitals

**Status: MIXED — Good build config, poor image handling**

#### What's good:
- All routes are lazy-loaded via `loadComponent`
- `PreloadAllModules` strategy enabled
- Production build has optimization enabled (`scripts`, `styles.minify`, `inlineCritical`, `fonts`)
- Budget limits set (2MB warning / 3MB error for initial bundle)
- Font loading uses `display=swap` (prevents FOIT)
- Google Maps loads asynchronously on `window.load`
- NgRx prevents unnecessary re-renders

#### What's missing or broken:

**Images (CLS violations):**
- `NgOptimizedImage` directive not used — all images use `<img src>`
- Only 2 image elements have `loading="lazy"` (photo-upload and issue-detail)
- Zero images have `width` and `height` attributes — causes layout shift
- No CDN or image format optimization (WebP/AVIF)

**Resource hints:**
- No `<link rel="preconnect">` for any third-party domain
- Missing preconnects for: `fonts.googleapis.com`, `fonts.gstatic.com`, Supabase domain, API domain, `maps.googleapis.com`
- No font preload hints

**Deferred rendering:**
- No `@defer` blocks used anywhere — missed opportunity for below-the-fold content

**PWA:**
- No service worker, no manifest, no offline capability
- Not installable as mobile app

#### Core Web Vitals estimate:
- **LCP**: Needs improvement — no optimized images, no `@defer`
- **INP**: Good — NgRx manages state efficiently
- **CLS**: Failing — images lack dimensions

---

### 5. Semantic HTML & Accessibility

**Status: CRITICAL — Zero semantic elements, zero ARIA**

**Semantic HTML:**
- Zero usage of `<main>`, `<nav>`, `<article>`, `<section>`, `<header>`, `<footer>`, `<aside>`
- Everything is `<div>`-based layout
- Multiple pages have improper heading hierarchy (missing `<h1>`, starting at `<h2>` or `<h3>`)
- App shell is just `<router-outlet />` with no semantic wrapper

**ARIA attributes:**
- Zero ARIA attributes in the entire application
- Icon-only buttons have no `aria-label`
- No `aria-live` regions for dynamic content
- No `aria-expanded` on dropdowns
- No `aria-current="page"` on active navigation
- Step indicators in issue creation lack semantic structure

**What's good:**
- `routerLink` used properly throughout (crawlable links)
- Links have descriptive text
- Logo images have `alt` text
- Issue images bind `alt` to issue title

**What needs improvement:**
- Photo alt text is generic ("Photo 1", "Photo 2")
- Dashboard quick actions use `(click)` handlers instead of `routerLink`

---

## Implementation Phases

### Phase 1: Critical Foundation

**Goal**: Make the app visible to search engines.

**Estimated effort**: 1–2 days

#### 1.1 Fix `<html lang>`

**File**: `src/index.html`

Change `<html lang="en">` to `<html lang="ro">`.

#### 1.2 Add default meta tags to `index.html`

**File**: `src/index.html`

Add to `<head>`:

```html
<meta name="description" content="Civiti — Platforma de participare civică pentru cetățenii din România. Raportează probleme locale și presează autoritățile prin campanii coordonate de email." />
<meta name="robots" content="index, follow" />
<meta name="theme-color" content="#14213D" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Civiti" />
<meta property="og:title" content="Civiti — Participare Civică" />
<meta property="og:description" content="Raportează probleme locale și presează autoritățile prin campanii coordonate de email." />
<meta property="og:image" content="/images/logo/civiti-og-image.png" />
<meta property="og:locale" content="ro_RO" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Civiti — Participare Civică" />
<meta name="twitter:description" content="Raportează probleme locale și presează autoritățile prin campanii coordonate de email." />
<meta name="twitter:image" content="/images/logo/civiti-og-image.png" />
```

Create an OG image at `public/images/logo/civiti-og-image.png` (recommended size: 1200x630px).

#### 1.3 Create `robots.txt`

**File**: `public/robots.txt`

```
User-agent: *
Allow: /

# Public pages
Allow: /issues
Allow: /issue/

# Block auth and admin routes
Disallow: /auth/
Disallow: /dashboard
Disallow: /my-issues
Disallow: /admin/

Sitemap: https://civiti.ro/sitemap.xml
```

Register `robots.txt` in `angular.json` under `assets` if not already served from `public/`.

#### 1.4 Create static `sitemap.xml`

**File**: `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.w3.org/2000/svg">
  <url>
    <loc>https://civiti.ro/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://civiti.ro/issues</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

A dynamic sitemap (generated from the issues database) should be considered in Phase 5.

#### 1.5 Add preconnect hints

**File**: `src/index.html`

Add before font/stylesheet links:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

Add Supabase and API domain preconnects dynamically or via environment-specific values.

#### 1.6 Fix SSR deployment on Vercel

**File**: `vercel.json`

This requires investigation into how Angular 19 SSR deploys on Vercel. The current config serves the SPA build. Options:

- Use Vercel's Angular framework preset (auto-detects SSR)
- Update `outputDirectory` and remove the SPA rewrite
- Configure `app.routes.server.ts` to prerender only public routes

#### 1.7 Configure route-specific prerendering

**File**: `src/app/app.routes.server.ts`

```typescript
export const serverRoutes: ServerRoute[] = [
  // Public pages — prerender for SEO
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'location', renderMode: RenderMode.Prerender },
  { path: 'issues', renderMode: RenderMode.Server },
  { path: 'issue/:id', renderMode: RenderMode.Server },

  // Auth pages — client-side only
  { path: 'auth/**', renderMode: RenderMode.Client },

  // Protected pages — client-side only
  { path: 'dashboard', renderMode: RenderMode.Client },
  { path: 'my-issues', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: 'create-issue/**', renderMode: RenderMode.Client },

  // Fallback
  { path: '**', renderMode: RenderMode.Client },
];
```

---

### Phase 2: Meta Tags & Social Sharing

**Goal**: Dynamic per-page titles, descriptions, and social previews.

**Estimated effort**: 1–2 days

#### 2.1 Create SEO service

**File**: `src/app/services/seo.service.ts` (create)

A centralized service that wraps Angular's `Meta` and `Title` services to:
- Set page title (with suffix: `"Page Title | Civiti"`)
- Set meta description
- Set OG tags (title, description, image, url, type)
- Set Twitter Card tags
- Set canonical URL
- Reset to defaults on navigation

#### 2.2 Add route-level SEO data

**File**: `src/app/app.routes.ts`

Add `title` and SEO metadata to route `data`:

```typescript
{
  path: 'issues',
  loadComponent: () => import('...'),
  title: 'Probleme Active în București | Civiti',
  data: {
    seo: {
      description: 'Vezi toate problemele raportate de cetățeni în București.',
      ogType: 'website'
    }
  }
}
```

#### 2.3 Dynamic meta tags for issue detail pages

The issue detail page should dynamically set:
- `<title>` to the issue title
- `<meta name="description">` to a truncated issue description
- `og:title`, `og:description`, `og:image` (from the primary photo)
- `og:url` to the canonical issue URL
- `og:type` to `"article"`

This requires SSR to work — crawlers need to see these tags in the initial HTML response.

#### 2.4 Canonical URLs

Inject `<link rel="canonical">` on every page via the SEO service. For issue detail pages: `https://civiti.ro/issue/{id}`. For list pages with filters: use the base URL without query parameters.

---

### Phase 3: Performance & Core Web Vitals

**Goal**: Pass Core Web Vitals assessment.

**Estimated effort**: 2–3 days

#### 3.1 Add image dimensions

Add `width` and `height` attributes to all `<img>` elements to prevent CLS:

| Component | Image | Suggested dimensions |
| --- | --- | --- |
| Login / registration | Logo | `width="160" height="48"` |
| Issues list | Issue thumbnail | `width="400" height="300"` |
| Dashboard | Issue card image | `width="400" height="300"` |
| My issues | Issue card image | `width="400" height="300"` |
| Issue detail | Full photo | `width="800" height="600"` |
| Photo upload | Preview thumbnail | `width="200" height="150"` |

#### 3.2 Adopt NgOptimizedImage

Replace `<img [src]>` with `<img [ngSrc]>` for images loaded from external URLs (Supabase storage). This provides:
- Automatic `srcset` generation
- Lazy loading by default
- Width/height enforcement
- Priority loading for LCP images

For the primary issue image (LCP candidate), add `priority` attribute.

#### 3.3 Add lazy loading to remaining images

Add `loading="lazy"` to all images that are below the fold:
- Issues list card thumbnails
- Dashboard issue images
- My-issues thumbnails
- Photo gallery items

Do NOT lazy-load:
- Logo (above the fold)
- Primary hero/LCP image

#### 3.4 Add `@defer` blocks

Use Angular's `@defer` for below-the-fold content:

```html
@defer (on viewport) {
  <app-comments [issueId]="issueId" />
} @placeholder {
  <div class="comments-placeholder">Se încarcă comentariile...</div>
}
```

Candidates for deferral:
- Comments section on issue detail
- Google Maps on issue detail
- Photo gallery lightbox
- Admin activity log entries beyond the first page

#### 3.5 Font preloading

Add preload hints for the most critical font weight:

```html
<link rel="preload" as="font" href="https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5Vvl4jL.woff2" type="font/woff2" crossorigin />
```

---

### Phase 4: Semantic HTML & Accessibility

**Goal**: Proper document structure and screen reader support.

**Estimated effort**: 2–3 days

#### 4.1 Add semantic landmarks

**App shell** (`app.component.html` or equivalent):
```html
<app-header />
<main>
  <router-outlet />
</main>
```

**Per-page components**: Wrap primary content in `<article>`, `<section>`, or `<aside>` as appropriate.

#### 4.2 Fix heading hierarchy

Every page must have exactly one `<h1>`. Current issues:

| Page | Current | Fix |
| --- | --- | --- |
| Issues list | Starts at `<h2>` | Add `<h1>` for page title |
| Dashboard | Uses `<h3>` cards | Add `<h1>`, demote cards to `<h2>` |
| Edit issue | Starts at `<h2>` | Add `<h1>` |
| Admin approval | Uses `<h3>` | Add `<h1>` |

#### 4.3 Add ARIA attributes

Priority ARIA additions:

| Pattern | ARIA needed |
| --- | --- |
| Icon-only buttons | `aria-label="Descriere acțiune"` |
| Dynamic content areas | `aria-live="polite"` |
| Dropdown menus | `aria-expanded`, `aria-haspopup` |
| Active navigation link | `aria-current="page"` |
| Issue creation steps | `role="progressbar"` or step semantics |
| Form fields with helpers | `aria-describedby` |

#### 4.4 Improve image alt text

Replace generic photo alt text:

```html
<!-- Before -->
<img [alt]="'Photo ' + (i + 1)">

<!-- After -->
<img [alt]="'Fotografie ' + (i + 1) + ' pentru problema: ' + issueTitle">
```

#### 4.5 Create proper 404 page

Create a dedicated `NotFoundComponent` with:
- Proper `<h1>` heading
- Helpful message in Romanian
- Link back to issues list
- HTTP 404 status via SSR

Replace the wildcard redirect:
```typescript
// Before
{ path: '**', redirectTo: '/location' }

// After
{ path: '**', loadComponent: () => import('./components/not-found/not-found.component') }
```

#### 4.6 Replace click-based navigation with routerLink

Dashboard quick actions and similar patterns should use anchor tags with `routerLink` instead of `<div (click)="navigate()">`. This makes them crawlable and keyboard-accessible.

---

### Phase 5: Advanced Optimizations

**Goal**: Structured data, dynamic sitemap, monitoring.

**Estimated effort**: 2–3 days

#### 5.1 JSON-LD structured data

Add schema.org markup for key pages:

**Homepage / Organization:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Civiti",
  "url": "https://civiti.ro",
  "description": "Platformă de participare civică pentru cetățenii din România"
}
```

**Issue detail / Article:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Issue title",
  "description": "Issue description",
  "image": "Primary photo URL",
  "datePublished": "2024-01-01",
  "author": { "@type": "Person", "name": "Reporter name" }
}
```

**Breadcrumbs:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Acasă", "item": "https://civiti.ro" },
    { "@type": "ListItem", "position": 2, "name": "Probleme", "item": "https://civiti.ro/issues" }
  ]
}
```

Inject via the SEO service using a `<script type="application/ld+json">` element.

#### 5.2 Dynamic sitemap generation

Replace the static sitemap with a server-side generated sitemap that includes all published issues:

```xml
<url>
  <loc>https://civiti.ro/issue/123</loc>
  <lastmod>2024-12-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
```

This can be implemented as a Supabase Edge Function or an API endpoint on the .NET backend.

#### 5.3 PWA support

Add `@angular/pwa` for:
- Offline browsing of previously viewed issues
- App installation on mobile
- Push notification capability (future)

#### 5.4 OG image generation

Generate dynamic OG images per issue (showing issue title, category, primary photo). Options:
- Vercel OG Image Generation (`@vercel/og`)
- Pre-generated images stored in Supabase

#### 5.5 Monitoring

- Register the site in Google Search Console
- Set up Core Web Vitals monitoring (via `web-vitals` library or Vercel Analytics)
- Test social sharing with Facebook Sharing Debugger and Twitter Card Validator

---

## Files to Create or Modify

### Create

| File | Phase | Purpose |
| --- | --- | --- |
| `public/robots.txt` | 1 | Crawling directives |
| `public/sitemap.xml` | 1 | Static sitemap (replaced by dynamic in Phase 5) |
| `public/images/logo/civiti-og-image.png` | 1 | Default Open Graph share image (1200x630px) |
| `src/app/services/seo.service.ts` | 2 | Centralized SEO meta tag management |
| `src/app/components/not-found/not-found.component.ts` | 4 | Proper 404 page |
| `src/app/components/not-found/not-found.component.html` | 4 | 404 page template |
| `src/app/components/not-found/not-found.component.scss` | 4 | 404 page styles |

### Modify

| File | Phase | Change |
| --- | --- | --- |
| `src/index.html` | 1 | `lang="ro"`, meta tags, preconnects |
| `vercel.json` | 1 | SSR deployment configuration |
| `src/app/app.routes.server.ts` | 1 | Route-specific render modes |
| `angular.json` | 1 | Register `robots.txt` and `sitemap.xml` as assets |
| `src/app/app.routes.ts` | 2, 4 | Route titles, SEO data, 404 route |
| `src/app/app.component.html` (or equivalent) | 4 | Add `<main>` wrapper |
| `src/app/components/shared/header/header.component.html` | 4 | Add `<nav>` semantic element |
| `src/app/components/issues-list/issues-list.component.html` | 3, 4 | Image dimensions, heading hierarchy |
| `src/app/components/issue-detail/issue-detail.component.ts` | 2 | Dynamic SEO tags via SEO service |
| `src/app/components/issue-detail/issue-detail.component.html` | 3, 4 | Image optimization, `@defer`, semantics |
| `src/app/components/user/dashboard/dashboard.component.html` | 3, 4 | Image dimensions, headings, `routerLink` |
| `src/app/components/user/my-issues/my-issues.component.html` | 3, 4 | Image dimensions, headings |
| `src/app/components/auth/login/login.component.html` | 3 | Logo image dimensions |
| `src/app/components/issue-creation/photo-upload/photo-upload.component.html` | 4 | Improve alt text |
| `src/app/components/issue-creation/issue-review/issue-review.component.html` | 4 | Improve alt text |

---

## Verification Checklist

### Phase 1 Complete When:
- [ ] `<html lang="ro">` in page source
- [ ] `/robots.txt` returns 200 with correct content
- [ ] `/sitemap.xml` returns 200 with valid XML
- [ ] Default meta description visible in page source
- [ ] Default OG tags visible in page source
- [ ] Preconnect hints in `<head>`
- [ ] SSR serves pre-rendered HTML for `/issues` route

### Phase 2 Complete When:
- [ ] Browser tab shows page-specific titles (not just "Civiti")
- [ ] Each route has a unique meta description
- [ ] Issue detail pages set OG tags from issue data
- [ ] Facebook Sharing Debugger shows correct preview for shared issue links
- [ ] `<link rel="canonical">` present on all pages

### Phase 3 Complete When:
- [ ] All `<img>` elements have `width` and `height` attributes
- [ ] Lighthouse CLS score is 0 or near 0
- [ ] Below-the-fold images have `loading="lazy"`
- [ ] At least one `@defer` block in use
- [ ] Google PageSpeed Insights score > 80

### Phase 4 Complete When:
- [ ] Every page has exactly one `<h1>`
- [ ] `<main>` wraps the router outlet
- [ ] Header navigation uses `<nav>`
- [ ] All icon-only buttons have `aria-label`
- [ ] `/nonexistent-page` shows 404 page (not redirect)
- [ ] Lighthouse accessibility score > 90

### Phase 5 Complete When:
- [ ] JSON-LD visible in page source for homepage and issue detail
- [ ] Dynamic sitemap includes all published issues
- [ ] Site registered in Google Search Console with no errors
- [ ] Core Web Vitals pass in Google Search Console
