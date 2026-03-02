import { useState, useEffect } from "react";
import AdminSidenav from "./1Admin_Sidenav";
import AdminManageTeam from "./3Admin_Manage_Team";
import AdminRequests from "./4Admin_Requests";
import AdminOrderLines from "./5Admin_OrderLines";
import AdminSettings from "./6Admin_Settings";
import AdminBills from "./7Admin_Bills";
import AdminBillCheck from "./8Admin_Bill_Check";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useToast, ToastContainer } from "../../../components/Toast";
import { getAuthAxios } from "../../../utils/apiClient";

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    joined_at: string;
    username?: string;
    accessible_orderlines?: number[];
}

interface ProfileRequest {
    id: number;
    employee_id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    created_at: string;
    current_first_name: string;
    current_last_name: string;
}

interface OrderLine {
    id: number;
    name: string;
    node_id: string;
    created_at?: string;
}

interface OlRequest {
    id: number;
    order_line_id: number;
    order_line_name: string;
    node_id: string;
    first_name: string;
    last_name: string;
    status: string;
    created_at: string;
}

interface EmployeeFormData {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    username: string;
    password: string;
    accessible_orderlines: number[];
}

const AdminDashboard = () => {
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
    const [showPassword, setShowPassword] = useState(false);
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

    const loadBills = () => {
        const stored = JSON.parse(localStorage.getItem('placedBills') || '[]');
        setBills(stored);

        const unv = JSON.parse(localStorage.getItem('unverifiedBills') || '[]');
        const adminUnv = unv.filter((b: any) => b.createdBy === 'Admin');
        setUnverifiedCount(adminUnv.length);
    };

    const handleDeleteBill = (id: number) => {
        const updated = bills.filter(b => b.id !== id);
        setBills(updated);
        localStorage.setItem('placedBills', JSON.stringify(updated));
    };

    const handleClearAllBills = () => {
        setBills([]);
        localStorage.setItem('placedBills', '[]');
    };

    const handleEditBill = (id: number, newCart: Record<string, number>, newRates?: Record<string, number>) => {
        const updated = bills.map(b => b.id === id ? { ...b, cart: newCart, customRates: newRates } : b);
        setBills(updated);
        localStorage.setItem('placedBills', JSON.stringify(updated));
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
        if (activeTab === 'bills') loadBills();
    }, [activeTab]);

    const api = () => getAuthAxios();

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
        setShowPassword(false);
        setShowModal(true);
    };


    const handleAddNew = () => {
        setEditingEmployee(null);
        setFormData({ first_name: "", last_name: "", email: "", role: "Staff", status: "Active", username: "", password: "", accessible_orderlines: [] });
        setShowPassword(false);
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

    return (
        <div className={`flex h-screen w-full font-['Outfit'] overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Desktop Sidenav */}
            <div className="hidden lg:block h-full">
                <AdminSidenav
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    companyName={companyName}
                    requestCount={requests.length}
                    olRequestCount={olRequests.length}
                    billCount={bills.length}
                    unverifiedCount={unverifiedCount}
                />
            </div>

            {/* Mobile Sidenav Drawer */}
            <Drawer
                anchor="left"
                open={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: 'transparent',
                        borderRight: 'none',
                    }
                }}
            >
                <div onClick={() => setIsMobileMenuOpen(false)} className="h-full">
                    <AdminSidenav
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        companyName={companyName}
                        requestCount={requests.length}
                        olRequestCount={olRequests.length}
                        billCount={bills.length}
                        unverifiedCount={unverifiedCount}
                        onClose={() => setIsMobileMenuOpen(false)}
                    />
                </div>
            </Drawer>

            <div className={`flex-grow flex flex-col min-w-0 overflow-hidden relative transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
                <header className={`px-6 lg:px-10 py-6 lg:py-8 z-10 flex justify-between items-center transition-colors border-b ${theme === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden">
                            <IconButton
                                onClick={() => setIsMobileMenuOpen(true)}
                                sx={{ color: theme === 'dark' ? 'white' : 'black' }}
                            >
                                <MenuIcon />
                            </IconButton>
                        </div>
                        <div>
                            <h2 className={`text-2xl lg:text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {activeTab === 'manage' ? 'Team Control' : activeTab === 'requests' ? 'Staff Requests' : activeTab === 'order-lines' ? 'Sector Management' : activeTab === 'bills' ? 'Bills Management' : activeTab === 'bill-check' ? 'Invoice Verifications' : 'Configuration'}
                            </h2>
                            <p className="text-slate-500 mt-1 font-medium italic text-xs lg:text-base">Powered by {companyName} Systems</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest border hidden sm:block ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            Auth: Admin Level 4
                        </div>
                        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center font-black text-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800 text-blue-400 border-white/10 ring-4 ring-white/5' : 'bg-white text-slate-800 border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                            A
                        </div>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto p-10 hide-scrollbar scroll-smooth">
                    <div className="max-w-6xl mx-auto">
                        {activeTab === 'manage' && (
                            <AdminManageTeam
                                employees={employees}
                                loading={loading}
                                theme={theme}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleAddNew={handleAddNew}
                            />
                        )}
                        {activeTab === 'requests' && (
                            <AdminRequests
                                requests={requests}
                                olRequests={olRequests}
                                theme={theme}
                                handleApproveRequest={handleApproveRequest}
                                handleRejectRequest={handleRejectRequest}
                                handleApproveOl={handleApproveOl}
                                handleRejectOl={handleRejectOl}
                            />
                        )}
                        {activeTab === 'order-lines' && (
                            <AdminOrderLines
                                orderLines={orderLines}
                                theme={theme}
                                handleOpenOlModal={handleOpenOlModal}
                                handleDeleteOl={handleDeleteOl}
                            />
                        )}
                        {activeTab === 'bills' && (
                            <AdminBills
                                bills={bills}
                                theme={theme}
                                onDeleteBill={handleDeleteBill}
                                onClearAll={handleClearAllBills}
                                onEditBill={handleEditBill}
                            />
                        )}
                        {activeTab === 'bill-check' && (
                            <AdminBillCheck theme={theme} />
                        )}
                        {activeTab === 'settings' && (
                            <AdminSettings
                                theme={theme}
                                setTheme={setTheme}
                                companyName={companyName}
                                setCompanyName={setCompanyName}
                                backendStatus={backendStatus}
                            />
                        )}
                    </div>
                </main>
            </div>

            {/* Confirm Dialog (replaces window.confirm) */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setConfirmModal(m => ({ ...m, open: false }))} />
                    <div className={`relative rounded-3xl w-full max-w-md shadow-2xl border p-8 ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div className="flex-grow">
                                <h3 className={`text-lg font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Confirm Action</h3>
                                <p className="text-slate-500 text-sm font-medium">{confirmModal.message}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setConfirmModal(m => ({ ...m, open: false }))}
                                className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { setConfirmModal(m => ({ ...m, open: false })); confirmModal.onConfirm(); }}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-red-600/30"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
                    <div className={`relative rounded-[60px] w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar shadow-[0_0_100px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500 border ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="p-12">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h2 className={`text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                        {editingEmployee ? "Refine Personnel" : "Provision Node"}
                                    </h2>
                                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Access Control Protocol</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className={`w-14 h-14 flex items-center justify-center rounded-3xl transition-all ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">First Name</label>
                                    <input required type="text" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Last Name</label>
                                    <input required type="text" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                                </div>
                                <div className="col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Communication Line (Email)</label>
                                    <input required type="email" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">System Identity</label>
                                    <input required type="text" placeholder="username" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
                                        Security Key {editingEmployee && <span className="text-slate-400 normal-case">(leave blank to keep current)</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            required={!editingEmployee}
                                            type={showPassword ? "text" : "password"}
                                            placeholder={editingEmployee ? "Leave blank to keep current" : "Min. 6 characters"}
                                            className={`w-full rounded-[25px] px-8 py-5 pr-16 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(v => !v)}
                                            title={showPassword ? 'Hide password' : 'Show password'}
                                            className={`absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-2xl transition-all
                                                ${theme === 'dark'
                                                    ? 'text-slate-400 hover:text-blue-400 hover:bg-white/10'
                                                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                        >
                                            {showPassword ? (
                                                /* Open eye — password is currently VISIBLE */
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                /* Closed eye — password is currently HIDDEN */
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            )}

                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Role Matrix</label>
                                    <select className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="Staff">Node Staff</option>
                                        <option value="Admin">Core Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Status</label>
                                    <select className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Active">Active</option>
                                        <option value="Suspended">Offline</option>
                                    </select>
                                </div>

                                {formData.role === 'Staff' && (
                                    <div className="col-span-2 space-y-3 mt-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Accessible Villages / Order Lines</label>
                                        <div className={`p-6 rounded-[25px] border ${theme === 'dark' ? 'bg-slate-800/50 border-white/10' : 'bg-slate-50 border-slate-200'} max-h-48 overflow-y-auto hide-scrollbar grid grid-cols-2 gap-3`}>
                                            {orderLines.map(ol => (
                                                <label key={ol.id} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border
                                                    ${formData.accessible_orderlines.includes(ol.id)
                                                        ? (theme === 'dark' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-blue-50 border-blue-300')
                                                        : (theme === 'dark' ? 'bg-slate-800 border-transparent hover:bg-slate-700' : 'bg-white border-transparent hover:bg-slate-100')}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 rounded truncate accent-blue-600 cursor-pointer"
                                                        checked={formData.accessible_orderlines.includes(ol.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData(f => ({ ...f, accessible_orderlines: [...f.accessible_orderlines, ol.id] }));
                                                            } else {
                                                                setFormData(f => ({ ...f, accessible_orderlines: f.accessible_orderlines.filter(id => id !== ol.id) }));
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{ol.name}</span>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{ol.node_id}</span>
                                                    </div>
                                                </label>
                                            ))}
                                            {orderLines.length === 0 && (
                                                <div className="col-span-2 text-center py-4 text-xs font-bold text-slate-500 italic">No Order Lines available</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <button type="submit" className="col-span-2 bg-blue-600 text-white font-black py-7 rounded-[35px] shadow-[0_20px_40px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:-translate-y-2 active:scale-[0.98] mt-6 transition-all text-2xl uppercase tracking-[0.2em] italic">
                                    {editingEmployee ? "Confirm Updates" : "Commit Provisioning"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Line Modal */}
            {showOlModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowOlModal(false)} />
                    <div className={`relative rounded-[60px] w-full max-w-xl shadow-[0_0_100px_rgba(16,185,129,0.2)] animate-in zoom-in-95 duration-500 border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="p-12">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h2 className={`text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                        {editingOl ? "Refine Sector" : "Deploy Sector"}
                                    </h2>
                                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Network Configuration Protocol</p>
                                </div>
                                <button onClick={() => setShowOlModal(false)} className={`w-14 h-14 flex items-center justify-center rounded-3xl transition-all ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleOlSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Village Name</label>
                                    <input required type="text" placeholder="Enter Sector Name" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-emerald-600/10 focus:border-emerald-600'}`} value={olFormData.name} onChange={e => setOlFormData({ ...olFormData, name: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Network Node ID</label>
                                    <input required type="text" placeholder="Node Identifier" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-emerald-600/10 focus:border-emerald-600'}`} value={olFormData.node_id} onChange={e => setOlFormData({ ...olFormData, node_id: e.target.value })} />
                                </div>
                                <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[30px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 hover:-translate-y-1 active:scale-95 transition-all mt-8">
                                    {editingOl ? "Confirm Configuration" : "Establish Node"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
