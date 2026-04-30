import React, { useState, useEffect } from 'react';
import Admin_ManualBill from './Admin_ManualBill';
import { getAuthAxios } from '../../../utils/apiClient';

interface SettingsProps {
    theme: string;
    setTheme: (theme: string) => void;
    companyName: string;
    setCompanyName: (name: string) => void;
    backendStatus: string;
    lastSynced: string;
    isSyncing: boolean;
    emailForwarding: boolean;
    pushNotifications: boolean;
    handleManualSync: () => void;
    setEmailForwarding: (val: boolean) => void;
    setPushNotifications: (val: boolean) => void;
    nextInvoiceNo: number;
    setNextInvoiceNo: (val: number) => void | Promise<void>;
    lastInvoiceNo: number;
    profilePic: string;
    setProfilePic: (val: string) => void;
    ledgerSheetUrl?: string;
    handleSyncAllToLedger?: () => void;
}

const AdminSettings = ({
    theme, setTheme, companyName, setCompanyName,
    lastSynced, isSyncing, emailForwarding, pushNotifications,
    handleManualSync, 
    setEmailForwarding, setPushNotifications,
    nextInvoiceNo, setNextInvoiceNo, lastInvoiceNo,
    profilePic, setProfilePic,
    ledgerSheetUrl = "",
    handleSyncAllToLedger
}: SettingsProps) => {

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [manualVillage, setManualVillage] = useState('');
    const [manualShop, setManualShop] = useState('');
    const [manualBillActive, setManualBillActive] = useState(false);
    // Local draft for invoice number — only synced to DB on explicit save
    const [draftInvoiceNo, setDraftInvoiceNo] = useState<string>(String(nextInvoiceNo));
    const [invoiceSaving, setInvoiceSaving] = useState(false);
    const [invoiceSaved, setInvoiceSaved] = useState(false);

    // Motor Vehicles state
    const [motorVehicles, setMotorVehicles] = useState<any[]>([]);
    const [newVehicle, setNewVehicle] = useState('');

    const fetchVehicles = async () => {
        try {
            const res = await getAuthAxios().get('/api/settings/vehicles');
            setMotorVehicles(res.data);
        } catch (err) {
            console.error('Failed to fetch vehicles', err);
        }
    };

    const handleAddVehicle = async () => {
        if (!newVehicle.trim()) return;
        try {
            await getAuthAxios().post('/api/settings/vehicles', { vehicle_no: newVehicle.trim() });
            setNewVehicle('');
            fetchVehicles();
        } catch (err) {
            alert('Failed to add vehicle. It might already exist.');
        }
    };

    const handleDeleteVehicle = async (id: number) => {
        if (!window.confirm('Delete this vehicle?')) return;
        try {
            await getAuthAxios().delete(`/api/settings/vehicles/${id}`);
            fetchVehicles();
        } catch (err) {
            alert('Failed to delete vehicle');
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    // Keep draft in sync if parent updates from DB
    useEffect(() => {
        setDraftInvoiceNo(String(nextInvoiceNo));
    }, [nextInvoiceNo]);

    const handleSaveInvoiceNo = async () => {
        const parsed = Math.max(1, parseInt(draftInvoiceNo, 10) || 1);
        setDraftInvoiceNo(String(parsed));
        setInvoiceSaving(true);
        setInvoiceSaved(false);
        await setNextInvoiceNo(parsed);
        setInvoiceSaving(false);
        setInvoiceSaved(true);
        setTimeout(() => setInvoiceSaved(false), 2500);
    };

    const handleStartManualBill = () => {
        if (!manualVillage.trim() || !manualShop.trim()) {
            alert('Please enter both Area/Village Name and Shop Name.');
            return;
        }
        setManualBillActive(true);
    };

    if (manualBillActive) {
        return (
            <Admin_ManualBill
                shopName={manualShop.trim()}
                villageName={manualVillage.trim()}
                theme={theme}
                onBack={() => {
                    setManualBillActive(false);
                    setManualVillage('');
                    setManualShop('');
                }}
                type="admin"
            />
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfilePic(base64String);
                localStorage.setItem('adminProfilePic', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const SectionHeader = ({ icon, title, subtitle, colorClass }: any) => (
        <div className="flex items-center space-x-5 mb-8">
            <div className={`w-14 h-14 ${colorClass} rounded-[20px] flex items-center justify-center text-2xl shadow-xl bg-opacity-10`}>{icon}</div>
            <div>
                <h3 className={`text-xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
    );

    const Card = ({ children }: any) => (
        <div className={`p-8 rounded-[40px] border transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5 shadow-2xl shadow-indigo-500/5 hover:border-white/10' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:border-slate-300'}`}>
            {children}
        </div>
    );

    const Toggle = ({ label, desc, active, onChange }: any) => (
        <div className="flex items-center justify-between p-4 rounded-3xl border border-transparent hover:border-blue-500/20 transition-all cursor-pointer" onClick={() => onChange(!active)}>
            <div>
                <p className={`font-black text-sm mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{label}</p>
                <p className="text-xs text-slate-500 font-medium">{desc}</p>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-all ${active ? 'bg-blue-500' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
        </div>
    );

    return (
        <div className="animate-in zoom-in-95 fade-in duration-500 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Profile Image card */}
                <Card>
                    <SectionHeader icon="📸" title="Administrator Identity" subtitle="Personalize Your Presence" colorClass="bg-emerald-600 text-emerald-500 shadow-emerald-500/40" />
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div 
                            className="relative group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={`w-32 h-32 rounded-full border-4 overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-50'}`}>
                                {profilePic ? (
                                    <img src={profilePic} alt="Admin" className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-4xl font-black italic ${theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-300'}`}>
                                        A
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm text-white font-black text-[10px] uppercase tracking-widest">
                                Edit
                            </div>
                        </div>

                        <div className="flex-grow space-y-3 text-center md:text-left">
                            <h4 className={`font-black italic ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Custom Profile Picture</h4>
                            <p className="text-slate-500 text-xs font-medium">
                                Upload a photo to represent your admin profile.
                            </p>
                            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                                    Browse
                                </button>
                                {profilePic && (
                                    <button 
                                        onClick={() => {
                                            setProfilePic("");
                                            localStorage.removeItem('adminProfilePic');
                                        }}
                                        className={`px-5 py-2.5 font-black rounded-xl text-[10px] uppercase tracking-widest border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-red-500/10 hover:text-red-500' : 'bg-white border-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500'}`}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Visual Experience */}
                <Card>
                    <SectionHeader icon="🎨" title="Visual Experience" subtitle="Appearance & Interface" colorClass="bg-indigo-600 text-indigo-500 shadow-indigo-500/40" />
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setTheme('light')}
                            className={`p-6 rounded-[30px] border-4 flex flex-col items-center justify-center space-y-3 transition-all ${theme === 'light' ? 'bg-blue-600 border-white shadow-2xl shadow-blue-500/50 scale-105' : 'bg-slate-50 border-slate-100 hover:border-slate-200 opacity-60'}`}>
                            <span className="text-3xl">☀️</span>
                            <span className={`font-black uppercase tracking-widest text-[10px] ${theme === 'light' ? 'text-white' : 'text-slate-900'}`}>Bright Mode</span>
                        </button>
                        <button onClick={() => setTheme('dark')}
                            className={`p-6 rounded-[30px] border-4 flex flex-col items-center justify-center space-y-3 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 shadow-2xl shadow-indigo-500/40 scale-105' : 'bg-slate-50 border-slate-100 hover:border-slate-200 opacity-60'}`}>
                            <span className="text-3xl">🌙</span>
                            <span className={`font-black uppercase tracking-widest text-[10px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Deep Space</span>
                        </button>
                    </div>
                </Card>

                {/* Company Branding */}
                <Card>
                    <SectionHeader icon="🏢" title="Profile Management" subtitle="Global Branding Assets" colorClass="bg-blue-600 text-blue-500 shadow-blue-500/40" />
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className={`text-[10px] font-black italic px-2 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Organization Name</label>
                            <div className="relative group">
                                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                                    className={`w-full px-6 py-4 rounded-[20px] font-black text-lg border transition-all focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 italic">Changing the organization name will instantly reflect across the dashboard header.</p>
                    </div>
                </Card>

                {/* Data Sync & APIs */}
                <Card>
                    <SectionHeader icon="🔄" title="Data Synchronization" subtitle="Manage Google Sheets API" colorClass="bg-emerald-600 text-emerald-500 shadow-emerald-500/40" />
                    <div className="space-y-8">
                        <div className={`p-6 rounded-[24px] border flex items-center justify-between ${theme === 'dark' ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Data Fetch</p>
                                <p className={`font-black text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{lastSynced}</p>
                            </div>
                            <button onClick={handleManualSync} disabled={isSyncing}
                                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isSyncing ? 'opacity-50 cursor-not-allowed bg-slate-500 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5'}`}>
                                {isSyncing ? 'Syncing...' : 'Sync Now'}
                            </button>
                        </div>
                        <a href="https://docs.google.com/spreadsheets/d/1gSE3fMAzka_eIlIU2sFR4xC4_IxJTeHAgJkp5YQCSvM/edit" target="_blank" rel="noreferrer"
                            className={`block text-center px-6 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all border ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-emerald-400' : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-600 shadow-sm'}`}>
                            ↗ Open Master Price Sheet
                        </a>
                    </div>
                </Card>
                
                {/* Ledger & Bookkeeping */}
                <Card>
                    <SectionHeader icon="📊" title="Ledger & Bookkeeping" subtitle="Track Every Rupee" colorClass="bg-blue-600 text-blue-500 shadow-blue-500/40" />
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <a 
                                href={ledgerSheetUrl || 'https://docs.google.com/spreadsheets/d/1slf-BRcvxU6OzKYxnzGOFeJz38IGN--nnAw0gpXWLiI/edit?gid=0#gid=0'} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:scale-95"
                            >
                                ↗ Open Sheet
                            </a>
                            
                            <button 
                                onClick={handleSyncAllToLedger} 
                                disabled={isSyncing}
                                className={`w-full py-4 border-2 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                                    ${theme === 'dark' ? 'border-white/10 text-slate-500 hover:border-blue-500/50 hover:text-blue-400' : 'border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600'}`}
                            >
                                {isSyncing ? 'Processing Sync...' : '🔄 Sync All Existing Shops to Ledger'}
                            </button>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 italic text-center px-4">
                            Historical transactions are automatically synced to your Google Sheet.
                        </p>
                    </div>
                </Card>

                {/* Manual Bill Generation */}
                <Card>
                    <SectionHeader icon="🧾" title="Manual Bill Generation" subtitle="Create Ad-Hoc Bills" colorClass="bg-pink-600 text-pink-500 shadow-pink-500/40" />
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className={`text-[10px] font-black italic px-2 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Area / Village Name</label>
                            <input type="text" placeholder="e.g. Salem City" value={manualVillage} onChange={e => setManualVillage(e.target.value)}
                                className={`w-full px-5 py-3 rounded-2xl font-bold text-sm border focus:outline-none focus:ring-2 transition-all ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:border-pink-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-pink-500'}`} />
                        </div>
                        <div className="space-y-1">
                            <label className={`text-[10px] font-black italic px-2 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Shop Name</label>
                            <input type="text" placeholder="e.g. General Traders" value={manualShop} onChange={e => setManualShop(e.target.value)}
                                className={`w-full px-5 py-3 rounded-2xl font-bold text-sm border focus:outline-none focus:ring-2 transition-all ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:border-pink-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-pink-500'}`} />
                        </div>
                        <button onClick={handleStartManualBill}
                            className="w-full mt-2 px-6 py-4 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-pink-500/30 hover:-translate-y-0.5 active:scale-95">
                            Start Manual Billing
                        </button>
                    </div>
                </Card>

                <Card>
                    <SectionHeader icon="📋" title="Invoice Format" subtitle="Set Starting Bill Number" colorClass="bg-violet-600 text-violet-500 shadow-violet-500/40" />
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className={`text-[10px] font-black italic px-2 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Next Invoice Number</label>
                            <input
                                type="number"
                                min={1}
                                value={draftInvoiceNo}
                                onChange={e => setDraftInvoiceNo(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveInvoiceNo(); }}
                                className={`w-full px-6 py-4 rounded-[20px] font-black text-2xl tracking-widest border transition-all focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-violet-300 focus:ring-violet-500/20 focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-violet-700 focus:ring-violet-600/10 focus:border-violet-600'}`}
                            />
                            <button
                                onClick={handleSaveInvoiceNo}
                                disabled={invoiceSaving}
                                className={`w-full py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95
                                    ${ invoiceSaved
                                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                        : invoiceSaving
                                        ? 'opacity-50 cursor-not-allowed bg-violet-400 text-white'
                                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20 hover:-translate-y-0.5'
                                    }`}
                            >
                                {invoiceSaved ? '✓ Saved' : invoiceSaving ? 'Saving…' : 'Set Number →'}
                            </button>
                        </div>
                        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'dark' ? 'bg-slate-800/50 border-white/5' : 'bg-violet-50 border-violet-100'}`}>
                            <span className="text-2xl">🔖</span>
                            <div>
                                <p className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Next bill will be assigned</p>
                                <p className={`font-black text-2xl ${theme === 'dark' ? 'text-violet-300' : 'text-violet-700'}`}>#{nextInvoiceNo}</p>
                            </div>
                        </div>
                        <p className="text-xs font-medium text-slate-500 italic px-1">
                            Bills will auto-increment from this number (4000 → 4001 → 4002…). Click <strong>Set Number</strong> to save. This value persists across logins.
                        </p>
                        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'dark' ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                            <span className="text-xl">🧾</span>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Last Generated Invoice</p>
                                <p className={`font-black text-xl ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>#{lastInvoiceNo}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Motor Vehicle Management */}
                <Card>
                    <SectionHeader icon="🚚" title="Motor Vehicles" subtitle="Manage Transport Fleet" colorClass="bg-amber-600 text-amber-500 shadow-amber-500/40" />
                    <div className="space-y-6">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Enter Vehicle No (e.g. TN 30 AA 1234)"
                                value={newVehicle}
                                onChange={e => setNewVehicle(e.target.value)}
                                className={`flex-1 px-5 py-3 rounded-2xl font-bold text-sm border focus:outline-none focus:ring-2 transition-all uppercase ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'}`}
                            />
                            <button
                                onClick={handleAddVehicle}
                                disabled={!newVehicle.trim()}
                                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                            >
                                Add
                            </button>
                        </div>
                        <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                            {motorVehicles.length === 0 ? (
                                <div className={`p-6 text-center text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    No motor vehicles added yet.
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-200 dark:divide-white/10">
                                    {motorVehicles.map(v => (
                                        <li key={v.id} className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                                            <span className={`font-black uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{v.vehicle_no}</span>
                                            <button
                                                onClick={() => handleDeleteVehicle(v.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Notifications */}
                <Card>
                    <SectionHeader icon="🔔" title="Notifications" subtitle="Alerts & Approvals" colorClass="bg-sky-600 text-sky-500 shadow-sky-500/40" />
                    <div className="space-y-2">
                        <Toggle label="Email Alerts" desc="Forward urgent staff requests to admin email" active={emailForwarding} onChange={setEmailForwarding} />
                        <Toggle label="Desktop Push" desc="Browser notifications for pending approvals" active={pushNotifications} onChange={setPushNotifications} />
                    </div>
                </Card>



            </div>

        </div>
    );
};

export default AdminSettings;
