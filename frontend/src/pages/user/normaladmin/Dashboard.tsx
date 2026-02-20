import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

interface User {
    id: number;
    nombre: string;
    correo: string;
    id_entidad: number;
    license_status?: string;
    license_expired?: boolean;
}

const NormalAdminDashboard: React.FC = () => {
    const { user } = useOutletContext<{ user: User }>();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                ¡Bienvenido a tu Panel, {user.nombre}!
            </h2>
            <p style={{ color: '#4b5563' }}>
                Administración para la entidad: <b>{user.id_entidad}</b>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontWeight: '600' }}>Usuarios Activos</h3>
                    <p style={{ fontSize: '2rem', color: '#008f39' }}>--</p>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontWeight: '600' }}>Accesos Diarios</h3>
                    <p style={{ fontSize: '2rem', color: '#008f39' }}>--</p>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontWeight: '600' }}>Estado de la Licencia</h3>
                    <p style={{ fontSize: '2rem', color: user.license_status === 'activo' ? '#008f39' : (user.license_status === 'pendiente' ? '#d97706' : '#dc2626') }}>
                        {user.license_status ? user.license_status.charAt(0).toUpperCase() + user.license_status.slice(1) : 'Desconocido'}
                    </p>
                    {user.license_status === 'pendiente' && (
                        <button
                            onClick={() => navigate('/license-payment')}
                            style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
