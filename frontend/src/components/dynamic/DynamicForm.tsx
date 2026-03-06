import React, { useState, useEffect } from 'react';
import type { TableColumn } from '../../services/dynamicTableService';
import styles from './DynamicForm.module.css';

interface DynamicFormProps {
    schema: TableColumn[];
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    initialData?: any;
    title?: string;
    onCancel?: () => void;
    immutableFields?: string[];
}

const DynamicForm: React.FC<DynamicFormProps> = ({
    schema,
    onSubmit,
    isLoading = false,
    initialData,
    title,
    onCancel,
    immutableFields = []
}) => {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (initialData) {
            // When editing, we exclude password from the form data to avoid overwriting it with empty string
            // unless the user specifically wants to change it. But per requirements, we don't edit it.
            const editData = { ...initialData };
            delete editData.password;
            setFormData(editData);
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
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const getInputType = (sqlType: string) => {
        if (sqlType.includes('int')) return 'number';
        if (sqlType.includes('date') || sqlType.includes('time')) return 'date';
        if (sqlType.includes('text')) return 'textarea';
        return 'text';
    };

    const editableColumns = schema.filter(
        col => col.name !== 'id' && col.name !== 'created_at' && col.name !== 'updated_at' && !col.auto_increment
    );

    const isShortForm = editableColumns.length <= 5;

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h3 className={styles.title}>{title || 'Agregar Nuevo Registro'}</h3>
            <div className={isShortForm ? styles.horizontalGrid : styles.grid}>
                {editableColumns.map(col => {
                    const isImmutable = initialData && immutableFields.includes(col.name);
                    const isPassword = col.name === 'password';

                    // Hide password if editing (usually password management is separate)
                    if (initialData && isPassword) return null;
                    // If immutableFields specifically includes it, we also follow that
                    if (initialData && immutableFields.includes(col.name) && isPassword) return null;

                    const inputType = isPassword ? 'password' : getInputType(col.type);

                    return (
                        <div key={col.name} className={`${styles.formGroup} ${isImmutable ? styles.immutable : ''}`}>
                            <label className={styles.label}>
                                {col.name.replace(/_/g, ' ')}
                                {col.required && !initialData && <span className={styles.required}> *</span>}
                                {isImmutable && <span className={styles.immutableNote}>(No editable)</span>}
                            </label>
                            {col.foreign ? (
                                <select
                                    name={col.name}
                                    value={formData[col.name] || ''}
                                    onChange={handleChange}
                                    required={col.required && !initialData}
                                    disabled={isImmutable}
                                    className={`${styles.select} ${isImmutable ? styles.readOnly : ''}`}
                                >
                                    <option value="">Seleccione una opción</option>
                                    {col.foreign.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : inputType === 'textarea' ? (
                                <textarea
                                    name={col.name}
                                    value={formData[col.name] || ''}
                                    onChange={handleChange}
                                    required={col.required && !initialData}
                                    readOnly={isImmutable}
                                    className={`${styles.textarea} ${isImmutable ? styles.readOnly : ''}`}
                                />
                            ) : (
                                <input
                                    type={inputType}
                                    name={col.name}
                                    value={formData[col.name] || ''}
                                    onChange={handleChange}
                                    required={col.required && !initialData}
                                    readOnly={isImmutable}
                                    className={`${styles.input} ${isImmutable ? styles.readOnly : ''}`}
                                />
                            )}
                        </div>
                    );
                })}

                <div className={styles.actionsGrid}>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className={`${styles.button} ${styles.cancelButton}`}
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`${styles.button} ${styles.saveButton}`}
                    >
                        {isLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default DynamicForm;
