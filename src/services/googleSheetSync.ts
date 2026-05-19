/**
 * Google Sheets API Integration for Product Rate Syncing
 * 
 * Fetches product rates from a Google Sheet and maps them to product IDs.
 * Sheet ID: 1gSE3fMAzka_eIlIU2sFR4xC4_IxJTeHAgJkp5YQCSvM
 */

const SHEET_RATES_KEY = 'googleSheetRates_v5';
const SHEET_SYNC_TIME_KEY = 'googleSheetSyncTime_v1';

interface SheetRatesData {
    rates: Record<string, number>;
    syncedAt: string;
}



import { getAuthAxios } from '../utils/apiClient';

/**
 * Fetches latest rates from the secure Node.js backend API and stores them locally.
 * Enforces the architectural rule that apps never query Google Sheets directly.
 */
export async function syncRatesFromSheet(): Promise<{ success: boolean; rateCount: number; error?: string }> {
    try {
        const response = await getAuthAxios().get('/api/products/rates');
        const rates = response.data || {};
        const rateCount = Object.keys(rates).length;

        // Store in localStorage
        const sheetData: SheetRatesData = {
            rates,
            syncedAt: new Date().toISOString()
        };
        localStorage.setItem(SHEET_RATES_KEY, JSON.stringify(sheetData));
        localStorage.setItem(SHEET_SYNC_TIME_KEY, sheetData.syncedAt);

        return { success: true, rateCount };
    } catch (err: any) {
        const message = err.response?.data?.error || err.message || 'Unknown error';
        return { success: false, rateCount: 0, error: `Failed to fetch rates from secure backend: ${message}` };
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
