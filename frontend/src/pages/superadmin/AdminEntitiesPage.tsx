import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import styles from './AdminEntitiesPage.module.css';
import { Pagination } from '../../components/common/Pagination';
import { getInstitutions } from '../../services/institutionService';

interface Entity {
    nit: string;
    nombre_entidad: string;
    correo: string;
    telefono: string;
    estado?: string;
}

export default function AdminEntitiesPage() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedNit, setExpandedNit] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState<any>({
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: 10,
        totalItems: 0
    });

    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        fetchEntities(currentPage);
    }, [currentPage]);

    const fetchEntities = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getInstitutions({ search: '', statuses: [] }, page, 10);
            setEntities(response.data);
            setPaginationMeta({
                currentPage: response.meta.currentPage,
                totalPages: response.meta.totalPages,
                itemsPerPage: response.meta.itemsPerPage,
                totalItems: response.meta.totalItems
            });
        } catch (err: any) {
            setError(err.message || 'Error al cargar las entidades');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const toggleExpand = (nit: string) => {
        if (expandedNit === nit) {
            setExpandedNit(null);
        } else {
            setExpandedNit(nit);
        }
    };

    const handleViewAdmins = (nit: string) => {
        navigate(`/superadmin/entities-admins/${nit}`);
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>Entidades Registradas</h1>
                        <p className={styles.pageSubtitle}>Seleccione una entidad para ver opciones adicionales.</p>
                    </div>

                    {error && (
                        <div className={styles.errorAlert}>
                            {error}
                        </div>
                    )}

                    <div className={styles.card}>
                        {loading ? (
                            <div className={styles.loadingState}>Cargando entidades...</div>
                        ) : entities.length === 0 ? (
                            <div className={styles.emptyState}>No hay entidades registradas</div>
                        ) : (
                            <div className={styles.accordionContainer}>
                                {entities.map(entity => (
                                    <div key={entity.nit} className={styles.accordionItem}>
                                        <div
                                            className={styles.accordionHeader}
                                            onClick={() => toggleExpand(entity.nit)}
                                        >
                                            <div className={styles.accordionTitleWrapper}>
                                                <h3 className={styles.accordionTitle}>{entity.nombre_entidad}</h3>
                                                <p className={styles.accordionSubtitle}>NIT: {entity.nit}</p>
                                            </div>
                                            <div className={styles.accordionIconWrapper}>
                                                {/* Icon toggle */}
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 20 20"
                                                    fill="none"
                                                    className={`${styles.accordionIcon} ${expandedNit === entity.nit ? styles.accordionIconExpanded : ''}`}
                                                >
                                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fill="#6B7280" />
                                                </svg>
                                            </div>
                                        </div>

                                        {expandedNit === entity.nit && (
                                            <div className={styles.accordionContent}>
                                                <div className={styles.accordionGrid}>
                                                    <div className={styles.infoBlock}>
                                                        <p>Correo</p>
                                                        <p title={entity.correo}>{entity.correo}</p>
                                                    </div>
                                                    <div className={styles.infoBlock}>
                                                        <p>Teléfono</p>
                                                        <p>{entity.telefono}</p>
                                                    </div>
                                                </div>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        onClick={() => handleViewAdmins(entity.nit)}
                                                        className={styles.viewBtn}
                                                    >
                                                        Ver Administradores
                                                    </button>
                                                    {/* To add admin, they also just go to the list where the 'Add' button is */}
                                                    <button
                                                        onClick={() => handleViewAdmins(entity.nit)}
                                                        className={styles.addBtn}
                                                    >
                                                        Añadir Administrador
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && entities.length > 0 && (
                            <Pagination
                                meta={paginationMeta}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
