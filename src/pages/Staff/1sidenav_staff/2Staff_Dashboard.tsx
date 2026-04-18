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
                {/* Mobile hamburger menu button */}
                <div className="lg:hidden fixed top-3 left-3 z-50">
                    <IconButton
                        onClick={() => actions.setIsMobileMenuOpen(true)}
                        sx={{
                            color: state.theme === 'dark' ? 'white' : '#1e293b',
                            backgroundColor: state.theme === 'dark' ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(12px)',
                            border: state.theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(226,232,240,1)',
                            borderRadius: '14px',
                            width: 44,
                            height: 44,
                            boxShadow: state.theme === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)',
                            '&:hover': { transform: 'scale(1.05)' },
                            transition: 'all 0.2s',
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                </div>

                <main className="flex-grow overflow-y-auto px-4 pt-14 pb-6 lg:px-10 lg:pt-8 lg:pb-10 hide-scrollbar scroll-smooth">
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
                            />
                        )}
                        {state.activeTab === 'bill-check' && (
                            <BillCheck
                                theme={state.theme}
                                type="staff"
                                userProfileName={state.userProfile.first_name ? `${state.userProfile.first_name} ${state.userProfile.last_name || ''}`.trim() : 'Staff'}
                                onUnverifiedCountChange={actions.setUnverifiedCount}
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
