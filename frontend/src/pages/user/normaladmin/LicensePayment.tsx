import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Registration.module.css';

const LicensePayment: React.FC = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [referencia, setReferencia] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('userData');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(storedUser);
        if (user.license_status !== 'pendiente') {
            navigate('/dashboard');
            return;
        }
        setUserData(user);
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!referencia.trim()) {
            setError('Please enter your payment reference');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const response = await fetch(`${API_URL}/licencias-sistema/${userData.license_id}/referencia`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify({ referencia_pago: referencia }),
            });

            const result = await response.json();
            if (!response.ok) throw result;

            setSubmitted(true);

        } catch (err: any) {
            setError(err.message || 'Failed to submit payment reference');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.title} style={{ color: '#008f39' }}>Payment Submitted!</h2>
                    <p className={styles.subtitle} style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                        Espera un momento o ponte en contacto con nuestro representante al <strong>3242594286</strong>
                    </p>
                    <button onClick={() => navigate('/login')} className={styles.button}>
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>License Payment</h2>
                <p className={styles.subtitle} style={{ marginBottom: '1.5rem' }}>
                    Aun no has pagado tu licencia, por favor paga por los medios a continuacion
                </p>

                <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#166534', fontWeight: 'bold' }}>Nequi Account:</p>
                    <p style={{ fontSize: '1.5rem', margin: '0.5rem 0', color: '#008f39', fontWeight: 'bold' }}>3242594286</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Payment Reference Number</label>
                        <input
                            type="text"
                            placeholder="Enter the reference from your Nequi transaction"
                            value={referencia}
                            onChange={(e) => setReferencia(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Reference'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        style={{ background: 'transparent', border: 'none', color: '#666', marginTop: '1rem', cursor: 'pointer' }}
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LicensePayment;
