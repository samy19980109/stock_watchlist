'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, TrendingDown, LayoutGrid, List as ListIcon } from 'lucide-react';
import StockCard from '@/components/StockCard';
import { getStocksData, StockFundamentalData } from '@/lib/fmp';
import { calculateDipScore } from '@/lib/scoring';

interface DashboardProps {
    initialStocks: StockFundamentalData[];
}

export default function Dashboard({ initialStocks }: DashboardProps) {
    const [stocks, setStocks] = useState<StockFundamentalData[]>(initialStocks);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'score' | 'fcfYield' | 'pe' | 'price' | 'name' | 'earningsDate'>('score');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // We only need to fetch if the user has a custom watchlist that differs from the default
        // For now, let's keep the logic simple: verify if we have stored symbols, 
        // and if they are different from what we might have loaded, fetch them.
        // However, since we can't easily know the default symbols here without duplication
        // or passing them down, we'll implement a check.

        const fetchUserData = async () => {
            try {
                const stored = localStorage.getItem('watchlist_symbols');
                if (stored) {
                    const symbols = JSON.parse(stored);
                    // If we have custom symbols, we should fetch them to ensure we show the user's specific list
                    // Optimization: We could check if initialStocks matches symbols, but that requires comparing arrays.
                    // For now, if there is a stored list, we fetch it to be safe and update the view.
                    // But if it's the first load and we passed data, maybe we can skip?
                    // Let's assume if the user has customized their list, we want to respect that override.

                    if (symbols.length > 0) {
                        setLoading(true);
                        setError(null);
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
                    }
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

    const filteredAndSortedStocks = stocks
        .filter(stock =>
            stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.name.toLowerCase().includes(searchTerm.toLowerCase())
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

    return (
        <div className="space-y-8">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Dip Finder</h1>
                    <p className="text-gray-400">Discover undervalued stocks in your watchlist.</p>
                </div>

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
