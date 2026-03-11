import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/api';
import styles from './AuthFlows.module.css';

/**
 * Componente de verificación de código de recuperación
 * 
 * Permite al usuario ingresar el código de 6 dígitos que recibió por correo
 * para verificar su identidad antes de restablecer la contraseña.
 */
const VerifyCode = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type') || 'usuario';

    // Estados del formulario
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');

    // Estados de control
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Estados de bloqueo
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    /**
     * Extrae el email de los parámetros de la URL al montar el componente
     */
    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    // Cargar estado de bloqueo al montar y cuando el email se establece
    useEffect(() => {
        if (!email) return;
        const storedLockout = localStorage.getItem(`lockout_${email}`);
        if (storedLockout) {
            const lockoutTime = parseInt(storedLockout, 10);
            if (lockoutTime > Date.now()) {
                setLockoutUntil(lockoutTime);
                setFailedAttempts(5);
            } else {
                localStorage.removeItem(`lockout_${email}`);
            }
        }
    }, [email]);

    // Manejar el temporizador de bloqueo
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;

        const updateTimer = () => {
            if (lockoutUntil) {
                const now = Date.now();
                if (lockoutUntil > now) {
                    setTimeLeft(Math.ceil((lockoutUntil - now) / 1000));
                } else {
                    setTimeLeft(0);
                    setLockoutUntil(null);
                    setFailedAttempts(0);
                    localStorage.removeItem(`lockout_${email}`);
                }
            } else {
                setTimeLeft(0);
            }
        };

        if (lockoutUntil) {
            updateTimer();
            timer = setInterval(updateTimer, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [lockoutUntil, email]);

    /**
     * Maneja el envío del formulario de verificación de código
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (lockoutUntil && lockoutUntil > Date.now()) {
            return; // Bloqueado
        }

        // Limpiar mensajes de error previos
        setErrorMessage('');
        setLoading(true);

        try {
            // Petición POST a Laravel para verificar el código
            await apiClient.post('/verify-code', {
                email,
                code,
                type: typeParam
            });

            // Si el código es válido, limpiar intentos y redirigir
            setFailedAttempts(0);
            localStorage.removeItem(`lockout_${email}`);
            navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${code}&type=${typeParam}`);

        } catch (error: any) {
            // Incrementamos intentos fallidos
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);

            if (newAttempts >= 5) {
                const lockoutTime = Date.now() + 30000; // 30 segundos
                setLockoutUntil(lockoutTime);
                localStorage.setItem(`lockout_${email}`, lockoutTime.toString());
                setErrorMessage('Demasiados intentos incorrectos.');
            } else {
                if (error.status === 422 || error.response?.status === 422) {
                    setErrorMessage(`Código de verificación incorrecto. Intento ${newAttempts} de 5.`);
                } else if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage(`Error al verificar el código. Intento ${newAttempts} de 5.`);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const isLocked = timeLeft > 0;

    return (
        <div className={styles.container}>
            {/* Modal inamovible de bloqueo */}
            {isLocked && (
                <div className={styles.lockOverlay}>
                    <div className={styles.lockContent}>
                        <div className={styles.lockIconWrapper}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <h2 className={styles.lockTitle}>
                            Acceso Bloqueado
                        </h2>
                        <span className={styles.lockTime}>
                            {timeLeft}<span className={styles.lockTimeSuffix}>s</span>
                        </span>
                        <p className={styles.lockMessage}>
                            Has superado el límite de intentos permitidos.
                            Por seguridad, espera hasta que el contador llegue a cero para volver a intentarlo.
                        </p>
                    </div>
                </div>
            )}

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
                            className={styles.readonlyInput}
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
                            disabled={loading || isLocked}
                            maxLength={6}
                            pattern="[0-9]{6}"
                            className={styles.codeInput}
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading || code.length !== 6 || isLocked}>
                        {loading ? 'Verificando...' : 'Verificar Código'}
                    </button>

                    <div className={styles.backLinkContainer}>
                        <a
                            href={`/forgot-password?email=${encodeURIComponent(email)}&type=${typeParam}`}
                            className={styles.backLink}
                            onClick={(e) => { e.preventDefault(); navigate(`/forgot-password?email=${encodeURIComponent(email)}&type=${typeParam}`); }}
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
