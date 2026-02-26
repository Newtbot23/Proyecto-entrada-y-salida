import React from 'react';
import { Modal } from '../common/Modal';
import styles from './LicenseDetailsModal.module.css';
import { type LicenseData } from '../../services/licenseDashboardService';
import { formatDateSafe } from '../../utils/dateUtils';

interface LicenseDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    license: LicenseData | null;
}

export const LicenseDetailsModal: React.FC<LicenseDetailsModalProps> = ({
    isOpen,
    onClose,
    license
}) => {
    if (!license) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalles de la Licencia">
            <div className={styles.detailsContainer}>

                {/* Primera Tarjeta: Información de Entidad y Plan */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionTitleContainer}>
                        <h3 className={styles.sectionTitle}>INFORMACIÓN GENERAL</h3>
                        <div className={styles.titleUnderline}></div>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>ID DE LICENCIA:</span>
                            <span className={styles.valueHighlight}>{license.id}</span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.label}>ESTADO ACTUAL:</span>
                            <span className={`${styles.statusBadge} ${styles[license.estado] || ''}`}>
                                {license.estado}
                            </span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.label}>NOMBRE DE LA ENTIDAD:</span>
                            <span className={styles.value}>{license.entidad?.nombre_entidad || 'N/A'}</span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.label}>PLAN ASIGNADO:</span>
                            <span className={styles.value}>{license.plan?.nombre_plan || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Segunda Tarjeta: Pagos y Tiempos */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionTitleContainer}>
                        <h3 className={styles.sectionTitle}>FECHAS Y COMPROBANTE</h3>
                        <div className={styles.titleUnderline}></div>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>FECHA DE INICIO:</span>
                            <span className={styles.value}>{formatDateSafe(license.fecha_inicio)}</span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.label}>FECHA DE VENCIMIENTO:</span>
                            <span className={styles.value}>{formatDateSafe(license.fecha_vencimiento)}</span>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }} className={styles.detailRow}>
                            <span className={styles.label}>STRIPE REFERENCIA (ID):</span>
                            <span className={styles.value}>{license.referencia_pago || 'No registrada'}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.closeButton} onClick={onClose}>
                        Cerrar
                    </button>
                </div>

            </div>
        </Modal>
    );
};
