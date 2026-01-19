import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import { createClient } from "@/utils/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DipFinder - Smart Stock Watchlist",
    description: "Identify buying opportunities using fundamental analysis and moving averages.",
};

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
`;

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    id="theme-initializer"
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{ __html: themeScript }}
                />
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <Layout serverUser={user}>{children}</Layout>
            </body>
        </html>
    );
}

