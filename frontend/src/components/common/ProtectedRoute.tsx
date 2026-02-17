import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Route Guard for SuperAdmin routes.
 * Checks for adminToken in localStorage.
 */
const ProtectedRoute: React.FC = () => {
    const adminToken = sessionStorage.getItem('adminToken');

    if (!adminToken) {
        // Redirect to login if no token found
        return <Navigate to="/superadmin/login" replace />;
    }

    // Render child routes
    return <Outlet />;
};

export default ProtectedRoute;
