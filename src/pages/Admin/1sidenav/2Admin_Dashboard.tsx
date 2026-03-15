import AdminSidenav from "./1Admin_Sidenav";
import AdminManageTeam from "./3Admin_Manage_Team";
import AdminRequests from "./4Admin_Requests";
import AdminOrderLines from "./5Admin_OrderLines";
import AdminSettings from "./6Admin_Settings";
import AdminBills from "./7Admin_Bills";
import AdminSales from "./8Admin_Sales";
import BillCheck from "../../../components/common/BillCheck/BillCheck";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ToastContainer } from "../../../components/Toast";

import AdminConfirmModal from "./Admin_ConfirmModal";
import AdminEmployeeModal from "./Admin_EmployeeModal";
import AdminOrderLineModal from "./Admin_OrderLineModal";
import { useAdminDashboardData } from "./useAdminDashboardData";

const AdminDashboard = () => {
    const { state, actions } = useAdminDashboardData();

    return (
        <div className={`flex h-screen w-full font-['Outfit'] overflow-hidden ${state.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <ToastContainer toasts={state.toasts} removeToast={actions.removeToast} />

            {/* Desktop Sidenav */}
            <div className="hidden lg:block h-full">
                <AdminSidenav
                    activeTab={state.activeTab}
                    setActiveTab={actions.setActiveTab}
                    companyName={state.companyName}
                    requestCount={state.requests.length}
                    olRequestCount={state.olRequests.length}
                    billCount={state.bills.length}
                    unverifiedCount={state.unverifiedCount}
                />
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
                    <AdminSidenav
                        activeTab={state.activeTab}
                        setActiveTab={actions.setActiveTab}
                        companyName={state.companyName}
                        requestCount={state.requests.length}
                        olRequestCount={state.olRequests.length}
                        billCount={state.bills.length}
                        unverifiedCount={state.unverifiedCount}
                        onClose={() => actions.setIsMobileMenuOpen(false)}
                    />
                </div>
            </Drawer>

            <div className={`flex-grow flex flex-col min-w-0 overflow-hidden relative transition-colors duration-500 ${state.theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
                <header className={`px-6 lg:px-10 py-6 lg:py-8 z-10 flex justify-between items-center transition-colors border-b ${state.theme === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
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
                                {state.activeTab === 'manage' ? 'Team Control' : state.activeTab === 'requests' ? 'Staff Requests' : state.activeTab === 'order-lines' ? 'Sector Management' : state.activeTab === 'bills' ? 'Bills Management' : state.activeTab === 'bill-check' ? 'Invoice Verifications' : state.activeTab === 'sales' ? 'Sales Analytics' : 'Configuration'}
                            </h2>
                            <p className="text-slate-500 mt-1 font-medium italic text-xs lg:text-base">Powered by {state.companyName} Systems</p>
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
                                "A"
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto p-10 hide-scrollbar scroll-smooth">
                    <div className="max-w-6xl mx-auto">
                        {state.activeTab === 'manage' && (
                            <AdminManageTeam
                                employees={state.employees}
                                loading={state.loading}
                                theme={state.theme}
                                billCount={state.bills.length}
                                handleEdit={actions.handleEdit}
                                handleDelete={actions.handleDelete}
                                handleAddNew={actions.handleAddNew}
                            />
                        )}
                        {state.activeTab === 'requests' && (
                            <AdminRequests
                                requests={state.requests}
                                olRequests={state.olRequests}
                                theme={state.theme}
                                handleApproveRequest={actions.handleApproveRequest}
                                handleRejectRequest={actions.handleRejectRequest}
                                handleApproveOl={actions.handleApproveOl}
                                handleRejectOl={actions.handleRejectOl}
                            />
                        )}
                        {state.activeTab === 'order-lines' && (
                            <AdminOrderLines
                                orderLines={state.orderLines}
                                theme={state.theme}
                                handleOpenOlModal={actions.handleOpenOlModal}
                                handleDeleteOl={actions.handleDeleteOl}
                            />
                        )}
                        {state.activeTab === 'bills' && (
                            <AdminBills
                                bills={state.bills}
                                theme={state.theme}
                                onDeleteBill={actions.handleDeleteBill}
                                onClearAll={actions.handleClearAllBills}
                                onEditBill={actions.handleEditBill}
                            />
                        )}
                        {state.activeTab === 'bill-check' && (
                            <BillCheck theme={state.theme} type="admin" />
                        )}
                        {state.activeTab === 'sales' && (
                            <AdminSales theme={state.theme} />
                        )}
                        {state.activeTab === 'settings' && (
                            <AdminSettings
                                theme={state.theme}
                                setTheme={actions.setTheme}
                                companyName={state.companyName}
                                setCompanyName={actions.setCompanyName}
                                backendStatus={state.backendStatus}
                                lastSynced={state.lastSynced}
                                isSyncing={state.isSyncing}
                                emailForwarding={state.emailForwarding}
                                pushNotifications={state.pushNotifications}
                                handleManualSync={actions.handleManualSync}
                                handleArchiveOldBills={actions.handleArchiveOldBills}
                                handleResetAnalytics={actions.handleResetAnalytics}
                                setEmailForwarding={actions.setEmailForwarding}
                                setPushNotifications={actions.setPushNotifications}
                                nextInvoiceNo={state.nextInvoiceNo}
                                setNextInvoiceNo={actions.setNextInvoiceNo}
                                profilePic={state.profilePic}
                                setProfilePic={actions.setProfilePic}

                            />
                        )}
                    </div>
                </main>
            </div>

            {/* Extracted Modals */}
            <AdminConfirmModal
                open={state.confirmModal.open}
                message={state.confirmModal.message}
                onConfirm={state.confirmModal.onConfirm}
                onClose={() => actions.setConfirmModal(m => ({ ...m, open: false }))}
                theme={state.theme}
            />

            <AdminEmployeeModal
                open={state.showModal}
                onClose={() => actions.setShowModal(false)}
                onSubmit={actions.handleSubmit}
                editingEmployee={state.editingEmployee}
                formData={state.formData}
                setFormData={actions.setFormData}
                theme={state.theme}
                orderLines={state.orderLines}
            />

            <AdminOrderLineModal
                open={state.showOlModal}
                onClose={() => actions.setShowOlModal(false)}
                onSubmit={actions.handleOlSubmit}
                editingOl={state.editingOl}
                olFormData={state.olFormData}
                setOlFormData={actions.setOlFormData}
                theme={state.theme}
            />

        </div>
    );
};

export default AdminDashboard;
