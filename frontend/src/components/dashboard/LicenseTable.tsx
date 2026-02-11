import React from 'react';
import styles from './LicenseTable.module.css';
import { type LicenseData } from '../../services/licenseDashboardService';

interface LicenseTableProps {
    data: LicenseData[];
    onActivate?: (id: number) => void;
}

const LicenseTable: React.FC<LicenseTableProps> = ({ data, onActivate }) => {

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'activa': return styles.active;
            case 'vencida': return styles.expired;
            case 'suspendida': return styles.suspended;
            case 'pendiente': return styles.expired; // Use expired style for pending for now
            default: return '';
        }
    };

    return (
        <div className={styles.tableContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>All System Licenses</h2>
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Institution / Entity</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Expiration Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.id}>
                                <td>{row.entidad?.nombre_entidad || 'N/A'}</td>
                                <td>{row.plan?.nombre_plan || 'N/A'}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusClass(row.estado)}`}>
                                        {row.estado}
                                    </span>
                                </td>
                                <td>{row.fecha_vencimiento}</td>
                                <td>
                                    <div className={styles.actions}>
                                        {row.estado === 'pendiente' && (
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => onActivate?.(row.id)}
                                            >
                                                Activate
                                            </button>
                                        )}
                                        <button className={styles.actionBtn}>View Details</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={5} className={styles.emptyMessage}>No licenses found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LicenseTable;
