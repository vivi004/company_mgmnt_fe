import React, { Suspense } from "react";
import AdminSidenav from "./1Admin_Sidenav";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ToastContainer } from "../../../components/Toast";
import { TabLoadingFallback } from "../../../components/common/LoadingScreen";

import AdminConfirmModal from "./Admin_ConfirmModal";
import AdminEmployeeModal from "./Admin_EmployeeModal";
import AdminOrderLineModal from "./Admin_OrderLineModal";
import { useAdminDashboardData } from "./useAdminDashboardData";

// Lazy-loaded Admin sub-tabs
const AdminManageTeam = React.lazy(() => import("./3Admin_Manage_Team"));
const AdminRequests = React.lazy(() => import("./4Admin_Requests"));
const AdminOrderLines = React.lazy(() => import("./5Admin_OrderLines"));
const AdminSettings = React.lazy(() => import("./6Admin_Settings"));
const AdminBills = React.lazy(() => import("./7Admin_Bills"));
const AdminSales = React.lazy(() => import("./8Admin_Sales"));
const AdminCollections = React.lazy(() => import("./9Admin_Collections"));
const BillCheck = React.lazy(() => import("../../../components/common/BillCheck/BillCheck"));

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
                    billCount={state.filteredBillCount}
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
                        billCount={state.filteredBillCount}
                        unverifiedCount={state.unverifiedCount}
                        onClose={() => actions.setIsMobileMenuOpen(false)}
                    />
                </div>
            </Drawer>

            <div className={`flex-grow flex flex-col min-w-0 overflow-hidden relative ${state.theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
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
                    <div className="max-w-7xl mx-auto">
                        <Suspense fallback={<TabLoadingFallback theme={state.theme} />}>
                            {state.activeTab === 'manage' && (
                                <AdminManageTeam
                                    employees={state.employees}
                                    loading={state.loading}
                                    theme={state.theme}
                                    billCount={state.totalBillsCount}
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
                                    handleRefreshInvoiceSettings={actions.fetchInvoiceSettings}
                                    setOrderLines={actions.setOrderLines}
                                    fetchOrderLines={actions.fetchOrderLines}
                                />
                            )}
                            {state.activeTab === 'collections' && (
                                <AdminCollections
                                    theme={state.theme}
                                    orderLines={state.orderLines}
                                    isAdmin={true}
                                />
                            )}
                            {state.activeTab === 'bills' && (
                                <AdminBills
                                    bills={state.bills}
                                    theme={state.theme}
                                    onDeleteBill={actions.handleDeleteBill}
                                    onEditBill={actions.handleEditBill}
                                    selectedDate={state.billSelectedDate}
                                    setSelectedDate={actions.setBillSelectedDate}
                                    motorVehicles={state.motorVehicles}
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
                                    backendStatus={state.backendStatus}
                                    lastSynced={state.lastSynced}
                                    isSyncing={state.isSyncing}
                                    handleSync={actions.handleSync}
                                    handleLogoutAllStaff={actions.handleLogoutAllStaff}
                                    nextInvoiceNo={state.nextInvoiceNo}
                                    setNextInvoiceNo={actions.setNextInvoiceNo}
                                    lastInvoiceNo={state.lastInvoiceNo}
                                    profilePic={state.profilePic}
                                    setProfilePic={actions.setProfilePic}
                                    ledgerSheetUrl={state.ledgerSheetUrl}
                                    handleSyncAllToLedger={actions.handleSyncAllToLedger}
                                    upiId1={state.upiId1}
                                    upiName1={state.upiName1}
                                    upiId2={state.upiId2}
                                    upiName2={state.upiName2}
                                    handleSaveUpiSettings={actions.handleSaveUpiSettings}
                                />
                            )}
                        </Suspense>
                    </div>
                </main>
            </div>

          
             <AdminConfirmModal
                open={state.confirmModal.open}
                message={state.confirmModal.message}
                onConfirm={state.confirmModal.onConfirm}
                onClose={() => actions.setConfirmModal(m => ({ ...m, open: false }))}
                theme={state.theme}
                confirmText={state.confirmModal.confirmText}
                confirmColor={state.confirmModal.confirmColor}
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
