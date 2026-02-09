import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './InstitutionDetailsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { InstitutionFormModal } from '../../components/modals/InstitutionFormModal';
import { EditIcon, ChevronLeftIcon } from '../../components/common/Icons';
import type { Institution, InstitutionFormData } from '../../types/institution';
import { getInstitutionById, updateInstitution } from '../../services/institutionService';

const InstitutionDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchInstitution();
        }
    }, [id]);

    const fetchInstitution = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const data = await getInstitutionById(id);
            setInstitution(data);
        } catch (error) {
            console.error('Failed to fetch institution:', error);
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
        }
    };

    if (loading) {
        return (
            <div className={styles.dashboardLayout}>
                <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
                <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                    <Header title="Institution Details" userName="Super Admin" onLogout={handleLogout} />
                    <div className={styles.loadingContainer}>
                        <p>Loading institution details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!institution) {
        return (
            <div className={styles.dashboardLayout}>
                <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
                <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                    <Header title="Institution Details" userName="Super Admin" onLogout={handleLogout} />
                    <div className={styles.errorContainer}>
                        <p>Institution not found</p>
                        <button onClick={handleBack} className={styles.backButton}>
                            Back to Institutions
                        </button>
                    </div>
                </main>
            </div>
        );
    }

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
                                <span className={`${styles.statusBadge} ${styles[institution.status]}`}>
                                    {institution.status}
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
                                <span className={styles.value}>{institution.correo}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <span className={styles.label}>Phone</span>
                                <span className={styles.value}>{institution.telefono}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <span className={styles.label}>NIT</span>
                                <span className={styles.value}>{institution.nit}</span>
                            </div>

                            <div className={styles.detailItem}>
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
                                    <span className={styles.value}>{institution.activeLicensesCount}</span>
                                </div>
                            )}

                            {institution.created_at && (
                                <div className={styles.detailItem}>
                                    <span className={styles.label}>Created At</span>
                                    <span className={styles.value}>
                                        {new Date(institution.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            {institution.updated_at && (
                                <div className={styles.detailItem}>
                                    <span className={styles.label}>Last Updated</span>
                                    <span className={styles.value}>
                                        {new Date(institution.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Future: Add licenses list here */}
                    <div className={styles.licensesSection}>
                        <h3 className={styles.sectionTitle}>Active Licenses</h3>
                        <div className={styles.placeholderBox}>
                            <p>License list will be displayed here</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
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
