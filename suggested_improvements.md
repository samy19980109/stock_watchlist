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
**Benefit:** The UI remains responsive during rapid typing, even if the watchlist grows to hundreds of items.

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

### Show Stock Price Change [DONE]
**Improvement:** Display price change percentages (YTD, 1M, 3M, etc.) on stock cards.
**Benefit:** Provides quick context on recent performance trends alongside fundamental metrics.

### Dashboard Filtering and Sorting [DONE]
**Improvement:** Add ability to filter by symbol and sort by various metrics (Score, PE, FCF Yield).
**Benefit:** Makes it easier to find the best opportunities in a large watchlist.

### Portfolio Tracking
**Improvement:** Allow users to enter their "Cost Basis" and "Quantity" for stocks in their watchlist to track PnL alongside the dip metrics.

### Supabase Realtime Updates
**Improvement:** Use Supabase Realtime to push updates to the dashboard when background workers update stock prices or scores.

### Debounced Search
**Current:** Search filters immediately.
**Improvement:** Debounce the search input (wait 300ms) to prevent excessive state updates.

### Unit Testing
**Current:** No tests visible.
**Improvement:** Add **Vitest** to test the `calculateDipScore` logic.

## 5. Future Roadmap & Advanced Features

### Real-time Market Data
**Improvement:** Integrate WebSockets (via FMP or Supabase Realtime) for live price updating without page refreshes.

### Advanced Interactive Charts
**Improvement:** Use **Lightweight Charts** (by TradingView) for a more professional charting experience when viewing stock details.

### Alerting System
**Improvement:** Implement price and dip-score alerts via email or push notifications using **Supabase Edge Functions** and **Resend**.

### Portfolio Tracking
**Improvement:** Expand from a simple watchlist to a portfolio tracker where users can enter cost basis and quantity to see actual PnL.

### Supabase Authentication
**Improvement:** Add user accounts so people can maintain their own private watchlists across devices.

### Automated Backfill & Re-scoring
**Improvement:** Implement a cron job (GitHub Action or Supabase Cron) to automatically refresh fundamental data and re-calculate scores every night.

---

## 6. Mobile Experience & Accessibility

### Responsive Card Layout
**Current:** Dashboard uses a static grid that may not optimally fit mobile screens.
**Improvement:** Implement a responsive card layout with swipeable cards on mobile and a condensed view option for quick scanning.

### Touch-Friendly Interactions
**Improvement:** Add swipe gestures for quick actions (e.g., swipe right to add to favorites, swipe left to remove from watchlist).

### Accessibility (a11y)
**Improvement:** Add proper ARIA labels, keyboard navigation support, and screen reader compatibility. Ensure color contrast meets WCAG 2.1 AA standards.

---

## 7. Watchlist Management

### Multiple Watchlists
**Improvement:** Allow users to create and manage multiple named watchlists (e.g., "Tech Dips", "Dividend Compounders", "High Growth").

### Bulk Symbol Import
**Improvement:** Add a text area or CSV upload to import multiple symbols at once instead of adding them one by one.

### Drag-and-Drop Reordering
**Improvement:** Allow users to manually reorder stocks in their watchlist via drag-and-drop.

### Notes & Tags
**Improvement:** Let users add personal notes and custom tags to each stock (e.g., "Wait for $150", "Earnings play").

---

## 8. Keyboard Shortcuts & Power User Features

### Global Keyboard Shortcuts
**Improvement:** Implement keyboard shortcuts for power users:
- `/` to focus search
- `r` to refresh data
- `1-9` to sort by different metrics
- `n` to add new symbol

### Command Palette
**Improvement:** Add a command palette (Cmd+K) for quick navigation and actions, similar to VS Code or Linear.

---

## 9. Theming & Customization

### Dark/Light Mode Toggle
**Current:** App uses dark mode only.
**Improvement:** Add a theme toggle for dark/light mode with system preference detection.

### Customizable Dashboard
**Improvement:** Let users choose which metrics to display on stock cards and in what order.

---

## 10. Data Export & Sharing

### Export to CSV/Excel
**Improvement:** Add ability to export the current filtered/sorted watchlist to CSV or Excel format.

### Share Watchlist
**Improvement:** Generate shareable links for watchlists (read-only) so users can share their dip picks with others.

### Screenshot/PDF Report
**Improvement:** One-click generation of a visual report/screenshot of the current watchlist state.

---

## 11. Stock Comparison & Analysis

### Side-by-Side Comparison
**Improvement:** Select 2-4 stocks and view their metrics in a side-by-side comparison table.

### Sector & Industry Grouping
**Improvement:** Group stocks by sector/industry and show aggregate metrics (average score, average FCF yield per sector).

### Correlation Analysis
**Improvement:** Show which stocks in the watchlist tend to move together, helping with portfolio diversification.

---

## 12. Enhanced Scoring System

### Configurable Score Weights
**Current:** Fixed weights in `calculateDipScore` (50% SMA, 30% FCF, 20% PE trend).
**Improvement:** Let users adjust the scoring weights based on their investment style (value-focused, growth-focused, technical).

### Score History
**Improvement:** Track and display how a stock's dip score has changed over time.

### Percentile Ranking
**Improvement:** Show how each metric compares to the rest of the watchlist (e.g., "Top 10% FCF Yield").

---

## 13. Notifications & Monitoring

### Browser Push Notifications
**Improvement:** Send browser notifications when a stock drops to a target price or score threshold.

### Watchlist Digest Email
**Improvement:** Daily or weekly email summary of watchlist changes, new dips, and upcoming earnings.

---

## 14. Data Quality & Debugging

### Data Source Indicators
**Improvement:** Show which API/data source each metric comes from and when it was last updated.

### Admin Debug Panel
**Improvement:** Add a hidden `/debug` route to inspect cache status, API call counts, and data freshness.

### Stale Data Warnings
**Improvement:** Highlight metrics that haven't been updated in >24 hours with a visual indicator.

---

## 15. Performance Monitoring

### Analytics Dashboard (Internal)
**Improvement:** Track API response times, cache hit rates, and error rates to proactively identify issues.

### Lighthouse CI
**Improvement:** Add Lighthouse CI to the GitHub Actions workflow to catch performance regressions.

---

## 16. Developer Experience

### Storybook for Components
**Improvement:** Add Storybook to develop and document UI components (StockCard, Dashboard) in isolation.

### E2E Testing with Playwright
**Improvement:** Add end-to-end tests for critical flows (add symbol, search, sort, view details).

### API Mocking for Development
**Improvement:** Create mock FMP responses for local development to avoid hitting rate limits during development.
