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
    { id: 'cn-100ml', name: 'Coconut Oil', brand: 'Nisha', size: '100 ml', price: 37, unit: 'BTL', icon: '🥥' },
    { id: 'cn-200ml', name: 'Coconut Oil', brand: 'Nisha', size: '200 ml', price: 74, unit: 'BTL', icon: '🥥' },
    { id: 'cn-500ml', name: 'Coconut Oil', brand: 'Nisha', size: '500 ml', price: 175, unit: 'BTL', icon: '🥥' },
    { id: 'cn-1l-pet', name: 'Coconut Oil', brand: 'Nisha', size: '1 LTR', price: 350, unit: 'BTL', icon: '🥥' },
    { id: 'cn-5l-can', name: 'Coconut Oil', brand: 'Nisha', size: '5 LTR CAN', price: 1750, unit: 'CAN', icon: '🥥' },
    { id: 'cn-15l', name: 'Coconut Oil', brand: 'Nisha', size: '15 LTR', price: 5175, unit: 'TIN', icon: '🥥' },
    { id: 'cn-15kg', name: 'Coconut Oil', brand: 'Nisha', size: '15 KG', price: 5643, unit: 'TIN', icon: '🥥' },

    // Sesame Oil (Gingelly) - (Nisha)
    { id: 'gg-100ml', name: 'Gingelly Oil', brand: 'Nisha', size: '100 ml', price: 38, unit: 'BTL', icon: '🌻' },
    { id: 'gg-200ml', name: 'Gingelly Oil', brand: 'Nisha', size: '200 ml', price: 74, unit: 'BTL', icon: '🌻' },
    { id: 'gg-500ml', name: 'Gingelly Oil', brand: 'Nisha', size: '500 ml', price: 175, unit: 'BTL', icon: '🌻' },
    { id: 'gg-1l-pet', name: 'Gingelly Oil', brand: 'Nisha', size: '1 LTR', price: 350, unit: 'BTL', icon: '🌻' },
    { id: 'gg-5l-can', name: 'Gingelly Oil', brand: 'Nisha', size: '5 LTR CAN', price: 1750, unit: 'CAN', icon: '🌻' },
    { id: 'gg-15l', name: 'Gingelly Oil', brand: 'Nisha', size: '15 LTR', price: 5175, unit: 'TIN', icon: '🌻' },
    { id: 'gg-15kg', name: 'Gingelly Oil', brand: 'Nisha', size: '15 KG', price: 5643, unit: 'TIN', icon: '🌻' },

    // Castor Oil (Nisha)
    { id: 'cs-100ml', name: 'Castor Oil', brand: 'Nisha', size: '100 ml', price: 29, unit: 'BTL', icon: '🌱' },
    { id: 'cs-200ml', name: 'Castor Oil', brand: 'Nisha', size: '200 ml', price: 56, unit: 'BTL', icon: '🌱' },
    { id: 'cs-500ml', name: 'Castor Oil', brand: 'Nisha', size: '500 ml', price: 130, unit: 'BTL', icon: '🌱' },
    { id: 'cs-1l-pet', name: 'Castor Oil', brand: 'Nisha', size: '1 LTR', price: 260, unit: 'BTL', icon: '🌱' },
    { id: 'cs-5l-can', name: 'Castor Oil', brand: 'Nisha', size: '5 LTR CAN', price: 1300, unit: 'CAN', icon: '🌱' },
    { id: 'cs-15l', name: 'Castor Oil', brand: 'Nisha', size: '15 LTR', price: 3825, unit: 'TIN', icon: '🌱' },
    { id: 'cs-15kg', name: 'Castor Oil', brand: 'Nisha', size: '15 KG', price: 4157.5, unit: 'TIN', icon: '🌱' },

    // Neem Oil (Nisha)
    { id: 'nm-100ml', name: 'Neem Oil', brand: 'Nisha', size: '100 ml', price: 39, unit: 'BTL', icon: '🌿' },
    { id: 'nm-200ml', name: 'Neem Oil', brand: 'Nisha', size: '200 ml', price: 76, unit: 'BTL', icon: '🌿' },
    { id: 'nm-500ml', name: 'Neem Oil', brand: 'Nisha', size: '500 ml', price: 180, unit: 'BTL', icon: '🌿' },
    { id: 'nm-1l-pet', name: 'Neem Oil', brand: 'Nisha', size: '1 LTR', price: 360, unit: 'BTL', icon: '🌿' },
    { id: 'nm-5l-can', name: 'Neem Oil', brand: 'Nisha', size: '5 LTR CAN', price: 1800, unit: 'CAN', icon: '🌿' },
    { id: 'nm-15l', name: 'Neem Oil', brand: 'Nisha', size: '15 LTR', price: 5325, unit: 'TIN', icon: '🌿' },
    { id: 'nm-15kg', name: 'Neem Oil', brand: 'Nisha', size: '15 KG', price: 5807.5, unit: 'TIN', icon: '🌿' },

    // Mahua Oil (Nisha)
    { id: 'mo-100ml', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '100 ml', price: 28, unit: 'BTL', icon: '🧴' },
    { id: 'mo-200ml', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '200 ml', price: 56, unit: 'BTL', icon: '🧴' },
    { id: 'mo-500ml', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '500 ml', price: 130, unit: 'BTL', icon: '🧴' },
    { id: 'mo-1l-pet', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '1 LTR', price: 260, unit: 'BTL', icon: '🧴' },
    { id: 'mo-5l-can', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '5 LTR CAN', price: 1300, unit: 'CAN', icon: '🧴' },
    { id: 'mo-15l', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '15 LTR', price: 3825, unit: 'TIN', icon: '🧴' },
    { id: 'mo-15kg', name: 'Mahua Oil(iluppa ennai)', brand: 'Nisha', size: '15 KG', price: 4158, unit: 'TIN', icon: '🧴' },

    // Lamp Oil (Nisha)
    { id: 'lo-100ml', name: 'Lamp oil', brand: 'Nisha', size: '100 ml', price: 18, unit: 'BTL', icon: '🪔' },
    { id: 'lo-200ml', name: 'Lamp oil', brand: 'Nisha', size: '200 ml', price: 34, unit: 'BTL', icon: '🪔' },
    { id: 'lo-500ml', name: 'Lamp oil', brand: 'Nisha', size: '500 ml', price: 75, unit: 'BTL', icon: '🪔' },
    { id: 'lo-1l-pet', name: 'Lamp oil', brand: 'Nisha', size: '1 LTR', price: 150, unit: 'BTL', icon: '🪔' },
    { id: 'lo-5l-can', name: 'Lamp oil', brand: 'Nisha', size: '5 LTR CAN', price: 750, unit: 'CAN', icon: '🪔' },
    { id: 'lo-15l', name: 'Lamp oil', brand: 'Nisha', size: '15 LTR', price: 2100, unit: 'TIN', icon: '🪔' },
    { id: 'lo-15kg', name: 'Lamp oil', brand: 'Nisha', size: '15 KG', price: 2250, unit: 'TIN', icon: '🪔' },
];

