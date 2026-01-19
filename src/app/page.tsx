import Dashboard from '@/components/Dashboard';
import { getStocksData } from '@/lib/fmp';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 3600; // Revalidate at most every hour

export default async function Page() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Default symbols
    const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META'];
    let symbols = DEFAULT_SYMBOLS;

    if (user) {
        // Try to fetch user's customized watchlist
        const { data: watchlist } = await supabase
            .from('watchlists')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', 'Default')
            .single();

        if (watchlist) {
            const { data: items } = await supabase
                .from('watchlist_items')
                .select('stock_symbol')
                .eq('watchlist_id', watchlist.id);

            if (items && items.length > 0) {
                symbols = items.map(item => item.stock_symbol);
            }
        }
    }

    // Fetch initial data on the server
    const initialStocks = await getStocksData(symbols);

    return (
        <main>
            <Dashboard initialStocks={initialStocks} serverUser={user} />
        </main>
    );
}

