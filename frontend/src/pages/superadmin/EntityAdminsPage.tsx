import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
}

export default function EntityAdminsPage() {
    const { nit } = useParams<{ nit: string }>();
    const navigate = useNavigate();

    const [admins, setAdmins] = useState<EntityAdmin[]>([]);
    const [entityLicenseId, setEntityLicenseId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (nit) {
            fetchEntityDetails();
            fetchAdmins();
        }
    }, [nit]);

    const fetchEntityDetails = async () => {
        try {
            // Fetch entity to get its associated license id
            const response: any = await apiClient.get(`/entidades/${nit}`);
            if (response && response.licencia && response.licencia.id) {
                setEntityLicenseId(response.licencia.id);
            }
        } catch (err) {
            console.error('Failed to fetch entity details:', err);
        }
    };

    const fetchAdmins = async () => {
        setLoading(true);
        setError(null);
        try {
            const responseData: any = await apiClient.get(`/entidades/${nit}/admins`);

            // Defensive filtering on the frontend to strictly ensure only admins (rol 1) of this nit are shown
            const filteredAdmins = (responseData || []).filter((admin: any) =>
                String(admin.id_rol) === '1' && String(admin.nit_entidad) === String(nit)
            );

            setAdmins(filteredAdmins);
            setCurrentPage(1); // Reset to first page on fetch
        } catch (err: any) {
            setError(err.message || 'Error al cargar los administradores.');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (doc: string) => {
        try {
            const response: any = await apiClient.patch(`/usuarios/${doc}/estado`, {});
            // Since apiClient unwraps the 'data' property of the Axios response:
            // The object `response` is actually the raw JSON data returned by the backend.
            if (response.success) {
                // Update local state
                setAdmins(admins.map(admin =>
                    admin.doc === doc ? { ...admin, estado: response.data.estado } : admin
                ));
            }
        } catch (err: any) {
            alert('Error al cambiar estado: ' + (err.message || 'Desconocido'));
        }
    };

    const handleCreateAdmin = async (formData: AdminFormData) => {
        try {
            // Need to map frontend AdminFormData to backend StoreUsuarioRequest or StoreAdminRequest equivalent.
            // Since role 1 = user type. Let's use the standard admins endpoint if it works, or form an object.

            // Re-formatting payload specifically for standard user registration manually. 
            // In a real app we'd reuse the proper endpoint from UsuariosController.
            // Notice: Using the flow for `/registration/usuarios` we made.

            const payload = {
                doc: formData.doc,
                id_tip_doc: 1, // CC
                primer_nombre: formData.nombre.split(' ')[0], // Simulating first name
                primer_apellido: formData.nombre.split(' ').slice(1).join(' ') || '', // Simulating last names
                telefono: formData.telefono,
                correo: formData.correo,
                contrasena: formData.contrasena,
                id_rol: 1, // Admin role
                nit_entidad: nit, // Injecting the URL NIT!
                id_licencia_sistema: entityLicenseId || 1, // Dynamically use the entity's license ID
            };

            // Using full registration or admin registration. Since we just need an admin, let's POST to `/admins` or `/usuarios-flow`?
            // Wait, we have POST /api/admins logic available which uses `StoreAdminRequest`. 
            // Let's use `apiClient.post('/admins', ...)` but inject `nit_entidad`.

            // Warning: `AdminsController@store` only creates an admin without NIT. 
            // Let's use our `/registration/usuarios` if it supports it, OR manually create through API if we update it.
            // For now, let's use the Registration Flow endpoint.
            // We don't need to read response here necessarily.
            await apiClient.post('/registration/usuarios', payload);

            setIsModalOpen(false);
            fetchAdmins(); // Refresh
        } catch (err: any) {
            alert('Error al crear administrador: ' + (err.message || 'Desconocido'));
            throw err;
        }
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

                    {error && <div className={styles.errorAlert}>{error}</div>}

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
                                        {paginatedAdmins.map(admin => {
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
                                    <div style={{ marginTop: '20px' }}>
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
