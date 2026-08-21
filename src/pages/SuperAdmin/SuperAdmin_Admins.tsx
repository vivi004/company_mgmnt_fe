import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
    CircularProgress, 
    Alert, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField,
    MenuItem,
    Select,
    FormControl
} from "@mui/material";

interface Tenant {
    id: number;
    name: string;
}

interface TenantAdmin {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    username: string;
    joined_at: string;
    tenant_id: number;
    tenant_name: string;
}

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const SuperAdminAdmins: React.FC = () => {
    const [admins, setAdmins] = useState<TenantAdmin[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    // Create Admin state
    const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
    const [tenantId, setTenantId] = useState<number | "">("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [submittingCreate, setSubmittingCreate] = useState<boolean>(false);

    // Reset Password state
    const [openResetDialog, setOpenResetDialog] = useState<boolean>(false);
    const [selectedAdmin, setSelectedAdmin] = useState<TenantAdmin | null>(null);
    const [newPassword, setNewPassword] = useState<string>("");
    const [submittingReset, setSubmittingReset] = useState<boolean>(false);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            
            // Parallel fetches
            const [adminsRes, tenantsRes] = await Promise.all([
                axios.get<TenantAdmin[]>(`${API}/api/superadmin/admins`, { headers }),
                axios.get<Tenant[]>(`${API}/api/superadmin/tenants`, { headers })
            ]);

            setAdmins(adminsRes.data);
            setTenants(tenantsRes.data);
        } catch (err: any) {
            console.error("Fetch admins data error:", err);
            setError(err.response?.data?.error || "Failed to load platform data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenCreate = () => {
        setTenantId("");
        setFirstName("");
        setLastName("");
        setEmail("");
        setUsername("");
        setPassword("");
        setOpenCreateDialog(true);
    };

    const handleCloseCreate = () => {
        setOpenCreateDialog(false);
    };

    const handleOpenReset = (admin: TenantAdmin) => {
        setSelectedAdmin(admin);
        setNewPassword("");
        setOpenResetDialog(true);
    };

    const handleCloseReset = () => {
        setOpenResetDialog(false);
        setSelectedAdmin(null);
        setNewPassword("");
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId || !firstName.trim() || !lastName.trim() || !username.trim() || !password.trim()) {
            return;
        }

        setSubmittingCreate(true);
        setError("");
        setSuccess("");

        try {
            await axios.post(`${API}/api/superadmin/admins`, {
                tenant_id: tenantId,
                first_name: firstName,
                last_name: lastName,
                email,
                username,
                password
            }, { headers });

            setSuccess(`Admin account created successfully for tenant`);
            handleCloseCreate();
            fetchData();
        } catch (err: any) {
            console.error("Create admin error:", err);
            setError(err.response?.data?.error || "Failed to create administrator");
        } finally {
            setSubmittingCreate(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin || !newPassword.trim() || newPassword.trim().length < 6) return;

        setSubmittingReset(true);
        setError("");
        setSuccess("");

        try {
            await axios.put(`${API}/api/superadmin/admins/${selectedAdmin.id}/reset-password`, {
                password: newPassword
            }, { headers });

            setSuccess(`Password reset successfully for ${selectedAdmin.username}`);
            handleCloseReset();
        } catch (err: any) {
            console.error("Reset password error:", err);
            setError(err.response?.data?.error || "Failed to reset password");
        } finally {
            setSubmittingReset(false);
        }
    };

    return (
        <div className="space-y-6 font-['Outfit']">
            {/* Header section */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white">Tenant Administrators</h3>
                    <p className="text-xs text-slate-400">Manage login access profiles for tenant environments</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Register Tenant Admin</span>
                </button>
            </div>

            {/* Notifications */}
            {error && <Alert severity="error" sx={{ backgroundColor: "#1e1b4b", color: "#f87171", border: "1px solid #312e81" }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ backgroundColor: "#064e3b", color: "#34d399", border: "1px solid #065f46" }}>{success}</Alert>}

            {/* Admins List */}
            {loading ? (
                <div className="flex h-48 items-center justify-center">
                    <CircularProgress sx={{ color: "#3b82f6" }} />
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg shadow-slate-950/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-950/50">
                                    <th className="py-5 px-6">Name</th>
                                    <th className="py-5 px-6">Username</th>
                                    <th className="py-5 px-6">Assigned Tenant</th>
                                    <th className="py-5 px-6">Email</th>
                                    <th className="py-5 px-6">Joined Date</th>
                                    <th className="py-5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300 text-sm">
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-850/40 transition-colors">
                                        <td className="py-4 px-6 font-bold text-white">
                                            {admin.first_name} {admin.last_name}
                                        </td>
                                        <td className="py-4 px-6 font-mono text-slate-400">{admin.username}</td>
                                        <td className="py-4 px-6">
                                            <span className="bg-blue-500/10 text-blue-400 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase border border-blue-500/20">
                                                {admin.tenant_name}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-400">{admin.email || "No Email Provided"}</td>
                                        <td className="py-4 px-6 text-slate-400">
                                            {new Date(admin.joined_at).toLocaleDateString("en-IN", {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleOpenReset(admin)}
                                                className="px-3 py-1.5 rounded-xl border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-white transition-all text-xs font-bold"
                                            >
                                                Reset Password
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Register Admin Dialog */}
            <Dialog 
                open={openCreateDialog} 
                onClose={handleCloseCreate}
                PaperProps={{
                    style: {
                        backgroundColor: "#0f172a",
                        color: "white",
                        borderRadius: "24px",
                        border: "1px solid #1e293b",
                        maxWidth: "500px",
                        width: "100%",
                        fontFamily: "'Outfit', sans-serif"
                    }
                }}
            >
                <form onSubmit={handleCreateAdmin}>
                    <DialogTitle className="font-bold text-white border-b border-slate-800 py-5">
                        Register Tenant Admin Profile
                    </DialogTitle>
                    <DialogContent className="space-y-4 pt-6">
                        {/* Tenant selection */}
                        <div className="space-y-1 mt-2">
                            <label className="text-xs font-bold text-slate-400">Target Tenant Environment</label>
                            <FormControl fullWidth sx={InputStyles}>
                                <Select
                                    value={tenantId}
                                    onChange={(e) => setTenantId(e.target.value as number)}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>Select Tenant</MenuItem>
                                    {tenants.map(t => (
                                        <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        {/* Name Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400">First Name</label>
                                <TextField
                                    fullWidth
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="First Name"
                                    sx={InputStyles}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400">Last Name</label>
                                <TextField
                                    fullWidth
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Last Name"
                                    sx={InputStyles}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Email Address (Optional)</label>
                            <TextField
                                fullWidth
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@domain.com"
                                sx={InputStyles}
                            />
                        </div>

                        {/* Username & Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400">Username</label>
                                <TextField
                                    fullWidth
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter login username"
                                    sx={InputStyles}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400">Password</label>
                                <TextField
                                    fullWidth
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Set temporary password"
                                    sx={InputStyles}
                                />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions className="border-t border-slate-800 p-6 space-x-3">
                        <Button 
                            onClick={handleCloseCreate} 
                            sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={submittingCreate || !tenantId || !firstName.trim() || !lastName.trim() || !username.trim() || !password.trim()}
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#2563eb', 
                                '&:hover': { backgroundColor: '#1d4ed8' },
                                borderRadius: '14px',
                                px: 4,
                                py: 1.2,
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            {submittingCreate ? 'Generating Account...' : 'Generate Profile'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog 
                open={openResetDialog} 
                onClose={handleCloseReset}
                PaperProps={{
                    style: {
                        backgroundColor: "#0f172a",
                        color: "white",
                        borderRadius: "24px",
                        border: "1px solid #1e293b",
                        maxWidth: "400px",
                        width: "100%",
                        fontFamily: "'Outfit', sans-serif"
                    }
                }}
            >
                <form onSubmit={handleResetPassword}>
                    <DialogTitle className="font-bold text-white border-b border-slate-800 py-5">
                        Reset Admin Password
                    </DialogTitle>
                    <DialogContent className="space-y-4 pt-6">
                        <p className="text-xs text-slate-400">
                            Set a new platform authentication password for <strong>{selectedAdmin?.first_name} {selectedAdmin?.last_name}</strong> (Username: <code className="text-blue-400">{selectedAdmin?.username}</code>).
                        </p>
                        <div className="space-y-1 mt-2">
                            <label className="text-xs font-bold text-slate-400">New Password</label>
                            <TextField
                                fullWidth
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter at least 6 characters"
                                autoFocus
                                sx={InputStyles}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions className="border-t border-slate-800 p-6 space-x-3">
                        <Button 
                            onClick={handleCloseReset} 
                            sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={submittingReset || !newPassword.trim() || newPassword.trim().length < 6}
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#ef4444', 
                                '&:hover': { backgroundColor: '#dc2626' },
                                borderRadius: '14px',
                                px: 4,
                                py: 1.2,
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            {submittingReset ? 'Resetting...' : 'Force Password Reset'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

const InputStyles = {
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        color: 'white',
        fontFamily: "'Outfit', sans-serif",
        '& fieldset': { border: 'none' },
        '&:hover fieldset': { border: 'none' },
        '&.Mui-focused fieldset': { border: '1px solid #3b82f6' },
        '& input': { px: 3, py: 2 }
    },
    '& .MuiSelect-select': {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        color: 'white',
        px: 3,
        py: 2,
        fontFamily: "'Outfit', sans-serif",
    }
};

export default SuperAdminAdmins;
