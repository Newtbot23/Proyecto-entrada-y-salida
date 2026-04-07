import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifySuperAdmin2FA } from '../../services/authService';
import styles from './SuperAdminLogin.module.css';

/**
 * Componente de verificación 2FA para Superadmin
 */
const Verify2FA: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Obtenemos el email del estado del router en lugar de la URL
    const email = location.state?.email;

    // Redirigir al login si se accede directamente a esta ruta sin estado previo
    useEffect(() => {
        if (!email) {
            navigate('/superadmin/login', { replace: true });
        }
    }, [email, navigate]);

    // Estados
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Estados de bloqueo
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    // Cargar estado de bloqueo al montar
    useEffect(() => {
        if (!email) return;
        const storedLockout = localStorage.getItem(`lockout_2fa_${email}`);
        if (storedLockout) {
            const lockoutTime = parseInt(storedLockout, 10);
            if (lockoutTime > Date.now()) {
                setLockoutUntil(lockoutTime);
                setFailedAttempts(5);
            } else {
                localStorage.removeItem(`lockout_2fa_${email}`);
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
                    localStorage.removeItem(`lockout_2fa_${email}`);
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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (lockoutUntil && lockoutUntil > Date.now()) {
            return; // Bloqueado
        }

        setErrorMessage('');
        setLoading(true);

        try {
            const data = await verifySuperAdmin2FA({ email, code });

            // Si el código es válido, limpiar intentos y redirigir
            setFailedAttempts(0);
            localStorage.removeItem(`lockout_2fa_${email}`);

            // Guardar credenciales y redirigir
            if (data.token && data.admin) {
                sessionStorage.setItem('authToken', data.token);
                sessionStorage.setItem('authUser', JSON.stringify(data.admin));
                navigate('/superadmin/dashboard', { replace: true });
            }

        } catch (error: any) {
            // Incrementamos intentos fallidos
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);

            if (newAttempts >= 5) {
                const lockoutTime = Date.now() + 30000; // 30 segundos
                setLockoutUntil(lockoutTime);
                localStorage.setItem(`lockout_2fa_${email}`, lockoutTime.toString());
                setErrorMessage('Demasiados intentos incorrectos.');
            } else {
                if (error.response?.status === 422) {
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

    // Si aún no se procesó el efecto de escape por falta de email (esto asegura no renderizar errores visuales de golpe)
    if (!email) return null;

    return (
        <div className={styles.container}>
            {/* Opcional: Modal inamovible de bloqueo similar al original, pero con estilos adhoc o integrados */}
            
            <div className={styles.card}>
                <h1 className={styles.title} style={{ fontSize: '24px' }}>Autenticación de Seguridad</h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.
                </p>

                {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
                
                {isLocked && (
                    <div className={styles.errorMessage} style={{ backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>
                        Acceso bloqueado. Espera {timeLeft} segundos para intentar de nuevo.
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            className={styles.input}
                            value={email}
                            readOnly
                            disabled
                            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="code" className={styles.label}>
                            Código de Verificación
                        </label>
                        <input
                            type="text"
                            id="code"
                            className={styles.input}
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            disabled={loading || isLocked}
                            maxLength={6}
                            pattern="[0-9]{6}"
                            style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading || code.length !== 6 || isLocked}>
                        {loading ? 'Verificando...' : 'Verificar e Ingresar'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link to="/superadmin/login" style={{ color: '#008f39', fontSize: '0.875rem', display: 'block' }}>
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Verify2FA;
