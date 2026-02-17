import React, { useState, useEffect } from 'react';
import styles from './ReportsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

const ReportsPage: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.replace('/superadmin/login');
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="System Reports" userName={adminName} role="Administrador" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>Analytics & Reports</h2>
                            <p className={styles.pageSubtitle}>Review system performance and entity activity</p>
                        </div>
                    </div>

                    <div className={styles.reportsGrid}>
                        <div className={styles.reportCard}>
                            <h3>Institution Growth</h3>
                            <p>Monthly registration trends and active entity count.</p>
                            <button className={styles.reportBtn}>Generate PDF</button>
                        </div>
                        <div className={styles.reportCard}>
                            <h3>Revenue Report</h3>
                            <p>Subscription income and upcoming renewals.</p>
                            <button className={styles.reportBtn}>Download Excel</button>
                        </div>
                        <div className={styles.reportCard}>
                            <h3>User Activity</h3>
                            <p>Logins and system usage across all institutions.</p>
                            <button className={styles.reportBtn}>View Analytics</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReportsPage;
