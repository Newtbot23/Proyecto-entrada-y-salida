import React, { useState, useEffect } from 'react';
import styles from './LicensePlansPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/common/Icons';

const LicensePlansPage: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('Super Admin');

    useEffect(() => {
        const adminUserStr = sessionStorage.getItem('adminUser');
        if (adminUserStr) {
            try {
                const adminUser = JSON.parse(adminUserStr);
                setAdminName(adminUser.nombre || 'Super Admin');
            } catch (e) {
                console.error('Error parsing admin user:', e);
            }
        }
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('adminToken');
            const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') + '/planes';

            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            setPlans(data.data || []);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.replace('/superadmin/login');
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="License Plans" userName={adminName} role="Administrador" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>License Plans</h2>
                            <p className={styles.pageSubtitle}>Define subscription tiers and pricing</p>
                        </div>
                        <button className={styles.createButton}>
                            <PlusIcon width={20} height={20} />
                            <span>Create New Plan</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>Loading plans...</div>
                    ) : (
                        <div className={styles.plansGridIdx}>
                            {plans.length === 0 ? (
                                <p className={styles.emptyState}>No plans found</p>
                            ) : (
                                plans.map(plan => (
                                    <div key={plan.id} className={styles.planCard}>
                                        <div className={styles.planHeader}>
                                            <h3>{plan.nombre_plan}</h3>
                                            <div className={styles.planPrice}>
                                                <span className={styles.amount}>${parseFloat(plan.precio).toLocaleString()}</span>
                                                <span className={styles.period}>/year</span>
                                            </div>
                                        </div>
                                        <div className={styles.planDetails}>
                                            <p>{plan.descripcion}</p>
                                        </div>
                                        <div className={styles.planActions}>
                                            <button className={styles.iconBtn} title="Edit"><EditIcon width={18} height={18} /></button>
                                            <button className={`${styles.iconBtn} ${styles.danger}`} title="Delete"><TrashIcon width={18} height={18} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LicensePlansPage;
