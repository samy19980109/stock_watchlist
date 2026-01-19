import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types/supabase';

const WATCHLIST_STORAGE_KEY = 'watchlist_symbols';
const DEFAULT_SYMBOLS = ['AAPL', 'ADBE', 'AMD', 'COST', 'MSFT', 'GOOGL', 'AMZN', 'NFLX', 'META', 'TSLA', 'NVDA', 'TSM', 'UBER', 'UNH', 'V'];

export async function getWatchlistSymbols(): Promise<string[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // Initialize with defaults if empty
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(DEFAULT_SYMBOLS));
        return DEFAULT_SYMBOLS;
    }

    // User is logged in, fetch from Supabase
    // Get the "Default" watchlist or create it if it doesn't exist
    let { data: watchlist, error } = await supabase
        .from('watchlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Default')
        .single();

    if (error || !watchlist) {
        // Create default watchlist
        const { data: newWatchlist, error: createError } = await supabase
            .from('watchlists')
            .insert({ user_id: user.id, name: 'Default' })
            .select()
            .single();

        if (createError) {
            console.error('Error creating default watchlist:', createError);
            return [];
        }
        watchlist = newWatchlist;
    }

    // Get items for this watchlist
    const { data: items, error: itemsError } = await supabase
        .from('watchlist_items')
        .select('stock_symbol')
        .eq('watchlist_id', watchlist.id);

    if (itemsError) {
        console.error('Error fetching watchlist items:', itemsError);
        return [];
    }

    return items.map(item => item.stock_symbol);
}

export async function addSymbolToWatchlist(symbol: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const current = await getWatchlistSymbols();
        if (!current.includes(symbol)) {
            const updated = [symbol, ...current];
            localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
        }
        return;
    }

    // Get "Default" watchlist
    const { data: watchlist } = await supabase
        .from('watchlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Default')
        .single();

    if (watchlist) {
        await supabase
            .from('watchlist_items')
            .upsert({ watchlist_id: watchlist.id, stock_symbol: symbol }, { onConflict: 'watchlist_id, stock_symbol' });
    }
}

export async function removeSymbolFromWatchlist(symbol: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const current = await getWatchlistSymbols();
        const updated = current.filter(s => s !== symbol);
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
        return;
    }

    // Get "Default" watchlist
    const { data: watchlist } = await supabase
        .from('watchlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Default')
        .single();

    if (watchlist) {
        await supabase
            .from('watchlist_items')
            .delete()
            .eq('watchlist_id', watchlist.id)
            .eq('stock_symbol', symbol);
    }
}

/**
 * Migrates symbols from localStorage to Supabase when a user signs in.
 * Should be called after successful login.
 */
export async function syncLocalWatchlistToSupabase(): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const localSymbols = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!localSymbols) return;

    const symbols: string[] = JSON.parse(localSymbols);
    if (symbols.length === 0) return;

    // Get or create "Default" watchlist
    let { data: watchlist } = await supabase
        .from('watchlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Default')
        .single();

    if (!watchlist) {
        const { data: newWatchlist } = await supabase
            .from('watchlists')
            .insert({ user_id: user.id, name: 'Default' })
            .select()
            .single();
        watchlist = newWatchlist;
    }

    if (watchlist) {
        // Batch insert items
        const itemsToInsert = symbols.map(symbol => ({
            watchlist_id: watchlist!.id,
            stock_symbol: symbol
        }));

        await supabase
            .from('watchlist_items')
            .upsert(itemsToInsert, { onConflict: 'watchlist_id, stock_symbol' });

        // Optional: Clear localStorage after sync if desired, 
        // but maybe safer to keep for a bit or if they logout.
        // localStorage.removeItem(WATCHLIST_STORAGE_KEY);
    }
}
