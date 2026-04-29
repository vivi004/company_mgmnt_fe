export interface Product {
    id: string;
    name: string;
    brand: string;
    size: string;
    price: number;
    unit: string;
    weight?: string;
    icon?: string;
}

import { getSheetRates } from '../services/googleSheetSync';

/* ── Default hardcoded products (used as initial seed) ── */

export const DEFAULT_NISHA_PRODUCTS: Product[] = [
    // Groundnut Oil (Nisha)
    // Groundnut Oil (க.எ)
    { id: 'gn-500ml', name: 'Groundnut Oil', brand: 'Nisha', size: '500 ml', price: 110, unit: 'Litre', icon: '🥜' },
    { id: 'gn-1l-pet', name: 'Groundnut Oil', brand: 'Nisha', size: '1 ltr', price: 220, unit: 'Litre', icon: '🥜' },
    { id: 'gn-2l', name: 'Groundnut Oil', brand: 'Nisha', size: '2 ltr', price: 440, unit: 'Litre', icon: '🥜' },
    { id: 'gn-5l-can', name: 'Groundnut Oil', brand: 'Nisha', size: '5 Ltr Can', price: 1100, unit: 'CAN', icon: '🥜' },
    { id: 'gn-5kg-can', name: 'Groundnut Oil', brand: 'Nisha', size: '5 Kg Can', price: 1245, unit: 'CAN', icon: '🥜' },
    { id: 'gn-15l', name: 'Groundnut Oil', brand: 'Nisha', size: '15 LTR', price: 3260, unit: 'Litre', icon: '🥜' },
    { id: 'gn-15kg', name: 'Groundnut Oil', brand: 'Nisha', size: '15 KG', price: 3530, unit: 'KG', icon: '🥜' },

    // Coconut Oil (தே.எ)
    { id: 'cn-100ml', name: 'Coconut Oil', brand: 'Nisha', size: '100 ml', price: 38, unit: 'Litre', icon: '🥥' },
    { id: 'cn-200ml', name: 'Coconut Oil', brand: 'Nisha', size: '200 ml', price: 74, unit: 'Litre', icon: '🥥' },
    { id: 'cn-500ml', name: 'Coconut Oil', brand: 'Nisha', size: '500 ml', price: 175, unit: 'Litre', icon: '🥥' },
    { id: 'cn-1l-pet', name: 'Coconut Oil', brand: 'Nisha', size: '1 ltr', price: 350, unit: 'Litre', icon: '🥥' },
    { id: 'cn-5l-can', name: 'Coconut Oil', brand: 'Nisha', size: '5 Ltr Can', price: 1750, unit: 'CAN', icon: '🥥' },
    { id: 'cn-15l', name: 'Coconut Oil', brand: 'Nisha', size: '15 LTR', price: 5175, unit: 'Litre', icon: '🥥' },
    { id: 'cn-15kg', name: 'Coconut Oil', brand: 'Nisha', size: '15 KG', price: 5642.5, unit: 'KG', icon: '🥥' },

    // Castor Oil (வி.எ)
    { id: 'cs-100ml', name: 'Castor Oil', brand: 'Nisha', size: '100 ml', price: 29, unit: 'Litre', icon: '🌿' },
    { id: 'cs-200ml', name: 'Castor Oil', brand: 'Nisha', size: '200 ml', price: 56, unit: 'Litre', icon: '🌿' },
    { id: 'cs-500ml', name: 'Castor Oil', brand: 'Nisha', size: '500 ml', price: 130, unit: 'Litre', icon: '🌿' },
    { id: 'cs-1l-pet', name: 'Castor Oil', brand: 'Nisha', size: '1 ltr', price: 260, unit: 'Litre', icon: '🌿' },
    { id: 'cs-5l-can', name: 'Castor Oil', brand: 'Nisha', size: '5 Ltr Can', price: 1300, unit: 'CAN', icon: '🌿' },
    { id: 'cs-15l', name: 'Castor Oil', brand: 'Nisha', size: '15 LTR', price: 3825, unit: 'Litre', icon: '🌿' },
    { id: 'cs-15kg', name: 'Castor Oil', brand: 'Nisha', size: '15 KG', price: 4157.5, unit: 'KG', icon: '🌿' },

    // Lamp Oil (தீ.ப.எ / Deepam Oil)
    { id: 'lo-100ml', name: 'Lamp oil', brand: 'Nisha', size: '100 ml', price: 18, unit: 'Litre', icon: '🪔' },
    { id: 'lo-200ml', name: 'Lamp oil', brand: 'Nisha', size: '200 ml', price: 34, unit: 'Litre', icon: '🪔' },
    { id: 'lo-500ml', name: 'Lamp oil', brand: 'Nisha', size: '500 ml', price: 75, unit: 'Litre', icon: '🪔' },
    { id: 'lo-1l-pet', name: 'Lamp oil', brand: 'Nisha', size: '1 ltr', price: 150, unit: 'Litre', icon: '🪔' },
    { id: 'lo-5l-can', name: 'Lamp oil', brand: 'Nisha', size: '5 Ltr Can', price: 750, unit: 'CAN', icon: '🪔' },
    { id: 'lo-15l', name: 'Lamp oil', brand: 'Nisha', size: '15 LTR', price: 2100, unit: 'Litre', icon: '🪔' },
    { id: 'lo-15kg', name: 'Lamp oil', brand: 'Nisha', size: '15 KG', price: 2250, unit: 'KG', icon: '🪔' },

    // Gingelly Oil (ந.எ / Nalla Ennai)
    { id: 'gg-100ml', name: 'Gingelly Oil', brand: 'Nisha', size: '100 ml', price: 38, unit: 'Litre', icon: '🏺' },
    { id: 'gg-200ml', name: 'Gingelly Oil', brand: 'Nisha', size: '200 ml', price: 74, unit: 'Litre', icon: '🏺' },
    { id: 'gg-500ml', name: 'Gingelly Oil', brand: 'Nisha', size: '500 ml', price: 175, unit: 'Litre', icon: '🏺' },
    { id: 'gg-1l-pet', name: 'Gingelly Oil', brand: 'Nisha', size: '1 ltr', price: 350, unit: 'Litre', icon: '🏺' },
    { id: 'gg-5l-can', name: 'Gingelly Oil', brand: 'Nisha', size: '5 Ltr Can', price: 1750, unit: 'CAN', icon: '🏺' },
    { id: 'gg-15l', name: 'Gingelly Oil', brand: 'Nisha', size: '15 LTR', price: 5175, unit: 'Litre', icon: '🏺' },
    { id: 'gg-15kg', name: 'Gingelly Oil', brand: 'Nisha', size: '15 KG', price: 5642.5, unit: 'KG', icon: '🏺' },

    // Mahua Oil (இ.எ / Iluppa Ennai)
    { id: 'mo-100ml', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '100 ml', price: 29, unit: 'Litre', icon: '🌼' },
    { id: 'mo-200ml', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '200 ml', price: 56, unit: 'Litre', icon: '🌼' },
    { id: 'mo-500ml', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '500 ml', price: 130, unit: 'Litre', icon: '🌼' },
    { id: 'mo-1l-pet', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '1 ltr', price: 260, unit: 'Litre', icon: '🌼' },
    { id: 'mo-5l-can', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '5 Ltr Can', price: 1300, unit: 'CAN', icon: '🌼' },
    { id: 'mo-15l', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '15 LTR', price: 3825, unit: 'Litre', icon: '🌼' },
    { id: 'mo-15kg', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '15 KG', price: 4157.5, unit: 'KG', icon: '🌼' },

    // Neem Oil (வே.எ / Veppa Ennai)
    { id: 'nm-100ml', name: 'Neem Oil', brand: 'Nisha', size: '100 ml', price: 39, unit: 'Litre', icon: '🍃' },
    { id: 'nm-200ml', name: 'Neem Oil', brand: 'Nisha', size: '200 ml', price: 76, unit: 'Litre', icon: '🍃' },
    { id: 'nm-500ml', name: 'Neem Oil', brand: 'Nisha', size: '500 ml', price: 180, unit: 'Litre', icon: '🍃' },
    { id: 'nm-1l-pet', name: 'Neem Oil', brand: 'Nisha', size: '1 ltr', price: 360, unit: 'Litre', icon: '🍃' },
    { id: 'nm-5l-can', name: 'Neem Oil', brand: 'Nisha', size: '5 Ltr Can', price: 1800, unit: 'CAN', icon: '🍃' },
    { id: 'nm-15l', name: 'Neem Oil', brand: 'Nisha', size: '15 LTR', price: 5325, unit: 'Litre', icon: '🍃' },
    { id: 'nm-15kg', name: 'Neem Oil', brand: 'Nisha', size: '15 KG', price: 5807.5, unit: 'KG', icon: '🍃' },
];

