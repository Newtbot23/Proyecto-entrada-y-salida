import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import {
    DashboardIcon,
    InstitutionIcon,
    LicenseIcon,
    ReportIcon,
    SystemLogIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '../common/Icons';

interface SidebarProps {
    isOpen?: boolean; // For mobile toggle
    isCollapsed?: boolean; // For desktop collapse
    onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen = true,
    isCollapsed = false,
    onToggle
}) => {
    const location = useLocation();
    const activePath = location.pathname;

    const menuItems = [
        { label: 'Panel', path: '/superadmin/dashboard', icon: DashboardIcon },
        { label: 'Administradores', path: '/superadmin/admins', icon: InstitutionIcon }, // Using InstitutionIcon for now
        { label: 'Instituciones', path: '/superadmin/institutions', icon: InstitutionIcon },
        { label: 'Planes de Licencia', path: '/superadmin/license-plans', icon: LicenseIcon },
        { label: 'Reportes', path: '/superadmin/reports', icon: ReportIcon },
        { label: 'Logs del Sistema', path: '/superadmin/logs', icon: SystemLogIcon },
    ];

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.logoArea}>
                <span className={styles.logoText}>SuperAdmin</span>
                <span className={styles.logoIcon}>SA</span>
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
                </ul>
            </nav>

            <button
                className={styles.toggleBtn}
                onClick={onToggle}
                aria-label={isCollapsed ? "Abrir barra lateral" : "Cerrar barra lateral"}
            >
                {isCollapsed ? <ChevronRightIcon width={20} height={20} /> : <ChevronLeftIcon width={20} height={20} />}
            </button>
        </aside>
    );
};

export default Sidebar;
