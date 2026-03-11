import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { searchPersona, registrarActividad } from '../../services/puertasService';
import type { PersonaSearchResult } from '../../services/puertasService';
import styles from './PersonasDashboard.module.css';

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
    const [searchResult, setSearchResult] = useState<PersonaSearchResult | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [selectedEquipo, setSelectedEquipo] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchDoc) return;
        setLoading(true);
        setSearchResult(null);
        setMessage(null);
        setSelectedEquipo(null);

        const token = sessionStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const res = await fetch(`${apiUrl}/puertas/search-persona?doc=${searchDoc}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
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
        } catch (error: any) {
            console.error(error);
            setMessage({ text: error.message || 'Usuario no encontrado', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterAction = async (accion: 'entrada' | 'salida') => {
        if (!searchResult) return;
        setLoading(true);

        try {
            const result = await registrarActividad({
                doc: searchResult.usuario.doc,
                accion,
                serial_equipo: selectedEquipo,
                id_registro: searchResult.id_registro
            });
            setMessage({ text: result.message, type: 'success' });
            setSearchResult(null);
            setSearchDoc('');
            setSelectedEquipo(null);
        } catch (error: any) {
            console.error(error);
            setMessage({ text: error.message || 'Error al registrar actividad', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Control de Acceso - Personas</h2>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Buscar por Documento</h3>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Número de documento..."
                        className={styles.searchInput}
                        value={searchDoc}
                        onChange={(e) => setSearchDoc(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" className={styles.searchBtn} disabled={loading}>
                        {loading ? 'Buscando...' : '🔍 Buscar'}
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
                        <div className={styles.resultHeader}>
                            <div className={styles.userInfo}>
                                <p>Nombre del Usuario</p>
                                <h3>{searchResult.usuario.nombre}</h3>
                                <p className={styles.doc}>DOC: {searchResult.usuario.doc}</p>
                            </div>
                            <div>
                                <span className={`${styles.statusBadge} ${searchResult.estaAdentro ? styles.statusInside : styles.statusOutside}`}>
                                    {searchResult.estaAdentro ? '● En Instalaciones' : '○ Fuera'}
                                </span>
                            </div>
                        </div>

                        {/* Equipos Propios */}
                        {searchResult.equipos.length > 0 && (!searchResult.estaAdentro || (searchResult.estaAdentro && searchResult.serial_equipo)) ? (
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
                        ) : (
                            <p className={styles.noEquipment}>Sin equipos propios registrados.</p>
                        )}

                        <div className={styles.actionButtons}>
                            {!searchResult.estaAdentro ? (
                                <button onClick={() => handleRegisterAction('entrada')} className={styles.entryBtn} disabled={loading}>
                                    📥 Confirmar Entrada {selectedEquipo ? '(Con Equipo)' : ''}
                                </button>
                            ) : (
                                <button onClick={() => handleRegisterAction('salida')} className={styles.exitBtn} disabled={loading}>
                                    📤 Confirmar Salida {searchResult.serial_equipo ? ' (Incluye Equipo)' : ''}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonasDashboard;