import React, { useState, useEffect } from 'react';
import styles from './LicensePlansPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/common/Icons';
import { PlanFormModal } from '../../components/modals/PlanFormModal';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import {
    getLicensePlans,
    createLicensePlan,
    updateLicensePlan,
    disableLicensePlan
} from '../../services/licensePlanService';
import type { LicensePlan, PlanFormMode, PlanFormData } from '../../types/licensePlan';

const LicensePlansPage: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [plans, setPlans] = useState<LicensePlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('Super Admin');

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<PlanFormMode>('create');
    const [selectedPlan, setSelectedPlan] = useState<LicensePlan | null>(null);

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
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const data = await getLicensePlans();
            setPlans(data);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async (formData: PlanFormData) => {
        try {
            if (formMode === 'edit' && selectedPlan) {
                await updateLicensePlan(selectedPlan.id, formData);
            } else {
                await createLicensePlan(formData);
            }
            fetchPlans();
        } catch (error) {
            console.error('Error saving plan:', error);
        }
    };

    const handleDeletePlan = async () => {
        if (!selectedPlan) return;
        try {
            await disableLicensePlan(selectedPlan.id);
            fetchPlans();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error disabling plan:', error);
        }
    };

    const openCreateModal = () => {
        setFormMode('create');
        setSelectedPlan(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (plan: LicensePlan) => {
        setFormMode('edit');
        setSelectedPlan(plan);
        setIsFormModalOpen(true);
    };

    const openDeleteModal = (plan: LicensePlan) => {
        setSelectedPlan(plan);
        setIsDeleteModalOpen(true);
    };

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.replace('/superadmin/login');
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="Planes de Licencia" userName={adminName} role="Administrador" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>Planes de Licencia</h2>
                            <p className={styles.pageSubtitle}>Definir niveles de suscripción y precios</p>
                        </div>
                        <button className={styles.createButton} onClick={openCreateModal}>
                            <PlusIcon width={20} height={20} />
                            <span>Crear Nuevo Plan</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>Cargando planes...</div>
                    ) : (
                        <div className={styles.plansGrid}>
                            {plans.length === 0 ? (
                                <p className={styles.emptyState}>No se encontraron planes</p>
                            ) : (
                                plans.map((plan, index) => (
                                    <div key={plan.id || `plan-${index}`} className={styles.planCard}>
                                        <div className={styles.planHeader}>
                                            <h3>{plan.name}</h3>
                                            <div className={styles.planPrice}>
                                                <span className={styles.amount}>${plan.price.toLocaleString()}</span>
                                                <span className={styles.period}>/{plan.billingPeriod === 'yearly' ? 'año' : 'mes'}</span>
                                            </div>
                                        </div>
                                        <div className={styles.planDetails}>
                                            <p>{plan.description}</p>
                                        </div>
                                        <div className={styles.planActions}>
                                            <button className={styles.iconBtn} title="Editar" onClick={() => openEditModal(plan)}>
                                                <EditIcon width={18} height={18} />
                                            </button>
                                            <button className={`${styles.iconBtn} ${styles.danger}`} title="Eliminar" onClick={() => openDeleteModal(plan)}>
                                                <TrashIcon width={18} height={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>

            <PlanFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSavePlan}
                mode={formMode}
                initialData={selectedPlan}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeletePlan}
                title="Deshabilitar Plan de Licencia"
                message={`¿Está seguro de que desea deshabilitar el plan "${selectedPlan?.name}"? Esta acción evitará nuevas suscripciones.`}
                confirmText="Deshabilitar Plan"
                variant="danger"
            />
        </div>
    );
};

export default LicensePlansPage;
