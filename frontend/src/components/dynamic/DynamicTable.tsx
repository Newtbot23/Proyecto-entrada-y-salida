import React from 'react';
import type { TableColumn } from '../../services/dynamicTableService';

interface DynamicTableProps {
    schema: TableColumn[];
    data: any[];
    onEdit?: (record: any) => void;
}

const DynamicTable: React.FC<DynamicTableProps> = ({ schema, data, onEdit }) => {
    if (!data.length) {
        return <div style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem', textAlign: 'center', color: '#6b7280' }}>No hay registros disponibles.</div>;
    }

    const columns = schema; // We might want to filter or order columns

    return (
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
                    {data.map((row, rowIndex) => (
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
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DynamicTable;
