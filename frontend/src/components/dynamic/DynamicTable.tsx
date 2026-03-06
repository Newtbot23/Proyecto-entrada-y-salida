import React, { useState, useMemo } from 'react';
import type { TableColumn } from '../../services/dynamicTableService';

interface DynamicTableProps {
    schema: TableColumn[];
    data: any[];
    onEdit?: (record: any) => void;
}

const DynamicTable: React.FC<DynamicTableProps> = ({ schema, data, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    // Filter columns to hide timestamps
    const columns = useMemo(() => 
        schema.filter(col => col.name !== 'created_at' && col.name !== 'updated_at'),
    [schema]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerSearch = searchTerm.toLowerCase();
        return data.filter(row => 
            columns.some(col => {
                const value = row[col.name];
                return value != null && String(value).toLowerCase().includes(lowerSearch);
            })
        );
    }, [data, searchTerm, columns]);

    // Paginate data
    const totalPages = Math.ceil(filteredData.length / recordsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * recordsPerPage;
        return filteredData.slice(startIndex, startIndex + recordsPerPage);
    }, [filteredData, currentPage]);

    // Reset to first page when search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (!data.length) {
        return <div style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem', textAlign: 'center', color: '#6b7280' }}>No hay registros disponibles.</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Search Input */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                    <input
                        type="text"
                        placeholder="Buscar registros..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#008f39'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            {columns.map(col => (
                                <th key={col.name} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', color: '#6b7280', letterSpacing: '0.05em' }}>
                                    {col.name.replace(/_/g, ' ')}
                                </th>
                            ))}
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', color: '#6b7280', letterSpacing: '0.05em' }}>
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIndex) => (
                                <tr key={rowIndex} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s', backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f9fafb' }}>
                                    {columns.map(col => (
                                        <td key={`${rowIndex}-${col.name}`} style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap', color: '#111827' }}>
                                            {row[col.name]}
                                        </td>
                                    ))}
                                    <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        <button
                                            onClick={() => onEdit && onEdit(row)}
                                            style={{
                                                color: '#008f39',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '0.875rem',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f0fdf4')}
                                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    No se encontraron registros que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Mostrando <span style={{ fontWeight: '600', color: '#111827' }}>{(currentPage - 1) * recordsPerPage + 1}</span> a <span style={{ fontWeight: '600', color: '#111827' }}>{Math.min(currentPage * recordsPerPage, filteredData.length)}</span> de <span style={{ fontWeight: '600', color: '#111827' }}>{filteredData.length}</span> registros
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                borderRadius: '0.375rem',
                                border: '1px solid #d1d5db',
                                backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                                color: currentPage === 1 ? '#9ca3af' : '#374151',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                borderRadius: '0.375rem',
                                border: '1px solid #d1d5db',
                                backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DynamicTable;
