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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            <div className="app-bg-container"></div>
            <div className="app-bg-overlay"></div>
            <NormalAdminSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            
            <style>{`
                .puertas-layout-main {
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
                    .puertas-layout-main {
                        margin-left: 0 !important;
                        width: 100% !important;
                        padding: 1rem !important;
                    }
                }
            `}</style>

            <main className="puertas-layout-main">
                <NormalAdminHeader />
                <Outlet context={{ user }} />
            </main>
        </div>
    );
};

export default PuertasLayout;
