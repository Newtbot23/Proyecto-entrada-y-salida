import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NormalAdminSidebar.module.css'; // Reusing established styles
import {
    DashboardIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '../common/Icons';

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

const UserSidebar: React.FC<SidebarProps> = ({
    isCollapsed = false,
    onToggle
}) => {
    const location = useLocation();
    const activePath = location.pathname;

    const menuItems = [
        { label: 'Mi Panel', path: '/user/dashboard', icon: DashboardIcon },
        { label: 'Historial', path: '/user/historial', icon: DashboardIcon }, // Reusing an icon for now, ideally find a history/time icon
    ];

    return (
        <aside className={`${styles.sidebar} ${styles.open} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.logoArea}>
                <span className={styles.logoText}>Usuario</span>
                <span className={styles.logoIcon}>US</span>
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

export default UserSidebar;
