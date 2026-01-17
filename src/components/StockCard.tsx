import { ArrowDown, ArrowUp, Info } from 'lucide-react';
import { StockFundamentalData } from '@/lib/fmp';
import { calculateDipScore } from '@/lib/scoring';

export default function StockCard({ stock }: { stock: StockFundamentalData }) {
    const { score, labels } = calculateDipScore(stock);

    const getScoreColor = (s: number) => {
        if (s > 70) return 'text-emerald-500';
        if (s > 40) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="dip-card glass p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold">{stock.symbol}</h3>
                    <p className="text-sm text-gray-400">{stock.name}</p>
                </div>
                <div className={`text-2xl font-black ${getScoreColor(score)}`}>
                    {score}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-gray-500 mb-1">Price</p>
                    <p className="font-semibold">${stock.price.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-gray-500 mb-1">FCF Yield</p>
                    <p className="font-semibold">{(stock.fcfYield * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-gray-500 mb-1">P/E (TTM)</p>
                    <p className="font-semibold">{stock.pe.toFixed(1)}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-gray-500 mb-1">P/E (FWD)</p>
                    <p className="font-semibold">{stock.peForward.toFixed(1)}</p>
                </div>
            </div>

            {stock.priceChanges && (
                <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-4">
                    {[
                        { label: 'YTD', value: stock.priceChanges.ytd },
                        { label: '1M', value: stock.priceChanges["1M"] },
                        { label: '3M', value: stock.priceChanges["3M"] },
                        { label: '6M', value: stock.priceChanges["6M"] },
                        { label: '1Y', value: stock.priceChanges["1Y"] },
                        { label: '3Y', value: stock.priceChanges["3Y"] },
                        { label: '5Y', value: stock.priceChanges["5Y"] },
                    ].map((item) => (
                        <div key={item.label} className="text-center">
                            <p className="text-[10px] text-gray-500 uppercase">{item.label}</p>
                            <p className={`text-[11px] font-bold ${item.value >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {item.value >= 0 ? '+' : ''}{item.value.toFixed(1)}%
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div className={`space-y-2 ${stock.priceChanges ? 'mt-0' : 'mt-2 border-t border-white/5 pt-4'}`}>
                <div className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${stock.price < stock.sma200 ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                    <span>{labels.sma}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${stock.fcfYield > 0.04 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{labels.value}</span>
                </div>
                {stock.nextEarnings && (
                    <div className="flex items-center gap-2 text-xs text-blue-400 font-medium pt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Earnings: {new Date(stock.nextEarnings.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {stock.nextEarnings.time && stock.nextEarnings.time !== 'N/A' && ` (${stock.nextEarnings.time})`}
                        </span>
                    </div>
                )}
            </div>

            <button className="mt-2 w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl font-medium transition-all text-sm">
                View Details
            </button>
        </div>
    );
}
