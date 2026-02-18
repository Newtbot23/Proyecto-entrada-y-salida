import React from 'react';
import { Modal } from '../common/Modal';
import styles from './ReportPreviewModal.module.css';

interface ReportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any | any[];
    onDownload: () => void;
    downloading: boolean;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
    isOpen,
    onClose,
    title,
    data,
    onDownload,
    downloading
}) => {
    // Helper to format data for display
    const renderContent = () => {
        if (!data) {
            return <div className={styles.emptyState}>No data available.</div>;
        }

        let displayData: any[] = [];
        if (Array.isArray(data)) {
            displayData = data;
        } else if (data.data && Array.isArray(data.data)) {
            // Handle paginated or wrapped response
            displayData = data.data;
        } else {
            // Single object (e.g. Entity detail)
            displayData = [data];
        }

        if (displayData.length === 0) {
            return <div className={styles.emptyState}>No records found.</div>;
        }

        // Get headers from first item, excluding nested objects/arrays for simplicity in table
        const firstItem = displayData[0];
        const headers = Object.keys(firstItem).filter(key =>
            typeof firstItem[key] !== 'object' || firstItem[key] === null
        );

        return (
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {headers.map(header => (
                                <th key={header}>{header.replace(/_/g, ' ')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((row, idx) => (
                            <tr key={idx}>
                                {headers.map(header => (
                                    <td key={`${idx}-${header}`}>
                                        {row[header]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className={styles.container}>
                {renderContent()}
                <div className={styles.actions}>
                    <button onClick={onClose} className={styles.secondaryBtn}>Cancelar</button>
                    <button onClick={onDownload} className={styles.primaryBtn} disabled={downloading}>
                        {downloading ? 'Descargando...' : 'Descargar PDF'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
