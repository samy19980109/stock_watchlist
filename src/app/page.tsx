import Dashboard from '@/components/Dashboard';
import { getStocksData } from '@/lib/fmp';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 3600; // Revalidate at most every hour

export default async function Page() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Default symbols
    const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META'];

    // Fetch initial data on the server
    const initialStocks = await getStocksData(DEFAULT_SYMBOLS);

    return (
        <main>
            <Dashboard initialStocks={initialStocks} serverUser={user} />
        </main>
    );
}