export const DEFAULT_MIXED_OIL_PRODUCTS: Product[] = [
    { id: 'mo-v-0.5po', name: 'Mixed Oil', brand: 'VARSHINI', size: '1/2 Pkt', price: 1500, unit: 'BOX', icon: '🛢️' },
    { id: 'mo-v-1lpo', name: 'Mixed Oil', brand: 'VARSHINI', size: '1 Ltr Pkt', price: 1500, unit: 'BOX', icon: '🛢️' },
    { id: 'mo-v-5lcan', name: 'Mixed Oil', brand: 'VARSHINI', size: '5 Ltr Can', price: 775, unit: 'CAN', icon: '🛢️' },
    { id: 'mo-v-15l', name: 'Mixed Oil', brand: 'VARSHINI', size: '15 LTR', price: 2230, unit: 'Litre', icon: '🛢️' },
    { id: 'mo-v-15kg', name: 'Mixed Oil', brand: 'VARSHINI', size: '15 KG', price: 2440, unit: 'KG', icon: '🛢️' },
    { id: 'mo-r-820g', name: 'Mixed Oil', brand: 'ROSHINI', size: '820 GM', price: 1380, unit: 'BOX', icon: '🛢️' },
];

export const DEFAULT_PALM_OIL_PRODUCTS: Product[] = [
    { id: 'po-r-850g', name: 'Palm Oil', brand: 'ROSI GOLD', size: '850 GM', price: 1320, unit: 'BOX', icon: '🌴' },
    { id: 'po-r-820g', name: 'Palm Oil', brand: 'ROSI GOLD', size: '820 GM', price: 1280, unit: 'BOX', icon: '🌴' },
    { id: 'po-r-800g', name: 'Palm Oil', brand: 'ROSI GOLD', size: '800 GM', price: 1250, unit: 'BOX', icon: '🌴' },
    { id: 'po-r-750g', name: 'Palm Oil', brand: 'ROSI GOLD', size: '750 GM', price: 1185, unit: 'BOX', icon: '🌴' },
    { id: 'po-r-15l', name: 'Palm Oil', brand: 'ROSI GOLD', size: '15 LTR', price: 2180, unit: 'Litre', icon: '🌴' },
    { id: 'po-r-15kg', name: 'Palm Oil', brand: 'ROSI GOLD', size: '15 KG', price: 2400, unit: 'KG', icon: '🌴' },
];

