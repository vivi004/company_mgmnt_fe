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
                            <BillCheck theme={state.theme} type="admin" onUnverifiedCountChange={actions.setUnverifiedCount} />
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
