import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styles from './Sidebar.module.css';
import {
    DashboardIcon,
    InstitutionIcon,
    LicenseIcon,
    ReportIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SystemLogIcon
} from '../common/Icons';
import { DynamicTableService } from '../../services/dynamicTableService';

interface SidebarProps {
    isOpen?: boolean; // For mobile toggle
    isCollapsed?: boolean; // For desktop collapse
    onToggle?: () => void;
    userType?: 'superadmin' | 'normal';
    showToggle?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen = true,
    isCollapsed = false,
    onToggle,
    userType = 'superadmin',
    showToggle = true
}) => {
    const location = useLocation();
    const activePath = location.pathname;
    const [isOtrosExpanded, setIsOtrosExpanded] = useState(false);

    const toggleOtros = () => setIsOtrosExpanded(!isOtrosExpanded);

    const { data: shortTables = [], isLoading } = useQuery({
        queryKey: ['shortTables'],
        queryFn: async () => {
            const response = await DynamicTableService.getShortTables();
            return (response as any).data || response;
        },
        enabled: userType === 'normal', // Solo ejecuta si es admin normal
    });

    const isSuperAdmin = activePath.startsWith('/superadmin');

    const superAdminItems = [
        { label: 'Panel', path: '/superadmin/dashboard', icon: DashboardIcon },
        { label: 'Administradores', path: '/superadmin/admins', icon: InstitutionIcon },
        { label: 'Instituciones', path: '/superadmin/institutions', icon: InstitutionIcon },
        { label: 'Admin Entidades', path: '/superadmin/entities-admins', icon: InstitutionIcon },
        { label: 'Planes de Licencia', path: '/superadmin/license-plans', icon: LicenseIcon },
        { label: 'Reportes', path: '/superadmin/reports', icon: ReportIcon },
    ];

    const normalAdminItems = [
        { label: 'Panel', path: '/dashboard', icon: DashboardIcon },
        { label: 'Usuarios', path: '/user/normaladmin/tables/usuarios', icon: InstitutionIcon },
        { label: 'Usuarios Registrados', path: '/user/normaladmin/registro-personas', icon: ReportIcon },
    ];

    const menuItems = isSuperAdmin ? superAdminItems : normalAdminItems;

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.logoArea}>
                <span className={styles.logoText}>{userType === 'superadmin' ? 'SuperAdmin' : 'Admin'}</span>
                <span className={styles.logoIcon}>{userType === 'superadmin' ? 'SA' : 'AD'}</span>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {menuItems.map((item) => (
                        <li key={item.path} className={styles.navItem}>
                            <Link
                                to={item.path}
                                className={`${styles.navLink} ${activePath === item.path ? styles.active : ''}`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <span className={styles.navIcon}>
                                    <item.icon />
                                </span>
                                <span className={styles.navLabel}>{item.label}</span>
                            </Link>
                        </li>
                    ))}

                    {/* Dynamic Tables Section for Normal Admin */}
                    {userType === 'normal' && (
                        <li className={styles.navItem}>
                            <div
                                className={`${styles.navLink} ${isOtrosExpanded ? styles.active : ''}`}
                                onClick={toggleOtros}
                                title={isCollapsed ? "Otros" : ''}
                            >
                                <div className={styles.navGroup}>
                                    <span className={styles.navIcon}>
                                        <SystemLogIcon />
                                    </span>
                                    <span className={styles.navLabel}>Otros</span>
                                </div>
                                {!isCollapsed && (
                                    <span className={styles.navLabel}>
                                        {isOtrosExpanded ? <ChevronLeftIcon width={16} height={16} /> : <ChevronRightIcon width={16} height={16} />}
                                    </span>
                                )}
                            </div>

                            {isOtrosExpanded && !isCollapsed && (
                                <ul className={styles.subList}>
                                    {isLoading ? (
                                        <li className={styles.emptySubItem}>Cargando...</li>
                                    ) : (
                                        <>
                                            {shortTables?.map((table: string) => (
                                                <li key={table} className={styles.subItem}>
                                                    <Link
                                                        to={`/user/normaladmin/tables/${table}`}
                                                        className={`${styles.subLink} ${activePath.includes(table) ? styles.subActive : ''}`}
                                                    >
                                                        {table}
                                                    </Link>
                                                </li>
                                            ))}
                                            {(!shortTables || shortTables.length === 0) && (
                                                <li className={styles.emptySubItem}>No hay tablas</li>
                                            )}
                                        </>
                                    )}
                                </ul>
                            )}
                        </li>
                    )}
                </ul>
            </nav>

            {showToggle && (
                <button
                    className={styles.toggleBtn}
                    onClick={onToggle}
                    aria-label={isCollapsed ? "Abrir barra lateral" : "Cerrar barra lateral"}
                >
                    {isCollapsed ? <ChevronRightIcon width={20} height={20} /> : <ChevronLeftIcon width={20} height={20} />}
                </button>
            )}
        </aside>
    );
};

export default Sidebar;
