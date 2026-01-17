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

### Optimize Search/Filtering
**Current:** Filtering happens on every keystroke.
**Improvement:** Use `useDeferredValue` for the search term or `useMemo` for the filtered list to ensure the UI remains responsive even if the watchlist grows to hundreds of items.

### Pagination or Infinite Scroll
**Problem:** Loading hundreds of stocks at once will degrade performance.
**Improvement:** Implement pagination or infinite scrolling for the dashboard.

## 2. Code Quality & Type Safety

### Validate Environment Variables
**Current:** `src/lib/supabase.ts` uses non-null assertions (`!`).
**Improvement:** Use **Zod** or a validation utility to ensure all required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `FMP_API_KEY`, etc.) are present at startup.

### Strict TypeScript Types
**Current:** `src/lib/fmp.ts` and `src/app/page.tsx` still contain `any` in some places (e.g., earnings sorting).
**Improvement:** Remove all usages of `any`. Define proper types for all API responses.

### Supabase Database Types [DONE]
**Current:** Types are generated in `src/types/supabase.ts`.
**Benefit:** Ensures your code is always in sync with your database schema and provides autocomplete for table columns.

## 3. Reliability & Error Handling

### Robust Rate Limiting
**Current:** `src/lib/fmp.ts` uses `setTimeout` with a random delay.
**Improvement:** Use a library like **p-limit** or **bottleneck** to strictly limit concurrency (e.g., max 5 requests at a time).
**Benefit:** Prevents hitting FMP API rate limits more reliably.

### Better Error Feedback
**Current:** Errors are logged to the console.
**Improvement:** Accurate error messages in the UI logic. If a specific symbol fails to fetch, show a warning indicator on that stock card.

## 4. Features & UX

### Historical Charts (Sparklines)
**Improvement:** Add small "sparkline" charts to each stock card showing the last 7-30 days of price action to give immediate visual context to the "Dip".

### Portfolio Tracking
**Improvement:** Allow users to enter their "Cost Basis" and "Quantity" for stocks in their watchlist to track PnL alongside the dip metrics.

### Supabase Realtime Updates
**Improvement:** Use Supabase Realtime to push updates to the dashboard when background workers update stock prices or scores.

### Debounced Search
**Current:** Search filters immediately.
**Improvement:** Debounce the search input (wait 300ms) to prevent excessive state updates.

### Customizable Scoring
**Current:** Scoring weights are hardcoded in `src/lib/scoring.ts`.
**Improvement:** Add a "Settings" modal allowing users to adjust the importance of "FCF Yield" vs "PE Ratio" vs "SMA Trends".

### Unit Testing
**Current:** No tests visible.
**Improvement:** Add **Vitest** to test the `calculateDipScore` logic.
