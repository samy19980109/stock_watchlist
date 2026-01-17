# Suggested Improvements

Based on an analysis of the codebase, here are several recommended improvements to enhance the application's performance, maintainability, and user experience.

## 1. Architecture & Performance

### Move Data Fetching to Server Components
**Current:** `src/app/page.tsx` is a Client Component (`'use client'`) that fetches data in a `useEffect`.
**Improvement:** Convert `src/app/page.tsx` to a Server Component. Fetch the initial stock data on the server and pass it as props to a Client Component (e.g., `<Dashboard stocks={initialStocks} />`).
**Benefit:** 
- Faster First Contentful Paint (FCP).
- Better SEO.
- Reduces client-side JavaScript execution.
- Eliminates the initial "loading" skeleton flicker for the user.

### Implement Robust Data Fetching (TabStack Query / SWR)
**Current:** Uses `useEffect` and `useState` for data fetching.
**Improvement:** If client-side fetching is still needed (e.g., for polling or updates), use **TanStack Query** (React Query) or **SWR**.
**Benefit:** 
- Automatic caching and re-fetching.
- Built-in loading and error states.
- Window focus revalidation.
- Deduping of requests.

### Optimize Search/Filtering
**Current:** Filtering happens on every keystroke.
**Improvement:** Use `useDeferredValue` for the search term or `useMemo` for the filtered list to ensure the UI remains responsive even if the watchlist grows to hundreds of items.

## 2. Code Quality & Type Safety

### Validate Environment Variables
**Current:** `src/lib/supabase.ts` uses non-null assertions (`!`), which can lead to runtime crashes if variables are missing.
**Improvement:** Use a library like **Zod** or create a validation utility to ensure all required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `FMP_API_KEY`, etc.) are present at startup.

### Strict TypeScript Types
**Current:** 
- `src/lib/fmp.ts` uses `any` for sorting earnings.
- `src/app/page.tsx` uses `any` in `onChange` handlers for the sort dropdown.
**Improvement:** Remove all usages of `any`. Define proper types for API responses (even partial ones) to prevent runtime errors.

### Supabase Database Types
**Current:** Manual interfaces (`StockFundamentalData`) map to database fields manually.
**Improvement:** Use the Supabase CLI to generate TypeScript types from your schema (`supabase gen types typescript --local > src/types/supabase.ts`).
**Benefit:** Ensures your code is always in sync with your database schema and provides autocomplete for table columns.

## 3. Reliability & Error Handling

### Robust Rate Limiting
**Current:** `src/lib/fmp.ts` uses `setTimeout` with a random delay to manage API limits.
**Improvement:** Use a library like **p-limit** or **bottleneck** to strictly limit concurrency (e.g., max 5 requests at a time).
**Benefit:** Prevents hitting FMP API rate limits more reliably than random delays, especially under load.

### Better Error Feedback
**Current:** Errors are logged to the console.
**Improvement:** accurate error messages in the UI logic. If a specific symbol fails to fetch, show a warning indicator on that stock card rather than failing silently or breaking the batch.

## 4. Features & UX

### Debounced Search
**Current:** Search filters immediately.
**Improvement:** Debounce the search input (wait 300ms after user stops typing) to prevent excessive state updates, especially if search logic becomes more complex.

### Customizable Scoring
**Current:** Scoring weights are hardcoded in `src/lib/scoring.ts`.
**Improvement:** Add a "Settings" modal allowing users to adjust the importance of "FCF Yield" vs "PE Ratio" vs "SMA Trends" to personalize the "Dip Score".

### Unit Testing
**Current:** No tests visible.
**Improvement:** Add **Vitest** or **Jest** to test the `calculateDipScore` logic and `getStocksData` transformation logic. This ensures regressions aren't introduced when modifying the scoring algorithm.
