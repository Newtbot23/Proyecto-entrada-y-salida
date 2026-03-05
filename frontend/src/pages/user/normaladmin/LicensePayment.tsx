import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Registration.module.css';

const LicensePayment: React.FC = () => {
    const navigate = useNavigate();
    const [licenseStatus, setLicenseStatus] = useState<string>('');
    const [licenseId, setLicenseId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLicenseStatus = async () => {
            const storedUser = sessionStorage.getItem('userData');
            const token = sessionStorage.getItem('userToken');

            if (!storedUser || !token) {
                navigate('/login');
                return;
            }

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                // Fetch latest license status using the new NIT-based endpoint
                const response = await fetch(`${API_URL}/licencia-actual`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Error al obtener el estado de la licencia');

                const status = result.data.estado;
                const id = result.data.id;

                // Map logical states if necessary (activo, inactivo, expirado, pendiente)
                // User mentioned: pendiente, vencida, expirada
                setLicenseStatus(status);
                setLicenseId(id);

                // If license is active, redirect to dashboard
                if (status === 'activo') {
                    navigate('/dashboard');
                }

            } catch (err: any) {
                console.error('Error fetching license status:', err);
                setError('No se pudo cargar el estado de tu licencia.');
            } finally {
                setLoading(false);
            }
        };

        fetchLicenseStatus();
    }, [navigate]);

    const formatStatus = (status: string) => {
        const states: Record<string, string> = {
            'pendiente': 'Pendiente',
            'expirado': 'Expirada/Vencida',
            'inactivo': 'Inactiva',
            'activo': 'Activa'
        };
        return states[status] || status;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <p className={styles.subtitle}>Cargando información de licencia...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Estado de Licencia</h2>

                <div style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fcd34d',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: 0, color: '#92400e', fontSize: '1.1rem' }}>
                        Tu licencia de sistema actualmente se encuentra en estado:
                    </p>
                    <p style={{
                        fontSize: '1.5rem',
                        margin: '1rem 0',
                        color: licenseStatus === 'pendiente' ? '#b45309' : '#b91c1c',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
                        {formatStatus(licenseStatus)}
                    </p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.form}>
                    <button
                        type="button"
                        className={styles.button}
                        onClick={async () => {
                            if (!licenseId) {
                                setError('No se encontró el ID de la licencia.');
                                return;
                            }

                            try {
                                setLoading(true);
                                const token = sessionStorage.getItem('userToken');
                                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

                                const response = await fetch(`${API_URL}/stripe/checkout-session`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        licencia_id: licenseId,
                                        tipo_pago: 'compra' // Defaulting to 'compra' as per requirement, or logic to determine
                                    })
                                });

                                const data = await response.json();

                                if (data.url) {
                                    window.location.href = data.url;
                                } else {
                                    console.error('Stripe session creation failed:', data);
                                    setError('No se pudo iniciar el pago. ' + (data.error || 'Intente nuevamente.'));
                                    setLoading(false);
                                }
                            } catch (e) {
                                console.error('Error connecting to payment gateway:', e);
                                setError('Error de conexión con la pasarela de pagos.');
                                setLoading(false);
                            }
                        }}
                    >
                        Pagar con Stripe
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        style={{ background: 'transparent', border: 'none', color: '#666', marginTop: '1rem', cursor: 'pointer' }}
                    >
                        Volver al Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LicensePayment;
