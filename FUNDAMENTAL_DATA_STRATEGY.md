# Fundamental Data Strategy: The "Quality" Upgrade

To transform the dashboard into a tool for finding "Quality Compounding Machines," we need to move beyond simple valuation metrics (P/E) and into measures of capital efficiency, growth durability, and management alignment.

## 1. Recommended New Fundamental Data

### A. Capital Efficiency & Moat (The "Quality" Core)
**Why:** Durable compounders consistently earn high returns on capital.
*   **ROIC (Return on Invested Capital) - TTM**: The single most important metric.
*   **ROIC - 5 Year Average**: Smooths out cyclicality to prove durability.
*   **Gross Margin - 5 Year Trend**: Expanding margins indicate a strengthening moat (pricing power).
*   **Operating Margin - 5 Year Trend**: Operational leverage.

### B. Growth & Compounding (The Engine)
**Why:** We want companies that are actually growing, not just "cheap".
*   **Revenue CAGR (3Y & 5Y)**: Top-line growth consistency.
*   **Free Cash Flow (FCF) CAGR (5Y)**: The growth of distributable cash. This is the ultimate truth.
*   **FCF Conversion**: (FCF / Net Income). Quality earnings turn into cash.

### C. Shareholder Yield (The "Buyback" Boost)
**Why:** "Cannibals" (companies that eat themselves) accelerate EPS growth.
*   **Share Count Change (YoY & 5Y)**: Negative number = Buybacks.
*   **Dividend Yield**: (Already have implies cash return, but explicit yield helps).
*   **Total Shareholder Yield**: Buyback Yield + Dividend Yield.

### D. "Smart Money" Signals
**Why:** Validate your conviction with insider and institutional moves.
*   **Net Insider Buying (LTM)**: Are executives eating their own cooking?
*   **Institutional Ownership %**: Too low? Maybe a hidden gem or a fraud. Too high? Crowded trade.

---

## 2. Required Supabase Schema Changes

We should **not** stuff all this into the main `stocks` table. It's better to create a dedicated `stock_quality_metrics` table linked by symbol. This keeps fetching lightweight for the main view but allows deep data for the detail view.

### New Table: `stock_metrics`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `symbol` | `text` | Foreign Key to `stocks.symbol` |
| `roic_ttm` | `numeric` | Current Return on Invested Capital |
| `roic_5y_avg` | `numeric` | Average ROIC over last 5 years |
| `revenue_cagr_5y` | `numeric` | Compound Annual Growth Rate of Revenue |
| `fcf_cagr_5y` | `numeric` | Compound Annual Growth Rate of FCF |
| `gross_margin_ttm` | `numeric` | Current Gross Margin |
| `gross_margin_5y_avg` | `numeric` | Average Gross Margin (for stability check) |
| `operating_margin_ttm` | `numeric` | Current Operating Margin |
| `share_count_cagr_5y` | `numeric` | Rate of share count change (negative is good) |
| `inside_ownership_percent`| `numeric` | % of shares held by insiders |
| `institutional_ownership_percent` | `numeric` | % of shares held by institutions |
| `last_updated` | `timestamp` | For cache invalidation |

### New Table: `stock_historical_annual` (Optional, for Charts)
For rendering the "sparklines" or history charts.

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `symbol` | `text` | FK |
| `year` | `integer` | e.g., 2023 |
| `revenue` | `numeric` | |
| `free_cash_flow` | `numeric` | |
| `roic` | `numeric` | |
| `gross_margin` | `numeric` | |
| `shares_outstanding` | `numeric` | |

---

## 3. Data Sourcing Strategy (FMP API)

We will use Financial Modeling Prep (FMP) endpoints. Note that some of these require calculation or multiple fetches.

| Metric | API Endpoint | Calculation/Notes |
| :--- | :--- | :--- |
| **ROIC (History)** | `/key-metrics/{symbol}?period=annual&limit=5` | Fetch last 5 years. Calculate TTM from latest quarters or just use latest annual if sufficient. Calculate 5Y Avg manually. |
| **CAGR (Rev/FCF)** | `/financial-growth/{symbol}?period=annual` | Endpoint returns `fiveYearRevenueGrowthPerShare`. Better: Fetch 5 years of `income-statement` and calculate CAGR manually: $(End/Start)^{(1/n)} - 1$. |
| **Margins** | `/ratios-ttm/{symbol}` or `/ratios/{symbol}` | Get `grossProfitMargin` and `operatingProfitMargin`. |
| **Share Count** | `/enterprise-values/{symbol}?period=annual&limit=5` | Contains `numberOfShares`. Calculate 5Y CAGR. |
| **Insider** | `/insider-trading/statistics?symbol={symbol}` | Returns aggregate stats (optional, or use raw trades). |
| **Institutional** | `/institutional-ownership/symbol-ownership?symbol={symbol}` | Returns `%` ownership. |

### Implementation Plan
1.  **Create Migration**: Add `stock_metrics` table.
2.  **Update `fmp.ts`**: Create a new function `getStockQualityData(symbol)` that orchestrates these calls.
    *   *Note*: To avoid spamming the API, we fetch this **only when the user clicks "View Details"**, and then cache it in Supabase for 7-30 days (fundamental trends change slowly).
3.  **UI Update**: Build the "Deep Dive" modal/page using this data.
