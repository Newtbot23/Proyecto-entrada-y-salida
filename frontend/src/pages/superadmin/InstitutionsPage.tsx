import React, { useState } from 'react';
import styles from './InstitutionsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

// Hooks
import { useInstitutions } from '../../hooks/useInstitutions';
import { useInstitutionForm } from '../../hooks/useInstitutionForm';

// Components
import { InstitutionsHeader } from './components/InstitutionsHeader';
import { SearchControls } from './components/SearchControls';
import { InstitutionsTable } from './components/InstitutionsTable';
import { InstitutionPagination } from './components/InstitutionPagination';
import { InstitutionDetailsModal } from './components/InstitutionDetailsModal';
import { InstitutionEditModal } from './components/InstitutionEditModal';

const InstitutionsPage: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Lógica principal y de filtrado
    const {
        institutions,
        loading,
        currentPage,
        searchQuery,
        totalPages,
        handleSearchChange,
        handlePageChange,
        handleDisable,
        handleEnable,
        refetch
    } = useInstitutions();

    // Lógica de formularios y modales
    const {
        isEditModalOpen,
        setIsEditModalOpen,
        isDetailsModalOpen,
        setIsDetailsModalOpen,
        selectedInstitution,
        editFormData,
        errors,
        serverError,
        isSaving,
        handleChange,
        handleEditSubmit,
        handleEditClick,
        handleViewDetails
    } = useInstitutionForm(refetch);

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header />

                <div className={styles.contentWrapper}>
                    <InstitutionsHeader />

                    <SearchControls 
                        searchQuery={searchQuery} 
                        onSearchChange={handleSearchChange} 
                    />

                    {loading ? (
                        <div className={styles.loadingContainer}>Cargando instituciones...</div>
                    ) : (
                        <>
                            <InstitutionsTable 
                                institutions={institutions}
                                onViewDetails={handleViewDetails}
                                onEdit={handleEditClick}
                                onEnable={handleEnable}
                                onDisable={handleDisable}
                            />

                            <InstitutionPagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </div>
            </main>

            <InstitutionDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                institution={selectedInstitution}
                onEdit={handleEditClick}
            />

            <InstitutionEditModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                formData={editFormData}
                errors={errors}
                serverError={serverError}
                isSaving={isSaving}
                onChange={handleChange}
                onSubmit={handleEditSubmit}
            />
        </div>
    );
};

export default InstitutionsPage;
