import { useState, useRef, useEffect } from 'react';
import { getAllProducts } from '../../../constants/productData';
import type { Bill } from '../../../utils/invoiceGenerator';

export const useAdminBills = (
    bills: Bill[],
    onEditBill: (id: number, newCart: Record<string, number>, newRates?: Record<string, number>) => void
) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [currentCalDate, setCurrentCalDate] = useState(new Date());
    const calendarRef = useRef<HTMLDivElement>(null);

    // Edit Modal State
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [editCart, setEditCart] = useState<Record<string, number>>({});
    const [editRates, setEditRates] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

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

    const filteredBills = selectedDate
        ? bills.filter(b => b.date.startsWith(selectedDate))
        : bills;

    const groupedBills = filteredBills.reduce((acc, bill) => {
        const creator = bill.createdBy || 'Admin';
        if (!acc[creator]) acc[creator] = [];
        acc[creator].push(bill);
        return acc;
    }, {} as Record<string, Bill[]>);

    const getTotal = (cart: Record<string, number>, customRates?: Record<string, number>) =>
        getAllProducts().reduce((sum, p) => sum + (cart[p.id] || 0) * (customRates?.[p.id] ?? p.price), 0);

    const getItemCount = (cart: Record<string, number>) =>
        Object.values(cart).reduce((s, q) => s + q, 0);

    const openEditModal = (bill: Bill) => {
        setEditingBill(bill);
        setEditCart({ ...bill.cart });
        setEditRates({ ...(bill.customRates || {}) });
        setSearchQuery('');
        setSelectedCategory('All');
    };

    const handleSaveEdit = () => {
        if (!editingBill) return;
        // Strip items with 0 qty
        const finalCart: Record<string, number> = {};
        for (const [id, qty] of Object.entries(editCart)) {
            if (qty > 0) finalCart[id] = qty;
        }
        onEditBill(editingBill.id, finalCart, editRates);
        setEditingBill(null);
    };

    // Calendar Logic
    const minDate = new Date('2025-03-01T00:00:00');
    const maxDate = new Date('2026-04-30T23:59:59');
    const todayStr = new Date().toISOString().split('T')[0];

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
        const prev = new Date(currentCalDate);
        prev.setMonth(prev.getMonth() - 1);
        if (prev >= new Date(minDate.getFullYear(), minDate.getMonth(), 1)) {
            setCurrentCalDate(prev);
        }
    };

    const handleNextMonth = () => {
        const next = new Date(currentCalDate);
        next.setMonth(next.getMonth() + 1);
        if (next <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
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
            editCart, editRates, searchQuery, selectedCategory,
            minDate, maxDate, todayStr, filteredBills, groupedBills
        },
        actions: {
            setSelectedDate, setIsCalendarOpen, setEditingBill,
            setEditCart, setEditRates, setSearchQuery, setSelectedCategory,
            openEditModal, handleSaveEdit, handlePrevMonth, handleNextMonth, handleDateSelect
        },
        computed: {
            getTotal, getItemCount, generateCalendarDays
        },
        refs: {
            calendarRef
        }
    };
};
