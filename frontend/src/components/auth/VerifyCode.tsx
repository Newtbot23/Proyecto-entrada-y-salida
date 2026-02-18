import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/api';
import styles from '../../pages/user/Registration.module.css';

/**
 * Componente de verificación de código de recuperación
 * 
 * Permite al usuario ingresar el código de 6 dígitos que recibió por correo
 * para verificar su identidad antes de restablecer la contraseña.
 */
const VerifyCode = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Estados del formulario
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');

    // Estados de control
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    /**
     * Extrae el email de los parámetros de la URL al montar el componente
     */
    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    /**
     * Maneja el envío del formulario de verificación de código
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Limpiar mensajes de error previos
        setErrorMessage('');
        setLoading(true);

        try {
            // Petición POST a Laravel para verificar el código
            await apiClient.post('/verify-code', {
                email,
                code,
                type: 'usuario' // Cambiar a 'superadmin' si es para super admin
            });

            // Si el código es válido, redirigir al formulario de reset
            navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${code}`);

        } catch (error) {
            // Manejo de errores
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('Error al verificar el código. Por favor, intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Verificar Código</h2>
                <p className={styles.subtitle}>
                    Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.
                </p>

                {/* Mensaje de error */}
                {errorMessage && (
                    <div className={styles.error}>
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Campo de email (readonly) */}
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            readOnly
                            disabled={loading}
                            style={{ backgroundColor: '#f9fafb', cursor: 'default' }}
                        />
                    </div>

                    {/* Campo del código */}
                    <div className={styles.formGroup}>
                        <label htmlFor="code">Código de Recuperación</label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="123456"
                            required
                            disabled={loading}
                            maxLength={6}
                            pattern="[0-9]{6}"
                            style={{ letterSpacing: '0.5em', textAlign: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading || code.length !== 6}>
                        {loading ? 'Verificando...' : 'Verificar Código'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <a
                            href="/forgot-password"
                            style={{ color: '#008f39', fontSize: '0.875rem', textDecoration: 'none' }}
                            onClick={(e) => { e.preventDefault(); navigate(`/forgot-password?email=${encodeURIComponent(email)}`); }}
                        >
                            ¿No recibiste el código? Volver a intentar
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyCode;
