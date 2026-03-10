import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

interface User {
    doc: string;
    nombre: string;
    rol?: string;
}

interface Equipo {
    serial: string;
    marca: string;
    modelo: string;
    tipo_equipo: string;
}

interface SearchData {
    usuario: User;
    equipos: Equipo[];
    estaAdentro: boolean;
    id_registro: number | null;
    serial_equipo: string | null;
}

const PersonasDashboard: React.FC = () => {
    const { user } = useOutletContext<{ user: User }>();
    const [searchDoc, setSearchDoc] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<SearchData | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [selectedEquipo, setSelectedEquipo] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchDoc) return;

        setLoading(true);
        setSearchResult(null);
        setMessage(null);
        setSelectedEquipo(null);

        const token = sessionStorage.getItem('userToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const res = await fetch(`${apiUrl}/puertas/search-persona?doc=${searchDoc}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSearchResult(data.data);
                // Si la persona ya está adentro y entró con un equipo, preseleccionarlo visualmente
                if (data.data.estaAdentro && data.data.serial_equipo) {
                    setSelectedEquipo(data.data.serial_equipo);
                }
            } else {
                setMessage({ text: data.message || 'Usuario no encontrado', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterAction = async (accion: 'entrada' | 'salida') => {
        if (!searchResult) return;

        setLoading(true);
        const token = sessionStorage.getItem('userToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const body = {
                doc: searchResult.usuario.doc,
                accion,
                serial_equipo: selectedEquipo,
                id_registro: searchResult.id_registro
            };

            const res = await fetch(`${apiUrl}/puertas/registrar-actividad`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ text: data.message, type: 'success' });
                setSearchResult(null);
                setSearchDoc('');
                setSelectedEquipo(null);
            } else {
                setMessage({ text: data.message || 'Error al registrar actividad', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Error al procesar registro', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Estilos
    const cardStyle: React.CSSProperties = { background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '1.5rem' };
    const inputStyle: React.CSSProperties = { padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem', width: '100%', maxWidth: '300px' };
    const btnSearchStyle: React.CSSProperties = { background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' };
    const btnActionStyle = (color: string): React.CSSProperties => ({ background: color, color: 'white', padding: '1rem 2rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', flex: 1 });

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Control de Acceso - Personas</h2>

            {/* Formulario de Búsqueda */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Buscar por Documento</h3>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Número de documento..."
                        style={inputStyle}
                        value={searchDoc}
                        onChange={(e) => setSearchDoc(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" style={btnSearchStyle} disabled={loading}>
                        {loading ? 'Buscando...' : '🔍 Buscar'}
                    </button>
                </form>
            </div>

            {/* Mensajes */}
            {message && (
                <div style={{ padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', backgroundColor: message.type === 'success' ? '#def7ec' : '#fde8e8', color: message.type === 'success' ? '#03543f' : '#9b1c1c', border: `1px solid ${message.type === 'success' ? '#84e1bc' : '#f8b4b4'}` }}>
                    {message.text}
                </div>
            )}

            {/* Resultados de Búsqueda */}
            {searchResult && (
                <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Nombre del Usuario</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{searchResult.usuario.nombre}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#374151', margin: 0 }}>DOC: {searchResult.usuario.doc}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: '600', backgroundColor: searchResult.estaAdentro ? '#fef3c7' : '#d1fae5', color: searchResult.estaAdentro ? '#92400e' : '#065f46' }}>
                                    {searchResult.estaAdentro ? '● En Instalaciones' : '○ Fuera'}
                                </span>
                            </div>
                        </div>

                        {/* Equipos Propios */}
                        {searchResult.equipos.length > 0 && (!searchResult.estaAdentro || (searchResult.estaAdentro && searchResult.serial_equipo)) && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '0.75rem' }}>💻 {searchResult.estaAdentro ? 'Equipo Vinculado a la Entrada' : 'Seleccionar Equipo (Opcional)'}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {searchResult.equipos
                                        .filter(eq => !searchResult.estaAdentro || eq.serial === searchResult.serial_equipo)
                                        .map(eq => {
                                            const isSelected = selectedEquipo === eq.serial;
                                            return (
                                                <div
                                                    key={eq.serial}
                                                    onClick={() => !searchResult.estaAdentro && setSelectedEquipo(isSelected ? null : eq.serial)}
                                                    style={{
                                                        padding: '1rem',
                                                        border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
                                                        borderRadius: '0.5rem',
                                                        backgroundColor: isSelected ? '#eff6ff' : 'white',
                                                        cursor: searchResult.estaAdentro ? 'default' : 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {/* Checkmark icon for selected equipment */}
                                                    {(!searchResult.estaAdentro || isSelected) && (
                                                        <div style={{
                                                            position: 'absolute', top: '0.5rem', right: '0.5rem',
                                                            width: '1.25rem', height: '1.25rem', borderRadius: '50%',
                                                            border: `1px solid ${isSelected ? '#2563eb' : '#d1d5db'}`,
                                                            backgroundColor: isSelected ? '#2563eb' : 'transparent',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {isSelected && <span style={{ color: 'white', fontSize: '0.75rem' }}>✓</span>}
                                                        </div>
                                                    )}
                                                    <p style={{ fontWeight: 'bold', margin: 0, paddingRight: '1.5rem' }}>{eq.marca} - {eq.modelo}</p>
                                                    <p style={{ fontSize: '0.85rem', color: isSelected ? '#1d4ed8' : '#6b7280', margin: '0.25rem 0' }}>SN: {eq.serial}</p>
                                                    <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>{eq.tipo_equipo}</p>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                        {searchResult.equipos.length === 0 && (
                            <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Sin equipos propios registrados.</p>
                        )}

                        {/* Botones de Acción */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            {!searchResult.estaAdentro ? (
                                <button onClick={() => handleRegisterAction('entrada')} style={btnActionStyle('#059669')} disabled={loading}>
                                    📥 Confirmar Entrada {selectedEquipo ? '(Con Equipo)' : ''}
                                </button>
                            ) : (
                                <button onClick={() => handleRegisterAction('salida')} style={btnActionStyle('#dc2626')} disabled={loading}>
                                    📤 Confirmar Salida {searchResult.serial_equipo ? ' (Incluye Equipo)' : ''}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PersonasDashboard;
