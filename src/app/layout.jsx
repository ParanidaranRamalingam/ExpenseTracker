import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Expense Tracker",
    description: "Personal expense tracker app",
    manifest: "/manifest.json",
    icons: {
        icon: "/app-icon.png",
        apple: "/app-icon.png",
    },
};

import { Toaster } from "sonner";
import Link from 'next/link';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-black text-black dark:text-white`}
            >
                <nav className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between max-w-md mx-auto">
                    <Link href="/" className="font-bold text-lg">Expense Tracker</Link>
                    <Link href="/budget" className="text-blue-600 dark:text-blue-400">Manage Budget</Link>
                </nav>
                {children}
                <Toaster position="top-center" />
            </body>
        </html>
    );
}
