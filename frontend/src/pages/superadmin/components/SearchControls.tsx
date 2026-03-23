import React from 'react';
import styles from '../InstitutionsPage.module.css';
import { SearchIcon } from '../../../components/common/Icons';

interface SearchControlsProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export const SearchControls: React.FC<SearchControlsProps> = ({ searchQuery, onSearchChange }) => {
    return (
        <div className={styles.controlsContainer}>
            <label className={styles.searchLabel}>
                Buscador por nit, correo y nombre de la entidad
            </label>
            <div className={styles.searchWrapper}>
                <SearchIcon
                    width={18}
                    height={18}
                    className={styles.searchIcon}
                />
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
        </div>
    );
};
