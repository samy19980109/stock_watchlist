# Suggestions for Stock Details View

Focus: **Quality Compounding Machines** + **Buying the Dip**

## 1. Quality Compounder Metrics
To identify "Compounding Machines," we need to look beyond current price and P/E.

*   **ROIC (Return on Invested Capital)**: The most critical metric for compounders. Aim for >15% consistently.
*   **Operating Margin Trend**: Is the business becoming more efficient? (Show 5-year trend).
*   **Revenue & FCF CAGR**: 3-year or 5-year growth rates to prove "compounding" status.
*   **Share Count Reduction**: Are they buying back shares? (Quality companies often do).

## 2. "Buy the Dip" Indicators
Improve the conviction for "Buying the Dip" with technical and valuation context.

*   **Drawdown from 52-Week High**: A simple "% off high" metric helps quantify the dip.
*   **RSI (Relative Strength Index)**: Standard 14-day RSI to identify "oversold" conditions (<30).
*   **Historical Valuation Bands**: 
    *   Current P/E vs. 5-Year Average P/E. 
    *   *Insight*: If a stock is down 20% but still has a P/E 50% above its 5-year average, it's not a "dip" in valuation terms.
*   **Moving Average Ribbon**: Visualization of Price vs. 20, 50, 100, and 200 SMAs.

## 3. Score Breakdown (Transparency)
Show the user *why* the Dip Finder gave it a specific score.
*   **Weighted breakdown**:
    *   *Quality Component*: ROIC, Growth, Margins.
    *   *Dip Component*: Distance from SMA, RSI, Drawdown.
    *   *Value Component*: FCF Yield, P/E vs. History.

## 4. Proposed Layout for Details View
A modal or a new page with the following sections:

| Section | Content |
| :--- | :--- |
| **Header** | Symbol, Name, Current Price, Day Change, Dip Score. |
| **Quality Dashboard** | ROIC, Gross/Op Margins, Net Debt/EBITDA (Safety). |
| **Growth & Compounding** | 5Y Revenue CAGR, 5Y FCF CAGR, Share Count Change. |
| **Valuation Context** | P/E (TTM), P/E (FWD), 5Y Avg P/E, FCF Yield. |
| **Technical Health** | % off High, RSI, Distance from 50/200 SMA. |
| **Earnings Signal** | Next Earnings Date, Historical Beat/Miss (if available). |

## 5. Visual Inspiration
*   **Micro-charts**: Sparklines for 1-year price and 5-year margin trends.
*   **Color-coded Badges**: Green for "Above 5Y ROIC average", Blue for "Oversold RSI".
*   **Actionable Insight**: A summary sentence like: *"AAPL is trading at a 15% discount to its 5Y Avg P/E despite maintaining 25% ROIC."*
