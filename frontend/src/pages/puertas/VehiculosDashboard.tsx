import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

interface User {
    doc: string;
    nombre: string;
}

interface Vehiculo {
    placa: string;
    tipo_vehiculo: string;
    marca: string;
    modelo: string;
    color: string;
    doc: string;
    usuario_nombre: string;
}

interface Equipo {
    serial: string;
    marca: string;
    modelo: string;
    tipo_equipo: string;
}

interface RegistroAbierto {
    id: number;
    doc: string;
    serial_equipo: string | null;
    placa: string | null;
}

interface SearchData {
    vehiculos: Vehiculo[];
    equipos: Equipo[];
    registrosAbiertos: RegistroAbierto[];
}

const VehiculosDashboard: React.FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user } = useOutletContext<{ user: User }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<SearchData | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [traeEquipo, setTraeEquipo] = useState(false);

    const [selectedVehiculo, setSelectedVehiculo] = useState<string | null>(null);
    const [selectedEquipo, setSelectedEquipo] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;

        setLoading(true);
        setSearchResult(null);
        setMessage(null);
        setTraeEquipo(false);
        setSelectedVehiculo(null);
        setSelectedEquipo(null);

        const token = sessionStorage.getItem('userToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const res = await fetch(`${apiUrl}/puertas/search-vehiculo?query=${searchQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSearchResult(data.data);
                // Si solo hay un vehículo, se selecciona automáticamente
                if (data.data.vehiculos && data.data.vehiculos.length === 1) {
                    setSelectedVehiculo(data.data.vehiculos[0].placa);
                }
            } else {
                setMessage({ text: data.message || 'Vehículo o usuario no encontrado', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const isVehiculoInside = (placa: string) => {
        if (!searchResult) return false;
        return searchResult.registrosAbiertos.some(r => r.placa === placa);
    };

    const getRegistroId = (placa: string) => {
        if (!searchResult) return null;
        const reg = searchResult.registrosAbiertos.find(r => r.placa === placa);
        return reg ? reg.id : null;
    };

    const handleRegisterAction = async (accion: 'entrada' | 'salida') => {
        if (!searchResult || !selectedVehiculo) return;

        const vehiculo = searchResult.vehiculos.find(v => v.placa === selectedVehiculo);
        if (!vehiculo) return;

        setLoading(true);
        const token = sessionStorage.getItem('userToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const body = {
                doc: vehiculo.doc,
                placa: vehiculo.placa,
                accion,
                serial_equipo: traeEquipo ? selectedEquipo : null,
                id_registro: accion === 'salida' ? getRegistroId(selectedVehiculo) : null
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
                setSearchQuery('');
                setSelectedVehiculo(null);
                setSelectedEquipo(null);
                setTraeEquipo(false);
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

    const selectedVehiculoData = searchResult?.vehiculos.find(v => v.placa === selectedVehiculo);
    const estaAdentro = selectedVehiculo ? isVehiculoInside(selectedVehiculo) : false;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Control de Acceso - Vehículos</h2>

            {/* Formulario de Búsqueda */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Buscar por Placa o Documento</h3>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Ej: ABC123... o Documento"
                        style={inputStyle}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                <div style={{ animation: 'slideUp 0.3s ease-out' }}>
                    <div style={cardStyle}>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '1rem' }}>🚗 Seleccionar Vehículo</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {searchResult.vehiculos.map(vehiculo => {
                                    const devInside = isVehiculoInside(vehiculo.placa);
                                    const isSelected = selectedVehiculo === vehiculo.placa;
                                    return (
                                        <div
                                            key={vehiculo.placa}
                                            onClick={() => setSelectedVehiculo(vehiculo.placa)}
                                            style={{
                                                padding: '1rem',
                                                border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
                                                borderRadius: '0.5rem',
                                                backgroundColor: isSelected ? '#eff6ff' : 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{vehiculo.placa}</h3>
                                                <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0.25rem 0' }}>{vehiculo.tipo_vehiculo} | {vehiculo.marca} {vehiculo.modelo} | Color: {vehiculo.color}</p>
                                                <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: 0 }}>Propietario: {vehiculo.usuario_nombre}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: devInside ? '#fee2e2' : '#dcfce7', color: devInside ? '#991b1b' : '#166534' }}>
                                                    {devInside ? '● Vehículo en Sede' : '○ Fuera'}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {selectedVehiculo && selectedVehiculoData && (
                            <>
                                {/* Selector de Equipo */}
                                {!estaAdentro && searchResult.equipos.length > 0 && (
                                    <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px dashed #d1d5db' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: traeEquipo ? '1rem' : '0' }}>
                                            <input
                                                type="checkbox"
                                                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                                                checked={traeEquipo}
                                                onChange={(e) => setTraeEquipo(e.target.checked)}
                                            />
                                            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>¿El conductor ingresa con equipo propio?</span>
                                        </label>

                                        {traeEquipo && (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                                {searchResult.equipos.map(eq => {
                                                    const isSelected = selectedEquipo === eq.serial;
                                                    return (
                                                        <div
                                                            key={eq.serial}
                                                            onClick={() => setSelectedEquipo(isSelected ? null : eq.serial)}
                                                            style={{
                                                                padding: '0.75rem',
                                                                border: `2px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                                                                borderRadius: '0.5rem',
                                                                backgroundColor: isSelected ? '#ecfdf5' : 'white',
                                                                cursor: 'pointer',
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            {isSelected && (
                                                                <div style={{
                                                                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                                                                    width: '1.25rem', height: '1.25rem', borderRadius: '50%',
                                                                    backgroundColor: '#10b981',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                }}>
                                                                    <span style={{ color: 'white', fontSize: '0.75rem' }}>✓</span>
                                                                </div>
                                                            )}
                                                            <p style={{ fontWeight: 'bold', margin: 0, fontSize: '0.9rem', color: '#111827' }}>{eq.marca}</p>
                                                            <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: '0.25rem 0' }}>SN: {eq.serial}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Botones de Acción */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {!estaAdentro ? (
                                        <button onClick={() => handleRegisterAction('entrada')} style={btnActionStyle('#2563eb')} disabled={loading}>
                                            📥 Registrar Ingreso de {selectedVehiculo} {traeEquipo && selectedEquipo ? '(Con equipo)' : ''}
                                        </button>
                                    ) : (
                                        <button onClick={() => handleRegisterAction('salida')} style={btnActionStyle('#4b5563')} disabled={loading}>
                                            📤 Registrar Salida de {selectedVehiculo}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default VehiculosDashboard;
