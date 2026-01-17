# Stock Watchlist & Dip Finder

A modern, mobile-first stock analysis application built with Next.js 15, Supabase, and Tailwind CSS. This tool helps investors identify potential "dips" in the market by ranking stocks based on technical and fundamental metrics.

## 🚀 Features

- **Personalized Watchlist**: Add and track your favorite stocks in real-time.
- **Dip Finder Ranking**: Intelligent scoring system that ranks stocks based on:
  - Price proximity to 20, 50, 100, and 200-day Moving Averages.
  - Price-to-Earnings (PE) ratios (Current, NTM, TTM).
  - Free Cash Flow (FCF) Yield.
- **Real-time Data**: Integrated with Financial Modeling Prep (FMP) API for accurate market data.
- **Smart Caching**: Minimized API calls via Supabase PostgreSQL caching to optimize for free-tier limits.
- **Performance Tracking**: View price changes across multiple timeframes (YTD, 1M, 3M, 6M, 1Y, 3Y, 5Y).
- **Responsive Design**: Elegant UI that looks great on both mobile and desktop.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Data Provider**: [Financial Modeling Prep (FMP) API](https://financialmodelingprep.com/developer/docs/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites

- Node.js 18.x or later
- A Supabase project
- An FMP API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd stock_watchlist
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   FMP_API_KEY=your_fmp_api_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📊 Dip Finder Logic

The "Dip Finder" calculates a composite score for each stock:
- **Technical (50%)**: Measures how far the current price is below key moving averages. The further below, the higher the "dip" score.
- **Fundamental (50%)**: Evaluates valuation metrics like PE Ratio and FCF Yield relative to historical or sector averages.

## 📄 License

This project is licensed under the MIT License.

