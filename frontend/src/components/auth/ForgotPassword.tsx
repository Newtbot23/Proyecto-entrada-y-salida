import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/api';

/**
 * Componente de recuperación de contraseña (Forgot Password)
 * 
 * Permite al usuario solicitar un código de recuperación de 6 dígitos
 * que será enviado a su correo electrónico.
 */
const ForgotPassword = () => {
  const navigate = useNavigate();

  // Estados del componente
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  /**
   * Maneja el envío del formulario de recuperación de contraseña
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Limpiar mensajes previos
    setSuccessMessage('');
    setErrorMessage('');
    setFieldErrors({});
    setLoading(true);

    try {
      // Petición POST a Laravel
      await apiClient.post('/forgot-password', {
        email,
        type: 'usuario' // Cambiar a 'superadmin' si es para super admin
      });

      // Si la petición es exitosa, redirigir a la página de verificación de código
      setSuccessMessage('Se ha enviado un código de recuperación a tu correo electrónico.');

      // Redirigir al componente de verificación de código después de 2 segundos
      setTimeout(() => {
        navigate(`/verify-code?email=${encodeURIComponent(email)}`);
      }, 2000);

    } catch (error: any) {
      // Manejo de errores
      if (error.status === 422 && error.errors) {
        setFieldErrors(error.errors);
      } else {
        setErrorMessage(error.message || 'Error al enviar la solicitud. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Recuperar Contraseña</h1>
      <p>Ingresa tu correo electrónico y te enviaremos un código de 6 dígitos para restablecer tu contraseña.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-email@ejemplo.com"
            required
            disabled={loading}
          />
          {fieldErrors.email && (
            <div style={{ color: 'red', marginTop: '5px' }}>
              {fieldErrors.email[0]}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Código de Recuperación'}
        </button>
      </form>

      {/* Mensajes de éxito */}
      {successMessage && (
        <div>
          <p>{successMessage}</p>
        </div>
      )}

      {/* Mensajes de error */}
      {errorMessage && (
        <div>
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
