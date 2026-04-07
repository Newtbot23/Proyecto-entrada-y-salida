import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../Registration.module.css'; // Reusing existing registration styles globally used
import { verifyNormalAdmin2FA } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';

const VerifyNormalAdmin2FA: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    const [email, setEmail] = useState<string | null>(null);
    const [codeStr, setCodeStr] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fallos, setFallos] = useState(0);
    const [bloqueadoHasta, setBloqueadoHasta] = useState<number | null>(null);
    const [tiempoRestante, setTiempoRestante] = useState<number>(0);

    const MAX_INTENTOS = 5;
    const TIEMPO_BLOQUEO_MS = 60000 * 5; // 5 minutos de bloqueo

    useEffect(() => {
        const stateEmail = location.state?.email;
        if (!stateEmail) {
            navigate('/login', { replace: true });
        } else {
            setEmail(stateEmail);
        }
    }, [location.state, navigate]);

    useEffect(() => {
        let timerId: NodeJS.Timeout;

        if (bloqueadoHasta) {
            const actualizarTemporizador = () => {
                const ahora = Date.now();
                if (ahora >= bloqueadoHasta) {
                    setBloqueadoHasta(null);
                    setFallos(0);
                    setTiempoRestante(0);
                } else {
                    setTiempoRestante(Math.ceil((bloqueadoHasta - ahora) / 1000));
                }
            };

            actualizarTemporizador();
            timerId = setInterval(actualizarTemporizador, 1000);
        }

        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [bloqueadoHasta]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (bloqueadoHasta) return;
        if (!email) return;

        if (codeStr.length !== 6 || !/^\d+$/.test(codeStr)) {
            setError('El código debe tener exactamente 6 dígitos.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await verifyNormalAdmin2FA({
                email,
                code: codeStr
            });

            // Login successful
            const { token, user } = data;
            setUser({ ...user, rol: 'Administrador' } as any);
            sessionStorage.setItem('authToken', token);

            // Execute exact redirection logic as NormalAdminLogin
            if (user.license_status === 'pendiente') {
                navigate('/license-payment');
            } else {
                const userRole = Number(user.id_rol);
                if (userRole === 2) {
                    navigate('/user/dashboard');
                } else if (user.id_rol === 3) {
                    navigate('/puertas/personas');
                } else if (user.id_rol === 4) {
                    navigate('/puertas/vehiculos');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err: any) {
            const nuevosFallos = fallos + 1;
            setFallos(nuevosFallos);

            if (nuevosFallos >= MAX_INTENTOS) {
                const nuevoBloqueo = Date.now() + TIEMPO_BLOQUEO_MS;
                setBloqueadoHasta(nuevoBloqueo);
                setError(`Demasiados intentos fallidos. Intente en 5 minutos.`);
            } else {
                setError(err.message || 'El código es inválido o ha expirado.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!email) return null;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Autenticación en Dos Pasos</h2>
                <p className={styles.subtitle}>Hemos enviado un código seguro de 6 dígitos a su correo electrónico.</p>

                {error && <div className={styles.error}>{error}</div>}

                {bloqueadoHasta ? (
                    <div className={styles.error}>
                        Ha superado el límite de intentos. Por favor, espere <strong>{formatTime(tiempoRestante)}</strong> antes de volver a intentar.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Código de Seguridad</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={codeStr}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setCodeStr(value);
                                }}
                                disabled={loading}
                                required
                                style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}
                                placeholder="000000"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className={styles.button} 
                            disabled={loading || codeStr.length !== 6}
                        >
                            {loading ? 'Verificando...' : 'Verificar Código'}
                        </button>
                        
                        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                            Asegúrese de revisar su carpeta de Spam.<br/>
                            <button 
                                type="button" 
                                onClick={() => navigate('/login', { replace: true })}
                                style={{ background: 'none', border: 'none', color: '#008f39', cursor: 'pointer', marginTop: '0.5rem' }}
                            >
                                Volver a Iniciar Sesión
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VerifyNormalAdmin2FA;
