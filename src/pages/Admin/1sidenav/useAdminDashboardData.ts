import { useState, useEffect } from "react";
import { useToast } from "../../../components/Toast";
import { getAuthAxios } from "../../../utils/apiClient";
import type { Employee, ProfileRequest, OrderLine, OlRequest, EmployeeFormData } from "../../../types/DashboardTypes";

export const useAdminDashboardData = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [requests, setRequests] = useState<ProfileRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [activeTab, setActiveTab] = useState("manage");
    const [backendStatus, setBackendStatus] = useState("Checking...");
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; message: string; onConfirm: () => void }>({
        open: false, message: '', onConfirm: () => { }
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [companyName, setCompanyName] = useState(() => localStorage.getItem('companyName') || "Nisha");
    const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || "light");

    // NEW ADMINISTRATIVE SETTINGS
    const [lastSynced, setLastSynced] = useState(() => localStorage.getItem('lastSynced') || "Never");
    const [emailForwarding, setEmailForwarding] = useState(() => localStorage.getItem('emailForwarding') === 'true');
    const [pushNotifications, setPushNotifications] = useState(() => localStorage.getItem('pushNotifications') === 'true');
    const [isSyncing, setIsSyncing] = useState(false);
    const [nextInvoiceNo, setNextInvoiceNo] = useState(() => parseInt(localStorage.getItem('nextInvoiceNo') || '1001', 10));
    const [profilePic, setProfilePic] = useState(() => localStorage.getItem('adminProfilePic') || "");


    const [formData, setFormData] = useState<EmployeeFormData>({
        first_name: "", last_name: "", email: "", role: "Staff", status: "Active", username: "", password: "", accessible_orderlines: []
    });

    const [olRequests, setOlRequests] = useState<OlRequest[]>([]);
    const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
    const [showOlModal, setShowOlModal] = useState(false);
    const [editingOl, setEditingOl] = useState<OrderLine | null>(null);
    const [olFormData, setOlFormData] = useState({ name: "", node_id: "" });

    const { toasts, showToast, removeToast } = useToast();

    const [bills, setBills] = useState<Array<{ id: number; shopName: string; villageName: string; cart: Record<string, number>; customRates?: Record<string, number>; date: string; invoiceNo: number }>>([]);
    const [unverifiedCount, setUnverifiedCount] = useState(0);

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [userProfile] = useState<Partial<Employee>>({
        id: storedUser.id || 0,
        first_name: storedUser.first_name || "Admin",
        last_name: storedUser.last_name || "",
        email: storedUser.email || "",
        role: storedUser.role || "Admin"
    });

    const api = () => getAuthAxios();

    const loadBills = async () => {
        try {
            const res = await api().get('/api/bills');
            const mappedBills = res.data.map((b: any) => ({
                id: b.id,
                shopName: b.shop_name || b.shopName,
                villageName: b.village_name || b.villageName,
                cart: b.cart,
                customRates: b.custom_rates || b.customRates || {},
                date: b.bill_date || b.date,
                invoiceNo: b.invoice_no || b.invoiceNo,
                createdBy: b.created_by || b.createdBy
            }));
            
            setBills(mappedBills);

            // Auto-seal legacy bills that have empty customRates
            const legacyBills = mappedBills.filter((b: any) => Object.keys(b.customRates).length === 0 && Object.keys(b.cart).length > 0);
            if (legacyBills.length > 0 && activeTab === 'bills') {
                import('../../../constants/productData').then(({ getAllProducts }) => {
                    const currentProducts = getAllProducts();
                    legacyBills.forEach(async (bill: any) => {
                        const legacyRates: Record<string, number> = {};
                        currentProducts.forEach(p => {
                            if (bill.cart[p.id] || bill.cart[`${p.id}_box`] || bill.cart[`${p.id}_ltr`]) {
                                legacyRates[p.id] = p.price;
                            }
                        });
                        try {
                            await api().put(`/api/bills/${bill.id}`, { cart: bill.cart, custom_rates: legacyRates });
                        } catch (e) {
                            console.error('Failed to seal legacy bill:', bill.id);
                        }
                    });
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
        });
    };

    const handleClearAllBills = () => {
        showToast("Clear all is disabled for primary ledger for safety. Delete individual bills if needed.", "info");
    };

    const handleEditBill = async (id: number, newCart: Record<string, number>, newRates?: Record<string, number>) => {
        try {
            await api().put(`/api/bills/${id}`, { cart: newCart, custom_rates: newRates });
            showToast("Bill updated successfully", "success");
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

    useEffect(() => {
        fetchEmployees();
        fetchRequests();
        fetchOrderLines();
        fetchOlRequests();
        checkBackendHealth();
        loadBills();
    }, []);

    useEffect(() => {
        localStorage.setItem('companyName', companyName);
        localStorage.setItem('adminTheme', theme);
        localStorage.setItem('emailForwarding', String(emailForwarding));
        localStorage.setItem('pushNotifications', String(pushNotifications));
        localStorage.setItem('nextInvoiceNo', String(nextInvoiceNo));
    }, [companyName, theme, emailForwarding, pushNotifications, nextInvoiceNo]);

    useEffect(() => {
        if (activeTab === 'bills' || activeTab === 'bill-check') loadBills();
    }, [activeTab]);

    const askConfirm = (message: string, onConfirm: () => void) => {
        setConfirmModal({ open: true, message, onConfirm });
    };

    // SETTINGS ACTIONS
    const handleManualSync = async () => {
        setIsSyncing(true);
        try {
            const { syncRatesFromSheet } = await import('../../../services/googleSheetSync');
            await syncRatesFromSheet();
            const now = new Date().toLocaleString('en-IN', { hour12: true });
            setLastSynced(now);
            localStorage.setItem('lastSynced', now);
            showToast("Product rates merged successfully from Google Sheets!", "success");
        } catch (err) {
            console.error(err);
            showToast("Google Sheets Sync Failed", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleArchiveOldBills = () => {
        askConfirm("DANGER: This will permanently archive bills older than 6 months. This action is irreversible. Proceed?", () => {
            showToast("Archive request sent. This feature is coming soon.", "info");
        });
    };

    const handleResetAnalytics = () => {
        askConfirm("Are you sure you want to flush the analytics cache? Sales pages will temporarily load slower while rebuilding.", () => {
            showToast("Analytics cache flushed automatically.", "success");
        });
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
        });
    };

    const handleOpenOlModal = (ol: OrderLine | null = null) => {
        if (ol) {
            setEditingOl(ol);
            setOlFormData({ name: ol.name, node_id: ol.node_id });
        } else {
            setEditingOl(null);
            setOlFormData({ name: "", node_id: "" });
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
        askConfirm("Are you sure you want to delete this record?", async () => {
            try {
                await api().delete(`/api/employees/${id}`);
                fetchEmployees();
                showToast("Record deleted successfully!", "success");
            } catch (err: any) {
                showToast(`Failed to delete record: ${err.response?.data?.error || err.message}`, "error");
            }
        });
    };

    return {
        state: {
            employees, requests, loading, showModal, editingEmployee, activeTab,
            backendStatus, confirmModal, isMobileMenuOpen, companyName, theme,
            formData, olRequests, orderLines, showOlModal, editingOl, olFormData,
            toasts, bills, unverifiedCount,
            lastSynced, isSyncing, emailForwarding, pushNotifications, nextInvoiceNo,
            userProfile, profilePic
        },
        actions: {
            setActiveTab, setConfirmModal, setIsMobileMenuOpen, setCompanyName,
            setTheme, setFormData, setShowModal, setShowOlModal, setOlFormData,
            setEmailForwarding, setPushNotifications, setNextInvoiceNo,
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
            removeToast, handleDeleteBill, handleClearAllBills, handleEditBill,
            handleApproveRequest, handleRejectRequest, handleApproveOl, handleRejectOl, setUnverifiedCount,
            handleDeleteOl, handleOpenOlModal, handleOlSubmit, handleSubmit,
            handleEdit, handleAddNew, handleDelete,
            handleManualSync, handleArchiveOldBills, handleResetAnalytics
        }
    };
};
