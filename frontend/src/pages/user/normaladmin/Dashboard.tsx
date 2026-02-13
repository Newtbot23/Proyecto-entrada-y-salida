import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/layout/Sidebar'; // Assuming same layout
import Header from '../../../components/layout/Header';
import ExpirationModal from '../../../components/modals/ExpirationModal';

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

    useEffect(() => {
        const userDataString = sessionStorage.getItem('userData');
        if (!userDataString) {
            navigate('/login');
        } else {
            try {
                const userData = JSON.parse(userDataString);
                setUser(userData);

                // Check license status
                if (userData.license_status === 'expirado' || userData.license_expired === true) {
                    setIsLicenseExpired(true);
                }
            } catch (e) {
                console.error("Error parsing user data", e);
                navigate('/login');
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    if (!user) return null;

    // Simple dashboard content
    const contentStyle = {
        padding: '2rem',
        marginLeft: isSidebarCollapsed ? '80px' : '260px',
        transition: 'margin-left 0.3s',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
    };

    return (
        <div>
            <ExpirationModal isOpen={isLicenseExpired} />
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            <main style={contentStyle}>
                <Header
                    title="Admin Dashboard"
                    userName={user.nombre}
                    onLogout={handleLogout}
                />

                <div style={{ marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Welcome to your Dashboard, {user.nombre}!
                    </h2>
                    <p style={{ color: '#4b5563' }}>
                        Administration for entity: <b>{user.id_entidad}</b>
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontWeight: '600' }}>Active Users</h3>
                            <p style={{ fontSize: '2rem', color: '#008f39' }}>--</p>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontWeight: '600' }}>Daily Access</h3>
                            <p style={{ fontSize: '2rem', color: '#008f39' }}>--</p>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontWeight: '600' }}>License Status</h3>
                            <p style={{ fontSize: '2rem', color: user.license_status === 'activo' ? '#008f39' : (user.license_status === 'pendiente' ? '#d97706' : '#dc2626') }}>
                                {user.license_status ? user.license_status.charAt(0).toUpperCase() + user.license_status.slice(1) : 'Unknown'}
                            </p>
                            {user.license_status === 'pendiente' && (
                                <button
                                    onClick={() => navigate('/license-payment')}
                                    style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Upload Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NormalAdminDashboard;
