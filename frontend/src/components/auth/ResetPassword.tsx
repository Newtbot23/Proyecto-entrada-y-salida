import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../config/api';
import styles from '../../pages/user/Registration.module.css';

/**
 * Componente de restablecimiento de contraseña (Reset Password)
 * 
 * Permite al usuario establecer una nueva contraseña después de haber
 * verificado el código de 6 dígitos. El código y email se obtienen de la URL.
 */
const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Estados del formulario
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    // Estados de control
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    /**
     * Extrae el código y email de los parámetros de la URL al montar el componente
     */
    useEffect(() => {
        const codeParam = searchParams.get('code');
        const emailParam = searchParams.get('email');

        if (codeParam) {
            setCode(codeParam);
        }

        if (emailParam) {
            setEmail(emailParam);
        }

        // Si no hay código o email, redirigir al forgot-password
        if (!codeParam || !emailParam) {
            navigate('/forgot-password');
        }
    }, [searchParams, navigate]);

    /**
     * Maneja el envío del formulario de restablecimiento de contraseña
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Limpiar mensajes de error previos
        setErrorMessage('');
        setValidationErrors({});
        setLoading(true);

        try {
            // Petición POST a Laravel con los datos de restablecimiento
            await apiClient.post('/reset-password', {
                email,
                code,
                password,
                password_confirmation: passwordConfirmation,
                type: 'usuario' // Cambiar a 'superadmin' si es para super admin
            });

            // Si la petición es exitosa, redirigir al login
            alert('Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (error: any) {
            // Manejo de errores con ApiError
            if (error.status === 422 && error.errors) {
                setValidationErrors(error.errors);
                setErrorMessage('Por favor corrige los errores en el formulario.');
            } else {
                setErrorMessage(error.message || 'Error al restablecer la contraseña. Por favor, intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Restablecer Contraseña</h2>
                <p className={styles.subtitle}>
                    Ingresa tu nueva contraseña para restablecer tu cuenta.
                </p>

                {/* Mensaje de error general */}
                {errorMessage && (
                    <div className={styles.error}>
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Campos ocultos */}
                    <input type="hidden" name="code" value={code} />
                    <input type="hidden" name="email" value={email} />

                    {/* Campo de email (readonly para referencia visual) */}
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
                        {validationErrors.email && <span className={styles.fieldError}>{validationErrors.email}</span>}
                    </div>

                    {/* Campo de nueva contraseña */}
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Nueva Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            required
                            disabled={loading}
                            minLength={8}
                        />
                        {validationErrors.password && <span className={styles.fieldError}>{validationErrors.password}</span>}
                    </div>

                    {/* Campo de confirmar contraseña */}
                    <div className={styles.formGroup}>
                        <label htmlFor="password_confirmation">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="Repite tu contraseña"
                            required
                            disabled={loading}
                            minLength={8}
                        />
                        {validationErrors.password_confirmation && (
                            <span className={styles.fieldError}>{validationErrors.password_confirmation}</span>
                        )}
                        {password && passwordConfirmation && password !== passwordConfirmation && (
                            <span className={styles.fieldError}>Las contraseñas no coinciden.</span>
                        )}
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <a
                            href="/login"
                            style={{ color: '#008f39', fontSize: '0.875rem', textDecoration: 'none' }}
                            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                        >
                            Cancelar y volver al login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
