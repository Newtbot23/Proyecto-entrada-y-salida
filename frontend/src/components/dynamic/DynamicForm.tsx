import React, { useState, useEffect } from 'react';
import type { TableColumn } from '../../services/dynamicTableService';
import styles from './DynamicForm.module.css';

export interface DynamicFormProps {
    schema: TableColumn[];
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    initialData?: any;
    title?: string;
    onCancel?: () => void;
    immutableFields?: string[];
    hiddenFields?: string[];
    serverErrors?: Record<string, string[]>;
    /** Controls the visual order of fields. Only fields listed here are shown. */
    fieldOrder?: string[];
    /** Custom labels for specific fields, e.g. { id_tip_doc: 'Tipo de Documento' } */
    fieldLabels?: Record<string, string>;
    /** Fields hidden from UI but injected with a fixed value on submit (e.g. { estado: 'activo' }) */
    hiddenWithDefault?: Record<string, string>;
}

const DYNAMIC_REGEX: Record<string, { regex: RegExp; message: string }> = {
    jornada: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{5,20}$/, message: 'Mínimo 5 y máximo 20 caracteres. Solo letras y espacios.' },
    marca: { regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]{2,20}$/, message: 'Mínimo 2 y máximo 20 caracteres. Solo letras, números, guiones.' },
    nave: { regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]{1,50}$/, message: 'Mínimo 1 y máximo 50 caracteres. Solo alfanuméricos y espacios.' },
    programa: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\(\)\-]{5,150}$/, message: 'Mínimo 5 y máximo 150 caracteres. Solo letras, espacios, paréntesis y guiones.' },
    rol: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,20}$/, message: 'Mínimo 3 y máximo 20 caracteres. Solo letras.' },
    sistema_operativo: { regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.]{3,50}$/, message: 'Mínimo 3 y máximo 50 caracteres. Solo letras, números, espacios y puntos.' },
    nombre: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]{2,30}$/, message: 'Mínimo 2 y máximo 30 caracteres. Solo letras, espacios y puntos.' },
    tipo_vehiculo: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/, message: 'Mínimo 3 y máximo 50 caracteres. Solo letras y espacios.' },
};

