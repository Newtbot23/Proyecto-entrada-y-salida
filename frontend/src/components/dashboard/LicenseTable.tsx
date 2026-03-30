import React, { useState } from 'react';
import styles from './LicenseTable.module.css';
import { type LicenseData } from '../../services/licenseDashboardService';
import { LicenseDetailsModal } from '../modals/LicenseDetailsModal';
import { Pagination } from '../common/Pagination';
import type { PaginationMeta } from '../../types';

interface LicenseTableProps {
    data: LicenseData[];
    paginationMeta?: PaginationMeta | null;
    onPageChange?: (page: number) => void;
    onUpdateStatus?: (id: number, status: string) => void;
}

const LicenseTable: React.FC<LicenseTableProps> = ({ data, paginationMeta, onPageChange, onUpdateStatus }) => {

    const [selectedLicense, setSelectedLicense] = useState<LicenseData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenDetails = (license: LicenseData) => {
        setSelectedLicense(license);
        setIsModalOpen(true);
    };

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
                <h2 className={styles.title}>Todas las Licencias del Sistema</h2>
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Institución / Entidad</th>
                            <th>Plan</th>
                            <th>Estado</th>
                            <th>Referencia de Pago</th>
                            <th>Fecha de Expiración</th>
                            <th>Acciones</th>
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
                                        <span className={styles.noRef}>Ninguna</span>
                                    )}
                                </td>
                                <td>{row.fecha_vencimiento}</td>
                                <td>
                                    <div className={styles.actions}>
                                        {row.estado === 'activo' && (
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => onUpdateStatus?.(row.id, 'inactivo')}
                                            >
                                                Suspender
                                            </button>
                                        )}
                                        {row.estado === 'inactivo' && (
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => onUpdateStatus?.(row.id, 'activo')}
                                            >
                                                Reactivar
                                            </button>
                                        )}
                                        <button className={styles.actionBtn} onClick={() => handleOpenDetails(row)}>Ver Detalles</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={5} className={styles.emptyMessage}>No se encontraron licencias</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {paginationMeta && onPageChange && (
                <div className={styles.pagination}>
                    <Pagination meta={paginationMeta} onPageChange={onPageChange} />
                </div>
            )}

            <LicenseDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                license={selectedLicense}
            />
        </div>
    );
};

export default LicenseTable;