export const DEFAULT_BURFI_PRODUCTS: Product[] = [
    { id: 'bu-k-barfi', name: 'Kadalai Burfi', brand: 'Nisha', size: 'JAR', price: 110, unit: 'JAR', icon: '🥜' },
];

export const DEFAULT_OIL_CAKE_PRODUCTS: Product[] = [
    // Thool Cake (தூள்-புண்ணாக்கு)
    { id: 'oc-thool-25kg', name: 'Thool Cake', brand: 'Nisha', size: '25 KG', price: 1525, unit: 'BAG', icon: '🧱' },
    { id: 'oc-thool-50kg', name: 'Thool Cake', brand: 'Nisha', size: '50 KG', price: 3000, unit: 'BAG', icon: '🧱' },
    // Katti Cake (கட்டி-புண்ணாக்கு)
    { id: 'oc-katti-25kg', name: 'Katti Cake', brand: 'Nisha', size: '25 KG', price: 1500, unit: 'BAG', icon: '🪨' },
    { id: 'oc-katti-50kg', name: 'Katti Cake', brand: 'Nisha', size: '50 KG', price: 2950, unit: 'BAG', icon: '🪨' },
];

/* ── localStorage-backed dynamic product management ── */

const NISHA_KEY = 'nishaProducts_v5';
const MIXED_KEY = 'mixedOilProducts_v5';
const PALM_KEY = 'palmOilProducts_v5';
const BURFI_KEY = 'burfiProducts_v5';
const OIL_CAKE_KEY = 'oilCakeProducts_v5';

/**
 * Helper to apply synced sheet rates to a list of products
 */
function applySheetRatesToProducts(products: Product[]): Product[] {
    const sheetRates = getSheetRates();
    return products.map(p => ({
        ...p,
        price: sheetRates[p.id] ?? p.price
    }));
}

export function getNishaProducts(): Product[] {
    const stored = localStorage.getItem(NISHA_KEY);
    const products = stored ? JSON.parse(stored) : DEFAULT_NISHA_PRODUCTS;
    return applySheetRatesToProducts(products);
}

