import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User {
    doc: string;
    nombre: string;
    rol: string;
    id_rol: number;
    correo: string;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);

    // Sync user state with sessionStorage on mount
    useEffect(() => {
        const storedUser = sessionStorage.getItem('adminUser');
        const token = sessionStorage.getItem('adminToken');

        if (token && storedUser) {
            try {
                setUserState(JSON.parse(storedUser));
            } catch (e) {
                console.error('Error parsing stored user:', e);
                // If invalid data, we don't necessarily logout, just stay null
            }
        }
    }, []);

    const setUser = (newUser: User | null) => {
        setUserState(newUser);
        if (newUser) {
            sessionStorage.setItem('adminUser', JSON.stringify(newUser));
        } else {
            sessionStorage.removeItem('adminUser');
        }
    };

    const logout = () => {
        setUserState(null);
        sessionStorage.clear(); // Clears token and user data
        window.location.replace('/login');
    };

    const isAuthenticated = !!sessionStorage.getItem('adminToken');

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
