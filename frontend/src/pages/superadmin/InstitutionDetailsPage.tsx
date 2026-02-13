import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './InstitutionDetailsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { EditIcon, TrashIcon, ArrowLeftIcon } from '../../components/common/Icons';

const InstitutionDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [institution, setInstitution] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('Super Admin');

    useEffect(() => {
        const adminUserStr = localStorage.getItem('adminUser');
        if (adminUserStr) {
            try {
                const adminUser = JSON.parse(adminUserStr);
                setAdminName(adminUser.nombre || 'Super Admin');
            } catch (e) {
                console.error('Error parsing admin user:', e);
            }
        }
        fetchInstitutionDetails();
    }, [id]);

    const fetchInstitutionDetails = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') + `/entidades/${id}`;

            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setInstitution(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch institution details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.replace('/superadmin/login');
    };

    if (loading) return <div className={styles.loading}>Loading details...</div>;
    if (!institution) return <div className={styles.error}>Institution not found</div>;

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="Institution Details" userName={adminName} role="Administrador" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    <button className={styles.backBtn} onClick={() => window.history.back()}>
                        <ArrowLeftIcon width={16} height={16} />
                        <span>Back to Institutions</span>
                    </button>

                    <div className={styles.detailsHeader}>
                        <div className={styles.titleInfo}>
                            <h2>{institution.nombre_entidad}</h2>
                            <span className={styles.nitLabel}>NIT: {institution.nit}</span>
                        </div>
                        <div className={styles.headerActions}>
                            <button className={styles.editBtn}><EditIcon width={18} height={18} /> Edit</button>
                            <button className={styles.deleteBtn}><TrashIcon width={18} height={18} /> Delete</button>
                        </div>
                    </div>

                    <div className={styles.detailsGrid}>
                        <div className={styles.detailsCard}>
                            <h3>Contact Information</h3>
                            <div className={styles.infoRow}>
                                <label>Representative:</label>
                                <span>{institution.nombre_titular}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Email:</label>
                                <span>{institution.correo}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Phone:</label>
                                <span>{institution.telefono}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Address:</label>
                                <span>{institution.direccion}</span>
                            </div>
                        </div>

                        <div className={styles.detailsCard}>
                            <h3>License Information</h3>
                            {institution.licencia ? (
                                <>
                                    <div className={styles.infoRow}>
                                        <label>Current Status:</label>
                                        <span className={`${styles.statusBadge} ${styles[institution.licencia.estado]}`}>
                                            {institution.licencia.estado}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <label>Valid Until:</label>
                                        <span>{new Date(institution.licencia.fecha_vencimiento).toLocaleDateString()}</span>
                                    </div>
                                </>
                            ) : (
                                <p className={styles.noLicense}>No active license found</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstitutionDetailsPage;
