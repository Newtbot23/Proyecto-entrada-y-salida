import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const AdminUsersPage: React.FC = () => {
    const userData = JSON.parse(sessionStorage.getItem('authUser') || '{}');

    return (
        <DashboardLayout>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2>Usuarios de la Entidad</h2>
                        <p>Gestiona los accesos y roles de tu personal.</p>
                    </div>
                    <button style={{ padding: '0.625rem 1.25rem', backgroundColor: '#008f39', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                        + Agregar Usuario
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f3f4f6' }}>
                                <th style={{ padding: '1rem' }}>Nombre</th>
                                <th style={{ padding: '1rem' }}>Correo</th>
                                <th style={{ padding: '1rem' }}>Rol</th>
                                <th style={{ padding: '1rem' }}>Estado</th>
                                <th style={{ padding: '1rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '1rem' }}>{userData.nombre || 'Juan Pérez'}</td>
                                <td style={{ padding: '1rem' }}>{userData.correo || 'juan@ejemplo.com'}</td>
                                <td style={{ padding: '1rem' }}>Administrador</td>
                                <td style={{ padding: '1rem' }}><span style={{ color: '#059669' }}>Activo</span></td>
                                <td style={{ padding: '1rem' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginRight: '0.5rem' }}>Editar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminUsersPage;
