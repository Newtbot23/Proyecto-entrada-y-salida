import React, { useState } from 'react';
import styles from './SuperAdminLogin.module.css';
import { loginSuperAdmin } from '../../services/authService';

const SuperAdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic client-side validation
        if (!email.trim() || !password.trim()) {
            setError('Por favor completa todos los campos.');
            return;
        }

        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EMAIL_REGEX.test(email)) {
            setError('Formato de correo inválido');
            return;
        }

        setLoading(true);

        try {
            const data = await loginSuperAdmin({ correo: email, contrasena: password });

            // Store token and admin data in sessionStorage for tab isolation
            sessionStorage.setItem('authToken', data.token);
            sessionStorage.setItem('authUser', JSON.stringify(data.admin));

            // Redirect to dashboard
            window.location.href = '/superadmin/dashboard';

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Iniciar Sesión</h1>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            className={styles.input}
                            placeholder="Ingresa tu correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <a href="/forgot-password?type=superadmin" style={{ color: '#008f39', fontSize: '0.875rem', display: 'block' }}>
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
