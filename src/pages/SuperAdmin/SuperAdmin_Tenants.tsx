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
    status: 'Active' | 'Suspended';
    created_at: string;
}

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const SuperAdminTenants: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    // Modal state
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [tenantName, setTenantName] = useState<string>("");
    const [tenantStatus, setTenantStatus] = useState<'Active' | 'Suspended'>('Active');
    const [submitting, setSubmitting] = useState<boolean>(false);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchTenants = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get<Tenant[]>(`${API}/api/superadmin/tenants`, { headers });
            setTenants(res.data);
        } catch (err: any) {
            console.error("Fetch tenants error:", err);
            setError(err.response?.data?.error || "Failed to load tenants");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleOpenCreate = () => {
        setDialogMode('create');
        setTenantName("");
        setTenantStatus('Active');
        setSelectedTenant(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (tenant: Tenant) => {
        setDialogMode('edit');
        setTenantName(tenant.name);
        setTenantStatus(tenant.status);
        setSelectedTenant(tenant);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setTenantName("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantName.trim()) return;

        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            if (dialogMode === 'create') {
                await axios.post(`${API}/api/superadmin/tenants`, { name: tenantName }, { headers });
                setSuccess("Tenant created successfully");
            } else if (dialogMode === 'edit' && selectedTenant) {
                await axios.put(`${API}/api/superadmin/tenants/${selectedTenant.id}`, { 
                    name: tenantName, 
                    status: tenantStatus 
                }, { headers });
                setSuccess("Tenant updated successfully");
            }
            handleCloseDialog();
            fetchTenants();
        } catch (err: any) {
            console.error("Tenant save error:", err);
            setError(err.response?.data?.error || "Failed to save tenant");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (id === 1) {
            setError("Cannot delete the root platform tenant");
            return;
        }
        if (!window.confirm("Are you absolutely sure you want to delete this tenant? This will permanently delete ALL data, shops, bills, and users associated with it.")) {
            return;
        }

        try {
            setError("");
            setSuccess("");
            await axios.delete(`${API}/api/superadmin/tenants/${id}`, { headers });
            setSuccess("Tenant deleted successfully");
            fetchTenants();
        } catch (err: any) {
            console.error("Delete tenant error:", err);
            setError(err.response?.data?.error || "Failed to delete tenant");
        }
    };

    return (
        <div className="space-y-6 font-['Outfit']">
            {/* Header section */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white font-['Outfit']">Platform Tenant Domains</h3>
                    <p className="text-xs text-slate-400">Configure and manage workspace environments</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add New Tenant</span>
                </button>
            </div>

            {/* Notifications */}
            {error && <Alert severity="error" sx={{ backgroundColor: "#1e1b4b", color: "#f87171", border: "1px solid #312e81" }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ backgroundColor: "#064e3b", color: "#34d399", border: "1px solid #065f46" }}>{success}</Alert>}

            {/* Tenants List */}
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
                                    <th className="py-5 px-6">ID</th>
                                    <th className="py-5 px-6">Tenant Name</th>
                                    <th className="py-5 px-6">Status</th>
                                    <th className="py-5 px-6">Created At</th>
                                    <th className="py-5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300 text-sm">
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-slate-850/40 transition-colors">
                                        <td className="py-4 px-6 font-mono font-bold text-slate-500">{tenant.id}</td>
                                        <td className="py-4 px-6 font-bold text-white">{tenant.name}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                tenant.status === 'Active' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                                {tenant.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-400">
                                            {new Date(tenant.created_at).toLocaleDateString("en-IN", {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-3">
                                            <button
                                                onClick={() => handleOpenEdit(tenant)}
                                                className="px-3 py-1.5 rounded-xl border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-white transition-all text-xs font-bold"
                                            >
                                                Edit
                                            </button>
                                            {tenant.id !== 1 && (
                                                <button
                                                    onClick={() => handleDelete(tenant.id)}
                                                    className="px-3 py-1.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-all text-xs font-bold"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Creation/Edit Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                PaperProps={{
                    style: {
                        backgroundColor: "#0f172a",
                        color: "white",
                        borderRadius: "24px",
                        border: "1px solid #1e293b",
                        maxWidth: "450px",
                        width: "100%",
                        fontFamily: "'Outfit', sans-serif"
                    }
                }}
            >
                <form onSubmit={handleSubmit}>
                    <DialogTitle className="font-bold text-white border-b border-slate-800 py-5">
                        {dialogMode === 'create' ? 'Register New Tenant Domain' : 'Modify Tenant Configuration'}
                    </DialogTitle>
                    <DialogContent className="space-y-6 pt-6">
                        <div className="space-y-1 mt-2">
                            <label className="text-xs font-bold text-slate-400">Tenant / Company Name</label>
                            <TextField
                                fullWidth
                                autoFocus
                                value={tenantName}
                                onChange={(e) => setTenantName(e.target.value)}
                                placeholder="e.g. Varshini Gold Oils"
                                variant="outlined"
                                sx={InputStyles}
                            />
                        </div>

                        {dialogMode === 'edit' && selectedTenant && selectedTenant.id !== 1 && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400">Activation Status</label>
                                <FormControl fullWidth sx={InputStyles}>
                                    <Select
                                        value={tenantStatus}
                                        onChange={(e) => setTenantStatus(e.target.value as any)}
                                    >
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Suspended">Suspended</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions className="border-t border-slate-800 p-6 space-x-3">
                        <Button 
                            onClick={handleCloseDialog} 
                            sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={submitting || !tenantName.trim()}
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
                            {submitting ? 'Saving...' : 'Save Configuration'}
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

export default SuperAdminTenants;
