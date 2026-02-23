import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registrationService } from '../../services/registrationService';
import styles from './Registration.module.css';

const RegisterEntity: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { planId } = (location.state as { planId?: string }) || {};

    const [formData, setFormData] = useState({
        nombre_entidad: '',
        correo: '',
        direccion: '',
        nombre_titular: '',
        telefono: '',
        nit: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

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
        REP_LEGAL_NAME: /^[^0-9]{8,}$/, // No numbers, min 8 chars
    };

    const validateField = (field: keyof typeof formData, value: string) => {
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
                    error = 'Debe ser un número válido en Colombia (10 dígitos, iniciar en 3 o 60)';
                break;
            case 'nit':
                if (!value.trim())
                    error = 'El NIT es obligatorio';
                else if (!REGEX.NIT.test(value))
                    error = 'El NIT debe tener entre 8 y 15 números, y puede incluir un dígito de verificación opcional (Ej: 12345678-9)';
                break;
        }

        setFieldErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const field = name as keyof typeof formData;

        setFormData(prev => ({ ...prev, [field]: value }));

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            validateField(field, value);
        }, 500);
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof typeof formData, string>> = {};

        if (!formData.nombre_entidad.trim()) {
            newErrors.nombre_entidad = 'El nombre de la entidad es obligatorio';
        } else if (!REGEX.ENTITY_NAME.test(formData.nombre_entidad)) {
            newErrors.nombre_entidad = 'El nombre de la entidad no puede contener números';
        }

        if (!formData.correo.trim()) {
            newErrors.correo = 'El correo es obligatorio';
        } else if (!REGEX.EMAIL.test(formData.correo)) {
            newErrors.correo = 'Formato de correo inválido';
        }

        if (!formData.direccion.trim()) {
            newErrors.direccion = 'La dirección es obligatoria';
        }

        if (!formData.nombre_titular.trim()) {
            newErrors.nombre_titular = 'El nombre del representante legal es obligatorio';
        } else if (/\d/.test(formData.nombre_titular)) {
            newErrors.nombre_titular = 'El nombre no puede contener números';
        } else if (formData.nombre_titular.trim().length < 8) {
            newErrors.nombre_titular = 'El nombre debe tener al menos 8 caracteres';
        }

        if (!formData.telefono.trim()) {
            newErrors.telefono = 'El teléfono es obligatorio';
        } else if (!REGEX.PHONE.test(formData.telefono)) {
            newErrors.telefono = 'Debe ser un número válido en Colombia (10 dígitos, iniciar en 3 o 60)';
        }

        if (!formData.nit.trim()) {
            newErrors.nit = 'El NIT es obligatorio';
        } else if (!REGEX.NIT.test(formData.nit)) {
            newErrors.nit = 'El NIT debe tener entre 8 y 15 números, y puede incluir un dígito de verificación opcional (Ej: 12345678-9)';
        }

        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            const response = await registrationService.createEntity(formData);

            if (response.success) {
                setSuccess('¡Entidad creada exitosamente! Redirigiendo al registro de administrador...');
                setTimeout(() => {
                    navigate('/register-admin', {
                        state: {
                            planId,
                            entidadId: response.data.id || response.data.entidad.nit,
                            entidadNombre: formData.nombre_entidad
                        }
                    });
                }, 2000);
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            if (err.status === 422 && err.errors) {
                // Map backend array errors to single string like the frontend ones
                const mappedErrors: Partial<Record<keyof typeof formData, string>> = {};
                for (const key in err.errors) {
                    mappedErrors[key as keyof typeof formData] = err.errors[key][0];
                }
                setFieldErrors(mappedErrors);
                setError('Por favor corrija los errores resaltados.');
            } else {
                setError(err.message || 'Error al crear la entidad. Por favor verifique el formulario.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Registro de Entidad</h2>
                <p className={styles.subtitle}>ID del Plan Seleccionado: {planId}</p>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Nombre de la Entidad</label>
                        <input
                            type="text"
                            name="nombre_entidad"
                            value={formData.nombre_entidad}
                            onChange={handleChange}
                            className={fieldErrors.nombre_entidad ? styles.inputError : ''}
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
                        />
                        {fieldErrors.nit && <span className={styles.fieldError}>{fieldErrors.nit}</span>}
                    </div>

                    <button type="submit" className={styles.button} disabled={loading || !!success}>
                        {loading ? 'Procesando...' : success ? 'Redirigiendo...' : 'Siguiente: Registrar Administrador'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterEntity;