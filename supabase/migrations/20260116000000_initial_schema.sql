-- Initial Schema for Stock Watchlist

-- Stocks Table (Used as a cache for fundamental data)
CREATE TABLE IF NOT EXISTS public.stocks (
    symbol TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pe_ratio_ttm DECIMAL,
    pe_ratio_forward DECIMAL,
    fcf_yield DECIMAL,
    sma_200 DECIMAL,
    sma_100 DECIMAL,
    sma_50 DECIMAL,
    sma_20 DECIMAL,
    current_price DECIMAL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Watchlists Table
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist Items (Links stocks to watchlists)
CREATE TABLE IF NOT EXISTS public.watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
    stock_symbol TEXT NOT NULL REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(watchlist_id, stock_symbol)
);

-- RLS Policies
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

-- Stocks are readable by anyone
CREATE POLICY "Stocks are readable by everyone" ON public.stocks
    FOR SELECT USING (true);

-- Watchlists are only accessible by owner
CREATE POLICY "Users can manage their own watchlists" ON public.watchlists
    FOR ALL USING (auth.uid() = user_id);

-- Watchlist items are only accessible by watchlist owner
CREATE POLICY "Users can manage their own watchlist items" ON public.watchlist_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.watchlists
            WHERE public.watchlists.id = watchlist_id
            AND public.watchlists.user_id = auth.uid()
        )
    );
