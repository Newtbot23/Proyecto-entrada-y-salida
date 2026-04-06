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
    'registro-personas': 'Usuarios Registrados',
    tables: 'Tablas de Usuarios',
    personas: 'Control de Personas',
    vehiculos: 'Control de Vehículos',
};

const NormalAdminHeader: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const pathParts = location.pathname.split('/').filter(Boolean);
    // Para rutas tipo /user/normaladmin/<view> o /puertas/<view>
    const view = pathParts[2] || pathParts[1] || pathParts[0]; 

    const title = routeTitles[view] ?? 'Panel';

    const getRoleName = () => {
        if (user?.rol) return user.rol;
        const roleId = Number(user?.id_rol);
        if (roleId === 3) return 'Puertas Personas';
        if (roleId === 4) return 'Puertas Vehículos';
        if (roleId === 1) return 'Administrador';
        return 'Usuario';
    };

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <h1 className={styles.pageTitle}>{title}</h1>
            </div>

            <div className={styles.rightSection}>
                <div className={styles.userInfo}>
                    <span className={styles.userRole}>
                        {getRoleName()}
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