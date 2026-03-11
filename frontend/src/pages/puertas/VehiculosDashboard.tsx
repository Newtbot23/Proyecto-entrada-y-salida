import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { registrarActividad } from '../../services/puertasService';
import type { VehiculoSearchResult } from '../../services/puertasService';
import styles from './VehiculosDashboard.module.css';

interface User {
    doc: string;
    nombre: string;
}

interface RegistroAbierto {
    id: number;
    placa: string | null;
    serial_equipo: string | null;
}

const btnSearchStyle: React.CSSProperties = {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer'
};

const btnActionStyle = (color: string): React.CSSProperties => ({
    backgroundColor: color,
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    width: '100%'
});

const VehiculosDashboard: React.FC = () => {
    useOutletContext<{ user: User }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<VehiculoSearchResult | null>(null);
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

        const token = sessionStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const res = await fetch(`${apiUrl}/puertas/search-vehiculo?query=${searchQuery}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();

            if (data.success) {
                setSearchResult(data.data);
                // Si la persona ya está adentro con un vehículo, seleccionarlo automáticamente
                if (data.data.registrosAbiertos && data.data.registrosAbiertos.length > 0) {
                    const activeReg = data.data.registrosAbiertos.find((r: RegistroAbierto) => r.placa);
                    if (activeReg && activeReg.placa) {
                        setSelectedVehiculo(activeReg.placa);
                        if (activeReg.serial_equipo) {
                            setTraeEquipo(true);
                            setSelectedEquipo(activeReg.serial_equipo);
                        }
                    } else if (data.data.vehiculos && data.data.vehiculos.length === 1) {
                        setSelectedVehiculo(data.data.vehiculos[0].placa);
                    }
                } else if (data.data.vehiculos && data.data.vehiculos.length === 1) {
                    setSelectedVehiculo(data.data.vehiculos[0].placa);
                }
            } else {
                setMessage({ text: data.message || 'Vehículo o usuario no encontrado', type: 'error' });
            }
        } catch (error: any) {
            console.error(error);
            setMessage({ text: error.message || 'Vehículo o usuario no encontrado', type: 'error' });
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
        try {
            const result = await registrarActividad({
                doc: vehiculo.doc,
                placa: vehiculo.placa,
                accion,
                serial_equipo: traeEquipo ? selectedEquipo : null,
                id_registro: accion === 'salida' ? getRegistroId(selectedVehiculo) : null
            });
            setMessage({ text: result.message, type: 'success' });
            setSearchResult(null);
            setSearchQuery('');
            setSelectedVehiculo(null);
            setSelectedEquipo(null);
            setTraeEquipo(false);
        } catch (error: any) {
            console.error(error);
            setMessage({ text: error.message || 'Error al registrar actividad', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const selectedVehiculoData = searchResult?.vehiculos.find(v => v.placa === selectedVehiculo);
    const estaAdentro = selectedVehiculo ? isVehiculoInside(selectedVehiculo) : false;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Control de Acceso - Vehículos</h2>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Buscar por Placa o Documento</h3>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Ej: ABC123... o Documento"
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" style={btnSearchStyle} disabled={loading}>
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>
            </div>

            {message && (
                <div className={`${styles.message} ${message.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
                    {message.text}
                </div>
            )}

            {searchResult && (
                <div className={styles.resultSection}>
                    <div className={styles.card}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '1rem' }}>🚗 {estaAdentro ? 'Vehículo Ingresado' : 'Seleccionar Vehículo'}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {searchResult.vehiculos
                                    .filter(vehiculo => !estaAdentro || (searchResult.registrosAbiertos.some(r => r.placa === vehiculo.placa)))
                                    .map(vehiculo => {
                                        const devInside = isVehiculoInside(vehiculo.placa);
                                        const isSelected = selectedVehiculo === vehiculo.placa;
                                        return (
                                            <div
                                                key={vehiculo.placa}
                                                onClick={() => !devInside && setSelectedVehiculo(vehiculo.placa)}
                                                style={{
                                                    padding: '1rem',
                                                    border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
                                                    borderRadius: '0.5rem',
                                                    backgroundColor: isSelected ? '#eff6ff' : 'white',
                                                    cursor: devInside ? 'default' : 'pointer',
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
                                                    <span style={{ padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: devInside ? '#fef3c7' : '#dcfce7', color: devInside ? '#92400e' : '#166534' }}>
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
                                {searchResult.equipos.length > 0 && (!estaAdentro || (estaAdentro && selectedEquipo)) && (
                                    <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px dashed #d1d5db' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: estaAdentro ? 'default' : 'pointer', marginBottom: traeEquipo ? '1rem' : '0' }}>
                                            {!estaAdentro && (
                                                <input
                                                    type="checkbox"
                                                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                                                    checked={traeEquipo}
                                                    onChange={(e) => setTraeEquipo(e.target.checked)}
                                                />
                                            )}
                                            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>
                                                {estaAdentro ? 'Equipo vinculado a la entrada:' : '¿El conductor ingresa con equipo propio?'}
                                            </span>
                                        </label>

                                        {traeEquipo && (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                                {searchResult.equipos
                                                    .filter(eq => !estaAdentro || eq.serial === selectedEquipo)
                                                    .map(eq => {
                                                        const isSelected = selectedEquipo === eq.serial;
                                                        return (
                                                            <div
                                                                key={eq.serial}
                                                                onClick={() => !estaAdentro && setSelectedEquipo(isSelected ? null : eq.serial)}
                                                                style={{
                                                                    padding: '0.75rem',
                                                                    border: `2px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                                                                    borderRadius: '0.5rem',
                                                                    backgroundColor: isSelected ? '#ecfdf5' : 'white',
                                                                    cursor: estaAdentro ? 'default' : 'pointer',
                                                                    position: 'relative'
                                                                }}
                                                            >
                                                                {isSelected && !estaAdentro && (
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

                                <div className={styles.actionButtons}>
                                    {!estaAdentro ? (
                                        <button onClick={() => handleRegisterAction('entrada')} className={styles.entryBtn} disabled={loading}>
                                            📥 Registrar Ingreso de {selectedVehiculo} {traeEquipo && selectedEquipo ? '(Con equipo)' : ''}
                                        </button>
                                    ) : (
                                        <button onClick={() => handleRegisterAction('salida')} style={btnActionStyle('#4b5563')} disabled={loading}>
                                            📤 Registrar Salida de {selectedVehiculo} {traeEquipo && selectedEquipo ? '(Con equipo)' : ''}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehiculosDashboard;
