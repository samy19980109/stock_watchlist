'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { User as SupabaseUser } from '@supabase/supabase-js';

export default function AuthStatus({ serverUser }: { serverUser?: SupabaseUser | null }) {
    const [user, setUser] = useState<SupabaseUser | null>(serverUser ?? null);
    const [loading, setLoading] = useState(!serverUser);
    const [mounted, setMounted] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        setMounted(true);
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (!mounted || loading) {
        return <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />;
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all active:scale-[0.98]"
            >
                Sign In
                <ChevronRight className="w-4 h-4" />
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-gray-400">Signed in as</span>
                <span className="text-sm font-medium text-white truncate max-w-[150px]">
                    {user.email}
                </span>
            </div>
            <div className="relative group">
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <User className="w-5 h-5 text-gray-400" />
                </button>
                <div className="absolute right-0 mt-2 w-48 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100 z-50">
                    <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors mt-1"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
