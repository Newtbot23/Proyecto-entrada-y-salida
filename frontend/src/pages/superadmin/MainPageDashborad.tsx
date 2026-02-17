import React, { useState, useEffect } from 'react';
import styles from './MainPageDashborad.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import StatCard from '../../components/dashboard/StatCard';
import LicenseTable from '../../components/dashboard/LicenseTable';
import { getDashboardStats, getLicensesList, type DashboardStats, type LicenseData } from '../../services/licenseDashboardService';

const MainPageDashborad: React.FC = () => {
    // Mobile sidebar state
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    // Desktop sidebar collapsed state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Data state
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [licenses, setLicenses] = useState<LicenseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dynamic Admin Info
    const [adminName, setAdminName] = useState('Super Admin');

    useEffect(() => {
        // Get admin user from localStorage
        const adminUserStr = localStorage.getItem('adminUser');
        if (adminUserStr) {
            try {
                const adminUser = JSON.parse(adminUserStr);
                setAdminName(adminUser.nombre || 'Super Admin');
            } catch (e) {
                console.error('Error parsing admin user:', e);
            }
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, licensesData] = await Promise.all([
                getDashboardStats(),
                getLicensesList(1, 10)
            ]);
            setStats(statsData);
            setLicenses(licensesData.data);
            setError(null);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            const message = err instanceof Error ? err.message : String(err);
            setError(`Failed to load dashboard data: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleLogout = () => {
        // Clear all admin-related items to prevent back-button access
        localStorage.clear();
        // Force redirect to login
        window.location.replace('/superadmin/login');
    };

    const statCards = [
        {
            title: 'Active Institutions',
            value: stats?.active_institutions ?? 0,
            subtitle: 'Currently active'
        },
        {
            title: 'Licenses About to Expire',
            value: stats?.expiring_licenses ?? 0,
            subtitle: 'Next 30 days'
        },
        {
            title: 'Monthly Revenue',
            value: `${(stats?.total_revenue ?? 0).toLocaleString()}$`,
            subtitle: 'Total earned'
        },
    ];

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>{error}</p>
                <button onClick={fetchDashboardData}>Retry</button>
            </div>
        );
    }


    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const { updateLicenseStatus } = await import('../../services/licenseDashboardService');
            await updateLicenseStatus(id, status);
            await fetchDashboardData();
        } catch (err) {
            console.error(`Error updating license status to ${status}:`, err);
            alert(`Failed to update license status to ${status}`);
        }
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar
                isOpen={isMobileSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
            />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="Dashboard" userName={adminName} role="Administrador" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    {/* Stats Row */}
                    <div className={styles.statsGrid}>
                        {loading ? (
                            <p>Loading stats...</p>
                        ) : (
                            statCards.map((stat, index) => (
                                <StatCard
                                    key={index}
                                    title={stat.title}
                                    value={stat.value}
                                    subtitle={stat.subtitle}
                                />
                            ))
                        )}
                    </div>

                    {/* Recent Activity Table */}
                    {loading ? (
                        <p>Loading licenses...</p>
                    ) : (
                        <LicenseTable
                            data={licenses}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default MainPageDashborad;
