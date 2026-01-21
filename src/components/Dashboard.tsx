'use client';

import { useState, useEffect, useDeferredValue, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, TrendingDown, LayoutGrid, List as ListIcon, Info, ChevronDown, ChevronUp } from 'lucide-react';
import StockCard from '@/components/StockCard';
import { getStocksData, StockFundamentalData } from '@/lib/fmp';
import { calculateDipScore } from '@/lib/scoring';
import { createClient } from '@/utils/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getWatchlistSymbols } from '@/lib/watchlist-service';

interface DashboardProps {
    initialStocks: StockFundamentalData[];
    serverUser?: SupabaseUser | null;
}

export default function Dashboard({ initialStocks, serverUser }: DashboardProps) {
    const [stocks, setStocks] = useState<StockFundamentalData[]>(initialStocks);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'score' | 'fcfYield' | 'pe' | 'price' | 'name' | 'earningsDate'>('score');
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<SupabaseUser | null>(serverUser ?? null);
    const [showFreeTierNotice, setShowFreeTierNotice] = useState(true);
    const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);
    const [isFormulaExpanded, setIsFormulaExpanded] = useState(false);

    const FREE_TIER_SYMBOLS = [
        'AAPL', 'TSLA', 'AMZN', 'MSFT', 'NVDA', 'GOOGL', 'META', 'NFLX', 'JPM', 'V', 'BAC', 'PYPL', 'DIS', 'T', 'PFE', 'COST', 'INTC', 'KO', 'TGT', 'NKE', 'SPY', 'BA', 'BABA', 'XOM', 'WMT', 'GE', 'CSCO', 'VZ', 'JNJ', 'CVX', 'PLTR', 'SQ', 'SHOP', 'SBUX', 'SOFI', 'HOOD', 'RBLX', 'SNAP', 'AMD', 'UBER', 'FDX', 'ABBV', 'ETSY', 'MRNA', 'LMT', 'GM', 'F', 'LCID', 'CCL', 'DAL', 'UAL', 'AAL', 'TSM', 'SONY', 'ET', 'MRO', 'COIN', 'RIVN', 'RIOT', 'CPRX', 'VWO', 'SPYG', 'NOK', 'ROKU', 'VIAC', 'ATVI', 'BIDU', 'DOCU', 'ZM', 'PINS', 'TLRY', 'WBA', 'MGM', 'NIO', 'C', 'GS', 'WFC', 'ADBE', 'PEP', 'UNH', 'CARR', 'HCA', 'TWTR', 'BILI', 'SIRI', 'FUBO', 'RKT'
    ];

    const supabase = createClient();

    // Defer the search term to keep the input responsive during rapid typing
    const deferredSearchTerm = useDeferredValue(searchTerm);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            try {
                setLoading(true);
                setError(null);

                const symbols = await getWatchlistSymbols();

                if (symbols.length > 0) {
                    // Optimization: verify if the initialStocks contain exactly these symbols to avoid re-fetching
                    const initialSymbols = initialStocks.map(s => s.symbol).sort();
                    const storedSymbolsSorted = [...symbols].sort();

                    const isSame = initialSymbols.length === storedSymbolsSorted.length &&
                        initialSymbols.every((val, index) => val === storedSymbolsSorted[index]);

                    if (!isSame) {
                        try {
                            const data = await getStocksData(symbols);
                            setStocks(data);

                            // Check if any critical errors occurred (e.g. all failed)
                            const allFailed = data.length > 0 && data.every(s => s.error && !s.name);
                            if (allFailed) {
                                setError('Failed to fetch data for all symbols. Please check your connection or API key.');
                            }
                        } catch (err: any) {
                            setError(err.message || 'Failed to fetch stock data');
                        }
                    }
                } else {
                    setStocks([]);
                }
            } catch (err: any) {
                console.error('Failed to fetch user stocks:', err);
                setError(err.message || 'Failed to load watchlist');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [initialStocks]);

    // Memoize the filtered and sorted stocks list to avoid recalculation on every render
    // Uses deferredSearchTerm so the input stays responsive during rapid typing
    const filteredAndSortedStocks = useMemo(() => {
        return stocks
            .filter(stock =>
                stock.symbol.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
                stock.name.toLowerCase().includes(deferredSearchTerm.toLowerCase())
            )
            .map(stock => ({
                ...stock,
                score: calculateDipScore(stock).score
            }))
            .sort((a, b) => {
                switch (sortBy) {
                    case 'score':
                        return b.score - a.score;
                    case 'fcfYield':
                        return b.fcfYield - a.fcfYield;
                    case 'pe':
                        return a.pe - b.pe; // Lower PE is usually better
                    case 'price':
                        return a.price - b.price;
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'earningsDate':
                        const dateA = a.nextEarnings?.date || '9999-12-31';
                        const dateB = b.nextEarnings?.date || '9999-12-31';
                        return dateA.localeCompare(dateB);
                    default:
                        return 0;
                }
            });
    }, [stocks, deferredSearchTerm, sortBy]);

    return (
        <div className="space-y-8">
            {/* FMP Free Tier Notice */}
            {showFreeTierNotice && (
                <div className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-xl -z-10" />
                    <div className="border border-blue-500/20 rounded-3xl p-5 md:p-6 transition-all">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                                <Info size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">Financial Modeling Prep - Free Tier Info</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    The FMP free tier supports only a specific set of symbols. For all US and Canadian stocks, a paid data plan is required.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setIsNoticeExpanded(!isNoticeExpanded)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all border border-white/5"
                                >
                                    {isNoticeExpanded ? 'Hide Symbols' : 'View Symbols'}
                                    {isNoticeExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                <button
                                    onClick={() => setShowFreeTierNotice(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>

                        {isNoticeExpanded && (
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {FREE_TIER_SYMBOLS.map(symbol => (
                                        <span key={symbol} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-[10px] font-mono font-bold text-blue-300">
                                            {symbol}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <p className="text-xs text-blue-400/80 italic">
                                        Note: Symbols like indices might have delayed data.
                                    </p>
                                    <a
                                        href="https://site.financialmodelingprep.com/developer/docs/pricing"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm text-blue-400 underline decoration-blue-400/30 underline-offset-4 hover:decoration-blue-400 font-medium"
                                    >
                                        Upgrade for full access
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">
                        {user ? `Hello, ${user.email?.split('@')[0]}` : 'Dip Finder'}
                    </h1>
                    <p className="text-gray-400">
                        {user ? "Here's what's moving in your watchlist." : "Discover undervalued stocks in your watchlist."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFormulaExpanded(!isFormulaExpanded)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${isFormulaExpanded ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-blue-400 border-white/5 hover:bg-white/10'}`}
                    >
                        <Info size={16} />
                        How it works
                    </button>
                    <div className="relative group max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search symbol or name (e.g. NVDA)"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Dip Score Formula Explanation */}
            {isFormulaExpanded && (
                <div className="glass rounded-3xl p-6 border-blue-500/30 bg-blue-500/5 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <TrendingDown size={24} className="text-blue-400" />
                                How the Dip Score is calculated
                            </h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Our proprietary Dip Score identifies high-quality companies trading at attractive valuations and technical levels. A score over 70 indicates a strong buying opportunity.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-blue-400 font-bold text-lg mb-1">50% Weight</div>
                                    <div className="text-white font-semibold mb-2">Technical Trend</div>
                                    <p className="text-xs text-gray-500">Based on distance from the 200-day SMA. Lower is better, indicating a deeper "dip" from long-term trends.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-emerald-400 font-bold text-lg mb-1">30% Weight</div>
                                    <div className="text-white font-semibold mb-2">FCF Yield</div>
                                    <p className="text-xs text-gray-500">Measures profitability and value. Higher Free Cash Flow relative to market cap signifies a stronger margin of safety.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-amber-400 font-bold text-lg mb-1">20% Weight</div>
                                    <div className="text-white font-semibold mb-2">Earnings Trend</div>
                                    <p className="text-xs text-gray-500">Compares Current P/E with Forward P/E. A lower Forward P/E suggests earnings growth is expected.</p>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-64 flex flex-col justify-center items-center text-center p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                            <div className="text-3xl font-black text-blue-400 mb-2">Formula</div>
                            <div className="text-[10px] font-mono text-gray-400 space-y-2 text-left">
                                <p>(SMA_Score × 0.5) +</p>
                                <p>(FCF_Score × 0.3) +</p>
                                <p>(PE_Trend × 0.2)</p>
                                <div className="h-px bg-white/10 my-2" />
                                <p className="text-white">× 100 = Dip Score</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400">
                    <Filter className="shrink-0" size={20} />
                    <p className="text-sm font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-auto px-4 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Filters & Actions */}
            <div className="flex items-center justify-between glass p-2 rounded-2xl">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSortBy('score')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${sortBy === 'score' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                    >
                        <TrendingDown size={18} />
                        Best Dips
                    </button>
                    <div className="h-8 w-[1px] bg-white/10 mx-1 hidden sm:block" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-white/20"
                    >
                        <option value="score">Sort by: Score</option>
                        <option value="fcfYield">Sort by: FCF Yield</option>
                        <option value="pe">Sort by: PE Ratio</option>
                        <option value="price">Sort by: Price</option>
                        <option value="name">Sort by: Name</option>
                        <option value="earningsDate">Sort by: Next Earnings</option>
                    </select>
                </div>

                <div className="hidden md:flex bg-black/40 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                    >
                        <ListIcon size={18} />
                    </button>
                </div>
            </div>

            {/* Stock Grid/List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredAndSortedStocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl border-dashed border-2 border-white/5">
                    <p className="text-gray-400 mb-4">No stocks found matching your criteria.</p>
                    <Link href="/watchlist" className="px-6 py-2 bg-blue-600 rounded-full font-medium">Add more symbols</Link>
                </div>
            ) : (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {filteredAndSortedStocks.map(stock => (
                        <StockCard key={stock.symbol} stock={stock} />
                    ))}
                </div>
            )}
        </div>
    );
}
