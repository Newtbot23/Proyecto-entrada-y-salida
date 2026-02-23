import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../config/api';

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

    const [entityData, setEntityData] = useState<EntityData | null>(null);
    const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
    const [stats, setStats] = useState<DashboardStats>({ vehiculos_ingresados: 0, equipos_propios: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch Entity Details
                const entity = await apiClient.get<EntityData>(`/entidades/${user.nit_entidad}`);
                setEntityData(entity);

                // Fetch License Details
                const license = await apiClient.get<LicenseData>(`/licencia-actual`);
                setLicenseData(license);

                // Fetch Stats
                const statsData = await apiClient.get<DashboardStats>(`/normaladmin/stats`);
                setStats(statsData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (!user) return null;

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                ¡Bienvenido a tu Panel, {user.nombre}!
            </h2>
            <p style={{ color: '#4b5563' }}>
                Administración para la entidad: <b>{entityData?.nombre_entidad || user.nit_entidad}</b>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontWeight: '600' }}>Usuarios Activos</h3>
                    <p style={{ fontSize: '2rem', color: '#16a34a' }}>--</p>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontWeight: '600' }}>Vehículos Ingresados</h3>
                    <p style={{ fontSize: '2rem', color: '#16a34a' }}>{stats.vehiculos_ingresados}</p>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontWeight: '600' }}>Equipos Propios</h3>
                    <p style={{ fontSize: '2rem', color: '#16a34a' }}>{stats.equipos_propios}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Información General</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p><strong style={{ color: '#4b5563' }}>NIT:</strong> {entityData?.nit || '--'}</p>
                        <p><strong style={{ color: '#4b5563' }}>Representante Legal:</strong> {entityData?.nombre_titular || '--'}</p>
                        <p><strong style={{ color: '#4b5563' }}>Teléfono:</strong> {entityData?.telefono || '--'}</p>
                        <p><strong style={{ color: '#4b5563' }}>Nombre de la Entidad:</strong> {entityData?.nombre_entidad || '--'}</p>
                        <p><strong style={{ color: '#4b5563' }}>Correo:</strong> {entityData?.correo || '--'}</p>
                        <p><strong style={{ color: '#4b5563' }}>Dirección:</strong> {entityData?.direccion || '--'}</p>
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
        </div>
    );
};

export default NormalAdminDashboard;
