'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ExpenseForm({ onSuccess }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        category: 'Personal',
        subCategory: '',
        type: 'Debit'
    });

    // Fetch categories heavily depends on the Categories sheet.
    // If empty, we provide defaults or allow free text if we want, but user asked for "assigning budget for subcategory"
    // which implies they must exist. 
    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCategories(data);
            })
            .catch(err => console.error("Failed to load categories", err));
    }, []);

    const availableSubCategories = categories
        .filter(c => c.category === formData.category)
        .map(c => c.subCategory);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success('Transaction added!');
                setFormData(prev => ({
                    ...prev,
                    date: new Date().toISOString().split('T')[0],
                    amount: '',
                    description: '',
                    subCategory: ''
                }));
                router.refresh();
                if (onSuccess) onSuccess();
            } else {
                toast.error('Failed to add transaction');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error submitting form');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-lg my-6">
            <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600 dark:[color-scheme:dark]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
                        >
                            <option value="Debit">Debit (Expense)</option>
                            <option value="Credit">Credit (Income)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                            className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
                        >
                            <option value="Personal">Personal</option>
                            <option value="House">House</option>
                        </select>
                    </div>
                </div>

                {/* Sub-category is only relevant for Debits usually */}
                {formData.type === 'Debit' && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Sub-Category</label>
                        {availableSubCategories.length > 0 ? (
                            <select
                                value={formData.subCategory}
                                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
                                required
                            >
                                <option value="">Select sub-category</option>
                                {availableSubCategories.map(sc => (
                                    <option key={sc} value={sc}>{sc}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={formData.subCategory}
                                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
                                placeholder="e.g. Rent, Groceries (Add in Budget page for dropdown)"
                            />
                        )}
                        {availableSubCategories.length === 0 && (
                            <p className="text-xs text-zinc-500 mt-1">Tip: Go to "Manage Budget" to define sub-categories.</p>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
                        placeholder="What for?"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? 'Adding...' : 'Add Transaction'}
                </button>
            </form>
        </div>
    );
}