const DynamicForm: React.FC<DynamicFormProps> = ({
    schema,
    onSubmit,
    isLoading = false,
    initialData,
    title,
    onCancel,
    immutableFields = [],
    hiddenFields = [],
    serverErrors = {},
    fieldOrder,
    fieldLabels = {},
    hiddenWithDefault = {},
}) => {
    const [formData, setFormData] = useState<any>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            const editData = { ...initialData };
            delete editData.password;
            delete editData.contrasena;
            setFormData(editData);
        } else {
            const defaultData: any = {};
            schema.forEach(col => {
                if (col.name !== 'id' && col.name !== 'created_at' && col.name !== 'updated_at') {
                    defaultData[col.name] = col.default || '';
                }
            });
            setFormData(defaultData);
        }
    }, [schema, initialData]);

    const validateField = (name: string, value: any) => {
        if (DYNAMIC_REGEX[name]) {
            if (value && !DYNAMIC_REGEX[name].regex.test(String(value))) {
                setValidationErrors(prev => ({ ...prev, [name]: DYNAMIC_REGEX[name].message }));
            } else {
                setValidationErrors(prev => {
                    if (!prev[name]) return prev;
                    const newErrs = { ...prev };
                    delete newErrs[name];
                    return newErrs;
                });
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            if (fileInput.files && fileInput.files[0]) {
                setFormData((prev: any) => ({ ...prev, [name]: fileInput.files![0] }));
            }
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
        validateField(name, value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        validateField(e.target.name, e.target.value);
    };

    const validateForm = (): boolean => {
        const formErrors: Record<string, string> = {};
        let isValid = true;
        for (const [key, value] of Object.entries(formData)) {
            if (DYNAMIC_REGEX[key] && value) {
                if (!DYNAMIC_REGEX[key].regex.test(String(value))) {
                    formErrors[key] = DYNAMIC_REGEX[key].message;
                    isValid = false;
                }
            }
        }
        setValidationErrors(formErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Merge hidden defaults (e.g. estado: 'activo') into the payload
        const fullData = { ...formData, ...hiddenWithDefault };
        const hasFile = Object.values(fullData).some(val => val instanceof File);

        if (hasFile) {
            const fd = new FormData();
            Object.entries(fullData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    fd.append(key, value as any);
                }
            });
            onSubmit(fd);
        } else {
            onSubmit(fullData);
        }
    };

    const getInputType = (sqlType: string) => {
        if (sqlType.includes('int')) return 'number';
        if (sqlType.includes('date') || sqlType.includes('time')) return 'date';
        if (sqlType.includes('text')) return 'textarea';
        return 'text';
    };

    const getLabel = (colName: string): string =>
        fieldLabels[colName] ?? colName.replace(/_/g, ' ');

    // All editable columns from schema
    const editableColumns = schema.filter(
        col => col.name !== 'id' && col.name !== 'created_at' && col.name !== 'updated_at' && !col.auto_increment
    );

    // When fieldOrder is provided, restrict and sort columns by that order
    const columnsToRender: TableColumn[] = fieldOrder
        ? (fieldOrder
            .map(name => editableColumns.find(col => col.name === name))
            .filter(Boolean) as TableColumn[])
        : editableColumns;

    const useOrderedLayout = !!fieldOrder;
    const isShortForm = !useOrderedLayout && editableColumns.length <= 5;

    const gridClass = useOrderedLayout
        ? styles.twoColGrid
        : isShortForm
        ? styles.horizontalGrid
        : styles.grid;

    const renderField = (col: TableColumn) => {
        const isImmutable = !!(initialData && immutableFields.includes(col.name));
        const isPassword = col.name === 'password' || col.name === 'contrasena';
        const isHidden = hiddenFields.includes(col.name);
        const isImagen = col.name === 'imagen';
        const isFullWidth = useOrderedLayout && isImagen;

        if (isHidden) return null;
        if (initialData && isPassword) return null;

        const inputType = isPassword ? 'password' : getInputType(col.type);

        return (
            <div
                key={col.name}
                className={[
                    styles.formGroup,
                    isImmutable ? styles.immutable : '',
                    isFullWidth ? styles.fullWidth : '',
                ].join(' ')}
            >
                <label className={styles.label}>
                    {getLabel(col.name)}
                    {col.required && !initialData && <span className={styles.required}> *</span>}
                    {isImmutable && <span className={styles.immutableNote}> (No editable)</span>}
                </label>

                {col.foreign ? (
                    <select
                        name={col.name}
                        value={formData[col.name] || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
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
                        onBlur={handleBlur}
                        required={col.required && !initialData}
                        readOnly={isImmutable}
                        className={`${styles.textarea} ${isImmutable ? styles.readOnly : ''}`}
                    />
                ) : isImagen && !isImmutable ? (
                    <input
                        type="file"
                        name={col.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required={col.required && !initialData}
                        accept="image/*"
                        className={styles.input}
                    />
                ) : (
                    <input
                        type={inputType}
                        name={col.name}
                        value={formData[col.name] || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required={col.required && !initialData}
                        readOnly={isImmutable}
                        className={`${styles.input} ${isImmutable ? styles.readOnly : ''}`}
                    />
                )}

                {validationErrors[col.name] && (
                    <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {validationErrors[col.name]}
                    </div>
                )}
                {serverErrors[col.name] && (
                    <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {serverErrors[col.name][0]}
                    </div>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h3 className={styles.title}>{title || 'Agregar Nuevo Registro'}</h3>
            <div className={gridClass}>
                {columnsToRender.map(col => renderField(col))}

                {/* Buttons row — spans full width when using the ordered 2-col layout */}
                <div className={`${styles.actionsGrid} ${useOrderedLayout ? styles.fullWidth : ''}`}>
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
