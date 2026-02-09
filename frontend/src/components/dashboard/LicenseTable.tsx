import React from 'react';
import styles from './LicenseTable.module.css';

export interface License {
    id: number;
    institution: string;
    status: 'Active' | 'Expired' | 'Suspended';
    expirationDate: string;
}

interface LicenseTableProps {
    data: License[];
}

const LicenseTable: React.FC<LicenseTableProps> = ({ data }) => {

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return styles.active;
            case 'expired': return styles.expired;
            case 'suspended': return styles.suspended;
            default: return '';
        }
    };

    return (
        <div className={styles.tableContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Recent License Activity</h2>
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Entity / Institution Name</th>
                            <th>License Status</th>
                            <th>License Expiration Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.id}>
                                <td>{row.institution}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusClass(row.status)}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td>{row.expirationDate}</td>
                                <td>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn}>View</button>
                                        <button className={styles.actionBtn}>Renew</button>
                                        <button className={styles.actionBtn}>Suspend</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.pagination}>
                <div className={styles.pageNum}>1</div>
                <div className={styles.pageNum}>2</div>
                <button className={styles.pageBtn}>Next</button>
            </div>
        </div>
    );
};

export default LicenseTable;
