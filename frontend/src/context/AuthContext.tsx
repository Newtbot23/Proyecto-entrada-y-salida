import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
    id?: number | string;
    doc?: string;
    nombre: string;
    primer_nombre?: string;
    primer_apellido?: string;
    rol: string;
    id_rol: number;
    correo: string;
    codigo_qr?: string;
    tipo_participante?: string;
    es_instructor?: boolean;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUserState] = useState<User | null>(null);

    // Sync user state with sessionStorage on mount
    useEffect(() => {
        const storedUser = sessionStorage.getItem('authUser');
        const token = sessionStorage.getItem('authToken');

        if (token && storedUser) {
            try {
                setUserState(JSON.parse(storedUser));
            } catch (e) {
                console.error('Error parsing stored user:', e);
            }
        }
    }, []);

    // Global Listener for API Auth Errors (Neutral 401 handling)
    useEffect(() => {
        const handleAuthError = () => {
            if (user) {
                // Determine redirect based on current role before clearing
                const isRegularUser = user.id_rol === 2;
                setUserState(null);
                // The api.ts already cleared sessionStorage, but we ensure it
                sessionStorage.clear();
                
                if (isRegularUser) {
                    navigate('/', { replace: true });
                } else {
                    navigate('/login', { replace: true });
                }
            }
        };

        window.addEventListener('api-auth-error', handleAuthError);
        return () => window.removeEventListener('api-auth-error', handleAuthError);
    }, [user, navigate]);

    const setUser = (newUser: User | null) => {
        setUserState(newUser);
        if (newUser) {
            sessionStorage.setItem('authUser', JSON.stringify(newUser));
        } else {
            sessionStorage.removeItem('authUser');
        }
    };

    const logout = useCallback(() => {
        const currentUser = user;
        setUserState(null);
        sessionStorage.clear();

        // Redirect based on role
        if (currentUser && currentUser.id_rol === 0) {
            // Superadmin
            navigate('/superadmin/login', { replace: true });
        } else if (currentUser && currentUser.id_rol === 2) {
            // Regular User -> Public Home
            navigate('/', { replace: true });
        } else {
            // Other admins -> Shared Login
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    const isAuthenticated = !!sessionStorage.getItem('authToken');

    return (
        <AuthContext.Provider value={{ user, setUser, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
