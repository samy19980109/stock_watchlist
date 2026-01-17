'use server';

import { supabaseService as supabase } from './supabase';

const FMP_API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/stable';

export interface PriceChangeData {
    "1D": number;
    "5D": number;
    "1M": number;
    "3M": number;
    "6M": number;
    "ytd": number;
    "1Y": number;
    "3Y": number;
    "5Y": number;
    "10Y": number;
    "max": number;
}

export interface StockFundamentalData {
    symbol: string;
    name: string;
    price: number;
    pe: number;
    peForward: number;
    fcfYield: number;
    sma200: number;
    sma100: number;
    sma50: number;
    sma20: number;
    priceChanges?: PriceChangeData;
}

export async function getStocksData(symbols: string[]): Promise<StockFundamentalData[]> {
    if (!FMP_API_KEY || FMP_API_KEY === 'your_fmp_api_key_here') {
        throw new Error('FMP_API_KEY is not set. Please add it to your environment variables.');
    }

    if (symbols.length === 0) return [];

    const normalizedSymbols = symbols.map(s => s.toUpperCase());
    const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
    const now = new Date().getTime();

    // 1. Check Supabase cache for all symbols
    const { data: cachedStocks, error: cacheError } = await supabase
        .from('stocks')
        .select('*')
        .in('symbol', normalizedSymbols);

    const stocksMap = new Map<string, StockFundamentalData>();
    const staleSymbols: string[] = [];

    if (cachedStocks && !cacheError) {
        cachedStocks.forEach(cachedData => {
            const lastUpdated = new Date(cachedData.last_updated).getTime();
            const cachedPrice = Number(cachedData.current_price);

            // Require priceChanges to be present in cache to consider it valid for this feature
            if (now - lastUpdated < CACHE_EXPIRY_MS && cachedPrice > 0 && cachedData.metadata?.priceChanges) {
                stocksMap.set(cachedData.symbol, {
                    symbol: cachedData.symbol,
                    name: cachedData.name,
                    price: cachedPrice,
                    pe: Number(cachedData.pe_ratio_ttm),
                    peForward: Number(cachedData.pe_ratio_forward),
                    fcfYield: Number(cachedData.fcf_yield),
                    sma200: Number(cachedData.sma_200),
                    sma100: Number(cachedData.sma_100),
                    sma50: Number(cachedData.sma_50),
                    sma20: Number(cachedData.sma_20),
                    priceChanges: cachedData.metadata?.priceChanges,
                });
            }
        });
    }

    // Determine which symbols need fresh data
    normalizedSymbols.forEach(s => {
        if (!stocksMap.has(s)) {
            staleSymbols.push(s);
        }
    });

    if (staleSymbols.length === 0) {
        console.log(`Using cached data for all ${symbols.length} symbols`);
        return normalizedSymbols.map(s => stocksMap.get(s)!).filter(Boolean);
    }

    // 2. Fetch from FMP for stale symbols individually (batching not supported reliably on free/stable)
    try {
        console.log(`Fetching fresh data for ${staleSymbols.length} symbols from FMP...`);

        const freshDataList = await Promise.all(staleSymbols.map(async (symbol) => {
            // Add a small random delay to avoid hitting rate limits instantly if many symbols
            await new Promise(r => setTimeout(r, Math.random() * 500));

            const [quoteRes, ratiosRes, metricsRes, priceChangeRes] = await Promise.all([
                fetch(`${BASE_URL}/quote?symbol=${symbol}&apikey=${FMP_API_KEY}`),
                fetch(`${BASE_URL}/ratios-ttm?symbol=${symbol}&apikey=${FMP_API_KEY}`),
                fetch(`${BASE_URL}/key-metrics-ttm?symbol=${symbol}&apikey=${FMP_API_KEY}`),
                fetch(`${BASE_URL}/stock-price-change?symbol=${symbol}&apikey=${FMP_API_KEY}`)
            ]);

            const safeJson = async (res: Response) => {
                if (!res.ok) return null;
                try { return await res.json(); } catch (e) { return null; }
            };

            const [quoteArr, ratiosArr, metricsArr, priceChangeArr] = await Promise.all([
                safeJson(quoteRes),
                safeJson(ratiosRes),
                safeJson(metricsRes),
                safeJson(priceChangeRes)
            ]);

            const data: Partial<StockFundamentalData> = { symbol };

            // Quote
            if (Array.isArray(quoteArr) && quoteArr[0]) {
                const item = quoteArr[0];
                data.name = item.name;
                data.price = item.price;
                data.sma200 = item.priceAvg200 || 0;
                data.sma50 = item.priceAvg50 || 0;
            }

            // Ratios
            if (Array.isArray(ratiosArr) && ratiosArr[0]) {
                const item = ratiosArr[0];
                data.pe = item.priceToEarningsRatioTTM || 0;
                data.peForward = item.forwardPriceToEarningsGrowthRatioTTM || 0;
            }

            // Metrics
            if (Array.isArray(metricsArr) && metricsArr[0]) {
                const item = metricsArr[0];
                data.fcfYield = item.freeCashFlowYieldTTM || 0;
            }

            // Price Change
            if (Array.isArray(priceChangeArr) && priceChangeArr[0]) {
                data.priceChanges = priceChangeArr[0];
            }

            return data;
        }));

        // 3. Save to Supabase and update final list
        const upsertPromises = freshDataList.map(async (data) => {
            if (!data.symbol) return null;
            const symbol = data.symbol;

            const fullData: StockFundamentalData = {
                symbol,
                name: data.name || symbol,
                price: data.price || 0,
                pe: data.pe || 0,
                peForward: data.peForward || 0,
                fcfYield: data.fcfYield || 0,
                sma200: data.sma200 || 0,
                sma100: 0,
                sma50: data.sma50 || 0,
                sma20: 0,
                priceChanges: data.priceChanges
            };

            stocksMap.set(symbol, fullData);

            await supabase.from('stocks').upsert({
                symbol,
                name: fullData.name,
                current_price: fullData.price,
                pe_ratio_ttm: fullData.pe,
                pe_ratio_forward: fullData.peForward,
                fcf_yield: fullData.fcfYield,
                sma_200: fullData.sma200,
                sma_100: fullData.sma100,
                sma_50: fullData.sma50,
                sma_20: fullData.sma20,
                last_updated: new Date().toISOString(),
                metadata: { priceChanges: fullData.priceChanges }
            });

            return fullData;
        });

        await Promise.all(upsertPromises);

        return normalizedSymbols.map(s => stocksMap.get(s)!).filter(Boolean);
    } catch (error) {
        console.error(`Error fetching batch data:`, error);
        throw error;
    }
}

export async function getStockData(symbol: string): Promise<StockFundamentalData> {
    const data = await getStocksData([symbol]);
    if (data.length === 0) throw new Error(`Could not fetch data for ${symbol}`);
    return data[0];
}

