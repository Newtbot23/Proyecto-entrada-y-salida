import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './InstitutionsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { PlusIcon, EditIcon, TrashIcon, ExternalLinkIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '../../components/common/Icons';
import { Modal } from '../../components/common/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import { getInstitutions, disableInstitution, enableInstitution } from '../../services/institutionService';
import { API_BASE_URL } from '../../config/api';
import { formatDateSafe } from '../../utils/dateUtils';

const InstitutionsPage: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Pagination & Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    // Query for Institutions
    const {
        data: response,
        isLoading: loading,
        refetch
    } = useQuery({
        queryKey: ['institutions', debouncedSearch, currentPage],
        queryFn: () => getInstitutions({
            search: debouncedSearch,
            statuses: []
        }, currentPage, 10),
    });

    const institutions: any[] = response?.data || [];
    const totalPages = response?.meta?.totalPages || 1;

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

    const [errors, setErrors] = useState<Partial<Record<keyof typeof editFormData, string>>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const REGEX = {
        NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };

    // ✅ VALIDACIÓN EN TIEMPO REAL POR CAMPO
    const validateField = (field: keyof typeof editFormData, value: string) => {
        let error: string | undefined;

        switch (field) {
            case 'nombre_titular':
                if (!value.trim())
                    error = 'El nombre del representante es obligatorio';
                else if (!REGEX.NAME.test(value))
                    error = 'El nombre solo debe contener letras y espacios';
                else if (value.length > 100)
                    error = 'El nombre no debe exceder los 100 caracteres';
                break;
            case 'correo':
                if (!value.trim())
                    error = 'El correo es obligatorio';
                else if (!REGEX.EMAIL.test(value))
                    error = 'Formato de correo inválido';
                else if (value.length > 255)
                    error = 'El correo no debe exceder los 255 caracteres';
                break;
            case 'telefono':
                if (!value.trim())
                    error = 'El teléfono es obligatorio';
                else if (value.startsWith('+'))
                    error = 'No incluya prefijos internacionales como +57';
                else if (!/^(3[0-9]{9}|60[0-9]{8})$/.test(value))
                    error = 'Debe ser un número válido en Colombia (10 dígitos, iniciar en 3 o 60)';
                break;
            case 'direccion':
                if (!value.trim())
                    error = 'La dirección es obligatoria';
                else if (value.length > 255)
                    error = 'La dirección no debe exceder los 255 caracteres';
                break;
        }

        setErrors(prev => ({ ...prev, [field]: error }));
    };

    // ✅ HANDLE CHANGE CON DEBOUNCE 500ms
    const handleChange = (field: keyof typeof editFormData, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            validateField(field, value);
        }, 500);
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof typeof editFormData, string>> = {};

        if (!editFormData.nombre_titular.trim()) {
            newErrors.nombre_titular = 'El nombre del representante es obligatorio';
        } else if (!REGEX.NAME.test(editFormData.nombre_titular)) {
            newErrors.nombre_titular = 'El nombre solo debe contener letras y espacios';
        } else if (editFormData.nombre_titular.length > 100) {
            newErrors.nombre_titular = 'El nombre no debe exceder los 100 caracteres';
        }

        if (!editFormData.correo.trim()) {
            newErrors.correo = 'El correo es obligatorio';
        } else if (!REGEX.EMAIL.test(editFormData.correo)) {
            newErrors.correo = 'Formato de correo inválido';
        } else if (editFormData.correo.length > 255) {
            newErrors.correo = 'El correo no debe exceder los 255 caracteres';
        }

        if (!editFormData.telefono.trim()) {
            newErrors.telefono = 'El teléfono es obligatorio';
        } else if (editFormData.telefono.startsWith('+')) {
            newErrors.telefono = 'No incluya prefijos internacionales como +57';
        } else if (!/^(3[0-9]{9}|60[0-9]{8})$/.test(editFormData.telefono)) {
            newErrors.telefono = 'Debe ser un número válido en Colombia (10 dígitos, iniciar en 3 o 60)';
        }

        if (!editFormData.direccion.trim()) {
            newErrors.direccion = 'La dirección es obligatoria';
        } else if (editFormData.direccion.length > 255) {
            newErrors.direccion = 'La dirección no debe exceder los 255 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        // Reset to page 1 when user starts typing
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
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
        setErrors({});
        setServerError(null);
        setIsEditModalOpen(true);
    };

    const handleViewDetails = (inst: any) => {
        setSelectedInstitution(inst);
        setIsDetailsModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!validate()) return;

        try {
            setIsSaving(true);
            const token = sessionStorage.getItem('authToken');
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
                refetch();
            } else {
                const errorData = await response.json();
                console.error('Update failed:', errorData);
                setServerError(errorData.message || 'Error al actualizar la institución');
            }
        } catch (error) {
            console.error('Failed to update institution:', error);
            setServerError('Error de red al actualizar la institución');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDisableClick = async (inst: any) => {
        if (window.confirm(`¿Estás seguro de que deseas desactivar la institución "${inst.nombre_entidad}"? No se podrá editar mientras esté inactiva.`)) {
            try {
                const idToDisable = inst.nit || inst.id;
                await disableInstitution(idToDisable);
                alert('Institución desactivada exitosamente');
                refetch();
            } catch (error: any) {
                console.error('Failed to disable institution:', error);
                alert(error.response?.data?.message || 'Error al desactivar la institución');
            }
        }
    };

    const handleEnableClick = async (inst: any) => {
        if (window.confirm(`¿Estás seguro de que deseas reactivar la institución "${inst.nombre_entidad}"?`)) {
            try {
                const idToEnable = inst.nit || inst.id;
                await enableInstitution(idToEnable);
                alert('Institución reactivada exitosamente');
                refetch();
            } catch (error: any) {
                console.error('Failed to enable institution:', error);
                alert(error.response?.data?.message || 'Error al reactivar la institución');
            }
        }
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header />

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

                    <div className={styles.controlsContainer}>
                        <label className={styles.searchLabel}>
                            Buscador por nit, correo y nombre de la entidad
                        </label>
                        <div className={styles.searchWrapper}>
                            <SearchIcon
                                width={18}
                                height={18}
                                className={styles.searchIcon}
                            />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className={styles.searchInput}
                            />
                        </div>
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
                                                                onClick={() => handleViewDetails(inst)}
                                                            >
                                                                <ExternalLinkIcon width={18} height={18} />
                                                            </button>
                                                            <button
                                                                className={styles.actionButton}
                                                                title={inst.estado === 'inactivo' ? "No se puede editar inactivos" : "Editar"}
                                                                onClick={() => handleEditClick(inst)}
                                                                disabled={inst.estado === 'inactivo'}
                                                            >
                                                                <EditIcon width={18} height={18} />
                                                            </button>
                                                            {inst.estado === 'inactivo' ? (
                                                                <button
                                                                    className={`${styles.actionButton} ${styles.success}`}
                                                                    title="Reactivar"
                                                                    onClick={() => handleEnableClick(inst)}
                                                                >
                                                                    <CheckIcon width={18} height={18} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className={`${styles.actionButton} ${styles.danger}`}
                                                                    title="Desactivar"
                                                                    onClick={() => handleDisableClick(inst)}
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
                    )}

                    {!loading && institutions.length > 0 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={styles.pageButton}
                            >
                                <ChevronLeftIcon width={16} height={16} />
                                <span>Anterior</span>
                            </button>

                            <span className={styles.pageInfo}>
                                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                            </span>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={styles.pageButton}
                            >
                                <span>Siguiente</span>
                                <ChevronRightIcon width={16} height={16} />
                            </button>
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
                                        <span>{selectedInstitution.licencia?.fecha_vencimiento ? formatDateSafe(selectedInstitution.licencia.fecha_vencimiento) : 'N/A'}</span>
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
                    {serverError && (
                        <div className={styles.serverErrorMessage}>
                            <strong>Error:</strong> {serverError}
                        </div>
                    )}
                    <div className={styles.formGroup}>
                        <label>NIT (Solo lectura)</label>
                        <input type="text" value={editFormData.nit} readOnly className={styles.readOnlyInput} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Nombre (Solo lectura)</label>
                        <input type="text" value={editFormData.nombre_entidad} readOnly className={styles.readOnlyInput} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Representante Legal <span className={styles.requiredStar}>*</span></label>
                        <input
                            type="text"
                            value={editFormData.nombre_titular}
                            onChange={(e) => handleChange('nombre_titular', e.target.value)}
                            className={errors.nombre_titular ? styles.inputError : ''}
                        />
                        {errors.nombre_titular && (
                            <span className={styles.errorText}>
                                {errors.nombre_titular}
                            </span>
                        )}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Correo <span className={styles.requiredStar}>*</span></label>
                        <input
                            type="email"
                            value={editFormData.correo}
                            onChange={(e) => handleChange('correo', e.target.value)}
                            className={errors.correo ? styles.inputError : ''}
                        />
                        {errors.correo && (
                            <span className={styles.errorText}>
                                {errors.correo}
                            </span>
                        )}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Teléfono <span className={styles.requiredStar}>*</span></label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={editFormData.telefono}
                            onChange={(e) => handleChange('telefono', e.target.value)}
                            className={errors.telefono ? styles.inputError : ''}
                        />
                        {errors.telefono && (
                            <span className={styles.errorText}>
                                {errors.telefono}
                            </span>
                        )}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Dirección <span className={styles.requiredStar}>*</span></label>
                        <input
                            type="text"
                            value={editFormData.direccion}
                            onChange={(e) => handleChange('direccion', e.target.value)}
                            className={errors.direccion ? styles.inputError : ''}
                        />
                        {errors.direccion && (
                            <span className={styles.errorText}>
                                {errors.direccion}
                            </span>
                        )}
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelButton} onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InstitutionsPage;
