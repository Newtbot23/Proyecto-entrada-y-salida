import React, { useState, useEffect } from 'react';
import type { TableColumn } from '../../services/dynamicTableService';

interface DynamicFormProps {
    schema: TableColumn[];
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    initialData?: any;
    title?: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ schema, onSubmit, isLoading = false, initialData, title }) => {
    const [formData, setFormData] = useState<any>(initialData || {});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Initialize form data with defaults or empty strings
            const defaultData: any = {};
            schema.forEach(col => {
                if (col.name !== 'id' && col.name !== 'created_at' && col.name !== 'updated_at') {
                    defaultData[col.name] = col.default || '';
                }
            });
            setFormData(defaultData);
        }
    }, [schema, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Handle basic types, could expand for checkboxes etc.
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const getInputType = (sqlType: string) => {
        if (sqlType.includes('int')) return 'number';
        if (sqlType.includes('date') || sqlType.includes('time')) return 'date'; // simplified
        if (sqlType.includes('text')) return 'textarea';
        // boolean could be checkbox, but sql often tinyint
        return 'text';
    };

    const editableColumns = schema.filter(
        col => col.name !== 'id' && col.name !== 'created_at' && col.name !== 'updated_at'
    );

    return (
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>{title || 'Agregar Nuevo Registro'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {editableColumns.map(col => {
                    const inputType = getInputType(col.type);
                    return (
                        <div key={col.name} style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>
                                {col.name.replace(/_/g, ' ')}
                                {col.required && <span style={{ color: 'red' }}> *</span>}
                            </label>
                            {inputType === 'textarea' ? (
                                <textarea
                                    name={col.name}
                                    value={formData[col.name] || ''}
                                    onChange={handleChange}
                                    required={col.required}
                                    style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                />
                            ) : (
                                <input
                                    type={inputType}
                                    name={col.name}
                                    value={formData[col.name] || ''}
                                    onChange={handleChange}
                                    required={col.required}
                                    style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: '0.5rem 1.5rem',
                        backgroundColor: '#008f39',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
    );
};

export default DynamicForm;
