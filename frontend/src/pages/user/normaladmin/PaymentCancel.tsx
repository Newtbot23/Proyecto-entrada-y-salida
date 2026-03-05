import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Registration.module.css';

const PaymentCancel: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ textAlign: 'center' }}>
                <h2 className={styles.title} style={{ color: '#991b1b' }}>Pago Cancelado</h2>
                <p className={styles.subtitle}>
                    El proceso de pago fue cancelado o no se pudo completar.
                </p>
                <button
                    className={styles.button}
                    onClick={() => navigate('/license-payment')}
                    style={{ marginTop: '2rem', backgroundColor: '#64748b' }}
                >
                    Intentar Nuevamente
                </button>
            </div>
        </div>
    );
};

export default PaymentCancel;
