import React, { useState, useEffect } from 'react';
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
    const [shortTables, setShortTables] = useState<string[]>([]);
    const [isOtrosExpanded, setIsOtrosExpanded] = useState(false);

    useEffect(() => {
        if (userType === 'normal') {
            DynamicTableService.getShortTables()
                .then(tables => setShortTables(tables))
                .catch(err => console.error("Failed to load tables", err));
        }
    }, [userType]);

    const superAdminItems = [
        { label: 'Panel', path: '/superadmin/dashboard', icon: DashboardIcon },
        { label: 'Administradores', path: '/superadmin/admins', icon: InstitutionIcon },
        { label: 'Instituciones', path: '/superadmin/institutions', icon: InstitutionIcon },
        { label: 'Planes de Licencia', path: '/superadmin/license-plans', icon: LicenseIcon },
        { label: 'Reportes', path: '/superadmin/reports', icon: ReportIcon },
        { label: 'Logs del Sistema', path: '/superadmin/logs', icon: SystemLogIcon },
    ];

    const normalAdminItems = [
        { label: 'Panel', path: '/user/normaladmin/dashboard', icon: DashboardIcon },
        // Add other normal admin standard items if any
    ];

    const menuItems = userType === 'superadmin' ? superAdminItems : normalAdminItems;

    const toggleOtros = () => {
        setIsOtrosExpanded(!isOtrosExpanded);
    };

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
                                style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                                title={isCollapsed ? "Otros" : ''}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
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
                                <ul style={{ listStyle: 'none', paddingLeft: '3rem', margin: 0 }}>
                                    {shortTables?.map(table => (
                                        <li key={table} style={{ marginBottom: '0.5rem' }}>
                                            <Link
                                                to={`/user/normaladmin/tables/${table}`}
                                                style={{
                                                    color: activePath.includes(table) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    display: 'block',
                                                    padding: '4px 0'
                                                }}
                                            >
                                                {table}
                                            </Link>
                                        </li>
                                    ))}
                                    {(!shortTables || shortTables.length === 0) && (
                                        <li style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No hay tablas</li>
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
