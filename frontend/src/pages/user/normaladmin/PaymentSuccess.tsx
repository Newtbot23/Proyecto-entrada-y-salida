import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../Registration.module.css'; // Reusing existing styles
import { confirmPayment } from '../../../services/paymentService';

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('Procesando tu pago...');
    const [isSuccess, setIsSuccess] = useState(false);
    const processedRef = useRef(false);

    useEffect(() => {
        if (!sessionId) {
            setMessage('No se encontró información del pago.');
            setLoading(false);
            return;
        }

        if (processedRef.current) return;
        processedRef.current = true;

        const confirmPaymentFlow = async () => {
            try {
                await confirmPayment({ session_id: sessionId });
                setIsSuccess(true);
                setMessage('¡Pago Exitoso! Tu licencia ha sido activada correctamente.');
            } catch (error: any) {
                console.error('Error confirming payment:', error);
                // If already registered, consider it a success for the UI
                if (error.message === 'Pago ya registrado anteriormente') {
                    setIsSuccess(true);
                    setMessage('Pago ya registrado. Tu licencia está activa.');
                } else {
                    setMessage(`Error: ${error.message || 'No se pudo confirmar el pago.'}`);
                }
            } finally {
                setLoading(false);
            }
        };

        confirmPaymentFlow();
    }, [sessionId]);

    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ textAlign: 'center' }}>
                <h2 className={styles.title} style={{ color: isSuccess ? '#166534' : '#b91c1c' }}>
                    {loading ? 'Procesando...' : (isSuccess ? '¡Pago Completo!' : 'Error en el Pago')}
                </h2>

                <p className={styles.subtitle} style={{ margin: '1.5rem 0' }}>
                    {message}
                </p>

                {!loading && (
                    <button
                        className={styles.button}
                        onClick={() => navigate('/dashboard')}
                        style={{ marginTop: '1rem' }}
                    >
                        Volver al Dashboard
                    </button>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
