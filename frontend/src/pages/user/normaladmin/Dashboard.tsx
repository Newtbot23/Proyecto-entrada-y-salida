import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import NormalAdminSidebar from '../../../components/layout/NormalAdminSidebar';
import NormalAdminHeader from '../../../components/layout/NormalAdminHeader';
import ExpirationModal from '../../../components/modals/ExpirationModal';
import { getNormalAdminStats } from '../../../services/authService';
import styles from './Dashboard.module.css';

interface User {
    id: number;
    nombre: string;
    correo: string;
    id_entidad: number;
    license_status?: string;
    license_expired?: boolean;
}

const NormalAdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isLicenseExpired, setIsLicenseExpired] = useState(false);

    // Context query for Stats
    const { data: stats, isLoading: loadingStats } = useQuery({
        queryKey: ['normalAdminStats'],
        queryFn: getNormalAdminStats,
        enabled: !!user, // Only runs when user info is loaded from session
    });

    useEffect(() => {
        const userDataString = sessionStorage.getItem('authUser');
        if (!userDataString) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(userDataString);

            // Security check
            const userRole = Number(userData.id_rol);
            if (userRole === 2) {
                navigate('/user/dashboard');
                return;
            } else if (userRole === 3) {
                navigate('/puertas/personas');
                return;
            } else if (userRole === 4) {
                navigate('/puertas/vehiculos');
                return;
            }

            setUser(userData);

            // Initial check from session
            if (userData.license_status === 'expirado' || userData.license_expired === true) {
                setIsLicenseExpired(true);
            }
        } catch (e) {
            console.error("Error parsing user data", e);
            navigate('/login');
        }
    }, [navigate]);

    // Update expiration state when query data changes
    useEffect(() => {
        if (stats?.license?.estado === 'expirado') {
            setIsLicenseExpired(true);
        } else if (stats?.license?.estado === 'activo') {
            setIsLicenseExpired(false);
        }
    }, [stats]);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    if (!user) return null;

    const isCollapsedClass = isSidebarCollapsed ? styles.mainContentCollapsed : '';

    return (
        <div className={styles.dashboardLayout} style={{ backgroundColor: 'transparent' }}>
            <div className="app-bg-container"></div>
            <div className="app-bg-overlay"></div>
            <ExpirationModal isOpen={isLicenseExpired} />
            <NormalAdminSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            <main className={`${styles.mainContent} ${isCollapsedClass}`} style={{ backgroundColor: 'transparent' }}>
                <NormalAdminHeader />

                <div className={styles.contentWrapper}>
                    <div className={styles.welcomeSection}>
                        <h2 className={styles.welcomeTitle}>
                            ¡Bienvenido a tu Panel, {user.nombre}!
                        </h2>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <h3 className={styles.statLabel}>
                                Usuarios Activos
                            </h3>
                            <p className={styles.statValue}>
                                {loadingStats ? '...' : stats?.active_users ?? '0'}
                            </p>
                        </div>
                        <div className={styles.statCard}>
                            <h3 className={styles.statLabel}>
                                Accesos Diarios
                            </h3>
                            <p className={styles.statValue}>
                                {loadingStats ? '...' : stats?.daily_accesses ?? '0'}
                            </p>
                        </div>
                        <div className={styles.statCard}>
                            <h3 className={styles.statLabel}>
                                Estado de la Licencia
                            </h3>
                            <p className={styles.statValue} style={{
                                color: loadingStats ? '#9ca3af' : (stats?.license?.estado === 'activo' ? 'var(--color-success)' : (stats?.license?.estado === 'pendiente' ? 'var(--color-warning)' : 'var(--color-danger)'))
                            }}>
                                {loadingStats ? 'Cargando...' : (stats?.license?.estado ? stats.license.estado.charAt(0).toUpperCase() + stats.license.estado.slice(1) : 'Desconocido')}
                            </p>
                            {!loadingStats && stats?.license?.estado === 'pendiente' && (
                                <button
                                    onClick={() => navigate('/license-payment')}
                                    className={styles.payButton}
                                >
                                    Cargar Pago
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoCardHeader}>
                            <h3 className={styles.infoCardTitle}>Información General de la Empresa</h3>
                            <span className={styles.planBadge}>
                                Plan: {stats?.license?.plan_nombre ?? 'Cargando...'}
                            </span>
                        </div>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoGroup}>
                                <label>Nombre de la Entidad</label>
                                <p className={styles.infoValue}>{stats?.entity?.nombre ?? 'Cargando...'}</p>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>NIT</label>
                                <p className={styles.infoValue}>{stats?.entity?.nit ?? 'Cargando...'}</p>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Vencimiento de Licencia</label>
                                <p className={styles.infoValueDanger}>
                                    {stats?.license?.fecha_vencimiento ? new Date(stats.license.fecha_vencimiento).toLocaleDateString() : 'Cargando...'}
                                </p>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Dirección</label>
                                <p className={styles.infoValue}>{stats?.entity?.direccion ?? 'No especificada'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NormalAdminDashboard;
