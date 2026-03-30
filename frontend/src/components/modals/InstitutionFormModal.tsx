/**
 * Institution Form Modal Component
 * 
 * Modal reutilizable para crear y editar instituciones.
 * Maneja validación tanto en frontend como errores del backend Laravel.
 * 
 * Features:
 * - Validación de formulario en tiempo real
 * - Manejo de errores de validación de Laravel (422)
 * - Modo create/edit con datos iniciales
 * - NIT no editable en modo edición
 * - Estados de carga (loading) durante las peticiones
 * 
 * @author Tu nombre
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import styles from './InstitutionFormModal.module.css';
import type { Institution, InstitutionFormData } from '../../types';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface InstitutionFormModalProps {
    /** Controla si el modal está visible */
    isOpen: boolean;
    /** Callback para cerrar el modal */
    onClose: () => void;
    /** Callback cuando se guarda el formulario (create o edit) */
    onSave: (data: InstitutionFormData) => Promise<void>;
    /** Modo del formulario: crear nueva o editar existente */
    mode: 'create' | 'edit';
    /** Datos iniciales para modo edición */
    initialData?: Institution | null;
}

/**
 * Estado de carga para manejar peticiones asíncronas
 */
type LoadingState = 'idle' | 'saving' | 'success' | 'error';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const InstitutionFormModal: React.FC<InstitutionFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    mode,
    initialData
}) => {
    // ------------------------------------------------------------------------
    // ESTADO DEL COMPONENTE
    // ------------------------------------------------------------------------

    const [formData, setFormData] = useState<InstitutionFormData>({
        nombre_entidad: '',
        correo: '',
        direccion: '',
        nombre_titular: '',
        telefono: '',
        nit: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof InstitutionFormData, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof InstitutionFormData, boolean>>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [loadingState, setLoadingState] = useState<LoadingState>('idle');

    // ------------------------------------------------------------------------
    // EFECTOS
    // ------------------------------------------------------------------------

    useEffect(() => {
        if (isOpen && initialData && mode === 'edit') {
            setFormData({
                nombre_entidad: initialData.nombre_entidad,
                correo: initialData.correo,
                direccion: initialData.direccion,
                nombre_titular: initialData.nombre_titular,
                telefono: initialData.telefono,
                nit: initialData.nit
            });
        } else if (isOpen && mode === 'create') {
            setFormData({
                nombre_entidad: '',
                correo: '',
                direccion: '',
                nombre_titular: '',
                telefono: '',
                nit: ''
            });
        }

        setErrors({});
        setTouched({});
        setServerError(null);
        setLoadingState('idle');
    }, [isOpen, initialData, mode]);

    // ------------------------------------------------------------------------
    // VALIDACIÓN
    // ------------------------------------------------------------------------

    const REGEX = {
        PHONE: /^[0-9]{10}$/,
        NIT: /^[0-9]{6,15}$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        DIRECCION: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.\-#]+$/,
    };

    const runValidation = (data: InstitutionFormData): Partial<Record<keyof InstitutionFormData, string>> => {
        const newErrors: Partial<Record<keyof InstitutionFormData, string>> = {};

        if (!data.nombre_entidad.trim()) {
            newErrors.nombre_entidad = 'El nombre de la institución es obligatorio';
        } else if (data.nombre_entidad.length > 200) {
            newErrors.nombre_entidad = 'El nombre de la institución no debe exceder los 200 caracteres';
        }

        if (!data.correo.trim()) {
            newErrors.correo = 'El correo es obligatorio';
        } else if (!REGEX.EMAIL.test(data.correo)) {
            newErrors.correo = 'Formato de correo inválido';
        } else if (data.correo.length > 200) {
            newErrors.correo = 'El correo no debe exceder los 200 caracteres';
        }

        if (!data.direccion.trim()) {
            newErrors.direccion = 'La dirección es obligatoria';
        } else if (!REGEX.DIRECCION.test(data.direccion)) {
            newErrors.direccion = 'La dirección contiene caracteres no permitidos';
        } else if (data.direccion.length > 200) {
            newErrors.direccion = 'La dirección no debe exceder los 200 caracteres';
        }

        if (!data.nombre_titular.trim()) {
            newErrors.nombre_titular = 'El nombre del representante legal es obligatorio';
        } else if (!REGEX.NAME.test(data.nombre_titular)) {
            newErrors.nombre_titular = 'Solo se permiten letras y espacios';
        } else if (data.nombre_titular.length > 100) {
            newErrors.nombre_titular = 'El nombre no debe exceder los 100 caracteres';
        }

        if (!data.telefono.trim()) {
            newErrors.telefono = 'El teléfono es obligatorio';
        } else if (!REGEX.PHONE.test(data.telefono)) {
            newErrors.telefono = 'El teléfono debe tener exactamente 10 dígitos (sin +57)';
        }

        if (!data.nit.trim()) {
            newErrors.nit = 'El NIT es obligatorio';
        } else if (!REGEX.NIT.test(data.nit)) {
            newErrors.nit = 'El NIT debe tener entre 6 y 15 dígitos';
        }

        return newErrors;
    };

    const validate = (): boolean => {
        const newErrors = runValidation(formData);
        setErrors(newErrors);

        // Al enviar el formulario, marcamos todos los campos como tocados para mostrar cualquier error
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key as keyof InstitutionFormData] = true;
            return acc;
        }, {} as Record<keyof InstitutionFormData, boolean>);
        setTouched(allTouched);

        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        // Validaciones in-line con debounce de 300ms
        const timer = setTimeout(() => {
            const currentErrors = runValidation(formData);

            // Solo mostrar errores de campos que hayan sido tocados (modificados/desenfocados)
            const visibleErrors: Partial<Record<keyof InstitutionFormData, string>> = {};
            (Object.keys(currentErrors) as Array<keyof InstitutionFormData>).forEach((field) => {
                if (touched[field]) {
                    visibleErrors[field] = currentErrors[field];
                }
            });

            setErrors(visibleErrors);
        }, 300);

        return () => clearTimeout(timer);
    }, [formData, touched]);

    // ------------------------------------------------------------------------
    // MANEJADORES DE EVENTOS
    // ------------------------------------------------------------------------

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

        } catch (error: any) {
            setLoadingState('error');

            // Si es un error de validación de API (ApiError)
            if (error.status === 422 && error.errors) {
                // Mapear errores del backend a los campos del formulario
                const backendErrors: Partial<Record<keyof InstitutionFormData, string>> = {};

                // Mapear cada campo si existe en la respuesta
                if (error.errors.nombre_entidad) backendErrors.nombre_entidad = error.errors.nombre_entidad[0];
                if (error.errors.correo) backendErrors.correo = error.errors.correo[0];
                if (error.errors.direccion) backendErrors.direccion = error.errors.direccion[0];
                if (error.errors.nombre_titular) backendErrors.nombre_titular = error.errors.nombre_titular[0];
                if (error.errors.telefono) backendErrors.telefono = error.errors.telefono[0];
                if (error.errors.nit) backendErrors.nit = error.errors.nit[0];

                setErrors(backendErrors);
                setServerError('Por favor corrija los errores en el formulario.');
            } else {
                setServerError(error.message || 'Ocurrió un error inesperado. Por favor intente nuevamente.');
            }
        }
    };

    const handleChange = (field: keyof InstitutionFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Marcar el campo como tocado para activar la validación inline
        setTouched(prev => ({ ...prev, [field]: true }));

        if (serverError) {
            setServerError(null);
        }
    };

    const handleBlur = (field: keyof InstitutionFormData) => {
        // Asegurar que el campo se muestre validado al quitar el foco
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const getTitle = () => {
        return mode === 'create' ? 'Crear Nueva Institución' : 'Editar Institución';
    };

    const isSaveDisabled = loadingState === 'saving' || loadingState === 'success';

    const getSaveButtonText = () => {
        switch (loadingState) {
            case 'saving':
                return 'Guardando...';
            case 'success':
                return '¡Guardado!';
            default:
                return mode === 'create' ? 'Crear Institución' : 'Guardar Cambios';
        }
    };

    // ------------------------------------------------------------------------
    // RENDERIZADO
    // ------------------------------------------------------------------------

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
            <form onSubmit={handleSubmit} className={styles.form}>

                {serverError && (
                    <div className={styles.serverError}>
                        <strong>Error:</strong> {serverError}
                    </div>
                )}

                {mode === 'edit' && initialData && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>ID</label>
                        <input
                            type="text"
                            className={`${styles.input} ${styles.readOnly}`}
                            value={initialData.id}
                            disabled
                            readOnly
                        />
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="nombre_entidad" className={styles.label}>
                        Nombre de la Institución <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="nombre_entidad"
                        type="text"
                        className={`${styles.input} ${errors.nombre_entidad ? styles.inputError : ''}`}
                        value={formData.nombre_entidad}
                        onChange={(e) => handleChange('nombre_entidad', e.target.value)}
                        onBlur={() => handleBlur('nombre_entidad')}
                        placeholder="Ingrese el nombre de la institución"
                        maxLength={200}
                        disabled={isSaveDisabled}
                    />
                    {errors.nombre_entidad && (
                        <span className={styles.errorText}>{errors.nombre_entidad}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="correo" className={styles.label}>
                        Correo Electrónico <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="correo"
                        type="email"
                        className={`${styles.input} ${errors.correo ? styles.inputError : ''}`}
                        value={formData.correo}
                        onChange={(e) => handleChange('correo', e.target.value)}
                        onBlur={() => handleBlur('correo')}
                        placeholder="contact@example.com"
                        maxLength={200}
                        disabled={isSaveDisabled}
                    />
                    {errors.correo && <span className={styles.errorText}>{errors.correo}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="direccion" className={styles.label}>
                        Dirección <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="direccion"
                        className={`${styles.textarea} ${errors.direccion ? styles.inputError : ''}`}
                        value={formData.direccion}
                        onChange={(e) => handleChange('direccion', e.target.value)}
                        onBlur={() => handleBlur('direccion')}
                        placeholder="Ingrese la dirección de la institución"
                        rows={3}
                        maxLength={200}
                        disabled={isSaveDisabled}
                    />
                    {errors.direccion && <span className={styles.errorText}>{errors.direccion}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="nombre_titular" className={styles.label}>
                        Nombre del Representante Legal <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="nombre_titular"
                        type="text"
                        className={`${styles.input} ${errors.nombre_titular ? styles.inputError : ''}`}
                        value={formData.nombre_titular}
                        onChange={(e) => handleChange('nombre_titular', e.target.value)}
                        onBlur={() => handleBlur('nombre_titular')}
                        placeholder="Ingrese el nombre del representante legal"
                        maxLength={100}
                        disabled={isSaveDisabled}
                    />
                    {errors.nombre_titular && (
                        <span className={styles.errorText}>{errors.nombre_titular}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="telefono" className={styles.label}>
                        Teléfono <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="telefono"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className={`${styles.input} ${errors.telefono ? styles.inputError : ''}`}
                        value={formData.telefono}
                        onChange={(e) => {
                            // Remover cualquier caracter que no sea número e imponer el valor al DOM para vaciar 'wqe'
                            let numericValue = e.target.value.replace(/\D/g, '');
                            e.target.value = numericValue;
                            handleChange('telefono', numericValue);
                        }}
                        onBlur={() => handleBlur('telefono')}
                        placeholder="Ej: 3001234567"
                        maxLength={10}
                        disabled={isSaveDisabled}
                    />
                    {errors.telefono && <span className={styles.errorText}>{errors.telefono}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="nit" className={styles.label}>
                        NIT <span className={styles.required}>*</span>
                        {mode === 'edit' && (
                            <span className={styles.immutableNote}> (No se puede cambiar)</span>
                        )}
                    </label>
                    <input
                        id="nit"
                        type="text"
                        className={`${styles.input} ${errors.nit ? styles.inputError : ''} ${mode === 'edit' ? styles.readOnly : ''
                            }`}
                        value={formData.nit}
                        onChange={(e) => {
                            if (mode === 'create') {
                                let numericValue = e.target.value.replace(/\D/g, '');
                                e.target.value = numericValue;
                                handleChange('nit', numericValue);
                            }
                        }}
                        onBlur={() => handleBlur('nit')}
                        placeholder="123456789"
                        maxLength={15}
                        disabled={mode === 'edit' || isSaveDisabled}
                        readOnly={mode === 'edit'}
                    />
                    {errors.nit && <span className={styles.errorText}>{errors.nit}</span>}
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
                        className={`${styles.saveButton} ${loadingState === 'success' ? styles.success : ''
                            } ${loadingState === 'error' ? styles.error : ''}`}
                        disabled={isSaveDisabled}
                    >
                        {getSaveButtonText()}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
