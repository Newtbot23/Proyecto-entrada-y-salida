import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registrationService } from '../../services/registrationService';
import styles from './Registration.module.css';

const RegisterAdmin: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { planId, entidadId, entidadNombre } = (location.state as { planId?: string; entidadId?: number; entidadNombre?: string }) || {};

    const [formData, setFormData] = useState({
        doc: '',
        id_tip_doc: '',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        telefono: '',
        correo: '',
        contrasena: '',
        confirm_contrasena: '',
    });

    interface TipoDoc {
        id_tip_doc: number;
        nombre: string;
    }

    const [tiposDoc, setTiposDoc] = useState<TipoDoc[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (!entidadId) {
            navigate('/plans');
            return;
        }

        const fetchTiposDoc = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tipo-doc`);
                if (!response.ok) throw new Error('Failed to fetch types');
                const data = await response.json();
                setTiposDoc(data);
            } catch (err) {
                console.error('Error fetching doc types:', err);
                setTiposDoc([
                    { id_tip_doc: 1, nombre: 'CC - Cédula de Ciudadanía' },
                    { id_tip_doc: 2, nombre: 'TI - Tarjeta de Identidad' },
                    { id_tip_doc: 3, nombre: 'CE - Cédula de Extranjería' }
                ]);
            }
        };

        fetchTiposDoc();
    }, [planId, entidadId, navigate]);

    const REGEX = {
        NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        DOC_MAX_LENGTH: 20
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validate Regex
        if ((name === 'primer_nombre' || name === 'segundo_nombre' || name === 'primer_apellido' || name === 'segundo_apellido') && value && !REGEX.NAME.test(value)) {
            setFieldErrors(prev => ({ ...prev, [name]: ['Only letters and spaces allowed'] }));
        } else if (name === 'doc' && value.length > REGEX.DOC_MAX_LENGTH) {
            setFieldErrors(prev => ({ ...prev, doc: ['Document number too long'] }));
        } else {
            // Clear error
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

        // Final Client-side Validation
        const errors: Record<string, string[]> = {};
        if (formData.contrasena !== formData.confirm_contrasena) {
            setError('Passwords do not match');
            return;
        }

        if (!REGEX.NAME.test(formData.primer_nombre)) errors.primer_nombre = ['Only letters and spaces allowed'];
        if (!REGEX.NAME.test(formData.primer_apellido)) errors.primer_apellido = ['Only letters and spaces allowed'];

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        if (!planId || !entidadId) {
            setError('Missing entity or plan data. Please start over.');
            return;
        }

        setLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            const payload = {
                id_entidad: entidadId,
                id_plan_lic: planId,
                doc: formData.doc,
                id_tip_doc: formData.id_tip_doc,
                primer_nombre: formData.primer_nombre,
                segundo_nombre: formData.segundo_nombre,
                primer_apellido: formData.primer_apellido,
                segundo_apellido: formData.segundo_apellido,
                user_telefono: formData.telefono,
                user_correo: formData.correo,
                contrasena: formData.contrasena,
            };

            const response = await registrationService.completeEntityRegistration(payload);

            if (response.success) {
                alert('Registration completed successfully! Please login.');
                navigate('/login');
            }
        } catch (err: any) {
            console.error('Final registration error:', err);

            // Handle ApiError from api.ts
            if (err.status === 422 && err.errors) {
                setFieldErrors(err.errors);
                setError('Please correct the highlighted errors.');
            } else {
                setError(err.message || 'Error occurred during registration');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Admin Registration</h2>
                <p className={styles.subtitle}>Configuring Admin for: {entidadNombre || 'New Entity'}</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Document Number</label>
                        <input type="number" name="doc" value={formData.doc} onChange={handleChange} required />
                        {fieldErrors.doc && <span className={styles.fieldError}>{fieldErrors.doc[0]}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Document Type</label>
                        <select name="id_tip_doc" value={formData.id_tip_doc} onChange={handleChange} required>
                            <option value="">Select Type</option>
                            {tiposDoc.map(type => (
                                <option key={type.id_tip_doc} value={type.id_tip_doc}>
                                    {type.nombre}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.id_tip_doc && <span className={styles.fieldError}>{fieldErrors.id_tip_doc[0]}</span>}
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>First Name</label>
                            <input type="text" name="primer_nombre" value={formData.primer_nombre} onChange={handleChange} required />
                            {fieldErrors.primer_nombre && <span className={styles.fieldError}>{fieldErrors.primer_nombre[0]}</span>}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Second Name (Optional)</label>
                            <input type="text" name="segundo_nombre" value={formData.segundo_nombre} onChange={handleChange} />
                            {fieldErrors.segundo_nombre && <span className={styles.fieldError}>{fieldErrors.segundo_nombre[0]}</span>}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>First Last Name</label>
                            <input type="text" name="primer_apellido" value={formData.primer_apellido} onChange={handleChange} required />
                            {fieldErrors.primer_apellido && <span className={styles.fieldError}>{fieldErrors.primer_apellido[0]}</span>}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Second Last Name (Optional)</label>
                            <input type="text" name="segundo_apellido" value={formData.segundo_apellido} onChange={handleChange} />
                            {fieldErrors.segundo_apellido && <span className={styles.fieldError}>{fieldErrors.segundo_apellido[0]}</span>}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Phone</label>
                        <input type="number" name="telefono" value={formData.telefono} onChange={handleChange} required />
                        {fieldErrors.user_telefono && <span className={styles.fieldError}>{fieldErrors.user_telefono[0]}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
                        {fieldErrors.user_correo && <span className={styles.fieldError}>{fieldErrors.user_correo[0]}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required />
                        {fieldErrors.contrasena && <span className={styles.fieldError}>{fieldErrors.contrasena[0]}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Confirm Password</label>
                        <input type="password" name="confirm_contrasena" value={formData.confirm_contrasena} onChange={handleChange} required />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Completing Registration...' : 'Finish Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterAdmin;
