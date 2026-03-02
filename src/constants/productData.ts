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

/* ── Default hardcoded products (used as initial seed) ── */

export const DEFAULT_NISHA_PRODUCTS: Product[] = [
    // Groundnut Oil (Nisha)
    { id: 'gn-500ml', name: 'Groundnut Oil', brand: 'Nisha', size: '500 ml', price: 115, unit: 'BTL', icon: '🥜' },
    { id: 'gn-1l-pet', name: 'Groundnut Oil', brand: 'Nisha', size: '1 Litre', price: 230, unit: 'BTL', icon: '🥜' },
    { id: 'gn-2l', name: 'Groundnut Oil', brand: 'Nisha', size: '2 LTR', price: 460, unit: 'CAN', icon: '🥜' },
    { id: 'gn-5l-can', name: 'Groundnut Oil', brand: 'Nisha', size: '5 LTR CAN', price: 1150, unit: 'CAN', icon: '🥜' },
    { id: 'gn-5kg-can', name: 'Groundnut Oil', brand: 'Nisha', size: '5 KG CAN', price: 1350, unit: 'CAN', icon: '🥜' },
    { id: 'gn-15l', name: 'Groundnut Oil', brand: 'Nisha', size: '15 LTR', price: 3380, unit: 'TIN', icon: '🥜' },
    { id: 'gn-15kg', name: 'Groundnut Oil', brand: 'Nisha', size: '15 KG', price: 3630, unit: 'TIN', icon: '🥜' },

    // Coconut Oil (Nisha)
    { id: 'cn-200ml', name: 'Coconut Oil', brand: 'Nisha', size: '200 ml', price: 74, unit: 'BTL', icon: '🥥' },
    { id: 'cn-500ml', name: 'Coconut Oil', brand: 'Nisha', size: '500 ml', price: 175, unit: 'BTL', icon: '🥥' },
    { id: 'cn-1l-pet', name: 'Coconut Oil', brand: 'Nisha', size: '1 LTR-PET', price: 350, unit: 'BTL', icon: '🥥' },
    { id: 'cn-5l-can', name: 'Coconut Oil', brand: 'Nisha', size: '5 LTR CAN', price: 1750, unit: 'CAN', icon: '🥥' },
    { id: 'cn-15l', name: 'Coconut Oil', brand: 'Nisha', size: '15 LTR', price: 5175, unit: 'TIN', icon: '🥥' },
    { id: 'cn-15kg', name: 'Coconut Oil', brand: 'Nisha', size: '15 KG', price: 5643, unit: 'TIN', icon: '🥥' },

    // Sesame Oil (Gingelly) - (Nisha)
    { id: 'sm-100ml', name: 'Sesame Oil', brand: 'Nisha', size: '100 ml', price: 38, unit: 'BTL', icon: '🌻' },
    { id: 'sm-200ml', name: 'Sesame Oil', brand: 'Nisha', size: '200 ml', price: 74, unit: 'BTL', icon: '🌻' },
    { id: 'sm-500ml', name: 'Sesame Oil', brand: 'Nisha', size: '500 ml', price: 175, unit: 'BTL', icon: '🌻' },
    { id: 'sm-1l-pet', name: 'Sesame Oil', brand: 'Nisha', size: '1 LTR-PET', price: 350, unit: 'BTL', icon: '🌻' },
    { id: 'sm-5l-can', name: 'Sesame Oil', brand: 'Nisha', size: '5 LTR CAN', price: 1750, unit: 'CAN', icon: '🌻' },
    { id: 'sm-15l', name: 'Sesame Oil', brand: 'Nisha', size: '15 LTR', price: 5175, unit: 'TIN', icon: '🌻' },
    { id: 'sm-15kg', name: 'Sesame Oil', brand: 'Nisha', size: '15 KG', price: 5643, unit: 'TIN', icon: '🌻' },

    // Castor Oil (Nisha)
    { id: 'cs-100ml', name: 'Castor Oil', brand: 'Nisha', size: '100 ml', price: 29, unit: 'BTL', icon: '🌱' },
    { id: 'cs-200ml', name: 'Castor Oil', brand: 'Nisha', size: '200 ml', price: 56, unit: 'BTL', icon: '🌱' },
    { id: 'cs-500ml', name: 'Castor Oil', brand: 'Nisha', size: '500 ml', price: 130, unit: 'BTL', icon: '🌱' },
    { id: 'cs-1l-pet', name: 'Castor Oil', brand: 'Nisha', size: '1 LTR-PET', price: 260, unit: 'BTL', icon: '🌱' },
    { id: 'cs-5l-can', name: 'Castor Oil', brand: 'Nisha', size: '5 LTR CAN', price: 1300, unit: 'CAN', icon: '🌱' },
    { id: 'cs-15l', name: 'Castor Oil', brand: 'Nisha', size: '15 LTR', price: 3825, unit: 'TIN', icon: '🌱' },
    { id: 'cs-15kg', name: 'Castor Oil', brand: 'Nisha', size: '15 KG', price: 4157.5, unit: 'TIN', icon: '🌱' },
];

