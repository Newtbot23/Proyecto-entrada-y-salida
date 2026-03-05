import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

/**
 * Route Guard for SuperAdmin routes.
 * Checks for adminToken in localStorage.
 */
const ProtectedRoute: React.FC = () => {
    const navigate = useNavigate();
    const adminToken = sessionStorage.getItem('adminToken');

    useEffect(() => {
        const checkBackNavigation = (event?: PageTransitionEvent) => {
            let isBackFromExternal = false;

            // 1. Check if the page is loaded from bfcache (Back/Forward Cache)
            if (event?.persisted) {
                isBackFromExternal = true;
            }
            // 2. Fallback: Check modern PerformanceNavigationTiming API
            else if (window.performance && window.performance.getEntriesByType) {
                const navEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
                if (navEntries.length > 0 && navEntries[0].type === 'back_forward') {
                    isBackFromExternal = true;
                }
            }
            // 3. Fallback for older browsers
            else if (window.performance && window.performance.navigation) {
                if (window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD) {
                    isBackFromExternal = true;
                }
            }

            // If we detected that the user pressed "Back" from an external site, forcefully logout
            // This prevents bfcache from restoring a protected view if navigate away and back
            if (isBackFromExternal) {
                sessionStorage.removeItem('adminToken');
                sessionStorage.removeItem('adminUser');
                navigate('/superadmin/login', { replace: true });
            }
        };

        // Run on initial mount
        checkBackNavigation();

        // Listen for pageshow events (bfcache restoration)
        window.addEventListener('pageshow', checkBackNavigation);

        return () => {
            window.removeEventListener('pageshow', checkBackNavigation);
        };
    }, [navigate]);

    if (!adminToken) {
        // Redirect to login if no token found
        return <Navigate to="/superadmin/login" replace />;
    }

    // Render child routes
    return <Outlet />;
};

export default ProtectedRoute;
