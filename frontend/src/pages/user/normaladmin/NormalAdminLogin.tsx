import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../Registration.module.css'; // Reusing registration styles for consistency
import { loginNormalAdmin } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';

const NormalAdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
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
            const data = await loginNormalAdmin(formData);

            if (data.requires_2fa && data.email) {
                // Halt standard flow, jump to 2FA verification passing email by state
                navigate('/verify-2fa-admin', { state: { email: data.email } });
                return;
            }

            // Store token and user data in sessionStorage (unified keys)
            const { token, user } = data;
            
            // Map roles accurately for local context
            let rolName = 'Usuario';
            if (user.id_rol === 3) rolName = 'Puertas Personas';
            if (user.id_rol === 4) rolName = 'Puertas Vehículos';
            
            setUser({ ...user, rol: rolName } as any);
            sessionStorage.setItem('authToken', token);

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
                        <Link to="/forgot-password?type=usuario" style={{ color: '#008f39', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                        <Link to="/register-user" style={{ color: '#008f39', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                            Registrarse
                        </Link>
                        <Link to="/plans" style={{ color: '#008f39', fontSize: '0.875rem' }}>
                            Volver a Planes
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NormalAdminLogin;
