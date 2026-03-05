import React, { useState, useEffect } from 'react';
import styles from './ReportFilters.module.css';
import { ChevronDownIcon } from '../common/Icons';
import type { ReportFilters as ReportFiltersType } from '../../types/report';
import { getInstitutionsForFilter, getLicenseTypesForFilter } from '../../services/reportService';

interface ReportFiltersProps {
    filters: ReportFiltersType;
    onFiltersChange: (filters: ReportFiltersType) => void;
    onExport: () => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
    filters,
    onFiltersChange,
    onExport
}) => {
    const [institutions, setInstitutions] = useState<Array<{ id: string; name: string }>>([]);
    const [licenseTypes, setLicenseTypes] = useState<Array<{ id: string; name: string }>>([]);

    useEffect(() => {
        loadFilterOptions();
    }, []);

    const loadFilterOptions = async () => {
        try {
            const [institutionsData, licenseTypesData] = await Promise.all([
                getInstitutionsForFilter(),
                getLicenseTypesForFilter()
            ]);
            setInstitutions(institutionsData);
            setLicenseTypes(licenseTypesData);
        } catch (error) {
            console.error('Failed to load filter options:', error);
        }
    };

    const handleDateChange = (field: 'start' | 'end', value: string) => {
        onFiltersChange({
            ...filters,
            dateRange: {
                ...filters.dateRange,
                [field]: value
            }
        });
    };

    const handleInstitutionChange = (value: string) => {
        onFiltersChange({
            ...filters,
            institutionId: value || undefined
        });
    };

    const handleLicenseTypeChange = (value: string) => {
        onFiltersChange({
            ...filters,
            licenseType: value || undefined
        });
    };

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
                {/* Date Range */}
                <div className={styles.dateRangeGroup}>
                    <label className={styles.label}>Date Range</label>
                    <div className={styles.dateInputs}>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={filters.dateRange.start}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                        />
                        <span className={styles.dateSeparator}>to</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={filters.dateRange.end}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                        />
                    </div>
                </div>

                {/* Institution Filter */}
                <div className={styles.selectGroup}>
                    <label className={styles.label}>Institution</label>
                    <div className={styles.selectWrapper}>
                        <select
                            className={styles.select}
                            value={filters.institutionId || ''}
                            onChange={(e) => handleInstitutionChange(e.target.value)}
                        >
                            <option value="">All Institutions</option>
                            {institutions.map((inst) => (
                                <option key={inst.id} value={inst.id}>
                                    {inst.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon width={16} height={16} className={styles.selectIcon} />
                    </div>
                </div>

                {/* License Type Filter */}
                <div className={styles.selectGroup}>
                    <label className={styles.label}>License Type</label>
                    <div className={styles.selectWrapper}>
                        <select
                            className={styles.select}
                            value={filters.licenseType || ''}
                            onChange={(e) => handleLicenseTypeChange(e.target.value)}
                        >
                            <option value="">All Types</option>
                            {licenseTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon width={16} height={16} className={styles.selectIcon} />
                    </div>
                </div>
            </div>

            {/* Export Button */}
            <button className={styles.exportButton} onClick={onExport}>
                Export Report
            </button>
        </div>
    );
};
