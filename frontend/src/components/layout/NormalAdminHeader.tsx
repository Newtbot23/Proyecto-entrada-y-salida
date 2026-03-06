import React from 'react';
import styles from './NormalAdminHeader.module.css';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ajusta ruta

const routeTitles: Record<string, string> = {
    dashboard: 'Panel',
    admins: 'Administradores',
    'license-plans': 'Planes de Licencia',
    institutions: 'Instituciones',
    reports: 'Reportes',
    'registro-personas': 'Registro Completo',
    tables: 'Tablas de Usuarios',
};

const NormalAdminHeader: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const pathParts = location.pathname.split('/').filter(Boolean);
    const view = pathParts[2] || pathParts[0]; // /user/normaladmin/<view> or /dashboard

    const title = routeTitles[view] ?? 'Panel';

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <h1 className={styles.pageTitle}>{title}</h1>
            </div>

            <div className={styles.rightSection}>
                <div className={styles.userInfo}>
                    <span className={styles.userRole}>
                        {user?.rol ?? 'Administrador'}
                    </span>
                    <span className={styles.userName}>
                        {user?.nombre ?? '—'}
                    </span>
                </div>

                <button className={styles.logoutBtn} onClick={logout}>
                    Cerrar Sesión
                </button>
            </div>
        </header>
    );
};

export default NormalAdminHeader;