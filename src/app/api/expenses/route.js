import { getExpenses, addExpense } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

export async function GET() {
    const expenses = await getExpenses();
    return NextResponse.json(expenses);
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { amount, description, category, type, subCategory, date } = body;

        if (!amount || !category || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newExpense = {
            date: date || new Date().toISOString().split('T')[0],
            amount: parseFloat(amount),
            description: description || '',
            category, // 'Personal' or 'House'
            type, // 'Credit' or 'Debit'
            subCategory: subCategory || ''
        };

        const success = await addExpense(newExpense);

        if (success) {
            return NextResponse.json({ message: 'Expense added successfully', expense: newExpense });
        } else {
            return NextResponse.json({ error: 'Failed to add expense' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
