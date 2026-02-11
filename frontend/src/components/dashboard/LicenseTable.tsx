import React from 'react';
import styles from './LicenseTable.module.css';
import { type LicenseData } from '../../services/licenseDashboardService';

interface LicenseTableProps {
    data: LicenseData[];
    onUpdateStatus?: (id: number, status: string) => void;
}

const LicenseTable: React.FC<LicenseTableProps> = ({ data, onUpdateStatus }) => {

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'activa': return styles.active;
            case 'activo': return styles.active; // Handle both
            case 'vencida': return styles.expired;
            case 'expirado': return styles.expired; // Handle both
            case 'suspendida': return styles.suspended;
            case 'inactivo': return styles.suspended; // Handle both
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
                            <th>Payment Reference</th>
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
                                <td>
                                    {row.referencia_pago ? (
                                        <code className={styles.refCode}>{row.referencia_pago}</code>
                                    ) : (
                                        <span className={styles.noRef}>None</span>
                                    )}
                                </td>
                                <td>{row.fecha_vencimiento}</td>
                                <td>
                                    <div className={styles.actions}>
                                        {row.estado === 'pendiente' && (
                                            <>
                                                <button
                                                    className={styles.actionBtn}
                                                    style={{ color: '#166534', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}
                                                    onClick={() => onUpdateStatus?.(row.id, 'activo')}
                                                    title="Approve Payment"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className={styles.actionBtn}
                                                    style={{ color: '#991b1b', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
                                                    onClick={() => onUpdateStatus?.(row.id, 'inactivo')}
                                                    title="Reject Payment"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {row.estado === 'activo' && (
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => onUpdateStatus?.(row.id, 'inactivo')}
                                            >
                                                Suspend
                                            </button>
                                        )}
                                        {row.estado === 'inactivo' && (
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => onUpdateStatus?.(row.id, 'activo')}
                                            >
                                                Re-Activate
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
