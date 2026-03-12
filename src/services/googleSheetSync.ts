/**
 * Google Sheets API Integration for Product Rate Syncing
 * 
 * Fetches product rates from a Google Sheet and maps them to product IDs.
 * Sheet ID: 1gSE3fMAzka_eIlIU2sFR4xC4_IxJTeHAgJkp5YQCSvM
 */

const SHEET_RATES_KEY = 'googleSheetRates_v1';
const SHEET_SYNC_TIME_KEY = 'googleSheetSyncTime_v1';

interface SheetRatesData {
    rates: Record<string, number>;
    syncedAt: string;
}

/**
 * Parses a cell value to a number, returning null if invalid
 */
function parsePrice(val: any): number | null {
    if (val === undefined || val === null || val === '' || val === '-' || val === 'NA' || val === 'NOT AVL') return null;
    const strVal = val.toString();
    if (strVal.startsWith('#')) return null;
    const num = parseFloat(strVal.replace(/,/g, ''));
    return isNaN(num) ? null : num;
}

/**
 * Maps the 2D array from Google Sheets to a Record<productId, price>
 * 
 * Sheet layout (0-indexed rows & cols from the raw CSV):
 * Row 0: Header (நிஷா ஆயில் மில், DATE)
 * Row 1: Category headers
 * Row 2-7: Product data block 1 (Groundnut, Varshini, Palm, Coconut, Neem, Oil Cake)
 * Row 8: Extra row (Roshini)
 * Row 9: Category headers block 2
 * Row 10-15: Product data block 2 (Castor, Lamp, Gingelly, Mahua, Kumaran, Burfi)
 * Row 16: Extra (Varshini Gold)
 */
function mapSheetToProducts(rows: string[][]): Record<string, number> {
    const rates: Record<string, number> = {};

    function set(id: string, row: number, col: number, factor: number = 1) {
        if (!rows[row]) return;
        const price = parsePrice(rows[row][col]);
        if (price !== null) {
            rates[id] = price * factor;
        }
    }

    // ── Block 1 (rows 2–7): Groundnut Oil (cols A=0, B=1) ──
    // Row 2: 500ML  | Row 3: 1LTR-PET | Row 4: 2LTR | Row 5: 5LTR CAN | Row 6: 5KG CAN | Row 7: 15LTR
    // Row 8: 15KG
    set('gn-500ml', 2, 1, 0.5);
    set('gn-1l-pet', 3, 1);
    set('gn-2l', 4, 1); // 440 is for 2L? Yes, 220*2. Factor 1 because price in sheet is already 440.
    set('gn-5l-can', 5, 1);
    set('gn-5kg-can', 6, 1);
    set('gn-15l', 7, 1);
    set('gn-15kg', 8, 1);

    // ── Block 1: Varshini Mixed Oil (cols C=2, D=3) ──
    set('mo-v-0.5po', 2, 3); // 1500 (BOX)
    set('mo-v-1lpo', 3, 3); // 1500 (BOX)
    set('mo-v-5lcan', 4, 3); // 775
    set('mo-v-15l', 5, 3); // 2230
    set('mo-v-15kg', 6, 3); // 2440

    // ── Block 1: Roshini Mixed Oil (row 8, cols C=2, D=3) ──
    set('mo-r-820g', 8, 3); // 1380 (BOX)

    // ── Block 1: ROSI GOLD Palm Oil (cols E=4, F=5) ──
    set('po-r-850g', 2, 5); // 1320 (BOX)
    set('po-r-820g', 3, 5);
    set('po-r-800g', 4, 5);
    set('po-r-750g', 5, 5);
    set('po-r-15l', 6, 5);
    set('po-r-15kg', 7, 5);

    // ── Block 1: Coconut Oil (cols G=6, H=7) ──
    set('cn-100ml', 2, 7, 0.1); // 380 rate -> 38 bottle (Assuming row 2 is 100ml or 200ml)
    set('cn-200ml', 3, 7, 0.2); // 370 rate -> 74 bottle
    set('cn-500ml', 4, 7, 0.5); // 350 rate -> 175 bottle
    set('cn-1l-pet', 5, 7);
    set('cn-5l-can', 6, 7);
    set('cn-15l', 7, 7);
    set('cn-15kg', 8, 7);

    // ── Block 1: Neem Oil (cols I=8, J=9) ──
    set('nm-100ml', 2, 9, 0.1);
    set('nm-200ml', 3, 9, 0.2);
    set('nm-500ml', 4, 9, 0.5);
    set('nm-1l-pet', 5, 9);
    set('nm-5l-can', 6, 9);
    set('nm-15l', 7, 9);
    set('nm-15kg', 8, 9);

    // ── Block 1: Oil Cake (cols K=10, L=11) ──
    set('oc-thool-25kg', 2, 11);
    set('oc-thool-50kg', 3, 11);
    set('oc-katti-25kg', 4, 11);
    set('oc-katti-50kg', 5, 11);

    // ── Block 2 (rows 10–16): Castor Oil (cols A=0, B=1) ──
    set('cs-100ml', 10, 1, 0.1);
    set('cs-200ml', 11, 1, 0.2);
    set('cs-500ml', 12, 1, 0.5);
    set('cs-1l-pet', 13, 1);
    set('cs-5l-can', 14, 1);
    set('cs-15l', 15, 1);
    set('cs-15kg', 16, 1);

    // ── Block 2: Lamp Oil (cols C=2, D=3) ──
    set('lo-100ml', 10, 3, 0.1);
    set('lo-200ml', 11, 3, 0.2);
    set('lo-500ml', 12, 3, 0.5);
    set('lo-1l-pet', 13, 3);
    set('lo-5l-can', 14, 3);
    set('lo-15l', 15, 3);
    set('lo-15kg', 16, 3);

    // ── Block 2: Gingelly Oil (cols E=4, F=5) ──
    set('gg-100ml', 10, 5, 0.1);
    set('gg-200ml', 11, 5, 0.2);
    set('gg-500ml', 12, 5, 0.5);
    set('gg-1l-pet', 13, 5);
    set('gg-5l-can', 14, 5);
    set('gg-15l', 15, 5);
    set('gg-15kg', 16, 5);

    // ── Block 2: Mahua Oil (cols G=6, H=7) ──
    set('mo-100ml', 10, 7, 0.1);
    set('mo-200ml', 11, 7, 0.2);
    set('mo-500ml', 12, 7, 0.5);
    set('mo-1l-pet', 13, 7);
    set('mo-5l-can', 14, 7);
    set('mo-15l', 15, 7);
    set('mo-15kg', 16, 7);

    // ── Block 2: Burfi (cols I=8, J=9, row 16) ──
    set('bu-k-barfi', 16, 9);

    return rates;
}

