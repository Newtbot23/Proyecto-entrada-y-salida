import React, { useState, useEffect } from 'react';
import styles from './LicensePlansPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { PlanFormModal } from '../../components/modals/PlanFormModal';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { PlusIcon, EditIcon, CopyIcon, TrashIcon } from '../../components/common/Icons';
import type { LicensePlan, PlanFormMode, PlanFormData } from '../../types/licensePlan';
import {
    getLicensePlans,
    createLicensePlan,
    updateLicensePlan,
    duplicateLicensePlan,
    disableLicensePlan
} from '../../services/licensePlanService';

const LicensePlansPage: React.FC = () => {
    // Layout state
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Data state
    const [plans, setPlans] = useState<LicensePlan[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<PlanFormMode>('create');
    const [selectedPlan, setSelectedPlan] = useState<LicensePlan | null>(null);

    useEffect(() => {
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

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleLogout = () => {
        console.log('Logging out...');
        // Add logout logic here
    };

    // Create Plan
    const handleCreateClick = () => {
        setFormMode('create');
        setSelectedPlan(null);
        setIsFormModalOpen(true);
    };

    // Edit Plan
    const handleEditClick = (plan: LicensePlan) => {
        setFormMode('edit');
        setSelectedPlan(plan);
        setIsFormModalOpen(true);
    };

    // Duplicate Plan
    const handleDuplicateClick = (plan: LicensePlan) => {
        setFormMode('duplicate');
        setSelectedPlan(plan);
        setIsFormModalOpen(true);
    };

    // Disable Plan
    const handleDisableClick = (plan: LicensePlan) => {
        setSelectedPlan(plan);
        setIsConfirmModalOpen(true);
    };

    // Save Plan (Create/Edit/Duplicate)
    const handleSavePlan = async (data: PlanFormData) => {
        try {
            if (formMode === 'create') {
                await createLicensePlan(data);
            } else if (formMode === 'edit' && selectedPlan) {
                await updateLicensePlan(selectedPlan.id, data);
            } else if (formMode === 'duplicate' && selectedPlan) {
                await duplicateLicensePlan(selectedPlan.id, data);
            }
            await fetchPlans();
        } catch (error) {
            console.error('Failed to save plan:', error);
        }
    };

    // Confirm Disable
    const handleConfirmDisable = async () => {
        if (selectedPlan) {
            try {
                await disableLicensePlan(selectedPlan.id);
                await fetchPlans();
            } catch (error) {
                console.error('Failed to disable plan:', error);
            }
        }
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar
                isOpen={isMobileSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
            />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="License Plans" userName="Super Admin" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>Manage License Plans</h2>
                            <p className={styles.pageSubtitle}>Create and manage subscription plans for institutions</p>
                        </div>
                        <button className={styles.createButton} onClick={handleCreateClick}>
                            <PlusIcon width={20} height={20} />
                            <span>Create Plan</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <p>Loading plans...</p>
                        </div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Plan Name</th>
                                        <th>Price</th>
                                        <th>Billing Period</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className={styles.emptyState}>
                                                No license plans found. Create your first plan to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        plans.map((plan) => (
                                            <tr key={plan.id}>
                                                <td className={styles.planName}>{plan.name}</td>
                                                <td>${plan.price.toFixed(2)}</td>
                                                <td className={styles.capitalize}>{plan.billingPeriod}</td>
                                                <td>{plan.duration} months</td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${styles[plan.status]}`}>
                                                        {plan.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actionButtons}>
                                                        <button
                                                            className={styles.actionButton}
                                                            onClick={() => handleEditClick(plan)}
                                                            title="Edit"
                                                        >
                                                            <EditIcon width={18} height={18} />
                                                        </button>
                                                        <button
                                                            className={styles.actionButton}
                                                            onClick={() => handleDuplicateClick(plan)}
                                                            title="Duplicate"
                                                        >
                                                            <CopyIcon width={18} height={18} />
                                                        </button>
                                                        <button
                                                            className={`${styles.actionButton} ${styles.danger}`}
                                                            onClick={() => handleDisableClick(plan)}
                                                            disabled={plan.status === 'disabled'}
                                                            title="Disable"
                                                        >
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

            {/* Plan Form Modal */}
            <PlanFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSavePlan}
                mode={formMode}
                initialData={selectedPlan}
            />

            {/* Disable Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDisable}
                title="Disable License Plan"
                message={`Are you sure you want to disable "${selectedPlan?.name}"? This action will prevent new subscriptions but won't affect existing ones.`}
                confirmText="Disable Plan"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
};

export default LicensePlansPage;
