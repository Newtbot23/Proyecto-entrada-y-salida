import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const AdminReportsPage: React.FC = () => {
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

    const handleLogout = () => {
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        window.location.replace('/login');
    };

    const reportCards = [
        { title: 'Reporte de Asistencia', description: 'Entradas y salidas detalladas por rango de fecha.' },
        { title: 'Reporte de Incidencias', description: 'Novedades reportadas durante el turno.' },
        { title: 'Resumen Mensual', description: 'Estadísticas generales de uso del sistema.' },
    ];

    return (
        <DashboardLayout
            title="Reportes"
            userName={userData.nombre || 'Admin'}
            roleLabel="Administrador"
            role="admin"
            onLogout={handleLogout}
        >
            <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2>Centro de Reportes</h2>
                <p>Genera y exporta la información de tu entidad.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                    {reportCards.map((report, index) => (
                        <div key={index} style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>{report.title}</h3>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#4b5563' }}>{report.description}</p>
                            <button style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#008f39', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                                Generar Reporte →
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminReportsPage;
