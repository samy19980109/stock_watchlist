'use client';

import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, RotateCcw, Monitor } from 'lucide-react';

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('FMP_API_KEY');
        if (storedKey) setApiKey(storedKey);
    }, []);

    const handleSave = () => {
        localStorage.setItem('FMP_API_KEY', apiKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings? This will not clear your watchlist.')) {
            localStorage.removeItem('FMP_API_KEY');
            setApiKey('');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Settings</h1>
                <p className="text-gray-400">Manage your API keys and application preferences.</p>
            </div>

            <div className="space-y-6">
                {/* API Configuration */}
                <section className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600/20 text-blue-500 rounded-xl">
                            <Key size={20} />
                        </div>
                        <h2 className="text-xl font-bold">API Configuration</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Financial Modeling Prep API Key</label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your FMP API Key"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Get your free API key at <a href="https://site.financialmodelingprep.com/developer/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Financial Modeling Prep</a>.
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {saved ? <><Save size={18} /> Saved!</> : <><Save size={18} /> Save Settings</>}
                    </button>
                </section>

                {/* Display Preferences */}
                <section className="glass p-6 rounded-3xl border border-white/10 space-y-4 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-600/20 text-purple-500 rounded-xl">
                            <Monitor size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Display Preferences</h2>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
                        <div>
                            <p className="font-medium text-gray-200">Default View Mode</p>
                            <p className="text-xs text-gray-500">Choose between Grid and List views</p>
                        </div>
                        <div className="flex bg-black/40 p-1 rounded-xl">
                            <button className="px-4 py-1.5 rounded-lg bg-white/10 text-sm font-medium">Grid</button>
                            <button className="px-4 py-1.5 rounded-lg text-gray-500 text-sm font-medium">List</button>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="pt-4 border-t border-white/5">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-medium transition-colors"
                    >
                        <RotateCcw size={16} />
                        Reset Settings back to Default
                    </button>
                </section>
            </div>
        </div>
    );
}
