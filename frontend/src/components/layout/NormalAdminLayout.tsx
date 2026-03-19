import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import NormalAdminSidebar from './NormalAdminSidebar';
import NormalAdminHeader from './NormalAdminHeader';

interface User {
    id: number;
    nombre: string;
    correo: string;
    id_entidad: number;
    id_rol: number;
    license_status?: string;
    license_expired?: boolean;
}

const NormalAdminLayout: React.FC = () => {
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

                // Security check: Only role 1 should be here
                const userRole = Number(userData.id_rol);
                if (userRole === 2) {
                    navigate('/user/dashboard');
                    return;
                }
                // Roles 1 (Admin), 3 (Door People), 4 (Door Vehicles) use this layout

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
            <NormalAdminSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            
            <style>{`
                .normal-admin-main {
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
                    .normal-admin-main {
                        margin-left: 0 !important;
                        width: 100% !important;
                        padding: 1rem !important;
                    }
                }
            `}</style>
            
            <main className="normal-admin-main">
                <NormalAdminHeader />
                <Outlet context={{ user }} />
            </main>
        </div>
    );
};

export default NormalAdminLayout;
