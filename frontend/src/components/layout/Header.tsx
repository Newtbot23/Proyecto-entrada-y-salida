import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
    title?: string;
    userName?: string;
    role?: string;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    title = 'Dashboard',
    userName = 'Super Admin',
    role = 'Administrator',
    onLogout
}) => {
    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <h1 className={styles.pageTitle}>{title}</h1>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{userName}</span>
                    <span className={styles.userRole}>{role}</span>
                </div>
                <button className={styles.logoutBtn} onClick={onLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
