import { useState, useEffect } from "react";
import StaffSidenav from "./1Staff_Sidenav";
import StaffDirectory from "./3Staff_Directory";
import StaffOrderLines from "./4Staff_OrderLines";
import StaffSettings from "./5Staff_Settings";
import StaffBillCheck from "./6Staff_Bill_Check";
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
    accessible_orderlines: number[];
}

interface OrderLine {
    id: number;
    name: string;
    node_id: string;
}


const StaffDashboard = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("directory");
    const [showModal, setShowModal] = useState(false);

    const [theme, setTheme] = useState(() => localStorage.getItem('staffTheme') || "light");
    const [companyName] = useState(() => localStorage.getItem('companyName') || "Nisha");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unverifiedCount, setUnverifiedCount] = useState(0);

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [userProfile, setUserProfile] = useState({
        id: storedUser.id || 0,
        first_name: storedUser.first_name || "",
        last_name: storedUser.last_name || "",
        email: storedUser.email || "",
        accessible_orderlines: storedUser.accessible_orderlines || [] as number[]
    });

    const [formData, setFormData] = useState({
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        email: userProfile.email
    });

    const [orderLines, setOrderLines] = useState<OrderLine[]>([]);

    const [olLoading, setOlLoading] = useState(false);
    const [showOlModal, setShowOlModal] = useState(false);
    const [newSector, setNewSector] = useState({ name: "", node_id: "" });

    const { toasts, showToast, removeToast } = useToast();

    const api = () => getAuthAxios();

    useEffect(() => {
        fetchEmployees();
        if (storedUser.id) {
            checkNotifications();
        }
    }, []);

    useEffect(() => {
        // Load dynamically based on username logic 
        const loadMyUnverified = async () => {
            try {
                const userName = userProfile.first_name ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim() : 'Staff';
                const res = await api().get('/api/bills/unverified');
                const myUnverified = res.data.filter((b: any) => b.created_by === userName);
                setUnverifiedCount(myUnverified.length);
            } catch (err) {
                console.error("Failed to load unverified count:", err);
            }
        };
        loadMyUnverified();
    }, [userProfile, activeTab]);

    useEffect(() => {
        localStorage.setItem('staffTheme', theme);
    }, [theme]);

    const checkNotifications = async () => {
        try {
            const response = await api().get(`/api/requests/my-status/${storedUser.id}`);
            const approvedRequests = response.data;

            if (approvedRequests.length > 0) {
                approvedRequests.forEach((req: any) => {
                    showToast(`✅ Profile approved! ${req.first_name} ${req.last_name} — ${req.email}`, 'success');
                    api().put(`/api/requests/acknowledge/${req.id}`);
                });
                fetchEmployees();
            }
        } catch (err) {
            console.error("Error checking notifications:", err);
        }
    };


    const fetchEmployees = async () => {
        try {
            const response = await api().get('/api/employees');
            setEmployees(response.data);

            if (storedUser.id) {
                const me = response.data.find((e: Employee) => e.id === storedUser.id);
                if (me) {
                    setUserProfile(me);
                    setFormData({
                        first_name: me.first_name,
                        last_name: me.last_name,
                        email: me.email
                    });

                    // Update userProfile array reference so changes take effect
                    setUserProfile(prev => ({ ...prev, accessible_orderlines: me.accessible_orderlines || [] }));

                    // Trigger a clean fetch with the freshest constraints straight from the DB
                    fetchOrderLines(me.accessible_orderlines || []);
                }
            }
        } catch (err) {
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    };


    const fetchOrderLines = async (authorizedIds: number[] = userProfile.accessible_orderlines || []) => {
        setOlLoading(true);
        try {
            const response = await api().get('/api/order-lines');
            const allOrderLines = response.data;

            // Filter order lines based on user's authorized access list
            if (authorizedIds.length > 0) {
                setOrderLines(allOrderLines.filter((ol: OrderLine) => authorizedIds.includes(ol.id)));
            } else {
                // If it's an empty array and they are staff, they see nothing by default
                setOrderLines([]);
            }
        } catch (err) {
            console.error("Error fetching order lines:", err);
        } finally {
            setOlLoading(false);
        }
    };


    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api().post('/api/requests', {
                employee_id: userProfile.id,
                ...formData
            });
            showToast('Your profile update request has been sent for admin approval.', 'success');
            setShowModal(false);
        } catch (err: any) {
            console.error("Error submitting request:", err);
            showToast(err.response?.data?.error || 'Failed to submit request.', 'error');
        }
    };


    const handleAddSector = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api().post('/api/order-lines', newSector);
            showToast('Sector added successfully!', 'success');
            setShowOlModal(false);
            setNewSector({ name: "", node_id: "" });
            fetchOrderLines();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to add sector', 'error');
        }
    };


    const handleDeleteRequest = async (olId: number) => {
        if (!window.confirm('Send a request to Admin to delete this sector?')) return;
        try {
            await api().post('/api/order-lines/request-delete', {
                order_line_id: olId,
                employee_id: userProfile.id
            });
            showToast('Deletion request sent for approval.', 'info');
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to send deletion request', 'error');
        }
    };


    return (
        <div className={`flex h-screen w-full font-['Outfit'] overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Desktop Sidenav */}
            <div className="hidden lg:block h-full">
                <StaffSidenav activeTab={activeTab} setActiveTab={setActiveTab} companyName={companyName} unverifiedCount={unverifiedCount} />
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
                    <StaffSidenav activeTab={activeTab} setActiveTab={setActiveTab} companyName={companyName} unverifiedCount={unverifiedCount} onClose={() => setIsMobileMenuOpen(false)} />
                </div>
            </Drawer>

            <div className={`flex-grow flex flex-col min-w-0 overflow-hidden relative transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
                <header className={`px-6 lg:px-10 py-6 lg:py-8 z-10 flex justify-between items-center transition-colors duration-500 border-b ${theme === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
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
                                {activeTab === 'settings' ? 'My Settings' : activeTab === 'order-lines' ? 'Order Lines' : activeTab === 'bill-check' ? 'Queue Verification' : 'Staff Portal'}
                            </h2>
                            <p className="text-slate-500 mt-1 font-medium italic text-xs lg:text-base">Welcome back, {userProfile.first_name || 'Staff'}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest border hidden sm:block ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            Access: Staff Verified
                        </div>
                        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center font-black text-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800 text-blue-400 border-white/10 ring-4 ring-white/5' : 'bg-white text-slate-800 border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                            {userProfile.first_name?.[0] || 'S'}
                        </div>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto p-10 hide-scrollbar scroll-smooth">
                    <div className="max-w-6xl mx-auto">
                        {activeTab === 'directory' && (
                            <StaffDirectory
                                employees={employees}
                                loading={loading}
                                theme={theme}
                                userProfileId={userProfile.id}
                            />
                        )}
                        {activeTab === 'order-lines' && (
                            <StaffOrderLines
                                orderLines={orderLines}
                                olLoading={olLoading}
                                theme={theme}
                                setShowOlModal={setShowOlModal}
                                handleDeleteRequest={handleDeleteRequest}
                            />
                        )}
                        {activeTab === 'bill-check' && (
                            <StaffBillCheck
                                theme={theme}
                                userProfileName={userProfile.first_name ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim() : 'Staff'}
                            />
                        )}
                        {activeTab === 'settings' && (
                            <StaffSettings
                                theme={theme}
                                setTheme={setTheme}
                                userProfile={userProfile}
                                setShowModal={setShowModal}
                            />
                        )}
                    </div>
                </main>
            </div>

            {/* Modals remain in wrapper */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
                    <div className={`relative rounded-[60px] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500 border hide-scrollbar ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="p-12 relative overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="flex justify-between items-center mb-12 relative">
                                <div>
                                    <h2 className={`text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Edit Profile</h2>
                                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Personal Node Modification</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className={`w-14 h-14 flex items-center justify-center rounded-3xl transition-all ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleRequestSubmit} className="space-y-8 relative">
                                <div className={`p-6 border rounded-[30px] flex items-start gap-4 mb-4 ${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-blue-50 border-blue-100'}`}>
                                    <span className="text-2xl">⚡</span>
                                    <p className={`text-xs font-bold leading-relaxed italic ${theme === 'dark' ? 'text-indigo-300' : 'text-blue-700'}`}>Changes submitted here will be queued for Admin approval. Your profile will update once confirmed.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">First Name</label>
                                        <input required type="text" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Last Name</label>
                                        <input required type="text" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Preferred Work Email</label>
                                    <input required type="email" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <button type="submit" className={`w-full text-white font-black py-7 rounded-[35px] shadow-2xl hover:-translate-y-2 active:scale-[0.98] mt-6 transition-all text-2xl uppercase tracking-[0.2em] italic ${theme === 'dark' ? 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700' : 'bg-blue-600 shadow-blue-600/40 hover:bg-blue-700'}`}>
                                    Submit Request
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showOlModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowOlModal(false)} />
                    <div className={`relative rounded-[60px] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(16,185,129,0.2)] animate-in zoom-in-95 duration-500 border hide-scrollbar ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="p-12 relative overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="flex justify-between items-center mb-12 relative">
                                <div>
                                    <h2 className={`text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Provision Sector</h2>
                                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Territorial Expansion Protocol</p>
                                </div>
                                <button onClick={() => setShowOlModal(false)} className={`w-14 h-14 flex items-center justify-center rounded-3xl transition-all ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleAddSector} className="space-y-8 relative">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Village Sector Name</label>
                                    <input required type="text" placeholder="e.g. Emerald Valley" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-emerald-600/10 focus:border-emerald-600'}`} value={newSector.name} onChange={e => setNewSector({ ...newSector, name: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Operational Node ID</label>
                                    <input required type="text" placeholder="e.g. SEC-1010" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-emerald-600/10 focus:border-emerald-600'}`} value={newSector.node_id} onChange={e => setNewSector({ ...newSector, node_id: e.target.value })} />
                                </div>
                                <button type="submit" className={`w-full text-white font-black py-7 rounded-[35px] shadow-2xl hover:-translate-y-2 active:scale-[0.98] mt-6 transition-all text-2xl uppercase tracking-[0.2em] italic ${theme === 'dark' ? 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700' : 'bg-emerald-600 shadow-emerald-600/40 hover:bg-emerald-700'}`}>
                                    Activate Sector
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
