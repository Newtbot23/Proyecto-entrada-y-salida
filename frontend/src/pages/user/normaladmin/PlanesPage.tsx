import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const AdminPlanesPage: React.FC = () => {
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

    const handleLogout = () => {
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        window.location.replace('/login');
    };

    return (
        <DashboardLayout
            title="Mi Plan y Licencia"
            userName={userData.nombre || 'Admin'}
            roleLabel="Administrador"
            role="admin"
            onLogout={handleLogout}
        >
            <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2>Estado de tu Plan</h2>
                <p>Aquí puedes ver los detalles de tu suscripción actual.</p>

                <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Plan Corporativo</h3>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                            ACTIVO
                        </span>
                    </div>
                    <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>Próxima fecha de pago: 12 de Marzo, 2026</p>
                    <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#008f39', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Gestionar Suscripción
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminPlanesPage;
