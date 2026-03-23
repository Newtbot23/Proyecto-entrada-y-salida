import React from 'react';
import styles from '../InstitutionsPage.module.css';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../components/common/Icons';

interface InstitutionPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const InstitutionPagination: React.FC<InstitutionPaginationProps> = ({ 
    currentPage, totalPages, onPageChange 
}) => {
    if (totalPages <= 1) return null;

    return (
        <div className={styles.pagination}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
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
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.pageButton}
            >
                <span>Siguiente</span>
                <ChevronRightIcon width={16} height={16} />
            </button>
        </div>
    );
};
