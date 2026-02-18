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

    const REGEX = {
        NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        DOC: /^[0-9]+$/,
        PHONE: /^[0-9]{7,15}$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof AdminFormData, string>> = {};

        if (!formData.doc.trim()) {
            newErrors.doc = 'El número de documento es obligatorio';
        } else if (!REGEX.DOC.test(formData.doc)) {
            newErrors.doc = 'El documento solo debe contener números';
        } else if (formData.doc.length > 20) {
            newErrors.doc = 'El número de documento no debe exceder los 20 dígitos';
        }

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        } else if (!REGEX.NAME.test(formData.nombre)) {
            newErrors.nombre = 'El nombre solo debe contener letras y espacios';
        } else if (formData.nombre.length > 100) {
            newErrors.nombre = 'El nombre no debe exceder los 100 caracteres';
        }

        if (!formData.correo.trim()) {
            newErrors.correo = 'El correo es obligatorio';
        } else if (!REGEX.EMAIL.test(formData.correo)) {
            newErrors.correo = 'Formato de correo inválido';
        } else if (formData.correo.length > 100) {
            newErrors.correo = 'El correo no debe exceder los 100 caracteres';
        }

        if (!formData.telefono.trim()) {
            newErrors.telefono = 'El teléfono es obligatorio';
        } else if (!REGEX.PHONE.test(formData.telefono)) {
            newErrors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos';
        }

        if (mode === 'create' && !formData.contrasena?.trim()) {
            newErrors.contrasena = 'La contraseña es obligatoria para nuevos administradores';
        } else if (formData.contrasena && formData.contrasena.length < 8) {
            newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
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
                setServerError('Ocurrió un error inesperado.');
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
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Crear Nuevo Administrador' : 'Editar Administrador'}>
            <form onSubmit={handleSubmit} className={styles.form}>

                {serverError && (
                    <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        <strong>Error:</strong> {serverError}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label className={styles.label}>Número de Documento <span className={styles.required}>*</span></label>
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
                    <label className={styles.label}>Nombre Completo <span className={styles.required}>*</span></label>
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
                    <label className={styles.label}>Correo Electrónico <span className={styles.required}>*</span></label>
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
                    <label className={styles.label}>Teléfono <span className={styles.required}>*</span></label>
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
                        Contraseña {mode === 'edit' && '(Dejar en blanco para mantener la actual)'} {mode === 'create' && <span className={styles.required}>*</span>}
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
                        Cancelar
                    </button>
                    <button type="submit" className={styles.saveButton} disabled={isSaveDisabled}>
                        {loadingState === 'saving' ? 'Guardando...' : mode === 'create' ? 'Crear Administrador' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
