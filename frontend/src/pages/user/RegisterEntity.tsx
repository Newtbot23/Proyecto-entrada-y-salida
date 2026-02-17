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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user types
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            const response = await registrationService.createEntity(formData);

            if (response.success) {
                setSuccess('Entity created successfully! Redirecting to admin registration...');
                // Wait 2 seconds so the user sees the success message
                setTimeout(() => {
                    navigate('/register-admin', {
                        state: {
                            planId,
                            entidadId: response.data.id,
                            entidadNombre: formData.nombre_entidad
                        }
                    });
                }, 2000);
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Error creating entity. Please check the form.');
            if (err.errors) {
                setFieldErrors(err.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Entity Registration</h2>
                <p className={styles.subtitle}>Selected Plan ID: {planId}</p>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Entity Name</label>
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
                        <label>Email</label>
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
                        <label>Address</label>
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
                        <label>Legal Representative Name</label>
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
                        <label>Phone</label>
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
                        {loading ? 'Processing...' : success ? 'Redirecting...' : 'Next: Register Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterEntity;