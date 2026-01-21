# Suggested Improvements

Based on an analysis of the codebase, here are several recommended improvements to enhance the application's performance, maintainability, and user experience.

## 1. Architecture & Performance

### Move Data Fetching to Server Components [DONE]
**Current:** `src/app/page.tsx` is a Server Component that fetches initial data.
**Benefit:** 
- Faster First Contentful Paint (FCP).
- Better SEO.
- Reduces client-side JavaScript execution.
- Eliminates the initial "loading" skeleton flicker for the user.

### Implement Robust Data Fetching (TanStack Query / SWR)
**Context:** While initial load is server-side, real-time updates or user-triggered refreshes should use a robust client-side fetching strategy.
**Improvement:** Use **TanStack Query** (React Query) or **SWR** for client-side interactions.
**Benefit:** 
- Automatic caching and re-fetching.
- Built-in loading and error states.
- Window focus revalidation.
- Deduping of requests.

### Optimize Search/Filtering [DONE]
**Current:** Filtering uses `useDeferredValue` for the search term and `useMemo` for the filtered list.
**Benefit:** The UI stays responsive during rapid typing, even if the watchlist grows.

### Pagination or Infinite Scroll
**Problem:** Loading hundreds of stocks at once will degrade performance.
**Improvement:** Implement pagination or infinite scrolling for the dashboard.

### Server-Side Caching Layer
**Improvement:** Implement a Redis or Upstash caching layer for FMP API responses.
**Benefit:** Drastically reduces API usage and speeds up data delivery for common symbols.

## 2. Code Quality & Type Safety

### Validate Environment Variables
**Current:** `src/lib/supabase.ts` uses non-null assertions (`!`).
**Improvement:** Use **Zod** or a validation utility to ensure all required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `FMP_API_KEY`, etc.) are present at startup.

### Strict TypeScript Types
**Current:** `src/lib/fmp.ts` and `src/app/page.tsx` still contain `any` in some places.
**Improvement:** Remove all usages of `any`. Define proper types for all API responses.

### Supabase Database Types [DONE]
**Current:** Types are generated in `src/types/supabase.ts`.
**Benefit:** Ensures code is in sync with database schema.

## 3. Reliability & Error Handling

### Robust Rate Limiting
**Current:** `src/lib/fmp.ts` uses `setTimeout` with a random delay.
**Improvement:** Use a library like **p-limit** or **bottleneck** to strictly limit concurrency.

### Better Error Feedback [DONE]
**Current:** Errors are displayed on individual stock cards; stale data is preserved if available.
**Benefit:** Users know when data is old or if a symbol is invalid without breaking the whole UI.

## 4. Features & UX

### Market Capitalization [DONE]
**Improvement:** Added Market Cap display to stock cards.
**Benefit:** Provides scale context for the company.

### Free Tier Availability Notice [DONE]
**Improvement:** Added a dashboard notice explaining FMP free tier limitations with an expandable list of supported symbols.
**Benefit:** Reduces user confusion when adding unsupported symbols.

### Price Change Percentages [DONE]
**Improvement:** Displayed price change percentages (YTD, 1M, 3M, etc.) on stock cards.
**Benefit:** Quick context on recent performance trends.

### Dashboard Sorting [DONE]
**Improvement:** Added ability to sort by Score, FCF Yield, PE, Price, and Earnings Date.
**Benefit:** Powerful way to find the best dips.

### Historical Charts (Sparklines)
**Improvement:** Add small "sparkline" charts to each stock card showing the last 30 days of price action.

### Portfolio Tracking
**Improvement:** Allow users to enter "Cost Basis" and "Quantity" for stocks.

### Unit Testing
**Improvement:** Add **Vitest** for the `calculateDipScore` logic.

## 5. Future Roadmap & Advanced Features

### Alerting System
**Improvement:** Implement price and dip-score alerts via email or push notifications.

### Supabase Authentication [DONE]
**Improvement:** Implemented user accounts with Magic Link and 6-Digit Code support.
**Benefit:** Personalization and data persistence across devices.

### Social Logins
**Improvement:** Add Google, Apple, and GitHub OAuth providers.

### Automated Backfill & Re-scoring
**Improvement:** Implement a cron job to automatically refresh fundamental data and re-calculate scores every night.

### Cloud Migration Plan [DONE]
**Improvement:** Created `MIGRATE_TO_SUPABASE_CLOUD.md` for moving to Supabase Cloud free tier.

---

## 6. Deep Fundamental Analysis (The "Quality" Filter)

### "High Quality Compounding" Checklist
**Improvement:** Add automated checks for quality:
- **ROIC > 15%**: consistently over 5 years.
- **Gross Margin Stability**: ensuring a moat.
- **Debt/FCF < 3**: ensuring low leverage.
- **Share Count Reduction**: tracking buybacks.

### Historical Valuation Context
**Improvement:** Compare current P/E or FCF Yield against the 10-year mean/median.
**Benefit:** Distinguish between a "dip" and a structural rerating.

---

## 7. Advanced Watchlist Insights

### Sector Benchmarking
**Improvement:** Compare a stock's metrics against its sector average.

### Insider Activity Integration
**Improvement:** Add data points showing recent net insider buying or selling.

### Institutional Ownership
**Improvement:** Show percentage of institutional ownership and recent changes (13F data).

---

## 8. Keyboard Shortcuts & Power User Features

### Command Palette
**Improvement:** Add a command palette (Cmd+K) for quick navigation and adding symbols.

### Global Shortcuts
**Improvement:** `/` for search, `r` for refresh, `n` for new symbol.

---

## 9. Data Export & Sharing

### Export to CSV/Excel
**Improvement:** Export filtered/sorted watchlist to CSV.

### Shareable Watchlists
**Improvement:** Public "read-only" links for watchlists.

---

## 10. Developer Experience

### Storybook
**Improvement:** Component documentation and isolation.

### E2E Testing
**Improvement:** Playwright tests for critical flows.

### API Mocking
**Improvement:** Mock FMP responses for local development.
