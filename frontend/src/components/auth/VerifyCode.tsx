import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../../config/api';

/**
 * Componente de verificación de código de recuperación
 * 
 * Permite al usuario ingresar el código de 6 dígitos que recibió por correo
 * para verificar su identidad antes de restablecer la contraseña.
 */
const VerifyCode = () => {
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
            window.location.href = `/reset-password?email=${encodeURIComponent(email)}&code=${code}`;

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
        <div>
            <h1>Verificar Código</h1>
            <p>Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.</p>

            <form onSubmit={handleSubmit}>
                {/* Campo de email (readonly) */}
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
                </div>

                {/* Campo del código */}
                <div>
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
                    />
                </div>

                <button type="submit" disabled={loading || code.length !== 6}>
                    {loading ? 'Verificando...' : 'Verificar Código'}
                </button>
            </form>

            {/* Mensaje de error */}
            {errorMessage && (
                <div>
                    <p>{errorMessage}</p>
                </div>
            )}
        </div>
    );
};

export default VerifyCode;
