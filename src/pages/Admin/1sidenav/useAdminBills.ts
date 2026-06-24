import { useState, useRef, useEffect } from 'react';
import { getAllProducts, getCartItems } from '../../../constants/productData';
import type { Bill } from '../../../utils/invoiceGenerator';

export const useAdminBills = (
    bills: Bill[],
    onEditBill: (id: number, newCart: Record<string, number>, newRates?: Record<string, number>, newDate?: string, isEditedPrice?: boolean) => void,
    externalSelectedDate?: string,
    setExternalSelectedDate?: (date: string) => void
) => {
    const getTodayLocal = () => {
        const d = new Date();
        return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    };

    const [internalSelectedDate, setInternalSelectedDate] = useState<string>(getTodayLocal());
    const selectedDate = externalSelectedDate !== undefined ? externalSelectedDate : internalSelectedDate;
    const setSelectedDate = setExternalSelectedDate !== undefined ? setExternalSelectedDate : setInternalSelectedDate;
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [currentCalDate, setCurrentCalDate] = useState(new Date());
    const calendarRef = useRef<HTMLDivElement>(null);

    // Edit Modal State
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [editCart, setEditCart] = useState<Record<string, number>>({});
    const [editRates, setEditRates] = useState<Record<string, number>>({});
    const [editDeliveryDate, setEditDeliveryDate] = useState<string>('');
    const [listSearchQuery, setListSearchQuery] = useState('');
    const [showReview, setShowReview] = useState(false);
    const [isEditedPrice, setIsEditedPrice] = useState(false);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredBills = bills.filter(b => {
        // 1. Date Filter
        if (selectedDate) {
            const targetDate = b.deliveryDate || b.date || '';
            const localDateStr = targetDate.includes('T') ? targetDate.split('T')[0] : targetDate.split(' ')[0];
            if (localDateStr !== selectedDate) return false;
        }

        // 2. Search Filter
        if (listSearchQuery.trim()) {
            const query = listSearchQuery.toLowerCase().trim();
            const shopMatch = b.shopName?.toLowerCase().includes(query);
            const villageMatch = b.villageName?.toLowerCase().includes(query);
            const invMatch = b.invoiceNo?.toString().includes(query);
            const areaMatch = b.specificArea?.toLowerCase().includes(query);
            if (!shopMatch && !villageMatch && !invMatch && !areaMatch) return false;
        }

        return true;
    });

    const groupedBills = filteredBills.reduce((acc, bill) => {
        const creator = bill.createdBy || 'Admin';
        if (!acc[creator]) acc[creator] = {};
        
        const village = bill.villageName || 'General';
        if (!acc[creator][village]) acc[creator][village] = [];
        
        acc[creator][village].push(bill);
        return acc;
    }, {} as Record<string, Record<string, Bill[]>>);

    const getTotal = (cart: Record<string, number>, customRates?: Record<string, number>) =>
        getCartItems(cart, customRates).reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const getItemCount = (cart: Record<string, number>) =>
        Object.values(cart).reduce((s, q) => s + q, 0);

    const updateQuantity = (id: string, delta: number) => {
        setEditCart(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const newCart = { ...prev };
                delete newCart[id];
                return newCart;
            }
            return { ...prev, [id]: next };
        });
    };

    const updateRate = (id: string, rate: number) => {
        setEditRates(prev => {
            const next = { ...prev };
            const p = getAllProducts().find(x => x.id === id);
            if (rate === 0 || (p && rate === p.price)) {
                delete next[id];
            } else {
                next[id] = rate;
            }
            // Flush variants so they recalculate from the new base rate
            delete next[`${id}_box`];
            delete next[`${id}_ltr`];
            delete next[`${id}_box_wl`];
            delete next[`${id}_ltr_wl`];
            return next;
        });
    };

    const openEditModal = (bill: Bill) => {
        setEditingBill(bill);
        setEditCart({ ...bill.cart });
        setEditRates({ ...(bill.customRates || {}) });
        
        // Handle both ISO (T) and MySQL (space) formats
        const d = bill.deliveryDate || bill.date || '';
        const datePart = d.includes('T') ? d.split('T')[0] : d.split(' ')[0];
        setEditDeliveryDate(datePart);
        setShowReview(false);
        setIsEditedPrice(false);
    };

    const handleSaveEdit = () => {
        if (!editingBill) return;
        // Strip items with 0 qty
        const finalCart: Record<string, number> = {};
        for (const [id, qty] of Object.entries(editCart)) {
            if (qty > 0) finalCart[id] = qty;
        }

        // Ensure newly added items capture the current price instead of staying dynamic
        const finalRates = { ...editRates };
        getAllProducts().forEach(p => {
            if (p.id.endsWith('_box') || p.id.endsWith('_ltr') || p.id.endsWith('_box_wl') || p.id.endsWith('_ltr_wl')) return;

            if (finalCart[p.id] || finalCart[`${p.id}_box`] || finalCart[`${p.id}_ltr`] ||
                finalCart[`${p.id}_wl`] || finalCart[`${p.id}_box_wl`] || finalCart[`${p.id}_ltr_wl`]) {
                finalRates[p.id] = editRates[p.id] ?? p.price;
            }
        });

        const finalDeliveryDate = editDeliveryDate || editingBill.deliveryDate;

        // Detect if any rate was changed from the original bill
        const originalRates = editingBill.customRates || {};
        const hasEditedPrice = Object.keys(finalRates).some(id => {
            return finalRates[id] !== undefined && finalRates[id] !== (originalRates[id] ?? finalRates[id]);
        }) || editingBill.isEditedPrice === true || isEditedPrice === true; // preserve flag if previously set or edited in current session

        onEditBill(editingBill.id, finalCart, finalRates, finalDeliveryDate, hasEditedPrice);
        setEditingBill(null);
        setShowReview(false);
    };

    // Calendar Logic
    const minDate = new Date('2025-01-01T00:00:00');
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow viewing 30 days ahead for future deliveries
    const todayStr = getTodayLocal();

    const generateCalendarDays = () => {
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // empty slots before month starts
        for (let i = 0; i < firstDay; i++) days.push(null);
        // actual days
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const handlePrevMonth = () => {
        const prev = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() - 1, 1);
        const minMonthStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        if (prev >= minMonthStart) {
            setCurrentCalDate(prev);
        }
    };

    const handleNextMonth = () => {
        const next = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() + 1, 1);
        const maxMonthStart = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
        if (next <= maxMonthStart) {
            setCurrentCalDate(next);
        }
    };

    const handleDateSelect = (date: Date) => {
        // Adjust for timezone offset to get local YYYY-MM-DD reliably
        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        setSelectedDate(offsetDate.toISOString().split('T')[0]);
        setIsCalendarOpen(false);
    };

    return {
        state: {
            selectedDate, isCalendarOpen, currentCalDate, editingBill,
            editCart, editRates, listSearchQuery,
            minDate, maxDate, todayStr, filteredBills, groupedBills,
            editDeliveryDate, showReview, isEditedPrice
        },
        actions: {
            setSelectedDate, setIsCalendarOpen, setEditingBill,
            setEditCart, setEditRates, setListSearchQuery,
            setEditDeliveryDate, setShowReview, setIsEditedPrice,
            openEditModal, handleSaveEdit, handlePrevMonth, handleNextMonth, handleDateSelect,
            updateQuantity, updateRate
        },
        computed: {
            getTotal, getItemCount, generateCalendarDays
        },
        refs: {
            calendarRef
        }
    };
};
