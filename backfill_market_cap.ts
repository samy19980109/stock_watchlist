import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FMP_API_KEY = process.env.FMP_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !FMP_API_KEY) {
    console.error('Missing environment variables. Please check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BASE_URL = 'https://financialmodelingprep.com/stable';

async function getMarketCap(symbol: string) {
    try {
        const url = `${BASE_URL}/quote?symbol=${symbol}&apikey=${FMP_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch quote for ${symbol}: ${response.statusText}`);
            return null;
        }
        const data: any = await response.json();
        if (Array.isArray(data) && data[0]) {
            console.log(data[0]);
            return data[0].marketCap;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching market cap for ${symbol}:`, error);
        return null;
    }
}

async function backfill() {
    const args = process.argv.slice(2);
    const targetSymbol = args.find(arg => !arg.startsWith('--')) || (args.includes('--symbol') ? args[args.indexOf('--symbol') + 1] : null);

    console.log('Fetching stocks from Supabase...');

    let query = supabase.from('stocks').select('symbol, metadata');
    if (targetSymbol) {
        console.log(`Filtering for symbol: ${targetSymbol}`);
        query = query.eq('symbol', targetSymbol.toUpperCase());
    }

    const { data: stocks, error } = await query;

    if (error) {
        console.error('Error fetching stocks:', error);
        return;
    }

    if (!stocks || stocks.length === 0) {
        console.log('No stocks found.');
        return;
    }

    console.log(`Processing ${stocks.length} stocks...`);

    for (const stock of stocks) {
        const symbol = stock.symbol;
        console.log(`Fetching market cap for ${symbol}...`);

        const marketCap = await getMarketCap(symbol);

        if (marketCap !== null && marketCap !== undefined) {
            const currentMetadata: any = stock.metadata || {};
            const updatedMetadata = {
                ...currentMetadata,
                marketCap: marketCap
            };

            console.log(`Updating ${symbol} with market cap: ${marketCap}`);

            const { error: updateError } = await supabase
                .from('stocks')
                .update({ metadata: updatedMetadata })
                .eq('symbol', symbol);

            if (updateError) {
                console.error(`Error updating ${symbol}:`, updateError);
            } else {
                console.log(`Successfully updated ${symbol}`);
            }
        } else {
            console.warn(`Could not get market cap for ${symbol}, skipping...`);
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('Backfill complete!');
}

backfill();
