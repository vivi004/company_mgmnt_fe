import React from 'react';
import { Navigate } from 'react-router-dom';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

interface ProtectedRouteProps {
    children: React.ReactElement;
    requiredRole?: 'admin' | 'staff';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const userRaw = localStorage.getItem('user');
    const loginTime = localStorage.getItem('loginTime');
    const token = localStorage.getItem('token');

    // Check all auth artifacts exist
    if (!userRaw || !loginTime || !token) {
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }

    // Check if session has expired
    const elapsed = Date.now() - parseInt(loginTime, 10);
    if (elapsed > SESSION_DURATION_MS) {
        localStorage.clear();
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
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