export const DEFAULT_MIXED_OIL_PRODUCTS: Product[] = [
    // Varshini Brand (Mixed Oil)
    { id: 'mo-v-0.5po', name: 'Mixed Oil', brand: 'Varshini', size: '1/2 PO', price: 1400, unit: 'BOX' },
    { id: 'mo-v-1lpo', name: 'Mixed Oil', brand: 'Varshini', size: '1 LTR PO', price: 1400, unit: 'BOX' },
    { id: 'mo-v-5lcan', name: 'Mixed Oil', brand: 'Varshini', size: '5 LTR CAN', price: 725, unit: 'CAN' },
    { id: 'mo-v-15l', name: 'Mixed Oil', brand: 'Varshini', size: '15 LTR', price: 2090, unit: 'TIN' },
    { id: 'mo-v-15kg', name: 'Mixed Oil', brand: 'Varshini', size: '15 KG', price: 2290, unit: 'TIN' },

    // Roshini Brand (Mixed Oil)
    { id: 'mo-r-820g', name: 'Mixed Oil', brand: 'Roshini', size: '820 GM', price: 1280, unit: 'BOX' },

    // Kumaran (GN OIL)
    { id: 'mo-k-barfi', name: 'Peanut Barfi', brand: 'Kumaran', size: '1 JAR', price: 110, unit: 'JAR' },
];

export const DEFAULT_PALM_OIL_PRODUCTS: Product[] = [
    // Rosi Gold (Palm Oil)
    { id: 'po-r-850g', name: 'Palm Oil', brand: 'Rosi Gold', size: '850 GM', price: 1230, unit: 'BOX' },
    { id: 'po-r-820g', name: 'Palm Oil', brand: 'Rosi Gold', size: '820 GM', price: 1190, unit: 'BOX' },
    { id: 'po-r-800g', name: 'Palm Oil', brand: 'Rosi Gold', size: '800 GM', price: 1160, unit: 'BOX' },
    { id: 'po-r-750g', name: 'Palm Oil', brand: 'Rosi Gold', size: '750 GM', price: 1100, unit: 'BOX' },
    { id: 'po-r-15l', name: 'Palm Oil', brand: 'Rosi Gold', size: '15 LTRS', price: 2010, unit: 'TIN' },
    { id: 'po-r-15kg', name: 'Palm Oil', brand: 'Rosi Gold', size: '15 KG', price: 2220, unit: 'TIN' },
];

/* ── localStorage-backed dynamic product management ── */

const NISHA_KEY = 'nishaProducts_v2';
const MIXED_KEY = 'mixedOilProducts_v2';
const PALM_KEY = 'palmOilProducts_v2';

export function getNishaProducts(): Product[] {
    const stored = localStorage.getItem(NISHA_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_NISHA_PRODUCTS;
}

export function getMixedOilProducts(): Product[] {
    const stored = localStorage.getItem(MIXED_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_MIXED_OIL_PRODUCTS;
}

export function getPalmOilProducts(): Product[] {
    const stored = localStorage.getItem(PALM_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PALM_OIL_PRODUCTS;
}

export function getAllProducts(): Product[] {
    const baseProducts = [...getNishaProducts(), ...getMixedOilProducts(), ...getPalmOilProducts()];
    const expanded: Product[] = [];

    for (const p of baseProducts) {
        expanded.push(p);

        const normalSize = p.size.toLowerCase();

        // 500ml gets both Box(20) and Litre(2) virtual products
        if (normalSize === '500 ml') {
            expanded.push({
                ...p,
                id: p.id + '_box',
                size: '1 BOX (20x500ml)',
                price: p.price * 20,
                unit: 'BOX'
            });
            expanded.push({
                ...p,
                id: p.id + '_ltr',
                size: '1 LTR (2x500ml)',
                price: p.price * 2,
                unit: 'LTR'
            });
        }

        // 1 Litre gets strictly a Box(10) virtual product
        if (normalSize === '1 litre') {
            expanded.push({
                ...p,
                id: p.id + '_box',
                size: '1 BOX (10x1L)',
                price: p.price * 10,
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
    const baseProducts = [...getNishaProducts(), ...getMixedOilProducts(), ...getPalmOilProducts()];

    return baseProducts.flatMap(p => {
        const items = [];
        const isNisha = p.brand === 'Nisha';
        const size = p.size.toLowerCase();
        const is2L = isNisha && size === '2 ltr';
        const is1L = isNisha && (size === '1 litre' || size === '1 ltr-pet');
        const is500ml = isNisha && size === '500 ml';

        // 1. Base Product / Litre selection (for 2L)
        if (cart[p.id]) {
            const price = customRates?.[p.id] ?? p.price; // Bottle price
            const quantity = is2L ? (cart[p.id] || 0) / 2 : (cart[p.id] || 0);
            items.push({ ...p, price, quantity });
        }

        // 2. Box Variant (suffix _box)
        if (cart[p.id + '_box']) {
            const multiplier = is500ml ? 20 : is1L ? 10 : is2L ? 5 : 1;
            const basePrice = customRates?.[p.id] ?? p.price;
            items.push({
                ...p,
                id: p.id + '_box',
                name: `${p.name} (Box)`,
                price: basePrice * multiplier,
                quantity: cart[p.id + '_box']
            });
        }

        // 3. Litre Variant (suffix _ltr, special for 500ml)
        if (cart[p.id + '_ltr']) {
            const price = customRates?.[p.id] ?? p.price; // Bottle price
            const quantity = is500ml ? (cart[p.id + '_ltr'] || 0) * 2 : (cart[p.id + '_ltr'] || 0);
            items.push({
                ...p,
                id: p.id + '_ltr',
                name: is500ml ? p.name : `${p.name} (Litre)`,
                price,
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

/* ── Backward-compat exports (used by existing components) ── */
export const NISHA_PRODUCTS = DEFAULT_NISHA_PRODUCTS;
export const MIXED_OIL_PRODUCTS = DEFAULT_MIXED_OIL_PRODUCTS;
export const PALM_OIL_PRODUCTS = DEFAULT_PALM_OIL_PRODUCTS;
export const ALL_PRODUCTS = [...DEFAULT_NISHA_PRODUCTS, ...DEFAULT_MIXED_OIL_PRODUCTS, ...DEFAULT_PALM_OIL_PRODUCTS];

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
