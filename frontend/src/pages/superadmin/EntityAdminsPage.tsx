import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import styles from './EntityAdminsPage.module.css';
import { AdminFormModal } from '../../components/modals/AdminFormModal';
import { Pagination } from '../../components/common/Pagination';
import { apiClient } from '../../config/api';
import type { AdminFormData } from '../../types/admin';

interface EntityAdmin {
    doc: string;
    primer_nombre: string;
    primer_apellido: string;
    correo: string;
    telefono: string;
    estado: string;
    id_rol: number | string;
    nit_entidad: string;
}

export default function EntityAdminsPage() {
    const { nit } = useParams<{ nit: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Queries
    const { data: entityLicenseId } = useQuery({
        queryKey: ['entityDetails', nit],
        queryFn: async () => {
            const response: any = await apiClient.get(`/entidades/${nit}`);
            return response?.licencia?.id || null;
        },
        enabled: !!nit
    });

    const { data: admins = [], isLoading: loading, isError, error } = useQuery<EntityAdmin[]>({
        queryKey: ['entityAdmins', nit],
        queryFn: async () => {
            const responseData: any = await apiClient.get(`/entidades/${nit}/admins`);
            // Defensive filtering on the frontend
            return (responseData || []).filter((admin: any) =>
                String(admin.id_rol) === '1' && String(admin.nit_entidad) === String(nit)
            );
        },
        enabled: !!nit
    });

    // Mutations
    const toggleStatusMutation = useMutation({
        mutationFn: (doc: string) => apiClient.patch(`/usuarios/${doc}/estado`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entityAdmins', nit] });
        },
        onError: (err: any) => {
            alert('Error al cambiar estado: ' + (err.message || 'Desconocido'));
        }
    });

    const createAdminMutation = useMutation({
        mutationFn: async (formData: AdminFormData) => {
            const payload = {
                doc: formData.doc,
                id_tip_doc: 1, // CC
                primer_nombre: formData.nombre.split(' ')[0],
                primer_apellido: formData.nombre.split(' ').slice(1).join(' ') || '',
                telefono: formData.telefono,
                correo: formData.correo,
                contrasena: formData.contrasena,
                id_rol: 1, // Admin role
                nit_entidad: nit,
                id_licencia_sistema: entityLicenseId || 1,
            };
            return apiClient.post('/registration/usuarios', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entityAdmins', nit] });
            setIsModalOpen(false);
        },
        onError: (err: any) => {
            alert('Error al crear administrador: ' + (err.message || 'Desconocido'));
        }
    });

    const toggleStatus = (doc: string) => {
        toggleStatusMutation.mutate(doc);
    };

    const handleCreateAdmin = async (formData: AdminFormData) => {
        await createAdminMutation.mutateAsync(formData);
    };

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    // Pagination calculations
    const totalItems = admins.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAdmins = admins.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header />

                <div className={styles.contentWrapper}>
                    <div className={styles.headerRow}>
                        <button
                            onClick={() => navigate('/superadmin/entities-admins')}
                            className={styles.backButton}
                        >
                            &larr; Volver
                        </button>
                        <div className={styles.titlesWrapper}>
                            <h1 className={styles.pageTitle}>Administradores</h1>
                            <p className={styles.pageSubtitle}>Entidad NIT: {nit}</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className={styles.addBtn}
                        >
                            + Nuevo Admin
                        </button>
                    </div>

                    {isError && <div className={styles.errorAlert}>{(error as any)?.message || 'Error al cargar los administradores.'}</div>}

                    <div className={styles.card}>
                        {loading ? (
                            <div className={styles.loadingState}>Cargando administradores...</div>
                        ) : admins.length === 0 ? (
                            <div className={styles.emptyState}>No hay administradores registrados para esta entidad.</div>
                        ) : (
                            <>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Documento</th>
                                            <th>Nombre Completo</th>
                                            <th>Correo</th>
                                            <th>Teléfono</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedAdmins.map((admin: EntityAdmin) => {
                                            const isActive = admin.estado === 'activo' || admin.estado === '1';
                                            return (
                                                <tr key={admin.doc}>
                                                    <td>{admin.doc}</td>
                                                    <td>{admin.primer_nombre} {admin.primer_apellido}</td>
                                                    <td>{admin.correo}</td>
                                                    <td>{admin.telefono}</td>
                                                    <td>
                                                        <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}>
                                                            {isActive ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => toggleStatus(admin.doc)}
                                                            className={`${styles.actionToggleBtn} ${isActive ? styles.toggleInactivate : styles.toggleActivate}`}
                                                        >
                                                            {isActive ? 'Inactivar' : 'Activar'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {totalItems > itemsPerPage && (
                                    <div className={styles.paginationWrapper}>
                                        <Pagination
                                            meta={{
                                                currentPage,
                                                totalPages,
                                                itemsPerPage,
                                                totalItems
                                            }}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            <AdminFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateAdmin}
                mode="create"
            />
        </div>
    );
}
