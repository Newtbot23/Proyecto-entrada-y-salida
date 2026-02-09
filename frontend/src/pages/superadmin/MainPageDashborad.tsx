import React, { useState } from 'react';
import styles from './MainPageDashborad.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import StatCard from '../../components/dashboard/StatCard';
import LicenseTable, { type License } from '../../components/dashboard/LicenseTable';

const MainPageDashborad: React.FC = () => {
    // Mobile sidebar state
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    // Desktop sidebar collapsed state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // Mock Data - To be replaced by API calls
    const stats = [
        { title: 'Active Institutions', value: 2, subtitle: 'Currently active' },
        { title: 'Licenses About to Expire', value: 1, subtitle: 'Next 30 days' },
        { title: 'Monthly Revenue', value: '1.000$', subtitle: 'This month' },
    ];

    const recentLicenses: License[] = [
        { id: 1, institution: 'Institution A', status: 'Active', expirationDate: '2024-12-31' },
        { id: 2, institution: 'Institution B', status: 'Expired', expirationDate: '2023-06-15' },
        { id: 3, institution: 'Institution C', status: 'Active', expirationDate: '2025-03-20' },
        { id: 4, institution: 'Institution D', status: 'Suspended', expirationDate: '2024-09-01' },
    ];

    const handleLogout = () => {
        console.log('Logging out...');
        // Add logout logic here
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar
                isOpen={isMobileSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
            />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="Dashboard" userName="Super Admin" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    {/* Stats Row */}
                    <div className={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <StatCard
                                key={index}
                                title={stat.title}
                                value={stat.value}
                                subtitle={stat.subtitle}
                            />
                        ))}
                    </div>

                    {/* Recent Activity Table */}
                    <LicenseTable data={recentLicenses} />
                </div>
            </main>
        </div>
    );
};

export default MainPageDashborad;
