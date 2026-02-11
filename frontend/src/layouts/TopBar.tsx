import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
    showLoginButton?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ showLoginButton = true }) => {
    const navigate = useNavigate();

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const topBarStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 3rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 1000,
    };

    const logoStyle: React.CSSProperties = {
        fontSize: '1.3rem',
        fontWeight: 700,
        cursor: 'pointer',
        color: 'var(--color-text-main)',
    };

    const rightContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    };

    const textStyle: React.CSSProperties = {
        fontSize: '0.9rem',
        color: 'var(--color-text-muted)',
    };

    const loginButtonStyle: React.CSSProperties = {
        padding: '0.5rem 1.4rem',
        fontSize: '0.9rem',
        fontWeight: 600,
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
    };

    return (
        <div style={topBarStyle}>
            <div style={logoStyle} onClick={() => navigate('/')}>
                Sistema de control de entrada y salida
            </div>

            {showLoginButton && (
                <div style={rightContainerStyle}>
                    <span style={textStyle}>¿Ya tiene un plan?</span>
                    <button style={loginButtonStyle} onClick={handleLoginRedirect}>
                        Iniciar Sesión
                    </button>
                </div>
            )}
        </div>
    );
};
