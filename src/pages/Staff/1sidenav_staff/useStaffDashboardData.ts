import { useState, useEffect } from "react";
import { useToast } from "../../../components/Toast";
import { getAuthAxios } from "../../../utils/apiClient";
import type { Employee, OrderLine } from "../../../types/DashboardTypes";
import { getAllProducts } from "../../../constants/productData";
import type { Product } from "../../../constants/productData";
import { syncRatesFromSheet } from "../../../services/googleSheetSync";

export const useStaffDashboardData = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("product-rates");
    const [showModal, setShowModal] = useState(false);

    const [theme, setTheme] = useState(() => localStorage.getItem('staffTheme') || "light");
    const [companyName] = useState(() => localStorage.getItem('companyName') || "Nisha");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unverifiedCount, setUnverifiedCount] = useState(0);
    const [profilePic, setProfilePic] = useState(() => localStorage.getItem('staffProfilePic') || "");


    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [userProfile, setUserProfile] = useState<Employee>({
        id: storedUser.id || 0,
        first_name: storedUser.first_name || "",
        last_name: storedUser.last_name || "",
        email: storedUser.email || "",
        role: storedUser.role || "Staff",
        status: storedUser.status || "Active",
        accessible_orderlines: storedUser.accessible_orderlines || []
    });

    const [formData, setFormData] = useState({
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        email: userProfile.email
    });

    const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
    const [olLoading, setOlLoading] = useState(false);
    const [showOlModal, setShowOlModal] = useState(false);
    const [newSector, setNewSector] = useState({ name: "", node_id: "" });

    const { toasts, showToast, removeToast } = useToast();
    const api = () => getAuthAxios();

    useEffect(() => {
        fetchProducts();
        fetchMyProfile();
        if (storedUser.id) {
            checkNotifications();
        }
    }, []);

    useEffect(() => {
        const loadMyUnverified = () => {
            const userName = userProfile.first_name ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim() : 'Staff';
            const stored = JSON.parse(localStorage.getItem('unverifiedBills') || '[]');
            setUnverifiedCount(stored.filter((b: any) => b.createdBy === userName).length);
        };
        loadMyUnverified();
    }, [userProfile, activeTab]);

    useEffect(() => {
        localStorage.setItem('staffTheme', theme);
    }, [theme]);

    const checkNotifications = async () => {
        try {
            const response = await api().get(`/api/requests/my-status/${storedUser.id}`);
            const approvedRequests = response.data;

            if (approvedRequests.length > 0) {
                approvedRequests.forEach((req: any) => {
                    showToast(`✅ Profile approved! ${req.first_name} ${req.last_name} — ${req.email}`, 'success');
                    api().put(`/api/requests/acknowledge/${req.id}`);
                });
            }
        } catch (err) {
            console.error("Error checking notifications:", err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            await syncRatesFromSheet();
            const allProducts = getAllProducts();
            setProducts(allProducts);
            
            // Still need to get my profile data for settings/orders if not loaded elsewhere
            // (Assuming user is already in local storage, we skip employee API call to save load time if not strictly needed)
        } catch (err) {
            console.error("Error fetching products:", err);
            // Default to local products if sheet fails
            setProducts(getAllProducts());
        } finally {
            setLoading(false);
        }
    };

    const fetchMyProfile = async () => {
        if (!storedUser.id) return;
        try {
            const response = await api().get('/api/employees');
            const me = response.data.find((e: Employee) => e.id === storedUser.id);
            if (me) {
                setUserProfile(me);
                setFormData({
                    first_name: me.first_name,
                    last_name: me.last_name,
                    email: me.email
                });
                
                // Parse accessible_orderlines from the DB (could be a string or array)
                let parsedOrderLines: number[] = [];
                if (typeof me.accessible_orderlines === 'string') {
                    try { parsedOrderLines = JSON.parse(me.accessible_orderlines); } catch (e) { console.error("Error parsing order lines", e); }
                } else if (Array.isArray(me.accessible_orderlines)) {
                    parsedOrderLines = me.accessible_orderlines;
                }
                
                setUserProfile(prev => ({ ...prev, accessible_orderlines: parsedOrderLines }));
                fetchOrderLines(parsedOrderLines);
            }
        } catch (err) {
            console.error("Error fetching my profile to get order lines:", err);
        }
    };

    const fetchOrderLines = async (authorizedIds: number[] = userProfile.accessible_orderlines || []) => {
        setOlLoading(true);
        try {
            const response = await api().get('/api/order-lines');
            const allOrderLines = response.data;

            if (authorizedIds.length > 0) {
                setOrderLines(allOrderLines.filter((ol: OrderLine) => authorizedIds.includes(ol.id)));
            } else {
                setOrderLines([]);
            }
        } catch (err) {
            console.error("Error fetching order lines:", err);
        } finally {
            setOlLoading(false);
        }
    };

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api().post('/api/requests', {
                employee_id: userProfile.id,
                ...formData
            });
            showToast('Your profile update request has been sent for admin approval.', 'success');
            setShowModal(false);
        } catch (err: any) {
            console.error("Error submitting request:", err);
            showToast(err.response?.data?.error || 'Failed to submit request.', 'error');
        }
    };

    const handleAddSector = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api().post('/api/order-lines', newSector);
            showToast('Sector added successfully!', 'success');
            setShowOlModal(false);
            setNewSector({ name: "", node_id: "" });
            fetchOrderLines();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to add sector', 'error');
        }
    };

    const handleDeleteRequest = async (olId: number) => {
        if (!window.confirm('Send a request to Admin to delete this sector?')) return;
        try {
            await api().post('/api/order-lines/request-delete', {
                order_line_id: olId,
                employee_id: userProfile.id
            });
            showToast('Deletion request sent for approval.', 'info');
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to send deletion request', 'error');
        }
    };

    return {
        state: {
            products, loading, activeTab, showModal, theme, companyName,
            isMobileMenuOpen, unverifiedCount, userProfile, formData,
            orderLines, olLoading, showOlModal, newSector, toasts, profilePic
        },
        actions: {
            setActiveTab, setShowModal, setTheme, setIsMobileMenuOpen,
            setFormData, setShowOlModal, setNewSector, removeToast,
            handleRequestSubmit, handleAddSector, handleDeleteRequest, setProfilePic
        }
    };
};
