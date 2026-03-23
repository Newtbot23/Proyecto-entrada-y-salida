import React from 'react';
import styles from '../InstitutionsPage.module.css';
import { Modal } from '../../../components/common/Modal';
import { formatDateSafe } from '../../../utils/dateUtils';

interface InstitutionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    institution: any;
    onEdit: (inst: any) => void;
}

export const InstitutionDetailsModal: React.FC<InstitutionDetailsModalProps> = ({ 
    isOpen, onClose, institution, onEdit 
}) => {
    if (!institution) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalles de la Institución"
        >
            <div className={styles.detailsModalContent}>
                <div className={styles.detailsSection}>
                    <h4 className={styles.sectionTitle}>Información General</h4>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <label>NIT:</label>
                            <span>{institution.nit || institution.id}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <label>Nombre de la Entidad:</label>
                            <span>{institution.nombre_entidad}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <label>Representante Legal:</label>
                            <span>{institution.nombre_titular}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <label>Correo:</label>
                            <span>{institution.correo}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <label>Teléfono:</label>
                            <span>{institution.telefono}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <label>Dirección:</label>
                            <span>{institution.direccion}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.detailsSection}>
                    <h4 className={styles.sectionTitle}>Licencia y Plan</h4>
                    {institution.licencia ? (
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <label>Plan Actual:</label>
                                <span className={styles.planBadgeHighlight}>{institution.licencia.plan?.nombre_plan || 'N/A'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Estado de Licencia:</label>
                                <span className={`${styles.statusBadge} ${styles[institution.licencia.estado]}`}>
                                    {institution.licencia.estado}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Expira el:</label>
                                <span>{institution.licencia?.fecha_vencimiento ? formatDateSafe(institution.licencia.fecha_vencimiento) : 'N/A'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Ref. de Pago:</label>
                                <code className={styles.refCode}>{institution.licencia.referencia_pago || 'Ninguna'}</code>
                            </div>
                        </div>
                    ) : (
                        <p className={styles.noLicense}>No se encontró licencia actual para esta entidad.</p>
                    )}
                </div>

                <div className={styles.modalActions}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cerrar
                    </button>
                    <button className={styles.submitButton} onClick={() => {
                        onClose();
                        onEdit(institution);
                    }}>
                        Editar Entidad
                    </button>
                </div>
            </div>
        </Modal>
    );
};
