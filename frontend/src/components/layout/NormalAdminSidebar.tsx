import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { DynamicTableService } from '../../services/dynamicTableService';
import styles from './NormalAdminSidebar.module.css';
import {
    DashboardIcon,
    InstitutionIcon,
    ReportIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DevicesIcon
} from '../common/Icons';

interface SidebarProps {
    isOpen?: boolean; // For mobile toggle
    isCollapsed?: boolean; // For desktop collapse
    onToggle?: () => void;
}

const NormalAdminSidebar: React.FC<SidebarProps> = ({
    isOpen = true,
    isCollapsed = false,
    onToggle
}) => {
    const location = useLocation();
    const activePath = location.pathname;
    const { user } = useAuth();

    // Improved role detection
    const getRole = () => {
        if (user?.id_rol) return Number(user.id_rol);
        const userData = sessionStorage.getItem('authUser');
        if (userData) {
            try {
                return Number(JSON.parse(userData).id_rol);
            } catch (e) {
                return 0;
            }
        }
        return 0;
    };

    const userRole = getRole();

    const [isOtrosOpen, setIsOtrosOpen] = useState(false);
    const [isReportesOpen, setIsReportesOpen] = useState(false);
    const [isFichasOpen, setIsFichasOpen] = useState(false);
    const [isEquiposOpen, setIsEquiposOpen] = useState(false);

    const { data: shortTables = [] } = useQuery({
        queryKey: ['shortTables'],
        queryFn: async () => {
            try {
                const response = await DynamicTableService.getShortTables();
                return Array.isArray(response) ? response : (response as any).data || [];
            } catch (error) {
                console.error("Error fetching short tables for sidebar", error);
                return [];
            }
        }
    });

    const menuItems = [];
    if (userRole === 1) {
        menuItems.push(
            { label: 'Panel', path: '/dashboard', icon: DashboardIcon },
            { label: 'Registro Completo', path: '/user/normaladmin/registro-personas', icon: ReportIcon },
            { label: 'Aprobaciones', path: '/user/normaladmin/aprobaciones', icon: ReportIcon } // Reusing ReportIcon since BellIcon doesn't exist yet
        );
    } else if (userRole === 3) {
        menuItems.push(
            { label: 'Control Personas', path: '/puertas/personas', icon: DashboardIcon }
        );
    } else if (userRole === 4) {
        menuItems.push(
            { label: 'Control Vehículos', path: '/puertas/vehiculos', icon: DashboardIcon }
        );
    }

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.logoArea}>
                <span className={styles.logoText}>Administración</span>
                <span className={styles.logoIcon}>AD</span>
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

                    {/* "Fichas" Accordion Item - Only for Admin */}
                    {userRole === 1 && (
                        <li className={styles.navItem}>
                            <button
                                className={`${styles.accordionHeader} ${isFichasOpen || activePath.includes('/fichas/') ? styles.active : ''}`}
                                onClick={() => setIsFichasOpen(!isFichasOpen)}
                                title={isCollapsed ? "Fichas" : ""}
                                style={{ padding: isCollapsed ? '0.75rem' : '0.75rem 1.5rem', justifyContent: isCollapsed ? 'center' : 'space-between' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className={styles.navIcon}>
                                        <InstitutionIcon /> {/* Reusing InstitutionIcon or similar */}
                                    </span>
                                    {!isCollapsed && <span className={styles.navLabel}>Fichas</span>}
                                </div>
                                {!isCollapsed && (
                                    <span className={`${styles.chevronIcon} ${isFichasOpen ? styles.rotated : ''}`}>
                                        <ChevronRightIcon width={16} height={16} />
                                    </span>
                                )}
                            </button>

                            {!isCollapsed && (
                                <div className={`${styles.accordionContent} ${isFichasOpen || activePath.includes('/fichas/') ? styles.open : ''}`}>
                                    <ul className={styles.accordionList}>
                                        <li className={styles.accordionItem}>
                                            <Link
                                                to="/user/normaladmin/fichas/crear"
                                                className={`${styles.accordionLink} ${activePath === '/user/normaladmin/fichas/crear' ? styles.active : ''}`}
                                            >
                                                Crear Ficha
                                            </Link>
                                        </li>
                                        <li className={styles.accordionItem}>
                                            <Link
                                                to="/user/normaladmin/fichas/asignar"
                                                className={`${styles.accordionLink} ${activePath === '/user/normaladmin/fichas/asignar' ? styles.active : ''}`}
                                            >
                                                Asignar Usuarios
                                            </Link>
                                        </li>
                                        <li className={styles.accordionItem}>
                                            <Link
                                                to="/user/normaladmin/fichas/lista"
                                                className={`${styles.accordionLink} ${activePath === '/user/normaladmin/fichas/lista' ? styles.active : ''}`}
                                            >
                                                Listar y Gestionar
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </li>
                    )}

                    {/* "Equipos" Accordion Item - Only for Admin */}
                    {userRole === 1 && (
                        <li className={styles.navItem}>
                            <button
                                className={`${styles.accordionHeader} ${isEquiposOpen || activePath.includes('/equipos/') ? styles.active : ''}`}
                                onClick={() => setIsEquiposOpen(!isEquiposOpen)}
                                title={isCollapsed ? "Equipos" : ""}
                                style={{ padding: isCollapsed ? '0.75rem' : '0.75rem 1.5rem', justifyContent: isCollapsed ? 'center' : 'space-between' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className={styles.navIcon}>
                                        <DevicesIcon />
                                    </span>
                                    {!isCollapsed && <span className={styles.navLabel}>Equipos</span>}
                                </div>
                                {!isCollapsed && (
                                    <span className={`${styles.chevronIcon} ${isEquiposOpen ? styles.rotated : ''}`}>
                                        <ChevronRightIcon width={16} height={16} />
                                    </span>
                                )}
                            </button>

                            {!isCollapsed && (
                                <div className={`${styles.accordionContent} ${isEquiposOpen || activePath.includes('/equipos/') ? styles.open : ''}`}>
                                    <ul className={styles.accordionList}>
                                        <li className={styles.accordionItem}>
                                            <Link
                                                to="/user/normaladmin/equipos/registrar"
                                                className={`${styles.accordionLink} ${activePath === '/user/normaladmin/equipos/registrar' ? styles.active : ''}`}
                                            >
                                                Registrar Equipos
                                            </Link>
                                        </li>
                                        <li className={styles.accordionItem}>
                                            <Link
                                                to="/user/normaladmin/equipos/asignar"
                                                className={`${styles.accordionLink} ${activePath === '/user/normaladmin/equipos/asignar' ? styles.active : ''}`}
                                            >
                                                Asignar Equipos
                                            </Link>
                                        </li>
                                        <li className={styles.accordionItem}>
                                            <Link
                                                to="/user/normaladmin/equipos/historial"
                                                className={`${styles.accordionLink} ${activePath === '/user/normaladmin/equipos/historial' ? styles.active : ''}`}
                                            >
                                                Historial de Asignaciones
                                            </Link>
                                        </li>
                                        <li className={styles.accordionItem}>
                                            <Link
                                                to="/user/normaladmin/equipos/gestion-lotes"
                                                className={`${styles.accordionLink} ${activePath === '/user/normaladmin/equipos/gestion-lotes' ? styles.active : ''}`}
                                            >
                                                Gestión de Lotes
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </li>
                    )}

                    {/* "Reportes" Accordion Item - Only for Admin */}
                    {userRole === 1 && (
                        <li className={styles.navItem}>
                            <button
                                className={`${styles.accordionHeader} ${isReportesOpen || activePath.includes('/reportes/') ? styles.active : ''}`}
                                onClick={() => setIsReportesOpen(!isReportesOpen)}
                                title={isCollapsed ? "Reportes" : ""}
                                style={{ padding: isCollapsed ? '0.75rem' : '0.75rem 1.5rem', justifyContent: isCollapsed ? 'center' : 'space-between' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className={styles.navIcon}>
                                        <ReportIcon />
                                    </span>
                                    {!isCollapsed && <span className={styles.navLabel}>Reportes</span>}
                                </div>
                                {!isCollapsed && (
                                    <span className={`${styles.chevronIcon} ${isReportesOpen ? styles.rotated : ''}`}>
                                        <ChevronRightIcon width={16} height={16} />
                                    </span>
                                )}
                            </button>

                            {!isCollapsed && (
                                <div className={`${styles.accordionContent} ${isReportesOpen || activePath.includes('/reportes/') ? styles.open : ''}`}>
                                    <ul className={styles.accordionList}>
                                        <li className={styles.accordionItem}>
                                            <Link
                                                to="/user/normaladmin/reportes/persona"
                                                className={`${styles.accordionLink} ${activePath === '/user/normaladmin/reportes/persona' ? styles.active : ''}`}
                                            >
                                                Reporte por Persona
                                            </Link>
                                        </li>
                                        <li className={styles.accordionItem}>
                                            <Link
                                                to="/user/normaladmin/reportes/diario"
                                                className={`${styles.accordionLink} ${activePath === '/user/normaladmin/reportes/diario' ? styles.active : ''}`}
                                            >
                                                Reporte del Día
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </li>
                    )}

                    {/* "Otros" Accordion Item - Only for Admin */}
                    {userRole === 1 && (
                        <li className={styles.navItem}>
                            <button
                                className={`${styles.accordionHeader} ${isOtrosOpen || activePath.includes('/tables/') ? styles.active : ''}`}
                                onClick={() => setIsOtrosOpen(!isOtrosOpen)}
                                title={isCollapsed ? "Otros" : ""}
                                style={{ padding: isCollapsed ? '0.75rem' : '0.75rem 1.5rem', justifyContent: isCollapsed ? 'center' : 'space-between' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className={styles.navIcon}>
                                        <InstitutionIcon />
                                    </span>
                                    {!isCollapsed && <span className={styles.navLabel}>Otros</span>}
                                </div>
                                {!isCollapsed && (
                                    <span className={`${styles.chevronIcon} ${isOtrosOpen ? styles.rotated : ''}`}>
                                        <ChevronRightIcon width={16} height={16} />
                                    </span>
                                )}
                            </button>

                            {!isCollapsed && (
                                <div className={`${styles.accordionContent} ${isOtrosOpen || activePath.includes('/tables/') ? styles.open : ''}`}>
                                    <ul className={styles.accordionList}>
                                        {shortTables.map((tableName: string) => {
                                            const tablePath = `/user/normaladmin/tables/${tableName}`;
                                            const isActive = activePath === tablePath;
                                            return (
                                                <li key={tableName} className={styles.accordionItem}>
                                                    <Link
                                                        to={tablePath}
                                                        className={`${styles.accordionLink} ${isActive ? styles.active : ''}`}
                                                    >
                                                        {tableName.replace(/_/g, ' ')}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                        {shortTables.length === 0 && (
                                            <li className={styles.accordionItem}>
                                                <span style={{ display: 'block', padding: '0.5rem 1.5rem 0.5rem 3.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                                                    Sin tablas adicionales
                                                </span>
                                            </li>
                                        )}
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

export default NormalAdminSidebar;
