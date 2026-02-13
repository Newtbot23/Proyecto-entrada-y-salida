import React, { useState, useEffect } from 'react';
import styles from './InstitutionsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { PlusIcon, EditIcon, TrashIcon, ExternalLinkIcon } from '../../components/common/Icons';

const InstitutionsPage: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [institutions, setInstitutions] = useState<any[]>([]);
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
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') + '/entidades';

            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            setInstitutions(data.data || []);
        } catch (error) {
            console.error('Failed to fetch institutions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.replace('/superadmin/login');
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="Institutions" userName={adminName} role="Administrador" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>Registered Institutions</h2>
                            <p className={styles.pageSubtitle}>Manage all entities using the system</p>
                        </div>
                        <button className={styles.createButton} onClick={() => window.location.href = '/register-entity'}>
                            <PlusIcon width={20} height={20} />
                            <span>Add Institution</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>Loading institutions...</div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>NIT</th>
                                        <th>Name</th>
                                        <th>Contact Person</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {institutions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className={styles.emptyState}>No institutions found</td>
                                        </tr>
                                    ) : (
                                        institutions.map(inst => (
                                            <tr key={inst.id}>
                                                <td>{inst.nit}</td>
                                                <td>{inst.nombre_entidad}</td>
                                                <td>{inst.nombre_titular}</td>
                                                <td>{inst.telefono}</td>
                                                <td>{inst.correo}</td>
                                                <td>
                                                    <div className={styles.actionButtons}>
                                                        <button
                                                            className={styles.actionButton}
                                                            title="View Details"
                                                            onClick={() => window.location.href = `/superadmin/institutions/${inst.id}`}
                                                        >
                                                            <ExternalLinkIcon width={18} height={18} />
                                                        </button>
                                                        <button className={styles.actionButton} title="Edit">
                                                            <EditIcon width={18} height={18} />
                                                        </button>
                                                        <button className={`${styles.actionButton} ${styles.danger}`} title="Delete">
                                                            <TrashIcon width={18} height={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InstitutionsPage;
