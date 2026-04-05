import React from 'react';
import { Link } from 'react-router-dom';

interface TopBarProps {
    showLoginButton?: boolean;
    showPlansButton?: boolean;
    showBranding?: boolean;
    subtitle?: string;
}

const AccessLogo: React.FC = () => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="8" fill="var(--color-primary)" />
        {/* Door frame */}
        <rect x="10" y="8" width="16" height="22" rx="2" fill="white" opacity="0.9" />
        {/* Door panel */}
        <rect x="12" y="10" width="10" height="18" rx="1" fill="var(--color-primary)" opacity="0.3" />
        {/* Door handle */}
        <circle cx="20" cy="19" r="1.5" fill="white" />
        {/* Arrow suggesting access/entry */}
        <path d="M24 17L28 19L24 21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const TopBar: React.FC<TopBarProps> = ({
    showLoginButton = true,
    showPlansButton = false,
    showBranding = false,
    subtitle = 'Inicio',
}) => {
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

    const logoContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        textDecoration: 'none',
    };

    const brandTextStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        lineHeight: 1.3,
    };

    const brandTitleStyle: React.CSSProperties = {
        fontSize: '1.075rem',
        fontWeight: 700,
        color: 'var(--color-text-main)',
    };

    const brandSubtitleStyle: React.CSSProperties = {
        fontSize: '0.875rem',
        color: 'var(--color-text-muted)',
        fontWeight: 400,
    };

    const logoStyle: React.CSSProperties = {
        fontSize: '1.425rem',
        fontWeight: 700,
        cursor: 'pointer',
        color: 'var(--color-text-main)',
        textDecoration: 'none',
    };

    const rightContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    };

    const textStyle: React.CSSProperties = {
        fontSize: '1.025rem',
        color: 'var(--color-text-muted)',
    };

    const loginButtonStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem 1.4rem',
        fontSize: '1.025rem',
        fontWeight: 600,
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        textDecoration: 'none',
    };

    const plansButtonStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem 1.4rem',
        fontSize: '1.025rem',
        fontWeight: 600,
        borderRadius: '8px',
        border: '1px solid var(--color-border-focus)',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        color: 'var(--color-text-main)',
        transition: 'all 0.2s',
        textDecoration: 'none',
    };

    return (
        <div style={topBarStyle}>
            {showBranding ? (
                <Link to="/" style={logoContainerStyle}>
                    <AccessLogo />
                    <div style={brandTextStyle}>
                        <span style={brandTitleStyle}>Control Inteligente: Acceso a tus instalaciones</span>
                        <span style={brandSubtitleStyle}>{subtitle}</span>
                    </div>
                </Link>
            ) : (
                <Link to="/" style={logoStyle}>
                    Sistema de control de entrada y salida
                </Link>
            )}

            <div style={rightContainerStyle}>
                {showPlansButton && (
                    <Link to="/plans" style={plansButtonStyle}>
                        Ver planes
                    </Link>
                )}

                {showLoginButton && (
                    <>
                        {!showPlansButton && <span style={textStyle}>¿Ya tiene un plan?</span>}
                        <Link to="/login" style={loginButtonStyle}>
                            Iniciar Sesión
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};
