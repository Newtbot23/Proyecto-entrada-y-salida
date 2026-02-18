import React, { useState, useEffect } from 'react';
import styles from './InstitutionsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { PlusIcon, EditIcon, TrashIcon, ExternalLinkIcon } from '../../components/common/Icons';
import { Modal } from '../../components/common/Modal';

import { API_BASE_URL } from '../../config/api';

const InstitutionsPage: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('Super Admin');

    // Modals State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({
        nombre_entidad: '',
        nit: '',
        correo: '',
        telefono: '',
        direccion: '',
        nombre_titular: ''
    });

    useEffect(() => {
        const adminUserStr = sessionStorage.getItem('adminUser');
        if (adminUserStr) {
            try {
                const adminUser = JSON.parse(adminUserStr);
                setAdminName(adminUser.nombre || 'Super Admin');
            } catch (e) {
                console.error('Error parsing admin user:', e);
            }
        }
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('adminToken');
            const url = `${API_BASE_URL}/entidades`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            // Eager loading should already bring relationships
            const items = data.data?.data || data.data || [];
            if (Array.isArray(items)) {
                setInstitutions(items);
            } else {
                console.warn('Unexpected API response structure:', data);
                setInstitutions([]);
            }
        } catch (error) {
            console.error('Failed to fetch institutions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (inst: any) => {
        setSelectedInstitution(inst);
        setEditFormData({
            nombre_entidad: inst.nombre_entidad || '',
            nit: inst.nit || '',
            correo: inst.correo || '',
            telefono: inst.telefono || '',
            direccion: inst.direccion || '',
            nombre_titular: inst.nombre_titular || ''
        });
        setIsEditModalOpen(true);
    };

    const handleViewDetails = (inst: any) => {
        setSelectedInstitution(inst);
        setIsDetailsModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('adminToken');
            const nitToUpdate = selectedInstitution.nit || selectedInstitution.id;
            const url = `${API_BASE_URL}/entidades/${nitToUpdate}`;

            console.log('Updating institution:', nitToUpdate, 'at:', url);
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });

            if (response.ok) {
                alert('Institución actualizada exitosamente');
                setIsEditModalOpen(false);
                fetchInstitutions();
            } else {
                const errorData = await response.json();
                console.error('Update failed:', errorData);
                alert(errorData.message || 'Error al actualizar la institución');
            }
        } catch (error) {
            console.error('Failed to update institution:', error);
            alert('Error de red al actualizar la institución');
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.replace('/superadmin/login');
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="Instituciones" userName={adminName} role="Administrador" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>Instituciones Registradas</h2>
                            <p className={styles.pageSubtitle}>Administra todas las entidades que usan el sistema</p>
                        </div>
                        <button className={styles.createButton} onClick={() => window.location.href = '/register-entity'}>
                            <PlusIcon width={20} height={20} />
                            <span>Agregar Institución</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>Cargando instituciones...</div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>NIT</th>
                                        <th>Nombre</th>
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
                                            <td colSpan={7} className={styles.emptyState}>No se encontraron instituciones</td>
                                        </tr>
                                    ) : (
                                        institutions.map((inst, idx) => {
                                            // Definitive identification for key and details
                                            const rowKey = inst.nit || inst.id || `inst-${idx}`;

                                            return (
                                                <tr key={rowKey}>
                                                    <td>{inst.nit || inst.id}</td>
                                                    <td>{inst.nombre_entidad}</td>
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
                                                                onClick={() => handleViewDetails(inst)}
                                                            >
                                                                <ExternalLinkIcon width={18} height={18} />
                                                            </button>
                                                            <button
                                                                className={styles.actionButton}
                                                                title="Editar"
                                                                onClick={() => handleEditClick(inst)}
                                                            >
                                                                <EditIcon width={18} height={18} />
                                                            </button>
                                                            <button className={`${styles.actionButton} ${styles.danger}`} title="Eliminar">
                                                                <TrashIcon width={18} height={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* View Institution Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Detalles de la Institución"
            >
                {selectedInstitution && (
                    <div className={styles.detailsModalContent}>
                        <div className={styles.detailsSection}>
                            <h4 className={styles.sectionTitle}>Información General</h4>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailItem}>
                                    <label>NIT:</label>
                                    <span>{selectedInstitution.nit || selectedInstitution.id}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Nombre de la Entidad:</label>
                                    <span>{selectedInstitution.nombre_entidad}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Representante Legal:</label>
                                    <span>{selectedInstitution.nombre_titular}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Correo:</label>
                                    <span>{selectedInstitution.correo}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Teléfono:</label>
                                    <span>{selectedInstitution.telefono}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Dirección:</label>
                                    <span>{selectedInstitution.direccion}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.detailsSection}>
                            <h4 className={styles.sectionTitle}>Licencia y Plan</h4>
                            {selectedInstitution.licencia ? (
                                <div className={styles.detailsGrid}>
                                    <div className={styles.detailItem}>
                                        <label>Plan Actual:</label>
                                        <span className={styles.planBadgeHighlight}>{selectedInstitution.licencia.plan?.nombre_plan || 'N/A'}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>Estado de Licencia:</label>
                                        <span className={`${styles.statusBadge} ${styles[selectedInstitution.licencia.estado]}`}>
                                            {selectedInstitution.licencia.estado}
                                        </span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>Expira el:</label>
                                        <span>{selectedInstitution.licencia.fecha_vencimiento ? new Date(selectedInstitution.licencia.fecha_vencimiento).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>Ref. de Pago:</label>
                                        <code className={styles.refCode}>{selectedInstitution.licencia.referencia_pago || 'Ninguna'}</code>
                                    </div>
                                </div>
                            ) : (
                                <p className={styles.noLicense}>No se encontró licencia actual para esta entidad.</p>
                            )}
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelButton} onClick={() => setIsDetailsModalOpen(false)}>
                                Cerrar
                            </button>
                            <button className={styles.submitButton} onClick={() => {
                                setIsDetailsModalOpen(false);
                                handleEditClick(selectedInstitution);
                            }}>
                                Editar Entidad
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Institution Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Editar Institución"
            >
                <form className={styles.editForm} onSubmit={handleEditSubmit}>
                    <div className={styles.formGroup}>
                        <label>NIT (Solo lectura)</label>
                        <input type="text" value={editFormData.nit} readOnly className={styles.readOnlyInput} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Nombre (Solo lectura)</label>
                        <input type="text" value={editFormData.nombre_entidad} readOnly className={styles.readOnlyInput} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Representante Legal</label>
                        <input
                            type="text"
                            value={editFormData.nombre_titular}
                            onChange={(e) => setEditFormData({ ...editFormData, nombre_titular: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Correo</label>
                        <input
                            type="email"
                            value={editFormData.correo}
                            onChange={(e) => setEditFormData({ ...editFormData, correo: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Teléfono</label>
                        <input
                            type="text"
                            value={editFormData.telefono}
                            onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Dirección</label>
                        <input
                            type="text"
                            value={editFormData.direccion}
                            onChange={(e) => setEditFormData({ ...editFormData, direccion: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelButton} onClick={() => setIsEditModalOpen(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InstitutionsPage;
