import React from 'react';
import styles from './Plans.module.css';

interface PlanBadgeProps {
    text: string;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ text }) => {
    return (
        <div className={styles.badgeContainer}>
            <span className={styles.badge}>{text}</span>
        </div>
    );
};
