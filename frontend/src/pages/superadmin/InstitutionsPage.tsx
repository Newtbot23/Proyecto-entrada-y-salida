import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InstitutionsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { InstitutionFormModal } from '../../components/modals/InstitutionFormModal';
import { InstitutionDetailsModal } from '../../components/modals/InstitutionDetailsModal';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { PlusIcon, EditIcon, EyeIcon, TrashIcon, ChevronDownIcon } from '../../components/common/Icons';
import { useDebounce } from '../../hooks/useDebounce';
import type { Institution, InstitutionFormData, InstitutionFilters, PaginationMeta } from '../../types/institution';
import {
    getInstitutions,
    createInstitution,
    updateInstitution,
    disableInstitution
} from '../../services/institutionService';

const InstitutionsPage: React.FC = () => {
    const navigate = useNavigate();

    // Layout state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Data state
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<('active' | 'inactive')[]>([]);
    const [minLicenses, setMinLicenses] = useState<string>('');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // Debounced search
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

    useEffect(() => {
        fetchInstitutions();
    }, [debouncedSearch, selectedStatuses, minLicenses, paginationMeta.currentPage]);

    const fetchInstitutions = async () => {
        try {
            setLoading(true);
            const filters: InstitutionFilters = {
                search: debouncedSearch,
                statuses: selectedStatuses,
                minLicenses: minLicenses ? parseInt(minLicenses) : undefined
            };
            const response = await getInstitutions(filters, paginationMeta.currentPage);
            setInstitutions(response.data);
            setPaginationMeta(response.meta);
        } catch (error) {
            console.error('Failed to fetch institutions:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleLogout = () => {
        console.log('Logging out...');
    };

    const handlePageChange = (page: number) => {
        setPaginationMeta(prev => ({ ...prev, currentPage: page }));
    };

    const handleStatusToggle = (status: 'active' | 'inactive') => {
        setSelectedStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
        setPaginationMeta(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPaginationMeta(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleMinLicensesChange = (value: string) => {
        setMinLicenses(value);
        setPaginationMeta(prev => ({ ...prev, currentPage: 1 }));
    };

    // Create Institution
    const handleCreateClick = () => {
        setFormMode('create');
        setSelectedInstitution(null);
        setIsFormModalOpen(true);
    };

    // Edit Institution
    const handleEditClick = (e: React.MouseEvent, institution: Institution) => {
        e.stopPropagation();
        setFormMode('edit');
        setSelectedInstitution(institution);
        setIsFormModalOpen(true);
    };

    // View Details Modal
    const handleViewClick = (e: React.MouseEvent, institution: Institution) => {
        e.stopPropagation();
        setSelectedInstitution(institution);
        setIsDetailsModalOpen(true);
    };

    // Row Click - Navigate to Details Page
    const handleRowClick = (institution: Institution) => {
        navigate(`/superadmin/institutions/${institution.id}`);
    };

    // Disable Institution
    const handleDisableClick = (e: React.MouseEvent, institution: Institution) => {
        e.stopPropagation();
        setSelectedInstitution(institution);
        setIsConfirmModalOpen(true);
    };

    // Save Institution (Create/Edit)
    const handleSaveInstitution = async (data: InstitutionFormData) => {
        try {
            if (formMode === 'create') {
                await createInstitution(data);
            } else if (formMode === 'edit' && selectedInstitution) {
                await updateInstitution(selectedInstitution.id, data);
            }
            await fetchInstitutions();
        } catch (error) {
            console.error('Failed to save institution:', error);
        }
    };

    // Confirm Disable
    const handleConfirmDisable = async () => {
        if (selectedInstitution) {
            try {
                await disableInstitution(selectedInstitution.id);
                await fetchInstitutions();
            } catch (error) {
                console.error('Failed to disable institution:', error);
            }
        }
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
            />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="Institutions" userName="Super Admin" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>Manage Institutions</h2>
                            <p className={styles.pageSubtitle}>View and manage all registered institutions</p>
                        </div>
                        <button className={styles.createButton} onClick={handleCreateClick}>
                            <PlusIcon width={20} height={20} />
                            <span>Create Institution</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className={styles.filtersContainer}>
                        <SearchInput
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search by name or email..."
                        />

                        <div className={styles.filterGroup}>
                            <div className={styles.dropdown}>
                                <button
                                    className={styles.dropdownButton}
                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                >
                                    <span>
                                        Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}
                                    </span>
                                    <ChevronDownIcon width={16} height={16} />
                                </button>
                                {showStatusDropdown && (
                                    <div className={styles.dropdownMenu}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={selectedStatuses.includes('active')}
                                                onChange={() => handleStatusToggle('active')}
                                            />
                                            <span>Active</span>
                                        </label>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={selectedStatuses.includes('inactive')}
                                                onChange={() => handleStatusToggle('inactive')}
                                            />
                                            <span>Inactive</span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <input
                                type="number"
                                className={styles.licenseInput}
                                placeholder="Min licenses"
                                value={minLicenses}
                                onChange={(e) => handleMinLicensesChange(e.target.value)}
                                min="0"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <p>Loading institutions...</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Institution Name</th>
                                            <th>Contact Email</th>
                                            <th>Status</th>
                                            <th>Active Licenses</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {institutions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className={styles.emptyState}>
                                                    No institutions found. Create your first institution to get started.
                                                </td>
                                            </tr>
                                        ) : (
                                            institutions.map((institution) => (
                                                <tr
                                                    key={institution.id}
                                                    className={styles.clickableRow}
                                                    onClick={() => handleRowClick(institution)}
                                                >
                                                    <td className={styles.institutionName}>{institution.nombre_entidad}</td>
                                                    <td>{institution.correo}</td>
                                                    <td>
                                                        {institution.status && (
                                                            <span className={`${styles.statusBadge} ${styles[institution.status]}`}>
                                                                {institution.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{institution.activeLicensesCount ?? 0}</td>
                                                    <td>
                                                        <div className={styles.actionButtons}>
                                                            <button
                                                                className={styles.actionButton}
                                                                onClick={(e) => handleViewClick(e, institution)}
                                                                title="View Details"
                                                            >
                                                                <EyeIcon width={18} height={18} />
                                                            </button>
                                                            <button
                                                                className={styles.actionButton}
                                                                onClick={(e) => handleEditClick(e, institution)}
                                                                title="Edit"
                                                            >
                                                                <EditIcon width={18} height={18} />
                                                            </button>
                                                            <button
                                                                className={`${styles.actionButton} ${styles.danger}`}
                                                                onClick={(e) => handleDisableClick(e, institution)}
                                                                disabled={institution.status === 'inactive'}
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

                            <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
                        </>
                    )}
                </div>
            </main>

            {/* Institution Form Modal */}
            <InstitutionFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveInstitution}
                mode={formMode}
                initialData={selectedInstitution}
            />

            {/* Institution Details Modal */}
            <InstitutionDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                institution={selectedInstitution}
            />

            {/* Disable Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDisable}
                title="Disable Institution"
                message={`Are you sure you want to disable "${selectedInstitution?.nombre_entidad}"? This will set the institution status to inactive.`}
                confirmText="Disable Institution"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
};

export default InstitutionsPage;
