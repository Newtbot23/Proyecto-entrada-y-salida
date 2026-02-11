import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registrationService } from '../../services/registrationService';
import styles from './Registration.module.css';

const RegisterAdmin: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { planId, entityData } = (location.state as { planId?: string; entityData?: any }) || {};

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

    useEffect(() => {
        if (!planId || !entityData) {
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
    }, [planId, entityData, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.contrasena !== formData.confirm_contrasena) {
            setError('Passwords do not match');
            return;
        }

        if (!planId || !entityData) {
            setError('Missing entity or plan data. Please start over.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Combine all data for unified registration
            const payload = {
                // Entity Data
                nombre_entidad: entityData.nombre_entidad,
                entidad_correo: entityData.correo,
                direccion: entityData.direccion,
                nombre_titular: entityData.nombre_titular,
                entidad_telefono: entityData.telefono,
                nit: entityData.nit,

                // License Data
                id_plan_lic: planId,

                // Admin User Data
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

            await registrationService.fullRegistration(payload);

            // Redirect to login on success
            alert('Registration completed successfully! Please login.');
            navigate('/login');

        } catch (err: any) {
            setError(err.message || 'Error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Admin Registration</h2>
                <p className={styles.subtitle}>Configuring Admin for: {entityData?.nombre_entidad || 'New Entity'}</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Document Number</label>
                        <input type="text" name="doc" value={formData.doc} onChange={handleChange} required />
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
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>First Name</label>
                            <input type="text" name="primer_nombre" value={formData.primer_nombre} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Second Name (Optional)</label>
                            <input type="text" name="segundo_nombre" value={formData.segundo_nombre} onChange={handleChange} />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>First Last Name</label>
                            <input type="text" name="primer_apellido" value={formData.primer_apellido} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Second Last Name (Optional)</label>
                            <input type="text" name="segundo_apellido" value={formData.segundo_apellido} onChange={handleChange} />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Phone</label>
                        <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required />
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
