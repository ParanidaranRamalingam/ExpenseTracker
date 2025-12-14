'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const fetchData = async () => {
        setLoading(true);
        try {
            const [expRes, catRes] = await Promise.all([
                fetch('/api/expenses'),
                fetch('/api/categories')
            ]);

            if (!expRes.ok) throw new Error('Failed to fetch expenses');

            const expData = await expRes.json();
            const catData = await catRes.json();

            setExpenses(expData);
            setCategories(Array.isArray(catData) ? catData : []);
        } catch (err) {
            console.error(err);
            setError('Could not load data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

    // Calculate totals
    const totalIncome = filteredExpenses
        .filter(e => e.type === 'Credit')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = filteredExpenses
        .filter(e => e.type === 'Debit')
        .reduce((acc, curr) => acc + curr.amount, 0);

    // Group by SubCategory for Budget calculation
    // We only care about Debits for budget tracking usually
    const spendingBySubCategory = filteredExpenses
        .filter(e => e.type === 'Debit')
        .reduce((acc, curr) => {
            const key = `${curr.category}|${curr.subCategory}`;
            acc[key] = (acc[key] || 0) + curr.amount;
            return acc;
        }, {});

    // Group Categories for UI display
    const categoriesGrouped = categories.reduce((acc, curr) => {
        if (!acc[curr.category]) acc[curr.category] = [];
        acc[curr.category].push(curr);
        return acc;
    }, {});

    return (
        <div className="w-full max-w-md space-y-6">

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Dashboard</h2>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-1 border rounded dark:bg-zinc-800 dark:[color-scheme:dark]"
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Income</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">Expense</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">₹{totalExpense.toFixed(2)}</p>
                </div>
            </div>

            {/* Budgets Progress */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Monthly Budgets</h3>
                {Object.keys(categoriesGrouped).length === 0 && (
                    <p className="text-sm text-zinc-500">No budgets defined.</p>
                )}
                {Object.entries(categoriesGrouped).map(([catName, subs]) => (
                    <div key={catName} className="space-y-3">
                        <h4 className="font-medium text-sm text-zinc-500 uppercase tracking-wider">{catName}</h4>
                        {subs.map(sub => {
                            const spent = spendingBySubCategory[`${catName}|${sub.subCategory}`] || 0;
                            const pct = sub.budget > 0 ? (spent / sub.budget) * 100 : 0;
                            const isOver = spent > sub.budget;

                            return (
                                <div key={sub.subCategory} className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-700">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{sub.subCategory}</span>
                                        <span>₹{spent} / ₹{sub.budget}</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${isOver ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-zinc-400 mt-1">
                                        <span>{pct.toFixed(0)}% used</span>
                                        <span>Remaining: ₹{(sub.budget - spent).toFixed(0)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Transactions ({selectedMonth})</h2>
                    <button onClick={fetchData} className="text-sm text-blue-500 hover:underline">Refresh</button>
                </div>

                {loading && <p className="text-center py-4 text-zinc-500">Loading...</p>}
                {error && <p className="text-center py-4 text-red-500 text-sm">{error}</p>}

                {!loading && !error && filteredExpenses.length === 0 && (
                    <p className="text-center py-4 text-zinc-500">No transactions in this month.</p>
                )}

                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {filteredExpenses.slice().reverse().map((expense, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded transition-colors">
                            <div>
                                <p className="font-medium">{expense.description || 'Expense'}</p>
                                <div className="text-xs text-zinc-500 flex gap-2">
                                    <span>{expense.date}</span>
                                    <span className="px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-600 text-[10px]">{expense.category}</span>
                                    {expense.subCategory && <span className="px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px]">{expense.subCategory}</span>}
                                </div>
                            </div>
                            <span className={`font-bold ${expense.type === 'Credit' ? 'text-green-600' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                {expense.type === 'Credit' ? '+' : '-'}₹{expense.amount}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
