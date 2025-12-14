import { getCategories, addCategory } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

export async function GET() {
    const categories = await getCategories();
    return NextResponse.json(categories);
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { category, subCategory, budget } = body;

        const success = await addCategory({ category, subCategory, budget });

        if (success) {
            return NextResponse.json({ message: 'Category added' });
        } else {
            return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
