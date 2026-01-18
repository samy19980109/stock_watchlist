'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LineChart, List, Settings } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-[var(--background)] pb-20 md:pb-0 md:pt-16 text-[var(--foreground)] transition-colors duration-300">
            {/* Desktop Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-16 glass z-50 hidden md:flex items-center justify-between px-8 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">D</div>
                    <span className="text-xl font-bold tracking-tight">DipFinder</span>
                </Link>
                <div className="flex gap-8">
                    <Link
                        href="/"
                        className={`transition-colors ${isActive('/') ? 'text-blue-500' : 'hover:text-blue-500 text-gray-400'}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/watchlist"
                        className={`transition-colors ${isActive('/watchlist') ? 'text-blue-500' : 'hover:text-blue-500 text-gray-400'}`}
                    >
                        Watchlist
                    </Link>
                    <Link
                        href="/settings"
                        className={`transition-colors ${isActive('/settings') ? 'text-blue-500' : 'hover:text-blue-500 text-gray-400'}`}
                    >
                        Settings
                    </Link>
                </div>

            </nav>

            <main className="max-w-7xl mx-auto p-4 md:p-8">
                {children}
            </main>

            {/* Mobile Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 h-16 glass z-50 flex md:hidden items-center justify-around border-t border-white/10">
                <Link href="/" className={`flex flex-col items-center gap-1 text-xs transition-colors ${isActive('/') ? 'text-blue-500' : 'text-gray-400'}`}>
                    <Home size={20} />
                    <span>Home</span>
                </Link>
                <Link href="/watchlist" className={`flex flex-col items-center gap-1 text-xs transition-colors ${isActive('/watchlist') ? 'text-blue-500' : 'text-gray-400'}`}>
                    <List size={20} />
                    <span>Watchlist</span>
                </Link>
                <Link href="/settings" className={`flex flex-col items-center gap-1 text-xs transition-colors ${isActive('/settings') ? 'text-blue-500' : 'text-gray-400'}`}>
                    <Settings size={20} />
                    <span>Settings</span>
                </Link>
            </nav>
        </div>
    );
}
