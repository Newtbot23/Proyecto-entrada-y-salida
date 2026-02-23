import React from 'react';
import { useOutletContext } from 'react-router-dom';

interface User {
    id: number;
    nombre: string;
    correo: string;
    id_entidad: number;
    nit_entidad: string;
    id_rol: number;
}

const UserDashboard: React.FC = () => {
    const { user } = useOutletContext<{ user: User }>();

    if (!user) return null;

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                ¡Bienvenido a tu Panel de Usuario, {user.nombre}!
            </h2>
            <p style={{ color: '#4b5563' }}>
                Tu correo electrónico es: <b>{user.correo}</b>
            </p>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
                <p>Este es el panel principal para usuarios regulares. (Pronto habrá más contenido aquí)</p>
            </div>
        </div>
    );
};

export default UserDashboard;
