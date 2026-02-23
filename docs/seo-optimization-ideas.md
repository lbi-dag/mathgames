# SEO Optimization Ideas (Post-Baseline)

This document captures SEO improvements to consider after the Phase 1 baseline metadata and crawlability updates.

## 1) Route-Level Metadata
Add route-specific `<title>`, description, canonical, and social metadata for:
- `/`
- `/about`
- `/games/number-sense`
- `/games/exponent-practice`
- `/games/prime-factor-challenge`

### Why
- Improves relevance for specific search intent.
- Increases click-through rate for long-tail game-specific keywords.

### Safe Implementation Notes
- Keep this client-only and static-friendly (Phase 1 compliant).
- Use a lightweight head-management approach in React.

## 2) Landing and About Content Expansion
Add short, indexable copy that maps to search intent:
- Mental math game
- Exponent practice game
- Prime factorization practice
- Number sense speed training
- Timed math challenge

### Why
- Search engines need rich text context, not only interactive UI.
- Better topical authority for target queries.

### Safe Implementation Notes
- Keep content static; no backend required.
- Avoid promising future-phase features (global leaderboards, login, accounts).

## 3) Structured Data (JSON-LD)
Add schema for:
- `WebSite`
- `SoftwareApplication`
- Optional `FAQPage` (if FAQ content is added)

### Why
- Improves machine readability of product intent and page purpose.
- Can improve eligibility for richer search presentation.

### Safe Implementation Notes
- Include only current Phase 1 functionality.
- Do not describe unavailable features.

## 4) SPA Crawlability Hardening
Ensure all index-worthy routes are linked via standard anchor navigation and are present in sitemap updates.

### Why
- Client-routed apps can be crawled inconsistently without clear path discovery.

### Safe Implementation Notes
- Keep gameplay architecture untouched.
- If needed later, prerender only marketing routes first.

## 5) Performance and Core Web Vitals
Prioritize:
- Hero/media optimization
- JS chunk reductions for non-game pages
- Lighthouse mobile checks

### Why
- Better performance supports SEO and improves engagement.

### Safe Implementation Notes
- Keep engine determinism and game-shell logic unchanged.
- Focus on asset and delivery optimizations.

## 6) Measurement and Iteration Loop
Establish a recurring review of:
- Indexed pages
- Impressions and CTR
- Top organic landing pages
- Query buckets by intent

### Why
- SEO gains come from iterative refinement, not one-time changes.

### Safe Implementation Notes
- Use Search Console and analytics tooling only; no backend changes required.
