import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../config/api';
import styles from './AuthFlows.module.css';

/**
 * Componente de restablecimiento de contraseña (Reset Password)
 * 
 * Permite al usuario establecer una nueva contraseña después de haber
 * verificado el código de 6 dígitos. El código y email se obtienen de la URL.
 */
const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type') || 'usuario';

    // Estados del formulario
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    // Estados de control
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPassword(val);

        setValidationErrors(prev => {
            const next = { ...prev };
            if (!val.trim()) {
                next.password = 'La contraseña es obligatoria';
            } else if (!REGEX_PASSWORD.test(val)) {
                next.password = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial';
            } else {
                delete next.password;
            }

            if (passwordConfirmation && val !== passwordConfirmation) {
                next.password_confirmation = 'Las contraseñas no coinciden';
            } else if (passwordConfirmation && val === passwordConfirmation) {
                delete next.password_confirmation;
            }
            return next;
        });
    };

    const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPasswordConfirmation(val);

        setValidationErrors(prev => {
            const next = { ...prev };
            if (val !== password) {
                next.password_confirmation = 'Las contraseñas no coinciden';
            } else {
                delete next.password_confirmation;
            }
            return next;
        });
    };

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

        // Validar antes de enviar
        if (!REGEX_PASSWORD.test(password) || password !== passwordConfirmation) {
            setValidationErrors(prev => {
                const next = { ...prev };
                if (!REGEX_PASSWORD.test(password)) next.password = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial';
                if (password !== passwordConfirmation) next.password_confirmation = 'Las contraseñas no coinciden';
                return next;
            });
            setErrorMessage('Por favor corrige los errores en el formulario.');
            return;
        }

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
                type: typeParam
            });

            // Si la petición es exitosa, redirigir al login
            toast.success('Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.');
            navigate(typeParam === 'superadmin' ? '/superadmin/login' : '/login');
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
                            className={styles.readonlyInput}
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
                            onChange={handlePasswordChange}
                            className={validationErrors.password ? styles.inputError : ''}
                            placeholder="Mínimo 8 caracteres"
                            required
                            disabled={loading}
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
                            onChange={handleConfirmChange}
                            className={validationErrors.password_confirmation ? styles.inputError : ''}
                            placeholder="Repite tu contraseña"
                            required
                            disabled={loading}
                        />
                        {validationErrors.password_confirmation && (
                            <span className={styles.fieldError}>{validationErrors.password_confirmation}</span>
                        )}
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </button>

                    <div className={styles.backLinkContainer}>
                        <a
                            href={typeParam === 'superadmin' ? "/superadmin/login" : "/login"}
                            className={styles.backLink}
                            onClick={(e) => { e.preventDefault(); navigate(typeParam === 'superadmin' ? '/superadmin/login' : '/login'); }}
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
