import React from 'react';
import { Navigate } from 'react-router-dom';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

interface ProtectedRouteProps {
    children: React.ReactElement;
    requiredRole?: 'admin' | 'staff';
}

// Keys to preserve across logout/session expiry (non-sensitive app settings)
const PERSISTENT_KEYS = ['nextInvoiceNo', 'lastInvoiceNo', 'adminTheme', 'companyName'];

const clearAuthStorage = () => {
    // Save persistent values before clearing
    const preserved: Record<string, string | null> = {};
    PERSISTENT_KEYS.forEach(k => { preserved[k] = localStorage.getItem(k); });
    localStorage.clear();
    // Restore them
    PERSISTENT_KEYS.forEach(k => { if (preserved[k] !== null) localStorage.setItem(k, preserved[k]!); });
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const userRaw = localStorage.getItem('user');
    const loginTime = localStorage.getItem('loginTime');
    const token = localStorage.getItem('token');

    // Check all auth artifacts exist
    if (!userRaw || !loginTime || !token) {
        clearAuthStorage();
        return <Navigate to="/login" replace />;
    }

    // Check if session has expired
    const elapsed = Date.now() - parseInt(loginTime, 10);
    if (elapsed > SESSION_DURATION_MS) {
        clearAuthStorage();
        return <Navigate to="/login" replace />;
    }

    // Parse user and check role
    try {
        const user = JSON.parse(userRaw);
        if (requiredRole && user.role !== requiredRole) {
            // Wrong role — redirect to appropriate dashboard
            return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} replace />;
        }
    } catch {
        clearAuthStorage();
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
