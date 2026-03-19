import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NormalAdminSidebar.module.css'; // Reusing established styles
import {
    DashboardIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    InstitutionIcon
} from '../common/Icons';
import { useAuth } from '../../context/AuthContext';

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
    const { user } = useAuth();
    const [isInstructorOpen, setIsInstructorOpen] = useState(false);

    const menuItems = [
        { label: 'Mi Panel', path: '/user/dashboard', icon: DashboardIcon },
        { label: 'Historial', path: '/user/historial', icon: DashboardIcon }, 
        { 
            label: 'Mi Código', 
            path: '/user/codigo', 
            icon: () => (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                </svg>
            )
        },
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

                    {/* Instructor Section - Conditional */}
                    {user?.es_instructor && (
                        <li className={styles.navItem}>
                            <button
                                className={`${styles.accordionHeader} ${isInstructorOpen || activePath.includes('/instructor/') ? styles.active : ''}`}
                                onClick={() => setIsInstructorOpen(!isInstructorOpen)}
                                title={isCollapsed ? "Instructor" : ""}
                                style={{ padding: isCollapsed ? '0.75rem' : '0.75rem 1.5rem', justifyContent: isCollapsed ? 'center' : 'space-between' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className={styles.navIcon}>
                                        <InstitutionIcon />
                                    </span>
                                    {!isCollapsed && <span className={styles.navLabel}>Instructor</span>}
                                </div>
                                {!isCollapsed && (
                                    <span className={`${styles.chevronIcon} ${isInstructorOpen ? styles.rotated : ''}`}>
                                        <ChevronRightIcon width={16} height={16} />
                                    </span>
                                )}
                            </button>

                            {!isCollapsed && (
                                <div className={`${styles.accordionContent} ${isInstructorOpen || activePath.includes('/instructor/') ? styles.open : ''}`}>
                                    <ul className={styles.accordionList}>
                                        <li className={styles.accordionItem}>
                                            <Link
                                                to="/user/instructor/equipos"
                                                className={`${styles.accordionLink} ${activePath === '/user/instructor/equipos' ? styles.active : ''}`}
                                            >
                                                Equipos Asignados
                                            </Link>
                                        </li>
                                        <li className={styles.accordionItem}>
                                            <Link
                                                to="/user/instructor/asistencia"
                                                className={`${styles.accordionLink} ${activePath === '/user/instructor/asistencia' ? styles.active : ''}`}
                                            >
                                                Asistencia de Ficha
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </li>
                    )}
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
