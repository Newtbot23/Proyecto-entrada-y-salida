import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Registration.module.css'; // Reusing registration styles for consistency

const NormalAdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        correo: '',
        contrasena: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EMAIL_REGEX.test(formData.correo)) {
            setError('Formato de correo inválido');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/normaladmin/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(formData),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Inicio de sesión fallido');
            }

            // Store token and user data in sessionStorage
            const { token, user } = result.data;
            sessionStorage.setItem('userToken', token);
            sessionStorage.setItem('userData', JSON.stringify(user));

            // Add consistent keys for AuthContext and Sidebar
            sessionStorage.setItem('adminToken', token);
            sessionStorage.setItem('adminUser', JSON.stringify(user));
            sessionStorage.setItem('userRole', user.id_rol.toString());

            // Phase 15 & 16: Redirect logic based on license
            if (user.license_status === 'pendiente') {
                navigate('/license-payment');
            } else {
                // Redirect to dashboard based on role
                const userRole = Number(user.id_rol);
                if (userRole === 2) {
                    navigate('/user/dashboard');
                } else if (user.id_rol === 3) {
                    navigate('/puertas/personas');
                } else if (user.id_rol === 4) {
                    navigate('/puertas/vehiculos');
                } else {
                    navigate('/dashboard');
                }
            }

        } catch (err: any) {
            setError(err.message || 'Inicio de sesión fallido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Ingreso al Sistema</h2>
                <p className={styles.subtitle}>¡Bienvenido de vuelta! Por favor ingrese sus credenciales.</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Contraseña</label>
                        <input
                            type="password"
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <a href="/forgot-password?type=usuario" style={{ color: '#008f39', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                            ¿Olvidaste tu contraseña?
                        </a>
                        <a href="/register-user" style={{ color: '#008f39', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                            Registrarse
                        </a>
                        <a href="/plans" style={{ color: '#008f39', fontSize: '0.875rem' }}>
                            Volver a Planes
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NormalAdminLogin;
