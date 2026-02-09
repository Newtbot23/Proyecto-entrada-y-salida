import React from 'react';
import { Modal } from '../common/Modal';
import styles from './InstitutionDetailsModal.module.css';
import type { Institution } from '../../types/institution';

interface InstitutionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    institution: Institution | null;
}

export const InstitutionDetailsModal: React.FC<InstitutionDetailsModalProps> = ({
    isOpen,
    onClose,
    institution
}) => {
    if (!institution) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Institution Details">
            <div className={styles.detailsContainer}>
                <div className={styles.detailRow}>
                    <span className={styles.label}>ID</span>
                    <span className={styles.value}>{institution.id}</span>
                </div>

                <div className={styles.detailRow}>
                    <span className={styles.label}>Institution Name</span>
                    <span className={styles.value}>{institution.nombre_entidad}</span>
                </div>

                <div className={styles.detailRow}>
                    <span className={styles.label}>Email</span>
                    <span className={styles.value}>{institution.correo}</span>
                </div>

                <div className={styles.detailRow}>
                    <span className={styles.label}>Address</span>
                    <span className={styles.value}>{institution.direccion}</span>
                </div>

                <div className={styles.detailRow}>
                    <span className={styles.label}>Legal Representative Name</span>
                    <span className={styles.value}>{institution.nombre_titular}</span>
                </div>

                <div className={styles.detailRow}>
                    <span className={styles.label}>Phone</span>
                    <span className={styles.value}>{institution.telefono}</span>
                </div>

                <div className={styles.detailRow}>
                    <span className={styles.label}>NIT</span>
                    <span className={styles.value}>{institution.nit}</span>
                </div>

                {institution.status && (
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Status</span>
                        <span className={`${styles.statusBadge} ${styles[institution.status]}`}>
                            {institution.status}
                        </span>
                    </div>
                )}

                {institution.activeLicensesCount !== undefined && (
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Active Licenses</span>
                        <span className={styles.value}>{institution.activeLicensesCount}</span>
                    </div>
                )}

                {institution.created_at && (
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Created At</span>
                        <span className={styles.value}>
                            {new Date(institution.created_at).toLocaleDateString()}
                        </span>
                    </div>
                )}

                {institution.updated_at && (
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Last Updated</span>
                        <span className={styles.value}>
                            {new Date(institution.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>
        </Modal>
    );
};
