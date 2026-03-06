import React, { useState, useEffect } from 'react';
import styles from './MainPageDashborad.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import StatCard from '../../components/dashboard/StatCard';
import LicenseTable from '../../components/dashboard/LicenseTable';
import { getDashboardStats, getLicensesList, type DashboardStats, type LicenseData } from '../../services/licenseDashboardService';
import { getPricingPlans, type PricingPlan } from '../../services/planService';
import type { PaginationMeta } from '../../types/institution';
import { useNavigate } from 'react-router-dom';

const MainPageDashborad: React.FC = () => {
    // Mobile sidebar state
    const [isMobileSidebarOpen] = useState(false);
    // Desktop sidebar collapsed state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const navigate = useNavigate();

    // Data state
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [licenses, setLicenses] = useState<LicenseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [plansList, setPlansList] = useState<PricingPlan[]>([]);
    const [filtersLoading, setFiltersLoading] = useState(false);

    useEffect(() => {
        // Load plans for the filter
        const loadPlans = async () => {
            try {
                const plans = await getPricingPlans();
                setPlansList(plans);
            } catch (e) {
                console.error('Error al las licencias:', e);
            }
        };
        loadPlans();

        fetchDashboardData();
        checkAuth();
    }, [navigate]);

    // Effect to trigger search/filter when states change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1); // Reset to first page on new filter
            fetchDashboardData(1);
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedStatus, selectedPlanId]);

    const fetchDashboardData = async (page = currentPage) => {
        try {
            if (page === 1 && !searchTerm && !selectedStatus && !selectedPlanId) {
                setLoading(true);
            } else {
                setFiltersLoading(true);
            }

            const [statsData, licensesData] = await Promise.all([
                getDashboardStats(),
                getLicensesList(page, 10, searchTerm, selectedStatus, selectedPlanId)
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
            setFiltersLoading(true);
            const licensesData = await getLicensesList(page, 10, searchTerm, selectedStatus, selectedPlanId);
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
            setFiltersLoading(false);
        }
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
                <button onClick={() => fetchDashboardData()}>Retry</button>
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

                    {/* Filters Section */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        backgroundColor: '#fff',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        alignItems: 'flex-end'
                    }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#555', fontWeight: '500' }}>
                                Buscar Entidad o ID
                            </label>
                            <input
                                type="text"
                                placeholder="Escribe para buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>

                        <div style={{ flex: '1 1 200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#555', fontWeight: '500' }}>
                                Estado
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Todos los Estados</option>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="expirado">Expirado</option>
                            </select>
                        </div>

                        <div style={{ flex: '1 1 200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#555', fontWeight: '500' }}>
                                Plan
                            </label>
                            <select
                                value={selectedPlanId}
                                onChange={(e) => setSelectedPlanId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer'
                                }}
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
                    {(loading && licenses.length === 0) || filtersLoading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            <p style={{ color: '#666', fontSize: '1.1rem' }}>Cargando licencias...</p>
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

export default MainPageDashborad;