export function getMixedOilProducts(): Product[] {
    const stored = localStorage.getItem(MIXED_KEY);
    const products = stored ? JSON.parse(stored) : DEFAULT_MIXED_OIL_PRODUCTS;
    return applySheetRatesToProducts(products);
}

export function getPalmOilProducts(): Product[] {
    const stored = localStorage.getItem(PALM_KEY);
    const products = stored ? JSON.parse(stored) : DEFAULT_PALM_OIL_PRODUCTS;
    return applySheetRatesToProducts(products);
}

export function getBurfiProducts(): Product[] {
    const stored = localStorage.getItem(BURFI_KEY);
    const products = stored ? JSON.parse(stored) : DEFAULT_BURFI_PRODUCTS;
    return applySheetRatesToProducts(products);
}

export function getOilCakeProducts(): Product[] {
    const stored = localStorage.getItem(OIL_CAKE_KEY);
    const products = stored ? JSON.parse(stored) : DEFAULT_OIL_CAKE_PRODUCTS;
    return applySheetRatesToProducts(products);
}

export function getAllProducts(): Product[] {
    const baseProducts = [...getNishaProducts(), ...getMixedOilProducts(), ...getPalmOilProducts(), ...getBurfiProducts(), ...getOilCakeProducts()];
    const expanded: Product[] = [];

    for (const product of baseProducts) {
        expanded.push(product);
        const p = product; // Keep 'p' reference for below logic if needed, or just rename below
        const effectivePrice = product.price;

        const normalSize = p.size.toLowerCase();

        // 100ml gets Box (5L -> 50 BTL) and Litre (10 BTL)
        if (normalSize === '100 ml') {
            expanded.push({
                ...product,
                id: p.id + '_box',
                size: '1 BOX (50x100ml)',
                price: effectivePrice * 50,
                unit: 'BOX'
            });
            expanded.push({
                ...product,
                id: p.id + '_ltr',
                size: '1 LTR (10x100ml)',
                price: effectivePrice * 10,
                unit: 'LTR'
            });
        }

        // 200ml gets Box (5L -> 25 BTL) and Litre (5 BTL)
        if (normalSize === '200 ml') {
            expanded.push({
                ...product,
                id: p.id + '_box',
                size: '1 BOX (25x200ml)',
                price: effectivePrice * 25,
                unit: 'BOX'
            });

            expanded.push({
                ...product,
                id: p.id + '_ltr',
                size: '1 LTR (5x200ml)',
                price: effectivePrice * 5,
                unit: 'LTR'
            });
        }

        // 500ml gets Box(20) and Litre(2) virtual products
        if (normalSize === '500 ml') {
            expanded.push({
                ...product,
                id: p.id + '_box',
                size: '1 BOX (20x500ml)',
                price: effectivePrice * 20,
                unit: 'BOX'
            });
            expanded.push({
                ...product,
                id: p.id + '_ltr',
                size: '1 LTR (2x500ml)',
                price: effectivePrice * 2,
                unit: 'LTR'
            });
        }

        // 1 Litre gets strictly a Box(10) virtual product
        if (normalSize === '1 litre' || normalSize === '1 ltr-pet' || normalSize === '1 ltr') {
            expanded.push({
                ...product,
                id: p.id + '_box',
                size: '1 BOX (10x1L)',
                price: effectivePrice * 10,
                unit: 'BOX'
            });
        }
    }

    return expanded;
}

/**
 * Centered utility to expand a raw cart into physically accurate items (bottles/boxes).
 * This replaces duplicated flatMap logic in components and prevents "double display" bugs.
 */
