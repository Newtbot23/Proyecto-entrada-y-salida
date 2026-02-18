import React, { useState, useEffect } from 'react';
import styles from './MainPageDashborad.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import StatCard from '../../components/dashboard/StatCard';
import LicenseTable from '../../components/dashboard/LicenseTable';
import { getDashboardStats, getLicensesList, type DashboardStats, type LicenseData } from '../../services/licenseDashboardService';

const MainPageDashborad: React.FC = () => {
    // Mobile sidebar state
    const [isMobileSidebarOpen] = useState(false);
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
        // Get admin user from sessionStorage
        const adminUserStr = sessionStorage.getItem('adminUser');
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
        // Clear all admin-related items from sessionStorage
        sessionStorage.clear();
        // Force redirect to login
        window.location.replace('/superadmin/login');
    };

    const statCards = [
        {
            title: 'Instituciones Activas',
            value: stats?.active_institutions ?? 0,
            subtitle: 'Actualmente activas'
        },
        {
            title: 'Licencias por Expirar',
            value: stats?.expiring_licenses ?? 0,
            subtitle: 'Próximos 30 días'
        },
        {
            title: 'Ingresos Mensuales',
            value: `${(stats?.total_revenue ?? 0).toLocaleString()}$`,
            subtitle: 'Total ganado'
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
                <Header title="Panel" userName={adminName} role="Administrador" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    {/* Stats Row */}
                    <div className={styles.statsGrid}>
                        {loading ? (
                            <p>Cargando estadísticas...</p>
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
                        <p>Cargando licencias...</p>
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
