import React, { useState, useEffect } from 'react';
import styles from './MainPageDashborad.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import StatCard from '../../components/dashboard/StatCard';
import LicenseTable from '../../components/dashboard/LicenseTable';
import { getDashboardStats, getLicensesList, activateLicense, type DashboardStats, type LicenseData } from '../../services/licenseDashboardService';

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

    useEffect(() => {
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
        console.log('Logging out...');
        // Clear admin-related items from localStorage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        // Redirect to login page
        window.location.href = '/login';
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

    const handleActivateLicense = async (id: number) => {
        try {
            await activateLicense(id);
            await fetchDashboardData();
        } catch (err) {
            console.error('Error activating license:', err);
            alert('Failed to activate license');
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
                <Header title="Dashboard" userName="Super Admin" onLogout={handleLogout} />

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
                            onActivate={handleActivateLicense}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default MainPageDashborad;
