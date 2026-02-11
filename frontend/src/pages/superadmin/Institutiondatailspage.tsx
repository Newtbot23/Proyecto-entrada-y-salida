/**
 * Institution Details Page
 * 
 * Página que muestra los detalles completos de una institución específica.
 * Permite editar la institución y ver información relacionada.
 * 
 * Features:
 * - Carga de datos desde Laravel API
 * - Edición de institución via modal
 * - Estados de carga y error
 * - Formato de fechas y datos
 * - Navegación de regreso a lista
 * 
 * @author Tu nombre
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './InstitutionDetailsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { InstitutionFormModal } from '../../components/modals/InstitutionFormModal';
import { EditIcon, ChevronLeftIcon } from '../../components/common/Icons';
import type { Institution, InstitutionFormData } from '../../types/institution';
import { getInstitutionById, updateInstitution } from '../../services/institutionService';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const InstitutionDetailsPage: React.FC = () => {
    // ------------------------------------------------------------------------
    // HOOKS
    // ------------------------------------------------------------------------

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // ------------------------------------------------------------------------
    // ESTADO
    // ------------------------------------------------------------------------

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // ------------------------------------------------------------------------
    // EFECTOS
    // ------------------------------------------------------------------------

    useEffect(() => {
        if (id) {
            fetchInstitution();
        }
    }, [id]);

    // ------------------------------------------------------------------------
    // FUNCIONES
    // ------------------------------------------------------------------------

    const fetchInstitution = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            
            const data = await getInstitutionById(id);
            
            if (data) {
                setInstitution(data);
            } else {
                setError('Institution not found');
            }
        } catch (err) {
            console.error('Failed to fetch institution:', err);
            setError(err instanceof Error ? err.message : 'Failed to load institution');
        } finally {
            setLoading(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleLogout = () => {
        console.log('Logging out...');
    };

    const handleBack = () => {
        navigate('/superadmin/institutions');
    };

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const handleSaveInstitution = async (data: InstitutionFormData) => {
        if (!institution) return;

        try {
            await updateInstitution(institution.id, data);
            await fetchInstitution();
        } catch (error) {
            console.error('Failed to update institution:', error);
            throw error;
        }
    };

    const formatDate = (isoDate: string): string => {
        return new Date(isoDate).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getStatusBadgeClass = (status: 'active' | 'inactive'): string => {
        return status === 'active' ? styles.statusActive : styles.statusInactive;
    };

    // ------------------------------------------------------------------------
    // RENDERIZADO - LOADING
    // ------------------------------------------------------------------------

    if (loading) {
        return (
            <div className={styles.dashboardLayout}>
                <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
                <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                    <Header title="Institution Details" userName="Super Admin" onLogout={handleLogout} />
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Loading institution details...</p>
                    </div>
                </main>
            </div>
        );
    }

    // ------------------------------------------------------------------------
    // RENDERIZADO - ERROR
    // ------------------------------------------------------------------------

    if (error || !institution) {
        return (
            <div className={styles.dashboardLayout}>
                <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
                <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                    <Header title="Institution Details" userName="Super Admin" onLogout={handleLogout} />
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <h2>Institution Not Found</h2>
                        <p>{error || 'The requested institution does not exist.'}</p>
                        <button onClick={handleBack} className={styles.backButton}>
                            <ChevronLeftIcon width={20} height={20} />
                            <span>Back to Institutions</span>
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // ------------------------------------------------------------------------
    // RENDERIZADO PRINCIPAL
    // ------------------------------------------------------------------------

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="Institution Details" userName="Super Admin" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    
                    <div className={styles.pageHeader}>
                        <button onClick={handleBack} className={styles.backButton}>
                            <ChevronLeftIcon width={20} height={20} />
                            <span>Back to Institutions</span>
                        </button>
                        
                        <button onClick={handleEditClick} className={styles.editButton}>
                            <EditIcon width={20} height={20} />
                            <span>Edit Institution</span>
                        </button>
                    </div>

                    <div className={styles.detailsCard}>
                        
                        <div className={styles.cardHeader}>
                            <h2 className={styles.institutionName}>{institution.nombre_entidad}</h2>
                            {institution.status && (
                                <span className={`${styles.statusBadge} ${getStatusBadgeClass(institution.status)}`}>
                                    {institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}
                                </span>
                            )}
                        </div>

                        <div className={styles.detailsGrid}>
                            
                            <div className={styles.detailItem}>
                                <span className={styles.label}>ID</span>
                                <span className={styles.value}>{institution.id}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <span className={styles.label}>Email</span>
                                <a href={`mailto:${institution.correo}`} className={styles.valueLink}>
                                    {institution.correo}
                                </a>
                            </div>

                            <div className={styles.detailItem}>
                                <span className={styles.label}>Phone</span>
                                <a href={`tel:${institution.telefono}`} className={styles.valueLink}>
                                    {institution.telefono}
                                </a>
                            </div>

                            <div className={styles.detailItem}>
                                <span className={styles.label}>NIT</span>
                                <span className={styles.value}>{institution.nit}</span>
                            </div>

                            <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                                <span className={styles.label}>Address</span>
                                <span className={styles.value}>{institution.direccion}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <span className={styles.label}>Legal Representative</span>
                                <span className={styles.value}>{institution.nombre_titular}</span>
                            </div>

                            {institution.activeLicensesCount !== undefined && (
                                <div className={styles.detailItem}>
                                    <span className={styles.label}>Active Licenses</span>
                                    <span className={`${styles.value} ${styles.badge}`}>
                                        {institution.activeLicensesCount}
                                    </span>
                                </div>
                            )}

                            {institution.created_at && (
                                <div className={styles.detailItem}>
                                    <span className={styles.label}>Created At</span>
                                    <span className={styles.value}>
                                        {formatDate(institution.created_at)}
                                    </span>
                                </div>
                            )}

                            {institution.updated_at && (
                                <div className={styles.detailItem}>
                                    <span className={styles.label}>Last Updated</span>
                                    <span className={styles.value}>
                                        {formatDate(institution.updated_at)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.licensesSection}>
                        <h3 className={styles.sectionTitle}>Active Licenses</h3>
                        <div className={styles.placeholderBox}>
                            <p>License list will be displayed here</p>
                            <small>This feature will show all licenses associated with this institution</small>
                        </div>
                    </div>
                </div>
            </main>

            <InstitutionFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveInstitution}
                mode="edit"
                initialData={institution}
            />
        </div>
    );
};

export default InstitutionDetailsPage;
