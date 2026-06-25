import { useState, useEffect } from "react";
import { useToast } from "../../../components/Toast";
import { getAuthAxios } from "../../../utils/apiClient";
import type { Employee, ProfileRequest, OrderLine, OlRequest, EmployeeFormData } from "../../../types/DashboardTypes";

// Module-level Set: tracks bill IDs already sealed in this session to prevent re-sealing on tab switches.
// Resets naturally on full page refresh (server already has the sealed data by then).
const sealedBillIds = new Set<number>();

export const useAdminDashboardData = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [requests, setRequests] = useState<ProfileRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || "manage");
    const [backendStatus, setBackendStatus] = useState("Checking...");
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; message: string; onConfirm: () => void; confirmText?: string; confirmColor?: string }>({
        open: false, message: '', onConfirm: () => { }, confirmText: 'Confirm', confirmColor: 'bg-red-600'
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [companyName, setCompanyName] = useState(() => localStorage.getItem('companyName') || "Nisha");
    const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || "light");

    // NEW ADMINISTRATIVE SETTINGS
    const [lastSynced, setLastSynced] = useState(() => localStorage.getItem('lastSynced') || "Never");
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSyncingLedger, setIsSyncingLedger] = useState(false);
    const [nextInvoiceNo, setNextInvoiceNo] = useState(() => parseInt(localStorage.getItem('nextInvoiceNo') || '1001', 10));
    const [lastInvoiceNo, setLastInvoiceNo] = useState(() => parseInt(localStorage.getItem('lastInvoiceNo') || '1000', 10));
    const [profilePic, setProfilePic] = useState(() => localStorage.getItem('adminProfilePic') || "");
    const [ledgerSheetUrl, setLedgerSheetUrl] = useState(() => localStorage.getItem('ledgerSheetUrl') || "");
    const [upiId1, setUpiId1] = useState(() => localStorage.getItem('upiId1') || "nishaoilmills@ybl");
    const [upiName1, setUpiName1] = useState(() => localStorage.getItem('upiName1') || "NISHA OIL MILL");
    const [upiId2, setUpiId2] = useState(() => localStorage.getItem('upiId2') || "nishaoilmills@okaxis");
    const [upiName2, setUpiName2] = useState(() => localStorage.getItem('upiName2') || "NISHA OIL MILL");


    const [formData, setFormData] = useState<EmployeeFormData>({
        first_name: "", last_name: "", email: "", role: "Staff", status: "Active", username: "", password: "", accessible_orderlines: []
    });

    const [olRequests, setOlRequests] = useState<OlRequest[]>([]);
    const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
    const [showOlModal, setShowOlModal] = useState(false);
    const [editingOl, setEditingOl] = useState<OrderLine | null>(null);
    const [olFormData, setOlFormData] = useState({ name: "", node_id: "", area_name: "" });

    const { toasts, showToast, removeToast } = useToast();

    const [bills, setBills] = useState<Array<{ id: number; shopName: string; villageName: string; areaName?: string; specificArea?: string; cart: Record<string, number>; customRates?: Record<string, number>; date: string; deliveryDate?: string; invoiceNo: number }>>([]);
    const [motorVehicles, setMotorVehicles] = useState<any[]>([]);
    const [unverifiedCount, setUnverifiedCount] = useState(0);
    const [totalBillsCount, setTotalBillsCount] = useState(0);
    const [billSelectedDate, setBillSelectedDate] = useState(() => {
        // Default to today's date in Indian Time
        const now = new Date();
        const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        return istDate.toISOString().split('T')[0];
    });

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [userProfile] = useState<Partial<Employee>>({
        id: storedUser.id || 0,
        first_name: storedUser.first_name || "Admin",
        last_name: storedUser.last_name || "",
        email: storedUser.email || "",
        role: storedUser.role || "Admin"
    });

    const api = () => getAuthAxios();

    const fetchBillsCount = async () => {
        try {
            const res = await api().get('/api/bills/count');
            setTotalBillsCount(res.data.count || 0);
        } catch (err) {
            console.error("Error loading bills count:", err);
        }
    };

    const loadBills = async (dateStr?: string) => {
        try {
            const targetDate = dateStr || billSelectedDate;
            const url = targetDate 
                ? `/api/bills/date-range?startDate=${targetDate}&endDate=${targetDate}`
                : '/api/bills';
            const res = await api().get(url);
            const mappedBills = res.data.map((b: any) => ({
                id: b.id,
                shopName: b.shop_name || b.shopName,
                villageName: b.village_name || b.villageName,
                areaName: b.area_name || b.areaName || '',
                specificArea: b.specific_area || b.specificArea || '',
                cart: b.cart,
                customRates: (() => {
                    const raw = b.custom_rates || b.customRates || {};
                    // Strip stale _box / _ltr keys — they are always derived dynamically
                    const cleaned: Record<string, number> = {};
                    for (const key of Object.keys(raw)) {
                        if (!key.endsWith('_box') && !key.endsWith('_ltr') && !key.endsWith('_box_wl') && !key.endsWith('_ltr_wl')) {
                            cleaned[key] = raw[key];
                        }
                    }
                    return cleaned;
                })(),
                date: b.bill_date || b.date,
                deliveryDate: b.delivery_date || b.deliveryDate,
                invoiceNo: b.invoice_no || b.invoiceNo,
                createdBy: b.created_by || b.createdBy,
                phone: b.phone || '',
                phone2: b.phone2 || '',
                isEditedPrice: Boolean(b.is_edited_price || b.isEditedPrice),
                old_balance: b.old_balance ?? b.oldBalance ?? 0
            }));
            
            setBills(mappedBills);

            // Auto-seal legacy bills that have empty customRates
            // Uses a session-level Set to track already-sealed IDs — prevents re-sealing on every tab switch
            const legacyBills = mappedBills.filter((b: any) => Object.keys(b.customRates).length === 0 && Object.keys(b.cart).length > 0 && !sealedBillIds.has(b.id));
            if (legacyBills.length > 0 && activeTab === 'bills') {
                import('../../../constants/productData').then(async ({ getAllProducts }) => {
                    const currentProducts = getAllProducts();
                    for (const bill of legacyBills) {
                        const legacyRates: Record<string, number> = {};
                        currentProducts.forEach(p => {
                            if (p.id.endsWith('_box') || p.id.endsWith('_ltr') || p.id.endsWith('_box_wl') || p.id.endsWith('_ltr_wl')) return;

                            if (bill.cart[p.id] || bill.cart[`${p.id}_box`] || bill.cart[`${p.id}_ltr`] ||
                                bill.cart[`${p.id}_wl`] || bill.cart[`${p.id}_box_wl`] || bill.cart[`${p.id}_ltr_wl`]) {
                                legacyRates[p.id] = p.price;
                            }
                        });
                        try {
                            await api().put(`/api/bills/${bill.id}`, { cart: bill.cart, custom_rates: legacyRates });
                            sealedBillIds.add(bill.id); // Mark as sealed for this session
                        } catch (e) {
                            console.error('Failed to seal legacy bill:', bill.id);
                        }
                    }
                });
            }

        } catch (err) {
            console.error("Error loading verified bills:", err);
            showToast("Failed to load bills from server", "error");
        }

        try {
            const unvRes = await api().get('/api/bills/unverified');
            setUnverifiedCount(unvRes.data.length);
        } catch (err) {
            console.error("Error loading unverified count:", err);
        }
    };

    const handleDeleteBill = async (id: number) => {
        askConfirm("Are you sure you want to permanently delete this verified bill from the ledger?", async () => {
            try {
                await api().delete(`/api/bills/${id}`);
                showToast("Bill deleted successfully", "success");
                loadBills();
            } catch {
                showToast("Failed to delete bill", "error");
            }
        }, "Confirm Delete");
    };

    const handleClearAllBills = () => {
        showToast("Clear all is disabled for primary ledger for safety. Delete individual bills if needed.", "info");
    };

    const handleEditBill = async (id: number, newCart: Record<string, number>, newRates?: Record<string, number>, newDate?: string, isEditedPrice?: boolean) => {
        try {
            // Use the centralized pricing logic to calculate the total amount
            const { getCartItems } = await import('../../../constants/productData');
            const items = getCartItems(newCart, newRates);
            const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Get current user for attribution
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const actingName = storedUser.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : 'Admin';

            await api().put(`/api/bills/${id}`, { 
                cart: newCart, 
                custom_rates: newRates,
                total_amount: totalAmount,
                delivery_date: newDate,
                created_by: actingName,
                is_edited_price: isEditedPrice ?? false
            });
            showToast("Bill updated successfully", "success");
            
            // Stay on the same date filter after update
            loadBills();
        } catch {
            showToast("Failed to update bill", "error");
        }
    };

    const fetchOrderLines = async () => {
        try {
            const response = await api().get('/api/order-lines');
            setOrderLines(response.data);
        } catch (err) {
            console.error("Error fetching order lines:", err);
        }
    };

    const fetchOlRequests = async () => {
        try {
            const response = await api().get('/api/order-lines/requests');
            setOlRequests(response.data);
        } catch (err) {
            console.error("Error fetching ol requests:", err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api().get('/api/employees');
            setEmployees(response.data);
            
            // Also sync the current user's profile picture if found
            const me = response.data.find((e: Employee) => e.id === storedUser.id);
            if (me) {
                const backendPic = me.profile_pic || "";
                setProfilePic(backendPic);
                localStorage.setItem('adminProfilePic', backendPic);
            }
        } catch (err) {
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await api().get('/api/requests');
            setRequests(response.data);
        } catch (err) {
            console.error("Error fetching requests:", err);
        }
    };

    const checkBackendHealth = async () => {
        try {
            const response = await api().get('/api/health');
            setBackendStatus(response.data.message || "Healthy");
        } catch {
            setBackendStatus("Disconnected");
        }
    };

    const applyInvoiceSettings = (settings: any) => {
        if (!settings) return;
        const { next_invoice_no, last_invoice_no, ledger_sheet_url, last_sheet_sync_time, upi_id_1, upi_name_1, upi_id_2, upi_name_2 } = settings;
        setNextInvoiceNo(next_invoice_no);
        setLastInvoiceNo(last_invoice_no);
        setLedgerSheetUrl(ledger_sheet_url || "");
        localStorage.setItem('nextInvoiceNo', String(next_invoice_no));
        localStorage.setItem('lastInvoiceNo', String(last_invoice_no));
        localStorage.setItem('ledgerSheetUrl', ledger_sheet_url || "");
        
        const id1 = upi_id_1 || "nishaoilmills@ybl";
        const name1 = upi_name_1 || "NISHA OIL MILL";
        const id2 = upi_id_2 || "nishaoilmills@okaxis";
        const name2 = upi_name_2 || "NISHA OIL MILL";
        
        setUpiId1(id1);
        setUpiName1(name1);
        setUpiId2(id2);
        setUpiName2(name2);
        localStorage.setItem('upiId1', id1);
        localStorage.setItem('upiName1', name1);
        localStorage.setItem('upiId2', id2);
        localStorage.setItem('upiName2', name2);
        
        if (last_sheet_sync_time) {
            setLastSynced(last_sheet_sync_time);
            localStorage.setItem('lastSynced', last_sheet_sync_time);
        }
    };

    const bootstrapDashboardData = async () => {
        try {
            const res = await api().get('/api/settings/bootstrap');
            const { invoiceSettings, vehicles, unverifiedCount, totalBillsCount } = res.data;
            if (invoiceSettings) {
                applyInvoiceSettings(invoiceSettings);
            }
            if (vehicles) {
                setMotorVehicles(vehicles);
            }
            setUnverifiedCount(unverifiedCount || 0);
            setTotalBillsCount(totalBillsCount || 0);
        } catch (err) {
            console.error('Failed to bootstrap dashboard data:', err);
            // Fallback
            fetchInvoiceSettings();
            fetchBillsCount();
            api().get('/api/settings/vehicles')
                .then(r => setMotorVehicles(r.data))
                .catch(e => console.error(e));
        }
    };

    const fetchInvoiceSettings = async () => {
        try {
            const res = await api().get('/api/settings/invoice');
            applyInvoiceSettings(res.data);
        } catch (err) {
            console.error('Could not load invoice settings from backend, using localStorage fallback.');
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchRequests();
        fetchOrderLines();
        fetchOlRequests();
        checkBackendHealth();
        loadBills();
        bootstrapDashboardData();
        
        // Refresh product rates from server
        import('../../../constants/productData').then(m => m.fetchAndCacheRatesFromServer());
    }, []);

    useEffect(() => {
        const handleWindowFocus = () => {
            console.log('[WINDOW FOCUS] Refocus detected. Refreshing stats and lists.');
            fetchEmployees();
            fetchRequests();
            fetchOrderLines();
            fetchOlRequests();
            checkBackendHealth();
            bootstrapDashboardData();
            loadBills(billSelectedDate);
        };

        window.addEventListener('focus', handleWindowFocus);
        return () => {
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [billSelectedDate]);

    useEffect(() => {
        localStorage.setItem('companyName', companyName);
        localStorage.setItem('adminTheme', theme);
        localStorage.setItem('nextInvoiceNo', String(nextInvoiceNo));
        localStorage.setItem('ledgerSheetUrl', ledgerSheetUrl);
        localStorage.setItem('adminActiveTab', activeTab);
        localStorage.setItem('upiId1', upiId1);
        localStorage.setItem('upiName1', upiName1);
        localStorage.setItem('upiId2', upiId2);
        localStorage.setItem('upiName2', upiName2);
    }, [companyName, theme, nextInvoiceNo, ledgerSheetUrl, activeTab, upiId1, upiName1, upiId2, upiName2]);

    useEffect(() => {
        if (activeTab === 'bills' || activeTab === 'bill-check') {
            loadBills(billSelectedDate);
        }
        if (activeTab === 'manage') {
            fetchBillsCount();
        }
    }, [activeTab, billSelectedDate]);

    const askConfirm = (message: string, onConfirm: () => void, confirmText: string = "Confirm Delete", confirmColor: string = "bg-red-600") => {
        setConfirmModal({ open: true, message, onConfirm, confirmText, confirmColor });
    };

    // SETTINGS ACTIONS
    // SETTINGS ACTIONS
    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const { syncRatesFromSheet, getSheetRates } = await import('../../../services/googleSheetSync');
            // 1. Fetch from sheet first to ensure we have latest
            const result = await syncRatesFromSheet();
            
            if (result.success) {
                // 2. Persist the sync timestamp
                const now = new Date().toLocaleString('en-IN', { hour12: true, timeZone: 'Asia/Kolkata' });
                setLastSynced(now);
                localStorage.setItem('lastSynced', now);
                try {
                    await api().put('/api/settings/invoice', { last_sheet_sync_time: now });
                } catch (dbErr) {
                    console.error('Failed to sync fetch timestamp to database:', dbErr);
                }

                // 3. Push to server for Mobile App
                const rates = getSheetRates();
                await api().post('/api/products/sync', { rates });
                
                showToast("Data synced to Web and Mobile App successfully!", "success");
            } else {
                showToast(result.error || "Google Sheets Sync Failed", "error");
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.error || err.message || "Sync Failed";
            showToast(`Sync failed: ${msg}`, "error");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleApproveRequest = async (id: number) => {
        try {
            await api().put(`/api/requests/${id}/approve`);
            showToast("Request approved successfully!", "success");
            fetchRequests();
            fetchEmployees();
        } catch {
            showToast("Failed to approve request.", "error");
        }
    };

    const handleRejectRequest = async (id: number) => {
        try {
            await api().put(`/api/requests/${id}/reject`);
            showToast("Request rejected.", "info");
            fetchRequests();
        } catch {
            showToast("Failed to reject request.", "error");
        }
    };

    const handleApproveOl = async (id: number) => {
        try {
            await api().put(`/api/order-lines/requests/${id}/approve`);
            showToast("Sector deletion approved!", "success");
            fetchOlRequests();
            fetchOrderLines();
        } catch {
            showToast("Failed to approve deletion.", "error");
        }
    };

    const handleRejectOl = async (id: number) => {
        try {
            await api().put(`/api/order-lines/requests/${id}/reject`);
            showToast("Deletion request rejected.", "info");
            fetchOlRequests();
        } catch {
            showToast("Failed to reject request.", "error");
        }
    };

    const handleDeleteOl = async (id: number) => {
        askConfirm("CRITICAL: This will permanently delete this village sector from the network. Proceed?", async () => {
            try {
                await api().delete(`/api/order-lines/${id}`);
                showToast("Sector purged from network.", "success");
                fetchOrderLines();
                fetchOlRequests();
            } catch (err: any) {
                showToast(`Purge failed: ${err.response?.data?.error || err.message}`, "error");
            }
        }, "Confirm Purge");
    };

    const handleOpenOlModal = (ol: OrderLine | null = null) => {
        if (ol) {
            setEditingOl(ol);
            setOlFormData({ name: ol.name, node_id: ol.node_id, area_name: ol.area_name || ol.name });
        } else {
            setEditingOl(null);
            setOlFormData({ name: "", node_id: "", area_name: "" });
        }
        setShowOlModal(true);
    };

    const handleOlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingOl) {
                await api().put(`/api/order-lines/${editingOl.id}`, olFormData);
                showToast("Sector updated successfully.", "success");
            } else {
                await api().post('/api/order-lines', olFormData);
                showToast("New sector deployed successfully.", "success");
            }
            setShowOlModal(false);
            setEditingOl(null);
            fetchOrderLines();
        } catch (err: any) {
            showToast(`Sync failure: ${err.response?.data?.error || err.message}`, "error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingEmployee) {
                await api().put(`/api/employees/${editingEmployee.id}`, formData);
                showToast("Record updated successfully!", "success");
            } else {
                await api().post('/api/employees', formData);
                showToast("Record added successfully!", "success");
            }
            setShowModal(false);
            setEditingEmployee(null);
            setFormData({ first_name: "", last_name: "", email: "", role: "Staff", status: "Active", username: "", password: "", accessible_orderlines: [] });
            fetchEmployees();
        } catch (err: any) {
            showToast(`Failed to save record: ${err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message}`, "error");
        }
    };

    const handleEdit = (emp: Employee) => {
        setEditingEmployee(emp);
        setFormData({
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            role: emp.role,
            status: emp.status,
            username: emp.username || "",
            password: "", // Never pre-fill password
            accessible_orderlines: emp.accessible_orderlines || []
        });
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingEmployee(null);
        setFormData({ first_name: "", last_name: "", email: "", role: "Staff", status: "Active", username: "", password: "", accessible_orderlines: [] });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (id === userProfile.id) {
            showToast("You cannot delete your own account while logged in.", "error");
            return;
        }
        askConfirm("Are you sure you want to delete this record?", async () => {
            try {
                await api().delete(`/api/employees/${id}`);
                fetchEmployees();
                showToast("Record deleted successfully!", "success");
            } catch (err: any) {
                showToast(`Failed to delete record: ${err.response?.data?.error || err.message}`, "error");
            }
        }, "Confirm Delete");
    };

    const filteredBillCount = bills.filter(b => {
        if (!billSelectedDate) return true;
        const targetDate = b.deliveryDate || b.date || '';
        const localDateStr = targetDate.includes('T') ? targetDate.split('T')[0] : targetDate.split(' ')[0];
        return localDateStr === billSelectedDate;
    }).length;

    return {
        state: {
            employees, requests, loading, showModal, editingEmployee, activeTab,
            backendStatus, confirmModal, isMobileMenuOpen, companyName, theme,
            formData, olRequests, orderLines, showOlModal, editingOl, olFormData,
            toasts, bills, unverifiedCount, totalBillsCount,
            lastSynced, isSyncing, isSyncingLedger, nextInvoiceNo,
            lastInvoiceNo,
            userProfile, profilePic,
            ledgerSheetUrl,
            billSelectedDate,
            filteredBillCount,
            motorVehicles,
            upiId1, upiName1, upiId2, upiName2
        },
        actions: {
            setActiveTab, setConfirmModal, setIsMobileMenuOpen, setCompanyName,
            setTheme, setFormData, setShowModal, setShowOlModal, setOlFormData,
            setOrderLines, fetchOrderLines,
            setUpiId1, setUpiName1, setUpiId2, setUpiName2,
            handleSaveUpiSettings: async (id1: string, name1: string, id2: string, name2: string) => {
                setUpiId1(id1);
                setUpiName1(name1);
                setUpiId2(id2);
                setUpiName2(name2);
                localStorage.setItem('upiId1', id1);
                localStorage.setItem('upiName1', name1);
                localStorage.setItem('upiId2', id2);
                localStorage.setItem('upiName2', name2);
                try {
                    await api().put('/api/settings/invoice', {
                        upi_id_1: id1,
                        upi_name_1: name1,
                        upi_id_2: id2,
                        upi_name_2: name2
                    });
                } catch (err) {
                    console.error('Failed to save UPI settings to backend:', err);
                }
            },
            setNextInvoiceNo: async (val: number) => {
                setNextInvoiceNo(val);
                localStorage.setItem('nextInvoiceNo', String(val));
                try {
                    await api().put('/api/settings/invoice', { next_invoice_no: val });
                } catch (err) {
                    console.error('Failed to save invoice number to backend:', err);
                }
            },
            setProfilePic: async (pic: string) => {
                setProfilePic(pic);
                localStorage.setItem('adminProfilePic', pic);
                try {
                    await api().put(`/api/employees/${storedUser.id}/profile-pic`, {
                        profile_pic: pic
                    });
                } catch (err) {
                    console.error("Error syncing admin profile pic:", err);
                }
            },
            setLedgerSheetUrl: async (url: string) => {
                setLedgerSheetUrl(url);
                localStorage.setItem('ledgerSheetUrl', url);
                try {
                    await api().put('/api/settings/invoice', { ledger_sheet_url: url });
                } catch (err) {
                    console.error('Failed to save ledger sheet URL to backend:', err);
                }
            },
            removeToast, handleDeleteBill, handleClearAllBills, handleEditBill,
            handleApproveRequest, handleRejectRequest, handleApproveOl, handleRejectOl, setUnverifiedCount,
            handleDeleteOl, handleOpenOlModal, handleOlSubmit, handleSubmit,
            handleEdit, handleAddNew, handleDelete,
            handleSync,
            handleSyncAllToLedger: async () => {
                setIsSyncingLedger(true);
                try {
                    await api().post('/api/shops/sync-all-to-ledger');
                    showToast("All existing shops synced to ledger!", "success");
                } catch (err) {
                    console.error(err);
                    showToast("Failed to sync all shops", "error");
                } finally {
                    setIsSyncingLedger(false);
                }
            },
            handleLogoutAllStaff: async () => {
                askConfirm("SECURITY ALERT: This will instantly log out ALL staff members from the mobile app on all their devices. They will need to re-authenticate to continue. Proceed?", async () => {
                    try {
                        await api().post('/api/settings/logout-all');
                        showToast("All staff sessions revoked successfully!", "success");
                    } catch (err: any) {
                        console.error(err);
                        showToast("Failed to revoke sessions. Check server connection.", "error");
                    }
                }, "Confirm Logout", "bg-red-600");
            },
            setBillSelectedDate,
            fetchInvoiceSettings
        }
    };
};
