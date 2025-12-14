import { google } from 'googleapis';

const AUTH = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEETS = google.sheets({ version: 'v4', auth: AUTH });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function getSheetData(rangeName = 'Sheet1!A:F') {
    try {
        const response = await SHEETS.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: rangeName,
        });

        const rows = response.data.values || [];
        if (rows.length === 0) return [];

        // Simple parser assuming first row is header
        // Returns array of arrays, let caller map it
        return rows;
    } catch (error) {
        console.error(`Error fetching sheet data for ${rangeName}:`, error);
        return [];
    }
}

export async function getExpenses() {
    const rows = await getSheetData('Sheet1!A:F');
    if (rows.length < 2) return [];

    // Expected headers: Date, Amount, Description, Category, Type, SubCategory
    return rows.slice(1).map(row => ({
        date: row[0],
        amount: parseFloat(row[1]),
        description: row[2],
        category: row[3],
        type: row[4],
        subCategory: row[5] || ''
    }));
}

export async function getCategories() {
    // Expected 'Categories' sheet with: Category, SubCategory, MonthlyBudget
    const rows = await getSheetData('Categories!A:C');
    if (rows.length < 2) return [];

    const map = new Map();
    rows.slice(1).forEach(row => {
        const key = `${row[0]}|${row[1]}`; // Category|SubCategory
        map.set(key, {
            category: row[0],
            subCategory: row[1],
            budget: parseFloat(row[2]) || 0
        });
    });

    return Array.from(map.values());
}

export async function addExpense(expense) {
    try {
        const values = [
            [
                expense.date,
                expense.amount,
                expense.description,
                expense.category,
                expense.type,
                expense.subCategory || ''
            ]
        ];

        await SHEETS.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:F',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });

        return true;
    } catch (error) {
        console.error('Error adding expense:', error);
        return false;
    }
}

export async function addCategory(categoryData) {
    try {
        const values = [
            [
                categoryData.category, // e.g. 'Personal'
                categoryData.subCategory, // e.g. 'Rent'
                categoryData.budget // e.g. 15000
            ]
        ];

        await SHEETS.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Categories!A:C',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });

        return true;
    } catch (error) {
        console.error('Error adding category:', error);
        return false;
    }
}
