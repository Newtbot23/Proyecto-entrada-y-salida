import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ExpirationModal from '../modals/ExpirationModal';

interface User {
    id: number;
    nombre: string;
    correo: string;
    id_entidad: number;
    license_status?: string;
    license_expired?: boolean;
}

const NormalAdminLayout: React.FC = () => {
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
            <Sidebar
                isCollapsed={false}
                onToggle={() => { }} // No-op, but required by type? Optional chaining in sidebar or no-op here.
                userType="normal"
                showToggle={false}
            />
            <main style={contentStyle}>
                <Header
                    title="Panel de Administración"
                    userName={user.nombre}
                    onLogout={handleLogout}
                />

                {/* Child content will be rendered here */}
                <Outlet context={{ user }} />
            </main>
        </div>
    );
};

export default NormalAdminLayout;
