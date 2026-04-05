import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registrationService } from '../../services/registrationService';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { ApiError } from '../../config/api';
import type { CreateEntityDTO } from '../../types';
import styles from './Registration.module.css';

const RegisterEntity: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { planId } = (location.state as { planId?: string }) || {};

    const [formData, setFormData] = useState<CreateEntityDTO>({
        nombre_entidad: '',
        correo: '',
        direccion: '',
        nombre_titular: '',
        telefono: '',
        nit: '',
    });

    const [showModal, setShowModal] = useState(false);
    const [navData, setNavData] = useState<{ planId?: string; entidadId?: number | string; entidadNombre?: string } | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CreateEntityDTO, string>>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!planId) {
            navigate('/plans');
        }
    }, [planId, navigate]);

    const REGEX = {
        PHONE: /^(3[0-9]{9}|60[0-9]{8})$/,
        NIT: /^[0-9]{8,15}(-[0-9])?$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        ENTITY_NAME: /^[^0-9]+$/, // No numbers
        DIRECCION: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.\-#]+$/,
    };

    const validateField = (field: keyof CreateEntityDTO, value: string) => {
        let error: string | undefined;

        switch (field) {
            case 'nombre_entidad':
                if (!value.trim())
                    error = 'El nombre de la entidad es obligatorio';
                else if (!REGEX.ENTITY_NAME.test(value))
                    error = 'El nombre de la entidad no puede contener números';
                break;
            case 'correo':
                if (!value.trim())
                    error = 'El correo es obligatorio';
                else if (!REGEX.EMAIL.test(value))
                    error = 'Formato de correo inválido';
                break;
            case 'direccion':
                if (!value.trim())
                    error = 'La dirección es obligatoria';
                else if (!REGEX.DIRECCION.test(value))
                    error = 'La dirección contiene caracteres no permitidos';
                break;
            case 'nombre_titular':
                if (!value.trim())
                    error = 'El nombre del representante legal es obligatorio';
                else if (/\d/.test(value))
                    error = 'El nombre no puede contener números';
                else if (value.trim().length < 8)
                    error = 'El nombre debe tener al menos 8 caracteres';
                break;
            case 'telefono':
                if (!value.trim())
                    error = 'El teléfono es obligatorio';
                else if (!REGEX.PHONE.test(value))
                    error = 'Debe tener 10 dígitos e iniciar por 3 o 60';
                break;
            case 'nit':
                if (!value.trim())
                    error = 'El NIT es obligatorio';
                else if (!REGEX.NIT.test(value))
                    error = 'El NIT debe tener entre 8 y 15 números';
                break;
        }

        setFieldErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const field = name as keyof CreateEntityDTO;

        setFormData(prev => ({ ...prev, [field]: value }));

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            validateField(field, value);
        }, 500);
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CreateEntityDTO, string>> = {};

        if (!formData.nombre_entidad.trim()) newErrors.nombre_entidad = 'El nombre de la entidad es obligatorio';
        if (!formData.correo.trim()) newErrors.correo = 'El correo es obligatorio';
        if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria';
        if (!formData.nombre_titular.trim()) newErrors.nombre_titular = 'El nombre del representante legal es obligatorio';
        if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
        if (!formData.nit.trim()) newErrors.nit = 'El NIT es obligatorio';

        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- MUTATION REFACTOR (TanStack Query v5) ---
    const mutation = useMutation({
        mutationFn: (data: CreateEntityDTO) => registrationService.createEntity(data),
        onSuccess: (entityData) => {
            setNavData({
                planId,
                entidadId: entityData.id,
                entidadNombre: entityData.entidad.nombre_entidad
            });
            setShowModal(true);
        },
        onError: (err: any) => {
            console.error('Registration failure:', err);
            
            if (err instanceof ApiError && err.status === 422 && err.errors) {
                // Map backend array errors to single string like the frontend ones
                const mappedErrors: Partial<Record<keyof CreateEntityDTO, string>> = {};
                for (const key in err.errors) {
                    mappedErrors[key as keyof CreateEntityDTO] = err.errors[key][0];
                }
                setFieldErrors(mappedErrors);
                setGeneralError('Por favor corrija los errores resaltados.');
            } else {
                setGeneralError(err.message || 'Error al crear la entidad. Por favor verifique el formulario.');
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        if (!validateForm()) {
            setGeneralError('Por favor complete todos los campos requeridos correctamente.');
            return;
        }

        mutation.mutate(formData);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Registro de Entidad</h2>
                <p className={styles.subtitle}>Configuración para el Plan #{planId}</p>

                {generalError && <div className={styles.error}>{generalError}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Nombre de la Entidad <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            name="nombre_entidad"
                            value={formData.nombre_entidad}
                            onChange={handleChange}
                            className={fieldErrors.nombre_entidad ? styles.inputError : ''}
                            disabled={mutation.isPending}
                        />
                        {fieldErrors.nombre_entidad && <span className={styles.fieldError}>{fieldErrors.nombre_entidad}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Correo Electrónico <span className={styles.required}>*</span></label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            className={fieldErrors.correo ? styles.inputError : ''}
                            disabled={mutation.isPending}
                        />
                        {fieldErrors.correo && <span className={styles.fieldError}>{fieldErrors.correo}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Dirección <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            className={fieldErrors.direccion ? styles.inputError : ''}
                            disabled={mutation.isPending}
                        />
                        {fieldErrors.direccion && <span className={styles.fieldError}>{fieldErrors.direccion}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Nombre del Representante Legal <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            name="nombre_titular"
                            value={formData.nombre_titular}
                            onChange={handleChange}
                            className={fieldErrors.nombre_titular ? styles.inputError : ''}
                            disabled={mutation.isPending}
                        />
                        {fieldErrors.nombre_titular && <span className={styles.fieldError}>{fieldErrors.nombre_titular}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Teléfono <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            inputMode="numeric"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className={fieldErrors.telefono ? styles.inputError : ''}
                            disabled={mutation.isPending}
                        />
                        {fieldErrors.telefono && <span className={styles.fieldError}>{fieldErrors.telefono}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>NIT <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            inputMode="numeric"
                            name="nit"
                            value={formData.nit}
                            onChange={handleChange}
                            className={fieldErrors.nit ? styles.inputError : ''}
                            disabled={mutation.isPending}
                        />
                        {fieldErrors.nit && <span className={styles.fieldError}>{fieldErrors.nit}</span>}
                    </div>

                    <button 
                        type="submit" 
                        className={styles.button} 
                        disabled={mutation.isPending || showModal}
                    >
                        {mutation.isPending ? 'Procesando...' : 'Siguiente: Registrar Administrador'}
                    </button>
                </form>
            </div>

            <ConfirmationModal
                isOpen={showModal}
                onClose={() => navigate('/register-admin', { state: navData })}
                onConfirm={() => navigate('/register-admin', { state: navData })}
                title="Entidad Creada Exitosamente"
                message="La entidad se ha creado correctamente y ya puedes proceder a registrar al administrador."
                confirmText="Continuar al Registro de Administrador"
                variant="success"
                isSingleButton={true}
            />
        </div>
    );
};

export default RegisterEntity;