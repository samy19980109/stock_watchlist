import { StockFundamentalData } from '@/lib/fmp';

export function calculateDipScore(data: StockFundamentalData) {
    // 1. Distance from 200 SMA (Long term trend)
    const sma200Dist = (data.price - data.sma200) / (data.sma200 || 1);

    // 2. FCF Yield (Profitability/Value)
    const fcfScore = Math.min(data.fcfYield * 10, 1); // Cap at 1

    // 3. PE Comparison
    const peTrend = data.peForward < data.pe ? 1 : 0.5;

    const smaScore = Math.max(0, 1 - (sma200Dist + 0.1));

    const finalScore = (smaScore * 0.5) + (fcfScore * 0.3) + (peTrend * 0.2);

    return {
        score: Math.round(finalScore * 100),
        labels: {
            sma: sma200Dist < 0 ? 'Below 200 SMA' : 'Near 200 SMA',
            value: data.fcfYield > 0.05 ? 'High FCF' : 'Moderate FCF',
        }
    };
}
