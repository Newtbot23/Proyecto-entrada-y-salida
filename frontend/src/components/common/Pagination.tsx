import React from 'react';
import styles from './Pagination.module.css';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import type { PaginationMeta } from '../../types/institution';

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
    const { currentPage, totalPages } = meta;

    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className={styles.pagination}>
            <button
                className={styles.pageButton}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <ChevronLeftIcon width={18} height={18} />
            </button>

            {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                    <button
                        key={`page-${page}`}
                        className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                        {page}
                    </span>
                )
            ))}

            <button
                className={styles.pageButton}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                <ChevronRightIcon width={18} height={18} />
            </button>
        </div>
    );
};
