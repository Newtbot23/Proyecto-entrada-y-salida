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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            <div className="app-bg-container"></div>
            <div className="app-bg-overlay"></div>
            <UserSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            
            <style>{`
                .user-layout-main {
                    flex: 1;
                    margin-left: ${isSidebarCollapsed ? '80px' : '260px'};
                    width: calc(100% - ${isSidebarCollapsed ? '80px' : '260px'});
                    transition: all 0.3s ease-in-out;
                    min-height: 100vh;
                    background-color: transparent;
                    padding: 2rem;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                }
                @media (max-width: 768px) {
                    .user-layout-main {
                        margin-left: 0 !important;
                        width: 100% !important;
                        padding: 1rem !important;
                    }
                }
            `}</style>

            <main className="user-layout-main">
                <UserHeader />
                <Outlet context={{ user }} />
            </main>
        </div>
    );
};

export default UserLayout;
