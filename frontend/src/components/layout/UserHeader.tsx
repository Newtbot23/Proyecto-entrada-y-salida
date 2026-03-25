import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './NormalAdminHeader.module.css'; // Reusing styles

const UserHeader: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout(); // This already handles state and sessionStorage in context
        navigate('/', { replace: true });
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <h1 className={styles.pageTitle}>Portal de Usuario</h1>
            </div>
            <div className={styles.headerRight}>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    Cerrar Sesión
                </button>
            </div>
        </header>
    );
};

export default UserHeader;
