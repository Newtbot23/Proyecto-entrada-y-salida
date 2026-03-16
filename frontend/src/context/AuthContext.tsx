import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
    id?: number | string;
    doc?: string;
    nombre: string;
    rol: string;
    id_rol: number;
    correo: string;
    codigo_qr?: string;
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

    const setUser = (newUser: User | null) => {
        setUserState(newUser);
        if (newUser) {
            sessionStorage.setItem('authUser', JSON.stringify(newUser));
        } else {
            sessionStorage.removeItem('authUser');
        }
    };

    const logout = useCallback(() => {
        // Determine redirect path based on user role before clearing state
        const currentUser = user;
        setUserState(null);
        sessionStorage.clear();

        // Redirect based on the role of the user that was logged in
        if (currentUser && currentUser.id_rol === 0) {
            // Superadmin (id_rol 0 or a convention you use)
            navigate('/superadmin/login', { replace: true });
        } else {
            // Normal admins and all other roles
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
