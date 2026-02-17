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
                throw new Error(result.message || 'Login failed');
            }

            // Store token and user data
            const { token, user } = result.data;
            localStorage.setItem('userToken', token);
            localStorage.setItem('userData', JSON.stringify(user));

            // Phase 15 & 16: Redirect logic based on license
            if (user.license_status === 'pendiente') {
                navigate('/license-payment');
            } else {
                // Redirect to dashboard
                navigate('/dashboard');
            }

        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Admin sistem Login</h2>
                <p className={styles.subtitle}>Welcome back! Please enter your credentials.</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <a href="/forgot-password" style={{ color: '#008f39', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                            ¿Olvidaste tu contraseña?
                        </a>
                        <a href="/plans" style={{ color: '#008f39', fontSize: '0.875rem' }}>
                            Back to Plans
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NormalAdminLogin;