export const DEFAULT_MIXED_OIL_PRODUCTS: Product[] = [
    // Varshini Brand (Mixed Oil)
    { id: 'mo-v-0.5po', name: 'Mixed Oil', brand: 'Varshini', size: '1/2 Pkt', price: 1400, unit: 'BOX' },
    { id: 'mo-v-1lpo', name: 'Mixed Oil', brand: 'Varshini', size: '1 LTR pkt', price: 1400, unit: 'BOX' },
    { id: 'mo-v-5lcan', name: 'Mixed Oil', brand: 'Varshini', size: '5 LTR CAN', price: 725, unit: 'CAN' },
    { id: 'mo-v-15l', name: 'Mixed Oil', brand: 'Varshini', size: '15 LTR', price: 2090, unit: 'TIN' },
    { id: 'mo-v-15kg', name: 'Mixed Oil', brand: 'Varshini', size: '15 KG', price: 2290, unit: 'TIN' },

    // Roshini Brand (Mixed Oil)
    { id: 'mo-r-820g', name: 'Mixed Oil', brand: 'Roshini', size: '820 GM', price: 1280, unit: 'BOX' },
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

export const DEFAULT_BURFI_PRODUCTS: Product[] = [
    // Kumaran (Peanut Barfi)
    { id: 'bu-k-barfi', name: 'Peanut Barfi', brand: 'Kumaran', size: '1 JAR', price: 110, unit: 'JAR', icon: '📦' },
];

export const DEFAULT_OIL_CAKE_PRODUCTS: Product[] = [
    // Thool Cake (துள்-புண்ணாக்கு)
    { id: 'oc-thool-25kg', name: 'Thool Cake', brand: 'Nisha', size: '25 KG', price: 1500, unit: 'BAG', icon: '🧱' },
    { id: 'oc-thool-50kg', name: 'Thool Cake', brand: 'Nisha', size: '50 KG', price: 2950, unit: 'BAG', icon: '🧱' },

    // Katti Cake (கட்டி-புண்ணாக்கு)
    { id: 'oc-katti-25kg', name: 'Katti Cake', brand: 'Nisha', size: '25 KG', price: 1475, unit: 'BAG', icon: '🪨' },
    { id: 'oc-katti-50kg', name: 'Katti Cake', brand: 'Nisha', size: '50 KG', price: 2900, unit: 'BAG', icon: '🪨' },
];

/* ── localStorage-backed dynamic product management ── */

const NISHA_KEY = 'nishaProducts_v2';
const MIXED_KEY = 'mixedOilProducts_v2';
const PALM_KEY = 'palmOilProducts_v2';
const BURFI_KEY = 'burfiProducts_v2';
const OIL_CAKE_KEY = 'oilCakeProducts_v2';

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

export function getBurfiProducts(): Product[] {
    const stored = localStorage.getItem(BURFI_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_BURFI_PRODUCTS;
}

export function getOilCakeProducts(): Product[] {
    const stored = localStorage.getItem(OIL_CAKE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_OIL_CAKE_PRODUCTS;
}

export function getAllProducts(): Product[] {
    const baseProducts = [...getNishaProducts(), ...getMixedOilProducts(), ...getPalmOilProducts(), ...getBurfiProducts(), ...getOilCakeProducts()];
    const expanded: Product[] = [];

    for (const p of baseProducts) {
        expanded.push(p);

        const normalSize = p.size.toLowerCase();

        // 100ml gets Box (5L -> 50 BTL) and Litre (10 BTL)
        if (normalSize === '100 ml') {
            expanded.push({
                ...p,
                id: p.id + '_box',
                size: '1 BOX (50x100ml)',
                price: p.price * 50,
                unit: 'BOX'
            });
            expanded.push({
                ...p,
                id: p.id + '_ltr',
                size: '1 LTR (10x100ml)',
                price: p.price * 10,
                unit: 'LTR'
            });
        }

        // 200ml gets Box (5L -> 25 BTL) and Litre (5 BTL)
        if (normalSize === '200 ml') {
            expanded.push({
                ...p,
                id: p.id + '_box',
                size: '1 BOX (25x200ml)',
                price: p.price * 25,
                unit: 'BOX'
            });

            expanded.push({
                ...p,
                id: p.id + '_ltr',
                size: '1 LTR (5x200ml)',
                price: p.price * 5,
                unit: 'LTR'
            });
        }

        // 500ml gets Box(20) and Litre(2) virtual products
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
        if (normalSize === '1 litre' || normalSize === '1 ltr-pet' || normalSize === '1 ltr') {
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
    const baseProducts = [...getNishaProducts(), ...getMixedOilProducts(), ...getPalmOilProducts(), ...getBurfiProducts(), ...getOilCakeProducts()];

    return baseProducts.flatMap(p => {
        const items = [];
        const isNisha = p.brand === 'Nisha';
        const size = p.size.toLowerCase();

        const is100ml = isNisha && size === '100 ml';
        const is200ml = isNisha && size === '200 ml';
        const is500ml = isNisha && size === '500 ml';
        const is1L = isNisha && (size === '1 litre' || size === '1 ltr-pet' || size === '1 ltr');
        const is2L = isNisha && size === '2 ltr';

        // 1. Base Product / Litre selection (for 2L)
        if (cart[p.id]) {
            const price = customRates?.[p.id] ?? p.price; // Bottle price
            const quantity = is2L ? (cart[p.id] || 0) / 2 : (cart[p.id] || 0);
            items.push({ ...p, price, quantity });
        }

        // 2. Box Variant (suffix _box)
        if (cart[p.id + '_box']) {
            const multiplier = is100ml ? 50 : is200ml ? 25 : is500ml ? 20 : is1L ? 10 : is2L ? 5 : 1;
            const basePrice = customRates?.[p.id] ?? p.price;
            items.push({
                ...p,
                id: p.id + '_box',
                name: `${p.name} (Box)`,
                price: basePrice * multiplier,
                quantity: cart[p.id + '_box']
            });
        }

        // 3. Litre Variant (suffix _ltr)
        if (cart[p.id + '_ltr']) {
            const price = customRates?.[p.id] ?? p.price; // Bottle price
            const multiplierLtr = is100ml ? 10 : is200ml ? 5 : is500ml ? 2 : 1;
            const quantity = (is100ml || is200ml || is500ml) ? (cart[p.id + '_ltr'] || 0) * multiplierLtr : (cart[p.id + '_ltr'] || 0);

            items.push({
                ...p,
                id: p.id + '_ltr',
                name: (is100ml || is200ml || is500ml) ? p.name : `${p.name} (Litre)`,
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
