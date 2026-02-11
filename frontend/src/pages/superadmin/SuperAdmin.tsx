import React, { useState, useEffect } from 'react';
import styles from './InstitutionsPage.module.css'; // Reusing layout styles
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/common/Icons';
import { AdminFormModal } from '../../components/modals/AdminFormModal';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import type { Admin, AdminFormData } from '../../types/admin';

const SuperAdmin: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') + '/admins';

            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setAdmins(data.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAdmin = async (formData: AdminFormData) => {
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') + '/admins';
            const url = formMode === 'edit' && selectedAdmin ? `${baseUrl}/${selectedAdmin.id}` : baseUrl;
            const method = formMode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to save admin');
            }

            fetchAdmins();
        } catch (error) {
            console.error('Error saving admin:', error);
            throw error;
        }
    };

    const handleDeleteAdmin = async () => {
        if (!selectedAdmin) return;
        try {
            const token = localStorage.getItem('adminToken');
            const url = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') + `/admins/${selectedAdmin.id}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                fetchAdmins();
                setIsDeleteModalOpen(false);
            }
        } catch (error) {
            console.error('Error deleting admin:', error);
            alert('Error deleting admin');
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
                <Header title="Administrator Management" userName="Super Admin" onLogout={() => window.location.href = '/superadmin/login'} />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>System Administrators</h2>
                            <p className={styles.pageSubtitle}>List and manage SuperAdmin access credentials</p>
                        </div>
                        <button className={styles.createButton} onClick={openCreateModal}>
                            <PlusIcon width={20} height={20} />
                            <span>Add Administrator</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>Loading administrators...</div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Doc</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className={styles.emptyState}>No administrators found</td>
                                        </tr>
                                    ) : (
                                        admins.map(admin => (
                                            <tr key={admin.id}>
                                                <td>{admin.doc}</td>
                                                <td>{admin.nombre}</td>
                                                <td>{admin.correo}</td>
                                                <td>{admin.telefono}</td>
                                                <td>
                                                    <div className={styles.actionButtons}>
                                                        <button className={styles.actionButton} title="Edit Admin" onClick={() => openEditModal(admin)}>
                                                            <EditIcon width={18} height={18} />
                                                        </button>
                                                        <button className={`${styles.actionButton} ${styles.danger}`} title="Delete Admin" onClick={() => openDeleteModal(admin)}>
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
                title="Delete Administrator"
                message={`Are you sure you want to delete ${selectedAdmin?.nombre}? This action cannot be undone.`}
                confirmText="Delete Admin"
                variant="danger"
            />
        </div>
    );
};

export default SuperAdmin;
