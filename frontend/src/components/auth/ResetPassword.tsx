import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../config/api';

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
        } catch (error) {
            // Manejo de errores
            if (error instanceof Error) {
                const errorMsg = error.message;

                // Intentar parsear errores de validación de Laravel
                if (errorMsg.includes(':')) {
                    const errors: Record<string, string> = {};
                    const errorParts = errorMsg.split(', ');

                    errorParts.forEach((part) => {
                        const [field, message] = part.split(':').map(s => s.trim());
                        if (field && message) {
                            errors[field] = message;
                        }
                    });

                    setValidationErrors(errors);
                } else {
                    setErrorMessage(errorMsg);
                }
            } else {
                setErrorMessage('Error al restablecer la contraseña. Por favor, intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Restablecer Contraseña</h1>
            <p>Ingresa tu nueva contraseña para restablecer tu cuenta.</p>

            <form onSubmit={handleSubmit}>
                {/* Campos ocultos */}
                <input type="hidden" name="code" value={code} />
                <input type="hidden" name="email" value={email} />

                {/* Campo de email (readonly para referencia visual) */}
                <div>
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        readOnly
                        disabled={loading}
                    />
                    {validationErrors.email && <span>{validationErrors.email}</span>}
                </div>

                {/* Campo de nueva contraseña */}
                <div>
                    <label htmlFor="password">Nueva Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                        required
                        disabled={loading}
                        minLength={8}
                    />
                    {validationErrors.password && <span>{validationErrors.password}</span>}
                </div>

                {/* Campo de confirmar contraseña */}
                <div>
                    <label htmlFor="password_confirmation">Confirmar Contraseña</label>
                    <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                        required
                        disabled={loading}
                        minLength={8}
                    />
                    {validationErrors.password_confirmation && (
                        <span>{validationErrors.password_confirmation}</span>
                    )}
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </button>
            </form>

            {/* Mensaje de error general */}
            {errorMessage && (
                <div>
                    <p>{errorMessage}</p>
                </div>
            )}

            {/* Validación en el cliente (opcional - feedback visual) */}
            {password && passwordConfirmation && password !== passwordConfirmation && (
                <div>
                    <p>Las contraseñas no coinciden.</p>
                </div>
            )}
        </div>
    );
};

export default ResetPassword;
