import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/api';
import styles from '../../pages/user/Registration.module.css';

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

  /**
   * Maneja el envío del formulario de recuperación de contraseña
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Limpiar mensajes previos
    setSuccessMessage('');
    setErrorMessage('');
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

    } catch (error) {
      // Manejo de errores
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error al enviar la solicitud. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Recuperar Contraseña</h2>
        <p className={styles.subtitle}>
          Ingresa tu correo electrónico y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
        </p>

        {/* Mensajes de éxito */}
        {successMessage && (
          <div className={styles.success}>
            {successMessage}
          </div>
        )}

        {/* Mensajes de error */}
        {errorMessage && (
          <div className={styles.error}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
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
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Código de Recuperación'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <a
              href="/login"
              style={{ color: '#008f39', fontSize: '0.875rem', textDecoration: 'none' }}
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
            >
              Volver al Inicio de Sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
