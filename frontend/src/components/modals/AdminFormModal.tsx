import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import styles from './AdminFormModal.module.css';
import type { Admin, AdminFormData } from '../../types';

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

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen && initialData && mode === 'edit') {
            setFormData({
                doc: initialData.doc.toString(),
                nombre: initialData.nombre,
                telefono: initialData.telefono,
                correo: initialData.correo,
                contrasena: ''
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
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/
    };

    // ✅ VALIDACIÓN EN TIEMPO REAL POR CAMPO
    const validateField = (field: keyof AdminFormData, value: string) => {
        let error: string | undefined;

        switch (field) {
            case 'doc':
                if (!value.trim())
                    error = 'El número de documento es obligatorio';
                else if (!REGEX.DOC.test(value))
                    error = 'El documento solo debe contener números';
                else if (value.length < 7 || value.length > 10)
                    error = 'El número de documento debe tener entre 7 y 10 dígitos';
                break;

            case 'nombre':
                if (!value.trim())
                    error = 'El nombre es obligatorio';
                else if (!REGEX.NAME.test(value))
                    error = 'El nombre solo debe contener letras y espacios';
                else if (value.length > 100)
                    error = 'El nombre no debe exceder los 100 caracteres';
                break;

            case 'correo':
                if (!value.trim())
                    error = 'El correo es obligatorio';
                else if (!REGEX.EMAIL.test(value))
                    error = 'Formato de correo inválido';
                else if (value.length > 100)
                    error = 'El correo no debe exceder los 100 caracteres';
                break;

            case 'telefono':
                if (!value.trim())
                    error = 'El teléfono es obligatorio';
                else if (value.startsWith('+'))
                    error = 'No incluya prefijos internacionales como +57';
                else if (!/^(3[0-9]{9}|60[0-9]{8})$/.test(value))
                    error = 'Debe ser un número válido en Colombia (10 dígitos, iniciar en 3 o 60)';
                break;

            case 'contrasena':
                if (mode === 'create' && !value.trim())
                    error = 'La contraseña es obligatoria para nuevos administradores';
                else if (value && !REGEX.PASSWORD.test(value))
                    error = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial';
                break;
        }

        setErrors(prev => ({ ...prev, [field]: error }));
    };

    // ✅ HANDLE CHANGE CON DEBOUNCE 500ms
    const handleChange = (field: keyof AdminFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            validateField(field, value);
        }, 500);
    };


    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof AdminFormData, string>> = {};

        if (!formData.doc.trim()) {
            newErrors.doc = 'El número de documento es obligatorio';
        } else if (!REGEX.DOC.test(formData.doc)) {
            newErrors.doc = 'El documento solo debe contener números';
        } else if (formData.doc.length < 7 || formData.doc.length > 10) {
            newErrors.doc = 'El número de documento debe tener entre 7 y 10 dígitos';
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
        } else if (formData.telefono.startsWith('+')) {
            newErrors.telefono = 'No incluya prefijos internacionales como +57';
        } else if (!/^(3[0-9]{9}|60[0-9]{8})$/.test(formData.telefono)) {
            newErrors.telefono = 'Debe ser un número válido en Colombia (10 dígitos, iniciar en 3 o 60)';
        }

        if (mode === 'create' && !formData.contrasena?.trim()) {
            newErrors.contrasena = 'La contraseña es obligatoria para nuevos administradores';
        } else if (formData.contrasena && !REGEX.PASSWORD.test(formData.contrasena)) {
            newErrors.contrasena = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!validate()) return;

        try {
            setLoadingState('saving');
            await onSave(formData);
            setLoadingState('success');
            setTimeout(onClose, 500);
        } catch (error) {
            setLoadingState('error');
            setServerError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            );
        }
    };

    const isSaveDisabled =
        loadingState === 'saving' || loadingState === 'success';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                mode === 'create'
                    ? 'Crear Nuevo Administrador'
                    : 'Editar Administrador'
            }
        >
            <form onSubmit={handleSubmit} className={styles.form}>
                {serverError && (
                    <div
                        style={{
                            color: '#ef4444',
                            marginBottom: '1rem',
                            fontSize: '0.875rem'
                        }}
                    >
                        <strong>Error:</strong> {serverError}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Número de Documento{' '}
                        <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="number"
                        className={`${styles.input} ${errors.doc ? styles.inputError : ''
                            } ${mode === 'edit' ? styles.readOnly : ''}`}
                        value={formData.doc}
                        onChange={e =>
                            mode === 'create' &&
                            handleChange('doc', e.target.value)
                        }
                        disabled={mode === 'edit' || isSaveDisabled}
                    />
                    {errors.doc && (
                        <span className={styles.errorText}>
                            {errors.doc}
                        </span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Nombre Completo{' '}
                        <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        className={`${styles.input} ${errors.nombre ? styles.inputError : ''
                            }`}
                        value={formData.nombre}
                        onChange={e =>
                            handleChange('nombre', e.target.value)
                        }
                        disabled={isSaveDisabled}
                    />
                    {errors.nombre && (
                        <span className={styles.errorText}>
                            {errors.nombre}
                        </span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Correo Electrónico{' '}
                        <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="email"
                        className={`${styles.input} ${errors.correo ? styles.inputError : ''
                            }`}
                        value={formData.correo}
                        onChange={e =>
                            handleChange('correo', e.target.value)
                        }
                        disabled={isSaveDisabled}
                    />
                    {errors.correo && (
                        <span className={styles.errorText}>
                            {errors.correo}
                        </span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Teléfono{' '}
                        <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        className={`${styles.input} ${errors.telefono ? styles.inputError : ''
                            }`}
                        value={formData.telefono}
                        onChange={e =>
                            handleChange('telefono', e.target.value)
                        }
                        disabled={isSaveDisabled}
                    />
                    {errors.telefono && (
                        <span className={styles.errorText}>
                            {errors.telefono}
                        </span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Contraseña{' '}
                        {mode === 'edit' &&
                            '(Dejar en blanco para mantener la actual)'}{' '}
                        {mode === 'create' && (
                            <span className={styles.required}>*</span>
                        )}
                    </label>
                    <input
                        type="password"
                        className={`${styles.input} ${errors.contrasena ? styles.inputError : ''
                            }`}
                        value={formData.contrasena}
                        onChange={e =>
                            handleChange(
                                'contrasena',
                                e.target.value
                            )
                        }
                        disabled={isSaveDisabled}
                    />
                    {errors.contrasena && (
                        <span className={styles.errorText}>
                            {errors.contrasena}
                        </span>
                    )}
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.cancelButton}
                        disabled={isSaveDisabled}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className={styles.saveButton}
                        disabled={isSaveDisabled}
                    >
                        {loadingState === 'saving'
                            ? 'Guardando...'
                            : mode === 'create'
                                ? 'Crear Administrador'
                                : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};