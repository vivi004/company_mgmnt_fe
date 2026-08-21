import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SuperAdminSidenav from "./SuperAdmin_Sidenav";
import SuperAdminDashboard from "./SuperAdmin_Dashboard";
import SuperAdminTenants from "./SuperAdmin_Tenants";
import SuperAdminAdmins from "./SuperAdmin_Admins";
import SuperAdminSettings from "./SuperAdmin_Settings";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

const SuperAdminPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [adminName, setAdminName] = useState<string>("Platform Super Admin");
    const navigate = useNavigate();

    useEffect(() => {
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
            try {
                const user = JSON.parse(userRaw);
                setAdminName(`${user.first_name || ""} ${user.last_name || ""}`.trim() || "Super Admin");
            } catch (e) {}
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <SuperAdminDashboard />;
            case "tenants":
                return <SuperAdminTenants />;
            case "admins":
                return <SuperAdminAdmins />;
            case "settings":
                return <SuperAdminSettings />;
            default:
                return <SuperAdminDashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-955 overflow-hidden text-slate-100" style={{ backgroundColor: "#020617" }}>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block h-full">
                <SuperAdminSidenav activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
            </div>

            {/* Mobile Sidebar Drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-72 h-full bg-slate-900 shadow-2xl relative animate-slide-in">
                        <SuperAdminSidenav 
                            activeTab={activeTab} 
                            setActiveTab={(tab) => {
                                setActiveTab(tab);
                                setSidebarOpen(false);
                            }} 
                            onLogout={handleLogout}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </div>
                    <div className="flex-grow" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center space-x-4">
                        <IconButton
                            onClick={() => setSidebarOpen(true)}
                            sx={{ color: "white" }}
                            className="lg:hidden"
                        >
                            <MenuIcon />
                        </IconButton>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white capitalize">
                                {activeTab.replace("-", " ")}
                            </h2>
                            <p className="text-xs text-slate-400">Platform Control Center</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold text-white">{adminName}</span>
                            <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">SYSTEM ROOT ACCESS</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 border border-blue-400/20">
                            SA
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
                            title="Log Out"
                        >
                            <LogoutIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Subview Container */}
                <main className="flex-grow overflow-y-auto p-8 bg-slate-950">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SuperAdminPortal;
