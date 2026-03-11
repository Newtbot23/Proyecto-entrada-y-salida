import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { registrationService } from '../../../services/registrationService';
import styles from '../Registration.module.css';

const RegisterUser: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const qrToken = searchParams.get('token');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        doc: '',
        id_tip_doc: '1',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        telefono: '',
        correo: '',
        contrasena: '',
        // Predeterminados según el requerimiento
        nit_entidad: '', // Will be resolved by backend via token
        id_rol: 2,
    });

    useEffect(() => {
        if (qrToken) {
            // Provide a visual cue or just let the user know they are registering via an invitation link
            console.log("Registering via QR Invitation token.");
        }
    }, [qrToken]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (qrToken) {
                // Remove nit_entidad from payload as it will be decoded from the token in the backend
                const { nit_entidad, ...userDataWithoutNit } = formData;
                await registrationService.registerUserWithQr(userDataWithoutNit, qrToken);
            } else {
                await registrationService.registerUser(formData);
            }
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Error al registrar el usuario. Por favor verifica los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ maxWidth: '600px', width: '90%' }}>
                <h2 className={styles.title}>Registro de Usuario</h2>
                <p className={styles.subtitle}>Crea una cuenta completando la siguiente información.</p>

                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label>Tipo de Documento *</label>
                            <select
                                name="id_tip_doc"
                                value={formData.id_tip_doc}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                            >
                                <option value="1">Cédula de Ciudadanía</option>
                                <option value="2">Tarjeta de Identidad</option>
                                <option value="3">Cédula de Extranjería</option>
                                <option value="4">Pasaporte</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Número de Documento *</label>
                            <input
                                type="text"
                                name="doc"
                                value={formData.doc}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label>Primer Nombre *</label>
                            <input
                                type="text"
                                name="primer_nombre"
                                value={formData.primer_nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Segundo Nombre</label>
                            <input
                                type="text"
                                name="segundo_nombre"
                                value={formData.segundo_nombre}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label>Primer Apellido *</label>
                            <input
                                type="text"
                                name="primer_apellido"
                                value={formData.primer_apellido}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Segundo Apellido</label>
                            <input
                                type="text"
                                name="segundo_apellido"
                                value={formData.segundo_apellido}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Teléfono *</label>
                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Correo Electrónico *</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Contraseña *</label>
                        <input
                            type="password"
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>¿Ya tienes una cuenta? </span>
                        <a href="/login" style={{ color: '#008f39', fontSize: '0.875rem', fontWeight: 'bold' }}>
                            Iniciar Sesión
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterUser;
