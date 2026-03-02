
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

interface AdminRequestsProps {
    requests: ProfileRequest[];
    olRequests: any[];
    theme: string;
    handleApproveRequest: (id: number) => void;
    handleRejectRequest: (id: number) => void;
    handleApproveOl: (id: number) => void;
    handleRejectOl: (id: number) => void;
}

const AdminRequests = ({ requests, olRequests, theme, handleApproveRequest, handleRejectRequest, handleApproveOl, handleRejectOl }: AdminRequestsProps) => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-5 duration-700">
            <div>
                <h3 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Operations Pipeline</h3>
                <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Pending Personnel & Sector Modifications</p>
            </div>

            {/* Profile Update Requests Section */}
            <div className="space-y-6">
                <h4 className={`text-xl font-black italic uppercase tracking-widest flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mr-4 text-blue-500">📝</div>
                    Profile Modifications
                </h4>
                {requests.length === 0 ? (
                    <div className={`p-10 rounded-[40px] border border-dashed text-center ${theme === 'dark' ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400 bg-white/30'}`}>
                        No pending personnel updates.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {requests.map(req => (
                            <div key={req.id} className={`p-8 rounded-[40px] border flex flex-col md:flex-row justify-between items-center gap-8 group transition-all hover:scale-[1.01] ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20'}`}>
                                <div className="flex items-center space-x-8">
                                    <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">👤</div>
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Request ID: SR-{req.id}</p>
                                        <h4 className={`text-xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                            {req.current_first_name} {req.current_last_name}
                                        </h4>
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            <div className="bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                                                <p className="text-[9px] font-black text-blue-500 uppercase">New Profile</p>
                                                <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>{req.first_name} {req.last_name}</p>
                                            </div>
                                            <div className="bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                                                <p className="text-[9px] font-black text-indigo-500 uppercase">New Comm Line</p>
                                                <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>{req.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleApproveRequest(req.id)}
                                        className="px-6 py-3 bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all text-[10px] uppercase tracking-widest"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleRejectRequest(req.id)}
                                        className={`px-6 py-3 border font-black rounded-2xl transition-all text-[10px] uppercase tracking-widest ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400 hover:text-red-500' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-red-600'}`}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Line Deletion Requests Section */}
            <div className="space-y-6 pt-10 border-t border-slate-100/5">
                <h4 className="text-xl font-black italic text-emerald-500 uppercase tracking-widest flex items-center">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mr-4 text-emerald-500">🗑️</div>
                    Sector Deletions
                </h4>
                {olRequests.length === 0 ? (
                    <div className={`p-10 rounded-[40px] border border-dashed text-center ${theme === 'dark' ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400 bg-white/30'}`}>
                        No active deletion protocols in queue.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {olRequests.map(req => (
                            <div key={req.id} className={`p-8 rounded-[40px] border flex flex-col md:flex-row justify-between items-center gap-8 group transition-all hover:scale-[1.01] ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20'}`}>
                                <div className="flex items-center space-x-6">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-[24px] flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">⚠️</div>
                                    <div>
                                        <p className={`font-black text-xl uppercase italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{req.order_line_name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Requester: EMP-{req.employee_id} {req.requester_name}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleApproveOl(req.id)}
                                        className="px-6 py-3 bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                                    >
                                        Confirm Purge
                                    </button>
                                    <button
                                        onClick={() => handleRejectOl(req.id)}
                                        className={`px-6 py-3 border font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRequests;
