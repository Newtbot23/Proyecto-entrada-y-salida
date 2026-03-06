import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './InstitutionDetailsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { formatDateSafe } from '../../utils/dateUtils';
import { EditIcon, TrashIcon, ArrowLeftIcon } from '../../components/common/Icons';

const InstitutionDetailsPage: React.FC = () => {
    const { nit } = useParams<{ nit: string }>();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [institution, setInstitution] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        console.log('InstitutionDetailsPage mounted with nit parameter:', nit);

        if (nit && nit !== 'undefined') {
            fetchInstitutionDetails();
        } else {
            setLoading(false);
            console.warn('NIT is undefined or invalid string "undefined"');
        }
    }, [nit]);

    const fetchInstitutionDetails = async () => {
        if (!nit || nit === 'undefined') {
            console.error('Cannot fetch institution details: NIT is undefined');
            return;
        }

        try {
            setLoading(true);
            const token = sessionStorage.getItem('adminToken');
            const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') + `/entidades/${nit}`;

            console.log(`Fetching institution details from: ${API_URL}`);
            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            console.log('Institution details API response:', data);
            if (data.success) {
                setInstitution(data.data);
            } else {
                console.error('API error fetching institution:', data.message);
                setInstitution(null);
            }
        } catch (error) {
            console.error('Failed to fetch institution details (exception):', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading details...</div>;
    if (!institution) return <div className={styles.error}>Institution not found</div>;

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header />

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
                                        <label>Plan:</label>
                                        <span>{institution.licencia.plan?.nombre_plan || 'N/A'}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <label>Current Status:</label>
                                        <span className={`${styles.statusBadge} ${styles[institution.licencia.estado] || styles.inactive}`}>
                                            {institution.licencia.estado}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <label>Valid Until:</label>
                                        <span>{institution.licencia.fecha_vencimiento ? formatDateSafe(institution.licencia.fecha_vencimiento) : 'N/A'}</span>
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
