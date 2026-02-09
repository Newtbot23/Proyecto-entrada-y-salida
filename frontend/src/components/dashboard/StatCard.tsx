import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => {
    return (
        <div className={styles.card}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.value}>{value}</div>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
    );
};

export default StatCard;
