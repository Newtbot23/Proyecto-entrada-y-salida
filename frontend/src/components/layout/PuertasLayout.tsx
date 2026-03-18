import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import NormalAdminSidebar from './NormalAdminSidebar';
import NormalAdminHeader from './NormalAdminHeader';

interface User {
    id: number;
    nombre: string;
    correo: string;
    id_entidad: number;
    nit_entidad: string;
    id_rol: number;
    license_status?: string;
    license_expired?: boolean;
}

const PuertasLayout: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const userDataString = sessionStorage.getItem('authUser');
        if (!userDataString) {
            navigate('/login');
        } else {
            try {
                const userData = JSON.parse(userDataString);
                // Extra security: if not role 3 and not 4, redirect
                if (userData.id_rol !== 3 && userData.id_rol !== 4) {
                    navigate('/login');
                    return;
                }
                setUser(userData);
            } catch (e) {
                console.error("Error parsing user data", e);
                navigate('/login');
            }
        }
    }, [navigate]);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    if (!user) return null;

    const contentStyle = {
        padding: '2rem',
        marginLeft: isSidebarCollapsed ? '80px' : '260px',
        transition: 'margin-left 0.3s',
        minHeight: '100vh',
        backgroundColor: 'transparent'
    };

    return (
        <div>
            <div className="app-bg-container"></div>
            <div className="app-bg-overlay"></div>
            <NormalAdminSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            <main style={contentStyle}>
                <NormalAdminHeader />
                <Outlet context={{ user }} />
            </main>
        </div>
    );
};

export default PuertasLayout;
