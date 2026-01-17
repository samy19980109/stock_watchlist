import Dashboard from '@/components/Dashboard';
import { getStocksData } from '@/lib/fmp';

export const revalidate = 3600; // Revalidate at most every hour

export default async function Page() {
    // Default symbols to show for first-time users or server-side rendering
    const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META'];

    // Fetch initial data on the server
    const initialStocks = await getStocksData(DEFAULT_SYMBOLS);

    return (
        <main>
            <Dashboard initialStocks={initialStocks} />
        </main>
    );
}

