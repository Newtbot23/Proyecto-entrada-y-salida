import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    userName: string;
    roleLabel: string;
    role: 'superadmin' | 'admin';
    onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    title,
    userName,
    roleLabel,
    role,
    onLogout
}) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar
                isOpen={isMobileSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
                role={role}
            />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header
                    title={title}
                    userName={userName}
                    role={roleLabel}
                    onLogout={onLogout}
                />

                <div className={styles.contentWrapper}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
