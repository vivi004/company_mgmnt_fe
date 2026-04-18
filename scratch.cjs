require('dotenv').config();
const apiKey = process.env.VITE_GOOGLE_SHEETS_API_KEY;
const sheetId = process.env.VITE_GOOGLE_SHEET_ID || '1gSE3fMAzka_eIlIU2sFR4xC4_IxJTeHAgJkp5YQCSvM';

async function fetchSheet() {
    const range = 'A1:M17';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data.values, null, 2));
}
fetchSheet();
