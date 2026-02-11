import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import styles from './AdminFormModal.module.css';
import type { Admin, AdminFormData } from '../../types/admin';

interface AdminFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AdminFormData) => Promise<void>;
    mode: 'create' | 'edit';
    initialData?: Admin | null;
}

type LoadingState = 'idle' | 'saving' | 'success' | 'error';

export const AdminFormModal: React.FC<AdminFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    mode,
    initialData
}) => {
    const [formData, setFormData] = useState<AdminFormData>({
        doc: '',
        nombre: '',
        telefono: '',
        correo: '',
        contrasena: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof AdminFormData, string>>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [loadingState, setLoadingState] = useState<LoadingState>('idle');

    useEffect(() => {
        if (isOpen && initialData && mode === 'edit') {
            setFormData({
                doc: initialData.doc.toString(),
                nombre: initialData.nombre,
                telefono: initialData.telefono,
                correo: initialData.correo,
                contrasena: '' // Empty for edit
            });
        } else if (isOpen && mode === 'create') {
            setFormData({
                doc: '',
                nombre: '',
                telefono: '',
                correo: '',
                contrasena: ''
            });
        }

        setErrors({});
        setServerError(null);
        setLoadingState('idle');
    }, [isOpen, initialData, mode]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof AdminFormData, string>> = {};

        if (!formData.doc.trim()) {
            newErrors.doc = 'Document number is required';
        }

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'Name is required';
        }

        if (!formData.correo.trim()) {
            newErrors.correo = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            newErrors.correo = 'Invalid email format';
        }

        if (!formData.telefono.trim()) {
            newErrors.telefono = 'Phone is required';
        }

        if (mode === 'create' && !formData.contrasena?.trim()) {
            newErrors.contrasena = 'Password is required for new admins';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!validate()) {
            return;
        }

        try {
            setLoadingState('saving');
            await onSave(formData);
            setLoadingState('success');

            setTimeout(() => {
                onClose();
            }, 500);

        } catch (error) {
            setLoadingState('error');
            if (error instanceof Error) {
                setServerError(error.message);
            } else {
                setServerError('An unexpected error occurred.');
            }
        }
    };

    const handleChange = (field: keyof AdminFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const isSaveDisabled = loadingState === 'saving' || loadingState === 'success';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Create New Admin' : 'Edit Admin'}>
            <form onSubmit={handleSubmit} className={styles.form}>

                {serverError && (
                    <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        <strong>Error:</strong> {serverError}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label className={styles.label}>Document Number <span className={styles.required}>*</span></label>
                    <input
                        type="number"
                        className={`${styles.input} ${errors.doc ? styles.inputError : ''} ${mode === 'edit' ? styles.readOnly : ''}`}
                        value={formData.doc}
                        onChange={(e) => mode === 'create' && handleChange('doc', e.target.value)}
                        disabled={mode === 'edit' || isSaveDisabled}
                    />
                    {errors.doc && <span className={styles.errorText}>{errors.doc}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
                        value={formData.nombre}
                        onChange={(e) => handleChange('nombre', e.target.value)}
                        disabled={isSaveDisabled}
                    />
                    {errors.nombre && <span className={styles.errorText}>{errors.nombre}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address <span className={styles.required}>*</span></label>
                    <input
                        type="email"
                        className={`${styles.input} ${errors.correo ? styles.inputError : ''}`}
                        value={formData.correo}
                        onChange={(e) => handleChange('correo', e.target.value)}
                        disabled={isSaveDisabled}
                    />
                    {errors.correo && <span className={styles.errorText}>{errors.correo}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        className={`${styles.input} ${errors.telefono ? styles.inputError : ''}`}
                        value={formData.telefono}
                        onChange={(e) => handleChange('telefono', e.target.value)}
                        disabled={isSaveDisabled}
                    />
                    {errors.telefono && <span className={styles.errorText}>{errors.telefono}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Password {mode === 'edit' && '(Leave blank to keep current)'} {mode === 'create' && <span className={styles.required}>*</span>}
                    </label>
                    <input
                        type="password"
                        className={`${styles.input} ${errors.contrasena ? styles.inputError : ''}`}
                        value={formData.contrasena}
                        onChange={(e) => handleChange('contrasena', e.target.value)}
                        disabled={isSaveDisabled}
                    />
                    {errors.contrasena && <span className={styles.errorText}>{errors.contrasena}</span>}
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isSaveDisabled}>
                        Cancel
                    </button>
                    <button type="submit" className={styles.saveButton} disabled={isSaveDisabled}>
                        {loadingState === 'saving' ? 'Saving...' : mode === 'create' ? 'Create Admin' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
