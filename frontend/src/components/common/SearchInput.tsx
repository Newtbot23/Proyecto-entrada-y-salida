import React from 'react';
import styles from './SearchInput.module.css';
import { SearchIcon } from './Icons';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Search...',
    className = ''
}) => {
    return (
        <div className={`${styles.searchContainer} ${className}`}>
            <SearchIcon width={18} height={18} />
            <input
                type="text"
                className={styles.searchInput}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};
