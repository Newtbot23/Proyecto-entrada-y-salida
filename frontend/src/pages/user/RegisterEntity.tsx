import React, { useState, useEffect } from 'react';
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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (!planId) {
            navigate('/plans');
        }
    }, [planId, navigate]);

    const REGEX = {
        PHONE: /^[0-9]{7,15}$/,
        NIT: /^[0-9]{6,15}$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,  // Letters and spaces only
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validate Validation
        if (name === 'telefono' && !REGEX.PHONE.test(value)) {
            setFieldErrors(prev => ({ ...prev, telefono: ['El teléfono debe tener entre 7 y 15 dígitos'] }));
        } else if (name === 'nit' && !REGEX.NIT.test(value)) {
            setFieldErrors(prev => ({ ...prev, nit: ['El NIT debe tener entre 6 y 15 dígitos'] }));
        } else if (name === 'correo' && !REGEX.EMAIL.test(value)) {
            setFieldErrors(prev => ({ ...prev, correo: ['Formato de correo inválido'] }));
        } else if (name === 'nombre_titular' && !REGEX.NAME.test(value)) {
            setFieldErrors(prev => ({ ...prev, nombre_titular: ['Solo se permiten letras y espacios'] }));
        } else if (name === 'nombre_entidad' && value.length > 200) {
            setFieldErrors(prev => ({ ...prev, nombre_entidad: ['Nombre demasiado largo (máx 200)'] }));
        } else if (name === 'direccion' && value.length > 200) {
            setFieldErrors(prev => ({ ...prev, direccion: ['Dirección demasiado larga (máx 200)'] }));
        } else {
            // Clear error for this field
            if (fieldErrors[name]) {
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final regex check before submit
        const errors: Record<string, string[]> = {};
        if (!REGEX.PHONE.test(formData.telefono)) errors.telefono = ['El teléfono debe tener entre 7 y 15 dígitos'];
        if (!REGEX.NIT.test(formData.nit)) errors.nit = ['El NIT debe tener entre 6 y 15 dígitos'];
        if (!REGEX.EMAIL.test(formData.correo)) errors.correo = ['Formato de correo inválido'];
        if (!REGEX.NAME.test(formData.nombre_titular)) errors.nombre_titular = ['Solo se permiten letras y espacios'];
        if (!formData.nombre_entidad.trim()) errors.nombre_entidad = ['El nombre de la entidad es obligatorio'];
        if (!formData.direccion.trim()) errors.direccion = ['La dirección es obligatoria'];

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            const response = await registrationService.createEntity(formData);

            if (response.success) {
                setSuccess('¡Entidad creada exitosamente! Redirigiendo al registro de administrador...');
                // Wait 2 seconds so the user sees the success message
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
            // Handle ApiError with structured validation errors
            if (err.status === 422 && err.errors) {
                setFieldErrors(err.errors);
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
                            required
                        />
                        {fieldErrors.nombre_entidad && <span className={styles.fieldError}>{fieldErrors.nombre_entidad[0]}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                        />
                        {fieldErrors.correo && <span className={styles.fieldError}>{fieldErrors.correo[0]}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Dirección</label>
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                        />
                        {fieldErrors.direccion && <span className={styles.fieldError}>{fieldErrors.direccion[0]}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Nombre del Representante Legal</label>
                        <input
                            type="text"
                            name="nombre_titular"
                            value={formData.nombre_titular}
                            onChange={handleChange}
                            required
                        />
                        {fieldErrors.nombre_titular && <span className={styles.fieldError}>{fieldErrors.nombre_titular[0]}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Teléfono</label>
                        <input
                            type="number"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            required
                        />
                        {fieldErrors.telefono && <span className={styles.fieldError}>{fieldErrors.telefono[0]}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>NIT</label>
                        <input
                            type="number"
                            name="nit"
                            value={formData.nit}
                            onChange={handleChange}
                            required
                        />
                        {fieldErrors.nit && <span className={styles.fieldError}>{fieldErrors.nit[0]}</span>}
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