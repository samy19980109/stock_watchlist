
import { createClient } from '@supabase/supabase-js';

// Mock process.env for the script
const FMP_API_KEY = process.env.FMP_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!FMP_API_KEY) {
    console.error('Missing FMP_API_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL!, SERVICE_KEY || SUPABASE_ANON_KEY!);

const BASE_URL = 'https://financialmodelingprep.com/stable';

async function main() {
    const symbols = ['AAPL'];

    console.log('--- 1. Testing FMP Earnings API ---');
    const symbolsStr = symbols.join(',');
    const url = `${BASE_URL}/earnings?symbol=${symbolsStr}&apikey=${FMP_API_KEY}`;
    console.log(`Fetching: ${url.replace(FMP_API_KEY, 'HIDDEN')}`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error('FMP Fetch Failed:', res.status, res.statusText);
        } else {
            const data = await res.json();
            console.log('FMP Response Type:', Array.isArray(data) ? 'Array' : typeof data);
            console.log('FMP Response Items:', Array.isArray(data) ? data.length : 'N/A');

            if (Array.isArray(data) && data.length > 0) {
                console.log('Sample Item:', JSON.stringify(data[0], null, 2));

                // Test filtering logic
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcoming = data.filter((item: any) => {
                    const date = new Date(item.date);
                    return date >= today;
                });
                console.log('Upcoming Earnings Found:', upcoming.length);
                if (upcoming.length > 0) {
                    console.log('Next Upcoming:', JSON.stringify(upcoming[0], null, 2));
                }
            } else {
                console.log('FMP returned empty array or invalid data.');
            }
        }
    } catch (e) {
        console.error('FMP Error:', e);
    }

    console.log('\n--- 2. Checking Supabase "stocks" table ---');
    try {
        const { data, error } = await supabase
            .from('stocks')
            .select('symbol, metadata, last_updated')
            .in('symbol', symbols);

        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Supabase Rows Found:', data.length);
            data.forEach((row: any) => {
                console.log(`[${row.symbol}] Last Updated: ${row.last_updated}`);
                console.log(`[${row.symbol}] nextEarnings:`, JSON.stringify(row.metadata?.nextEarnings, null, 2));
            });
        }
    } catch (e) {
        console.error('Supabase Exception:', e);
    }
}

main();
