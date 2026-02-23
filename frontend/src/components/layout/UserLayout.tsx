import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Header from './Header'; // Reusing Header if possible, or we can make a custom one
import ExpirationModal from '../modals/ExpirationModal';

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

const UserLayout: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isLicenseExpired, setIsLicenseExpired] = useState(false);

    useEffect(() => {
        const userDataString = sessionStorage.getItem('userData');
        if (!userDataString) {
            navigate('/login');
        } else {
            try {
                const userData = JSON.parse(userDataString);
                
                // Extra security: if not role 2 or 1, maybe redirect
                if (userData.id_rol !== 2 && userData.id_rol !== 1) {
                    navigate('/login');
                    return;
                }

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

    if (!user) return null;

    const contentStyle = {
        padding: '2rem',
        margin: '0 auto',
        maxWidth: '1200px',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
    };

    return (
        <div>
            <ExpirationModal isOpen={isLicenseExpired} />
            <Header
                title="Panel de Usuario"
                userName={user.nombre}
                onLogout={handleLogout}
            />
            <main style={contentStyle}>
                {/* Child content will be rendered here */}
                <Outlet context={{ user }} />
            </main>
        </div>
    );
};

export default UserLayout;
