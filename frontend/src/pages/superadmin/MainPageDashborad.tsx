import React, { useState, useEffect } from 'react';
import styles from './MainPageDashborad.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import StatCard from '../../components/dashboard/StatCard';
import LicenseTable from '../../components/dashboard/LicenseTable';
import { getDashboardStats, getLicensesList, type DashboardStats, type LicenseData } from '../../services/licenseDashboardService';
import type { PaginationMeta } from '../../types/institution';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

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
                getLicensesList(currentPage, 10)
            ]);
            setStats(statsData);
            setLicenses(licensesData.data);
            setPaginationMeta({
                currentPage: licensesData.current_page,
                totalPages: licensesData.last_page,
                totalItems: licensesData.total,
                itemsPerPage: licensesData.per_page,
            });
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

    const handlePageChange = async (page: number) => {
        setCurrentPage(page);
        try {
            setLoading(true);
            const licensesData = await getLicensesList(page, 10);
            setLicenses(licensesData.data);
            setPaginationMeta({
                currentPage: licensesData.current_page,
                totalPages: licensesData.last_page,
                totalItems: licensesData.total,
                itemsPerPage: licensesData.per_page,
            });
        } catch (err) {
            console.error('Error loading licenses data:', err);
        } finally {
            setLoading(false);
        }
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
                <Header />

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
                    {loading && licenses.length === 0 ? (
                        <p>Cargando licencias...</p>
                    ) : (
                        <LicenseTable
                            data={licenses}
                            paginationMeta={paginationMeta}
                            onPageChange={handlePageChange}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default MainPageDashborad;
