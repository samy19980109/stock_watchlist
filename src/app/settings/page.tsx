'use client';

import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, RotateCcw, Monitor, Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        const storedKey = localStorage.getItem('FMP_API_KEY');
        if (storedKey) setApiKey(storedKey);

        // Load theme preference
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.setAttribute('data-theme', storedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultTheme = prefersDark ? 'dark' : 'light';
            setTheme(defaultTheme);
            document.documentElement.setAttribute('data-theme', defaultTheme);
        }
    }, []);

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleSave = () => {
        localStorage.setItem('FMP_API_KEY', apiKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings? This will not clear your watchlist.')) {
            localStorage.removeItem('FMP_API_KEY');
            localStorage.removeItem('theme');
            setApiKey('');
            setTheme('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Settings</h1>
                <p className="text-muted">Manage your API keys and application preferences.</p>
            </div>

            <div className="space-y-6">
                {/* API Configuration */}
                <section className="glass p-6 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600/20 text-blue-500 rounded-xl">
                            <Key size={20} />
                        </div>
                        <h2 className="text-xl font-bold">API Configuration</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">Financial Modeling Prep API Key</label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your FMP API Key"
                                className="w-full input-bg border border-[var(--border)] rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle hover:text-[var(--foreground)] transition-colors"
                            >
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-xs text-subtle">
                            Get your free API key at <a href="https://site.financialmodelingprep.com/developer/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Financial Modeling Prep</a>.
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all text-white ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {saved ? <><Save size={18} /> Saved!</> : <><Save size={18} /> Save Settings</>}
                    </button>
                </section>

                {/* Display Preferences */}
                <section className="glass p-6 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-600/20 text-purple-500 rounded-xl">
                            <Monitor size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Display Preferences</h2>
                    </div>

                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[var(--input-bg)] rounded-2xl">
                        <div>
                            <p className="font-medium">Theme</p>
                            <p className="text-xs text-subtle">Choose between Light and Dark mode</p>
                        </div>
                        <div className="flex bg-[var(--card)] p-1 rounded-xl border border-[var(--border)]">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${theme === 'light'
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'text-muted hover:text-[var(--foreground)]'
                                    }`}
                            >
                                <Sun size={16} />
                                Light
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${theme === 'dark'
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'text-muted hover:text-[var(--foreground)]'
                                    }`}
                            >
                                <Moon size={16} />
                                Dark
                            </button>
                        </div>
                    </div>

                    {/* View Mode (disabled) */}
                    <div className="flex items-center justify-between p-4 bg-[var(--input-bg)] rounded-2xl opacity-50 cursor-not-allowed">
                        <div>
                            <p className="font-medium">Default View Mode</p>
                            <p className="text-xs text-subtle">Choose between Grid and List views</p>
                        </div>
                        <div className="flex bg-[var(--card)] p-1 rounded-xl border border-[var(--border)]">
                            <button className="px-4 py-1.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium">Grid</button>
                            <button className="px-4 py-1.5 rounded-lg text-muted text-sm font-medium">List</button>
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
