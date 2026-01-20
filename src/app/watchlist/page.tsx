'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getWatchlistSymbols, addSymbolToWatchlist, removeSymbolFromWatchlist } from '@/lib/watchlist-service';

export default function WatchlistPage() {
    const [symbols, setSymbols] = useState<string[]>([]);
    const [newSymbol, setNewSymbol] = useState('');
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });

    useEffect(() => {
        const fetchSymbols = async () => {
            const data = await getWatchlistSymbols();
            setSymbols(data);
        };
        fetchSymbols();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const normalized = newSymbol.trim().toUpperCase();

        if (!normalized) return;

        if (symbols.includes(normalized)) {
            setStatus({ type: 'error', message: `${normalized} is already in your watchlist.` });
            setTimeout(() => setStatus({ type: 'idle' }), 3000);
            return;
        }

        setStatus({ type: 'loading' });
        try {
            await addSymbolToWatchlist(normalized);
            setSymbols([normalized, ...symbols]);
            setNewSymbol('');
            setStatus({ type: 'success', message: `Added ${normalized} successfully!` });
            setTimeout(() => setStatus({ type: 'idle' }), 3000);
        } catch (err: any) {
            console.error('Failed to add symbol:', err);
            setStatus({ type: 'error', message: err.message || `Failed to add ${normalized}.` });
            setTimeout(() => setStatus({ type: 'idle' }), 5000);
        }
    };

    const handleRemove = async (symbol: string) => {
        try {
            await removeSymbolFromWatchlist(symbol);
            setSymbols(symbols.filter(s => s !== symbol));
        } catch (err) {
            console.error('Failed to remove symbol:', err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Your Watchlist</h1>
                    <p className="text-gray-400">Manage the stocks you want to track for dips.</p>
                </div>
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition-all text-sm w-fit"
                >
                    <TrendingUp size={18} />
                    View Analysis
                </Link>
            </div>

            {/* Add Symbol Form */}
            <form onSubmit={handleAdd} className="glass p-6 rounded-3xl border border-white/10">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            value={newSymbol}
                            onChange={(e) => setNewSymbol(e.target.value)}
                            placeholder="Enter stock symbol (e.g. NVDA)"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold uppercase"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newSymbol.trim() || status.type === 'loading'}
                        className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all whitespace-nowrap"
                    >
                        {status.type === 'loading' ? (
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <Plus size={20} />
                        )}
                        {status.type === 'loading' ? 'Adding...' : 'Add Symbol'}
                    </button>
                </div>
                {status.type === 'error' && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={16} />
                        {status.message}
                    </div>
                )}
                {status.type === 'success' && (
                    <div className="mt-4 flex items-center gap-2 text-green-400 text-sm animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={16} className="rotate-180" />
                        {status.message}
                    </div>
                )}
            </form>

            {/* Symbols List */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {symbols.map((symbol) => (
                    <div
                        key={symbol}
                        className="glass group p-4 rounded-2xl border border-white/10 flex items-center justify-between hover:border-white/20 transition-all"
                    >
                        <span className="text-xl font-black tracking-wider">{symbol}</span>
                        <button
                            onClick={() => handleRemove(symbol)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                {symbols.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-gray-500">Your watchlist is empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
