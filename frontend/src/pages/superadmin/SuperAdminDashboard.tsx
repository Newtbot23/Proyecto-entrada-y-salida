import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styles from './SuperAdminDashboard.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import StatCard from '../../components/dashboard/StatCard';
import LicenseTable from '../../components/dashboard/LicenseTable';
import { getDashboardStats, getLicensesList } from '../../services/licenseDashboardService';
import { getPricingPlans } from '../../services/planService';

const SuperAdminDashboard: React.FC = () => {
    // Desktop sidebar collapsed state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Pagination/Filter states
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState('');

    // Query for Stats
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: getDashboardStats,
    });

    // Query for Plans (used in filters)
    const { data: plansList = [] } = useQuery({
        queryKey: ['plans'],
        queryFn: getPricingPlans,
    });

    // Query for Licenses (Main Table)
    const {
        data: licensesData,
        isLoading: licensesLoading,
        isPlaceholderData
    } = useQuery({
        queryKey: ['licenses', currentPage, searchTerm, selectedStatus, selectedPlanId],
        queryFn: () => getLicensesList(currentPage, 10, searchTerm, selectedStatus, selectedPlanId),
        placeholderData: (previousData) => previousData, // Maintain UI stability while refetching
    });

    const licenses = licensesData?.data || [];
    const paginationMeta = licensesData ? {
        currentPage: licensesData.current_page,
        totalPages: licensesData.last_page,
        totalItems: licensesData.total,
        itemsPerPage: licensesData.per_page,
    } : null;

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleFilterChange = (setter: (val: string) => void, value: string) => {
        setter(value);
        setCurrentPage(1); // Reset to first page on filter change
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

    const queryClient = useQueryClient();

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const { updateLicenseStatus } = await import('../../services/licenseDashboardService');
            await updateLicenseStatus(id, status);
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
        } catch (err) {
            console.error(`Error updating license status to ${status}:`, err);
            alert(`Failed to update license status to ${status}`);
        }
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar
                isOpen={false} // Assuming mobile sidebar is handled elsewhere or not used here
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
            />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header />

                <div className={styles.contentWrapper}>
                    {/* Stats Row */}
                    <div className={styles.statsGrid}>
                        {statsLoading ? (
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

                    {/* Filters Section */}
                    <div className={styles.filtersContainer}>
                        <div className={styles.filterGroupLarge}>
                            <label className={styles.filterLabel}>
                                Buscar Entidad o ID
                            </label>
                            <input
                                type="text"
                                className={styles.filterInput}
                                placeholder="Escribe para buscar..."
                                value={searchTerm}
                                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>
                                Estado
                            </label>
                            <select
                                className={styles.filterSelect}
                                value={selectedStatus}
                                onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
                            >
                                <option value="">Todos los Estados</option>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="expirado">Expirado</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>
                                Plan
                            </label>
                            <select
                                className={styles.filterSelect}
                                value={selectedPlanId}
                                onChange={(e) => handleFilterChange(setSelectedPlanId, e.target.value)}
                            >
                                <option value="">Todos los Planes</option>
                                {plansList.map(plan => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    {licensesLoading && !isPlaceholderData ? (
                        <div className={styles.loadingPlaceholder}>
                            <p className={styles.loadingText}>Cargando licencias...</p>
                        </div>
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

export default SuperAdminDashboard;
