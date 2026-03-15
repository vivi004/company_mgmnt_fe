import StaffSidenav from "./1Staff_Sidenav";
import StaffProductRates from "./3Staff_Directory";
import StaffOrderLines from "./4Staff_OrderLines";
import StaffSettings from "./5Staff_Settings";
import BillCheck from "../../../components/common/BillCheck/BillCheck";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ToastContainer } from "../../../components/Toast";
import { useStaffDashboardData } from './useStaffDashboardData';
import StaffProfileModal from './Staff_ProfileModal';
import StaffSectorModal from './Staff_SectorModal';

const StaffDashboard = () => {
    const { state, actions } = useStaffDashboardData();

    return (
        <div className={`flex h-screen w-full font-['Outfit'] overflow-hidden ${state.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <ToastContainer toasts={state.toasts} removeToast={actions.removeToast} />

            {/* Desktop Sidenav */}
            <div className="hidden lg:block h-full">
                <StaffSidenav activeTab={state.activeTab} setActiveTab={actions.setActiveTab} companyName={state.companyName} unverifiedCount={state.unverifiedCount} />
            </div>

            {/* Mobile Sidenav Drawer */}
            <Drawer
                anchor="left"
                open={state.isMobileMenuOpen}
                onClose={() => actions.setIsMobileMenuOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: 'transparent',
                        borderRight: 'none',
                    }
                }}
            >
                <div onClick={() => actions.setIsMobileMenuOpen(false)} className="h-full">
                    <StaffSidenav activeTab={state.activeTab} setActiveTab={actions.setActiveTab} companyName={state.companyName} unverifiedCount={state.unverifiedCount} onClose={() => actions.setIsMobileMenuOpen(false)} />
                </div>
            </Drawer>

            <div className={`flex-grow flex flex-col min-w-0 overflow-hidden relative transition-colors duration-500 ${state.theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
                <header className={`px-6 lg:px-10 py-6 lg:py-8 z-10 flex justify-between items-center transition-colors duration-500 border-b ${state.theme === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden">
                            <IconButton
                                onClick={() => actions.setIsMobileMenuOpen(true)}
                                sx={{ color: state.theme === 'dark' ? 'white' : 'black' }}
                            >
                                <MenuIcon />
                            </IconButton>
                        </div>
                        <div>
                            <h2 className={`text-2xl lg:text-4xl font-black italic tracking-tighter ${state.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {state.activeTab === 'settings' ? 'My Settings' : state.activeTab === 'order-lines' ? 'Order Lines' : state.activeTab === 'bill-check' ? 'Queue Verification' : 'Staff Portal'}
                            </h2>
                            <p className="text-slate-500 mt-1 font-medium italic text-xs lg:text-base">Welcome back, {state.userProfile.first_name || 'Staff'}</p>
                        </div>
                    </div>
                    <div 
                        className="flex items-center space-x-6 cursor-pointer group"
                        onClick={() => actions.setActiveTab('settings')}
                    >
                        <div className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest border hidden sm:block transition-all group-hover:scale-105 ${state.theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-500/20' : 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100'}`}>
                            Hi {state.userProfile.first_name}
                        </div>
                        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center font-black text-2xl border transition-all group-hover:scale-110 group-active:scale-95 overflow-hidden ${state.theme === 'dark' ? 'bg-slate-800 text-blue-400 border-white/10 ring-4 ring-white/5' : 'bg-white text-slate-800 border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                            {state.profilePic ? (
                                <img src={state.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                state.userProfile.first_name?.[0] || 'S'
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto p-10 hide-scrollbar scroll-smooth">
                    <div className="max-w-6xl mx-auto">
                        {state.activeTab === 'product-rates' && (
                            <StaffProductRates
                                products={state.products}
                                loading={state.loading}
                                theme={state.theme}
                            />
                        )}
                        {state.activeTab === 'order-lines' && (
                            <StaffOrderLines
                                orderLines={state.orderLines}
                                olLoading={state.olLoading}
                                theme={state.theme}
                                setShowOlModal={actions.setShowOlModal}
                                handleDeleteRequest={actions.handleDeleteRequest}
                            />
                        )}
                        {state.activeTab === 'bill-check' && (
                            <BillCheck
                                theme={state.theme}
                                type="staff"
                                userProfileName={state.userProfile.first_name ? `${state.userProfile.first_name} ${state.userProfile.last_name || ''}`.trim() : 'Staff'}
                            />
                        )}
                        {state.activeTab === 'settings' && (
                            <StaffSettings
                                theme={state.theme}
                                setTheme={actions.setTheme}
                                userProfile={state.userProfile}
                                setShowModal={actions.setShowModal}
                                profilePic={state.profilePic}
                                setProfilePic={actions.setProfilePic}
                            />
                        )}
                    </div>
                </main>
            </div>

            <StaffProfileModal
                open={state.showModal}
                onClose={() => actions.setShowModal(false)}
                formData={state.formData}
                setFormData={actions.setFormData}
                handleRequestSubmit={actions.handleRequestSubmit}
                theme={state.theme}
            />

            <StaffSectorModal
                open={state.showOlModal}
                onClose={() => actions.setShowOlModal(false)}
                newSector={state.newSector}
                setNewSector={actions.setNewSector}
                handleAddSector={actions.handleAddSector}
                theme={state.theme}
            />
        </div>
    );
};

export default StaffDashboard;
