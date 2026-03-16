import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import UserHeader from './UserHeader';

interface User {
    id?: number | string;
    doc?: string;
    nombre: string;
    correo: string;
    id_entidad?: number;
    id_rol: number;
    codigo_qr?: string;
}

const UserLayout: React.FC = () => {
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
                // Security check for role
                if (userData.id_rol !== 2) {
                    navigate('/dashboard'); // Only role 2 here
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
        backgroundColor: '#f3f4f6'
    };

    return (
        <div>
            <UserSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            <main style={contentStyle}>
                <UserHeader />
                <Outlet context={{ user }} />
            </main>
        </div>
    );
};

export default UserLayout;
