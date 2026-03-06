import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NormalAdminSidebar from '../../../components/layout/NormalAdminSidebar';
import NormalAdminHeader from '../../../components/layout/NormalAdminHeader';
import ExpirationModal from '../../../components/modals/ExpirationModal';

interface User {
    id: number;
    nombre: string;
    correo: string;
    id_entidad: number;
    nit_entidad: string;
    license_status?: string;
    license_expired?: boolean;
}

interface EntityData {
    nit: string;
    nombre_entidad: string;
    correo: string;
    direccion: string;
    nombre_titular: string;
    telefono: string;
}

interface LicenseData {
    id: number;
    referencia_pago: string;
    fecha_vencimiento: string;
    estado: string;
    plan?: {
        nombre_plan: string;
    };
}

interface DashboardStats {
    vehiculos_ingresados: number;
    equipos_propios: number;
}

const NormalAdminDashboard: React.FC = () => {
    const { user } = useOutletContext<{ user: User }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isLicenseExpired, setIsLicenseExpired] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const userDataString = sessionStorage.getItem('userData');
        if (!userDataString) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(userDataString);

            // Security check: Only role 1 should be here
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

            // Check initial license status from session, but fetchStats will update it with fresh data
            if (userData.license_status === 'expirado' || userData.license_expired === true) {
                setIsLicenseExpired(true);
            }

            fetchStats();
        } catch (e) {
            console.error("Error parsing user data", e);
            navigate('/login');
        }
    }, [navigate]);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/normal-admin/stats`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                }
            );
            const result = await response.json();
            if (result.success) {
                setStats(result.data);
                // Update expiration modal based on real-time license status
                if (result.data.license?.estado === 'expirado') {
                    setIsLicenseExpired(true);
                } else {
                    setIsLicenseExpired(false);
                }
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    if (!user) return null;

    return (
        <div>
            <ExpirationModal isOpen={isLicenseExpired} />
            <NormalAdminSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            <main style={contentStyle}>
                <NormalAdminHeader />

                <div style={{ marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        ¡Bienvenido a tu Panel, {user.nombre}!
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Usuarios Activos
                            </h3>
                            <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#008f39', marginTop: '0.5rem' }}>
                                {loadingStats ? '...' : stats?.active_users ?? '0'}
                            </p>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Accesos Diarios
                            </h3>
                            <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#008f39', marginTop: '0.5rem' }}>
                                {loadingStats ? '...' : stats?.daily_accesses ?? '0'}
                            </p>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Estado de la Licencia
                            </h3>
                            <p style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: loadingStats ? '#9ca3af' : (stats?.license?.estado === 'activo' ? '#008f39' : (stats?.license?.estado === 'pendiente' ? '#d97706' : '#dc2626')),
                                marginTop: '0.5rem'
                            }}>
                                {loadingStats ? 'Cargando...' : (stats?.license?.estado ? stats.license.estado.charAt(0).toUpperCase() + stats.license.estado.slice(1) : 'Desconocido')}
                            </p>
                            {!loadingStats && stats?.license?.estado === 'pendiente' && (
                                <button
                                    onClick={() => navigate('/license-payment')}
                                    style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Cargar Pago
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Nueva Card: Información General de la Empresa */}
                    <div style={{ marginTop: '2rem', background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Información General de la Empresa</h3>
                            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                Plan: {stats?.license?.plan_nombre ?? 'Cargando...'}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                            <div>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Nombre de la Entidad</p>
                                <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{stats?.entity?.nombre ?? 'Cargando...'}</p>
                            </div>
                            <div>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>NIT</p>
                                <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{stats?.entity?.nit ?? 'Cargando...'}</p>
                            </div>
                            <div>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Vencimiento de Licencia</p>
                                <p style={{ fontWeight: '600', fontSize: '1.125rem', color: '#dc2626' }}>
                                    {stats?.license?.fecha_vencimiento ? new Date(stats.license.fecha_vencimiento).toLocaleDateString() : 'Cargando...'}
                                </p>
                            </div>
                            <div>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Dirección</p>
                                <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{stats?.entity?.direccion ?? 'No especificada'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Licencia y Plan</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p><strong style={{ color: '#4b5563' }}>Plan Actual:</strong> {licenseData?.plan?.nombre_plan || '--'}</p>
                        <p><strong style={{ color: '#4b5563' }}>Expira el:</strong> {licenseData?.fecha_vencimiento ? new Date(licenseData.fecha_vencimiento).toLocaleDateString() : '--'}</p>
                        <p><strong style={{ color: '#4b5563' }}>Estado de Licencia:</strong>
                            <span style={{
                                marginLeft: '0.5rem',
                                color: licenseData?.estado === 'activo' || licenseData?.estado === 'activa' ? '#16a34a' : (licenseData?.estado === 'pendiente' ? '#d97706' : '#dc2626'),
                                fontWeight: 'bold'
                            }}>
                                {licenseData?.estado ? licenseData.estado.charAt(0).toUpperCase() + licenseData.estado.slice(1) : '--'}
                            </span>
                        </p>
                        <p><strong style={{ color: '#4b5563' }}>Ref de Pago:</strong> {licenseData?.referencia_pago || '--'}</p>
                    </div>
                    {licenseData?.estado === 'pendiente' && (
                        <button
                            onClick={() => navigate('/license-payment')}
                            style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                        >
                            Cargar Pago
                        </button>
                    )}
                </div>
        </div>
        </div >
    );
};

export default NormalAdminDashboard;
