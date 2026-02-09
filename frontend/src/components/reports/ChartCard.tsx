import React from 'react';
import styles from './ChartCard.module.css';

interface ChartCardProps {
    title: string;
    children?: React.ReactNode;
    loading?: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
    title,
    children,
    loading = false,
    isEmpty = false,
    emptyMessage = 'No data available'
}) => {
    return (
        <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>{title}</h3>
            <div className={styles.chartContent}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <p>Loading chart data...</p>
                    </div>
                ) : isEmpty ? (
                    <div className={styles.emptyState}>
                        <p>{emptyMessage}</p>
                    </div>
                ) : (
                    children || (
                        <div className={styles.placeholder}>
                            <p>Chart Placeholder: {title}</p>
                            <p className={styles.placeholderNote}>
                                Integrate chart library here (e.g., Chart.js, Recharts, Victory)
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};
