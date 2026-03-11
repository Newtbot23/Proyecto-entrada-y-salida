import React, { useState, useEffect } from 'react';

interface Registro {
    id: number;
    fecha: string;
    hora_entrada: string;
    hora_salida?: string;
    placa?: string;
    serial_equipo?: string;
    vehiculo_marca?: string;
    vehiculo_modelo?: string;
    vehiculo_color?: string;
    equipo_marca?: string;
    equipo_modelo?: string;
}

const UserHistory: React.FC = () => {
    // using userOutletContext is not strictly necessary unless we need user info
    // const { user } = useOutletContext<{ user: User }>();

    const [entradas, setEntradas] = useState<Registro[]>([]);
    const [historyDateFilter, setHistoryDateFilter] = useState('');

    const fetchEntradas = async (headers?: any, fecha?: string) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        if (!headers) {
            const token = sessionStorage.getItem('authToken');
            if (!token) return;
            headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        }

        try {
            let url = `${apiUrl}/user/entradas`;
            if (fecha) url += `?fecha=${fecha}`;
            
            const res = await fetch(url, { headers });
            const data = await res.json();
            if (data.success) {
                setEntradas(data.data);
            }
        } catch (error) {
            console.error("Error fetching entradas", error);
        }
    };

    useEffect(() => {
        fetchEntradas();
    }, []);

    const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setHistoryDateFilter(val);
        fetchEntradas(undefined, val);
    };

    const cardStyle: React.CSSProperties = { background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem' };
    const inputStyle: React.CSSProperties = { border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem', outline: 'none' };
    const theadStyle: React.CSSProperties = { background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'left' } as const;
    const thTdStyle: React.CSSProperties = { padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' };

    return (
        <div style={{ marginTop: '1rem', paddingBottom: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                Historial de Entradas
            </h2>

            <div style={cardStyle}>
                <div style={{ overflowX: 'auto' }}>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '500', color: '#4b5563' }}>Filtrar por fecha:</label>
                        <input 
                            type="date" 
                            style={{ ...inputStyle, width: 'auto', padding: '0.4rem 0.75rem' }} 
                            value={historyDateFilter}
                            onChange={handleDateFilterChange}
                        />
                        {historyDateFilter && (
                            <button 
                                onClick={() => handleDateFilterChange({ target: { value: '' } } as any)}
                                style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                                Limpiar Filtro
                            </button>
                        )}
                    </div>
                    {entradas.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                            <p style={{ fontSize: '3rem', margin: 0 }}>⏱️</p>
                            <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>No hay registros de entradas</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead style={theadStyle}>
                                <tr>
                                    <th style={thTdStyle}>Fecha</th>
                                    <th style={thTdStyle}>Hora Entrada</th>
                                    <th style={thTdStyle}>Hora Salida</th>
                                    <th style={thTdStyle}>Vehículo</th>
                                    <th style={thTdStyle}>Equipo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entradas.map((ent, idx) => (
                                    <tr key={ent.id || idx} style={{ transition: 'background 0.1s' }} onMouseOver={ev => ev.currentTarget.style.background = '#f9fafb'} onMouseOut={ev => ev.currentTarget.style.background = 'transparent'}>
                                        <td style={{ ...thTdStyle, fontWeight: '600', color: '#111827' }}>{ent.fecha}</td>
                                        <td style={{ ...thTdStyle, color: '#10b981', fontWeight: '500' }}>{ent.hora_entrada}</td>
                                        <td style={thTdStyle}>{ent.hora_salida || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>En instalación</span>}</td>
                                        <td style={thTdStyle}>
                                            {ent.placa ? (
                                                <div>
                                                    <span style={{ fontWeight: '600' }}>{ent.placa}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block' }}>{ent.vehiculo_marca} {ent.vehiculo_modelo} ({ent.vehiculo_color})</span>
                                                </div>
                                            ) : <span style={{ color: '#9ca3af' }}>-</span>}
                                        </td>
                                        <td style={thTdStyle}>
                                            {ent.serial_equipo ? (
                                                <div>
                                                    <span style={{ fontWeight: '600' }}>{ent.serial_equipo}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block' }}>{ent.equipo_marca} {ent.equipo_modelo}</span>
                                                </div>
                                            ) : <span style={{ color: '#9ca3af' }}>-</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserHistory;
