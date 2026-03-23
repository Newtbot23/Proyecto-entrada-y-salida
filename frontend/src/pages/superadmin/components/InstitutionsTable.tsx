import React from 'react';
import styles from '../InstitutionsPage.module.css';
import { ExternalLinkIcon, EditIcon, CheckIcon, TrashIcon } from '../../../components/common/Icons';

interface InstitutionsTableProps {
    institutions: any[];
    onViewDetails: (inst: any) => void;
    onEdit: (inst: any) => void;
    onEnable: (inst: any) => void;
    onDisable: (inst: any) => void;
}

export const InstitutionsTable: React.FC<InstitutionsTableProps> = ({ 
    institutions, onViewDetails, onEdit, onEnable, onDisable 
}) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>NIT</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Plan</th>
                        <th>Representante</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {institutions.length === 0 ? (
                        <tr>
                            <td colSpan={8} className={styles.emptyState}>No se encontraron instituciones</td>
                        </tr>
                    ) : (
                        institutions.map((inst, idx) => {
                            const rowKey = inst.nit || inst.id || `inst-${idx}`;
                            return (
                                <tr key={rowKey}>
                                    <td>{inst.nit || inst.id}</td>
                                    <td>{inst.nombre_entidad}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[inst.estado || 'activo']}`}>
                                            {inst.estado || 'activo'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.planBadge}>
                                            {inst.licencia?.plan?.nombre_plan || 'Sin Plan'}
                                        </span>
                                    </td>
                                    <td>{inst.nombre_titular}</td>
                                    <td>{inst.telefono}</td>
                                    <td>{inst.correo}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={styles.actionButton}
                                                title="Ver Detalles"
                                                onClick={() => onViewDetails(inst)}
                                            >
                                                <ExternalLinkIcon width={18} height={18} />
                                            </button>
                                            <button
                                                className={styles.actionButton}
                                                title={inst.estado === 'inactivo' ? "No se puede editar inactivos" : "Editar"}
                                                onClick={() => onEdit(inst)}
                                                disabled={inst.estado === 'inactivo'}
                                            >
                                                <EditIcon width={18} height={18} />
                                            </button>
                                            {inst.estado === 'inactivo' ? (
                                                <button
                                                    className={`${styles.actionButton} ${styles.success}`}
                                                    title="Reactivar"
                                                    onClick={() => onEnable(inst)}
                                                >
                                                    <CheckIcon width={18} height={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    className={`${styles.actionButton} ${styles.danger}`}
                                                    title="Desactivar"
                                                    onClick={() => onDisable(inst)}
                                                >
                                                    <TrashIcon width={18} height={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};
