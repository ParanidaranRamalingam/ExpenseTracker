'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function BudgetPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newCat, setNewCat] = useState({
        category: 'Personal',
        subCategory: '',
        budget: ''
    });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (Array.isArray(data)) setCategories(data);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCat.subCategory || !newCat.budget) return;

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCat)
            });

            if (res.ok) {
                toast.success('Category saved');
                setNewCat({ ...newCat, subCategory: '', budget: '' });
                fetchCategories();
            } else {
                toast.error('Failed to save');
            }
        } catch (err) {
            toast.error('Error saving');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    ←
                </Link>
                <h1 className="text-2xl font-bold">Manage Budgets</h1>
            </div>

            {/* Add New Form */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 mb-8">
                <h2 className="font-semibold mb-4">Add Sub-Category & Budget</h2>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium uppercase text-zinc-500 mb-1">Category</label>
                        <select
                            className="w-full p-2 border rounded dark:bg-zinc-700"
                            value={newCat.category}
                            onChange={(e) => setNewCat({ ...newCat, category: e.target.value })}
                        >
                            <option value="Personal">Personal</option>
                            <option value="House">House</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase text-zinc-500 mb-1">Sub-Category Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded dark:bg-zinc-700"
                            placeholder="e.g. Rent, Groceries, WiFi"
                            value={newCat.subCategory}
                            onChange={(e) => setNewCat({ ...newCat, subCategory: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase text-zinc-500 mb-1">Monthly Budget (₹)</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded dark:bg-zinc-700"
                            placeholder="0.00"
                            value={newCat.budget}
                            onChange={(e) => setNewCat({ ...newCat, budget: e.target.value })}
                            required
                        />
                    </div>

                    <button className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded font-medium">
                        Add / Update
                    </button>
                </form>
            </div>

            {/* List Existing */}
            <div className="space-y-4">
                <h2 className="font-semibold">Current Budgets</h2>
                {categories.length === 0 && <p className="text-zinc-500 italic">No categories defined yet.</p>}

                {categories.map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                        <div>
                            <p className="font-medium">{cat.subCategory}</p>
                            <p className="text-xs text-zinc-500">{cat.category}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">₹{cat.budget}</p>
                            <p className="text-xs text-zinc-400">Monthly</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
