'use client';

import { useState } from 'react';
import ExpenseForm from "@/components/ExpenseForm";
import Dashboard from "@/components/Dashboard";

export default function Home() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black text-black dark:text-white">
            <main className="container mx-auto p-4 max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center">Expense Tracker</h1>

                <Dashboard key={refreshKey} />
                <ExpenseForm onSuccess={handleSuccess} />

            </main>
        </div>
    );
}
