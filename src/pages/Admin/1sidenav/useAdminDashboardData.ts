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
    }, [companyName, theme]);

    useEffect(() => {
        if (activeTab === 'bills' || activeTab === 'bill-check') loadBills();
    }, [activeTab]);

    const askConfirm = (message: string, onConfirm: () => void) => {
        setConfirmModal({ open: true, message, onConfirm });
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
            toasts, bills, unverifiedCount
        },
        actions: {
            setActiveTab, setConfirmModal, setIsMobileMenuOpen, setCompanyName,
            setTheme, setFormData, setShowModal, setShowOlModal, setOlFormData,
            removeToast, handleDeleteBill, handleClearAllBills, handleEditBill,
            handleApproveRequest, handleRejectRequest, handleApproveOl, handleRejectOl,
            handleDeleteOl, handleOpenOlModal, handleOlSubmit, handleSubmit,
            handleEdit, handleAddNew, handleDelete
        }
    };
};