/**
 * Fetches latest rates from Google Sheets API and stores them locally
 */
export async function syncRatesFromSheet(): Promise<{ success: boolean; rateCount: number; error?: string }> {
    const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
    const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID || '1gSE3fMAzka_eIlIU2sFR4xC4_IxJTeHAgJkp5YQCSvM';

    if (!apiKey) {
        return { success: false, rateCount: 0, error: 'Google Sheets API key not configured. Add VITE_GOOGLE_SHEETS_API_KEY to .env' };
    }

    try {
        const range = 'A1:M17';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE`;

        const response = await fetch(url);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const message = errData?.error?.message || `HTTP ${response.status}`;
            return { success: false, rateCount: 0, error: `Google Sheets API error: ${message}` };
        }

        const data = await response.json();
        const rows: string[][] = data.values || [];

        if (rows.length < 10) {
            return { success: false, rateCount: 0, error: 'Sheet data appears incomplete (fewer than 10 rows)' };
        }

        const rates = mapSheetToProducts(rows);
        const rateCount = Object.keys(rates).length;

        // Store in localStorage
        const sheetData: SheetRatesData = {
            rates,
            syncedAt: new Date().toISOString()
        };
        localStorage.setItem(SHEET_RATES_KEY, JSON.stringify(sheetData));
        localStorage.setItem(SHEET_SYNC_TIME_KEY, sheetData.syncedAt);

        return { success: true, rateCount };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, rateCount: 0, error: `Network error: ${message}` };
    }
}

/**
 * Returns the last synced rates from localStorage (or empty object if never synced)
 */
export function getSheetRates(): Record<string, number> {
    try {
        const stored = localStorage.getItem(SHEET_RATES_KEY);
        if (!stored) return {};
        const data: SheetRatesData = JSON.parse(stored);
        return data.rates;
    } catch {
        return {};
    }
}

/**
 * Returns the last sync timestamp (ISO string) or null
 */
export function getLastSyncTime(): string | null {
    return localStorage.getItem(SHEET_SYNC_TIME_KEY);
}

/**
 * Clears stored sheet rates
 */
export function clearSheetRates(): void {
    localStorage.removeItem(SHEET_RATES_KEY);
    localStorage.removeItem(SHEET_SYNC_TIME_KEY);
}
