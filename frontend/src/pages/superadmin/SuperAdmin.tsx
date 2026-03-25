import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './SuperAdmin.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/common/Icons';
import { AdminFormModal } from '../../components/modals/AdminFormModal';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import type { Admin, AdminFormData } from '../../types/admin';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin as deleteAdminApi } from '../../services/adminService';

const SuperAdmin: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const queryClient = useQueryClient();

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    // Queries
    const { data: admins = [], isLoading: loading } = useQuery({
        queryKey: ['superAdmins'],
        queryFn: getAdmins
    });

    // Mutations
    const saveMutation = useMutation({
        mutationFn: async ({ mode, formData, admin }: { mode: 'create' | 'edit', formData: AdminFormData, admin?: Admin | null }) => {
            if (mode === 'edit' && admin) {
                return updateAdmin(String(admin.doc), formData);
            } else {
                return createAdmin(formData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['superAdmins'] });
            setIsFormModalOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (doc: string) => deleteAdminApi(doc),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['superAdmins'] });
            setIsDeleteModalOpen(false);
            setSelectedAdmin(null);
        }
    });

    const handleSaveAdmin = async (formData: AdminFormData) => {
        try {
            await saveMutation.mutateAsync({ mode: formMode, formData, admin: selectedAdmin });
        } catch (error) {
            console.error('Error saving admin:', error);
            throw error;
        }
    };

    const handleDeleteAdmin = async () => {
        if (!selectedAdmin) return;
        try {
            await deleteMutation.mutateAsync(String(selectedAdmin.doc));
        } catch (error) {
            console.error('Error deleting admin:', error);
            toast.error('Error deleting admin');
        }
    };


    const openCreateModal = () => {
        setFormMode('create');
        setSelectedAdmin(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (admin: Admin) => {
        setFormMode('edit');
        setSelectedAdmin(admin);
        setIsFormModalOpen(true);
    };

    const openDeleteModal = (admin: Admin) => {
        setSelectedAdmin(admin);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>Administradores del Sistema</h2>
                            <p className={styles.pageSubtitle}>Listar y gestionar credenciales de acceso de SuperAdmin</p>
                        </div>
                        <button className={styles.createButton} onClick={openCreateModal}>
                            <PlusIcon width={20} height={20} />
                            <span>Agregar Administrador</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>Cargando administradores...</div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Doc</th>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Teléfono</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className={styles.emptyState}>No se encontraron administradores</td>
                                        </tr>
                                    ) : (
                                        admins.map(admin => (
                                            <tr key={admin.doc}>
                                                <td>{admin.doc}</td>
                                                <td>{admin.nombre}</td>
                                                <td>{admin.correo}</td>
                                                <td>{admin.telefono}</td>
                                                <td>
                                                    <div className={styles.actionButtons}>
                                                        <button className={styles.actionButton} title="Editar Admin" onClick={() => openEditModal(admin)}>
                                                            <EditIcon width={18} height={18} />
                                                        </button>
                                                        <button className={`${styles.actionButton} ${styles.danger}`} title="Eliminar Admin" onClick={() => openDeleteModal(admin)}>
                                                            <TrashIcon width={18} height={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <AdminFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveAdmin}
                mode={formMode}
                initialData={selectedAdmin}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAdmin}
                title="Eliminar Administrador"
                message={`¿Está seguro de que desea eliminar a ${selectedAdmin?.nombre}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar Admin"
                variant="danger"
            />
        </div>
    );
};

export default SuperAdmin;