export function getCartItems(cart: Record<string, number>, customRates?: Record<string, number>): (Product & { quantity: number; price: number })[] {
    const baseProducts = [...getNishaProducts(), ...getMixedOilProducts(), ...getPalmOilProducts(), ...getBurfiProducts(), ...getOilCakeProducts()];

    return baseProducts.flatMap(p => {
        const items = [];
        const isNisha = p.brand === 'Nisha';
        const size = p.size.toLowerCase();
        // Use customRates first, then base price (which already includes sheetRates)
        const effectivePrice = customRates?.[p.id] ?? p.price;

        const is100ml = isNisha && size === '100 ml';
        const is200ml = isNisha && size === '200 ml';
        const is500ml = isNisha && size === '500 ml';
        const is1L = isNisha && (size === '1 litre' || size === '1 ltr-pet' || size === '1 ltr');
        const is2L = isNisha && size === '2 ltr';

        // 1. Base Product / Litre selection (for 2L)
        if (cart[p.id]) {
            const quantity = cart[p.id] || 0;
            items.push({ ...p, price: effectivePrice, quantity });
        }

        // 2. Box Variant (suffix _box)
        if (cart[p.id + '_box']) {
            const multiplier = is100ml ? 50 : is200ml ? 25 : is500ml ? 20 : is1L ? 10 : is2L ? 5 : 1;
            items.push({
                ...p,
                id: p.id + '_box',
                name: `${p.name} (Box)`,
                price: effectivePrice * multiplier,
                quantity: cart[p.id + '_box']
            });
        }

        // 3. Litre Variant (suffix _ltr)
        if (cart[p.id + '_ltr']) {
            const multiplierLtr = is100ml ? 10 : is200ml ? 5 : is500ml ? 2 : 1;
            const quantity = (is100ml || is200ml || is500ml) ? (cart[p.id + '_ltr'] || 0) * multiplierLtr : (cart[p.id + '_ltr'] || 0);

            items.push({
                ...p,
                id: p.id + '_ltr',
                name: (is100ml || is200ml || is500ml) ? p.name : `${p.name} (Litre)`,
                size: is100ml ? '100 ml' : is200ml ? '200 ml' : is500ml ? '500 ml' : p.size,
                price: effectivePrice,
                quantity
            });
        }
        return items;
    });
}

export function saveNishaProducts(products: Product[]) {
    localStorage.setItem(NISHA_KEY, JSON.stringify(products));
}

export function saveMixedOilProducts(products: Product[]) {
    localStorage.setItem(MIXED_KEY, JSON.stringify(products));
}

export function savePalmOilProducts(products: Product[]) {
    localStorage.setItem(PALM_KEY, JSON.stringify(products));
}

export function saveBurfiProducts(products: Product[]) {
    localStorage.setItem(BURFI_KEY, JSON.stringify(products));
}

export function saveOilCakeProducts(products: Product[]) {
    localStorage.setItem(OIL_CAKE_KEY, JSON.stringify(products));
}

/* ── Backward-compat exports (used by existing components) ── */
export const NISHA_PRODUCTS = DEFAULT_NISHA_PRODUCTS;
export const MIXED_OIL_PRODUCTS = DEFAULT_MIXED_OIL_PRODUCTS;
export const PALM_OIL_PRODUCTS = DEFAULT_PALM_OIL_PRODUCTS;
export const BURFI_PRODUCTS = DEFAULT_BURFI_PRODUCTS;
export const OIL_CAKE_PRODUCTS = DEFAULT_OIL_CAKE_PRODUCTS;
export const ALL_PRODUCTS = [...DEFAULT_NISHA_PRODUCTS, ...DEFAULT_MIXED_OIL_PRODUCTS, ...DEFAULT_PALM_OIL_PRODUCTS, ...DEFAULT_BURFI_PRODUCTS, ...DEFAULT_OIL_CAKE_PRODUCTS];

/* ── Nisha Pure Oil Subcategories (localStorage-backed) ── */

export interface NishaSubcategory {
    id: string;
    name: string;
    icon: string;
}

export const DEFAULT_NISHA_SUBCATEGORIES: NishaSubcategory[] = [
    { id: 'GN', name: 'Groundnut Oil', icon: '🥜' },
    { id: 'CN', name: 'Coconut Oil', icon: '🥥' },
    { id: 'GG', name: 'Gingelly Oil', icon: '🌻' },
    { id: 'CS', name: 'Castor Oil', icon: '🌱' },
    { id: 'NM', name: 'Neem Oil', icon: '🌿' },
    { id: 'MO', name: 'Mahua Oil(iluppa ennai)', icon: '🧴' },
    { id: 'LO', name: 'Lamp oil', icon: '🪔' },
];

const NISHA_SUBCAT_KEY = 'nishaSubcats_v2';

export function getNishaSubcategories(): NishaSubcategory[] {
    const stored = localStorage.getItem(NISHA_SUBCAT_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_NISHA_SUBCATEGORIES;
}

export function saveNishaSubcategories(cats: NishaSubcategory[]): void {
    localStorage.setItem(NISHA_SUBCAT_KEY, JSON.stringify(cats));
}
