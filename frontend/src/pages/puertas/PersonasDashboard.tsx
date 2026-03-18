import React, { useState } from 'react';
import { searchPersona, registrarActividad } from '../../services/puertasService';
import { toast } from 'sonner';
import { useSpeech } from '../../hooks/useSpeech';
import type { PersonaSearchResult } from '../../services/puertasService';
import styles from './PersonasDashboard.module.css';

const STORAGE_URL = import.meta.env.VITE_API_STORAGE || 'http://localhost:8000/storage';

// Unused types removed

const PersonasDashboard: React.FC = () => {
    const { leerEnVozAlta, formatTextForSpeech } = useSpeech();
    const [searchDoc, setSearchDoc] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<PersonaSearchResult | null>(null);
    const [selectedEquipos, setSelectedEquipos] = useState<string[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchDoc) return;
        setLoading(true);
        setSearchResult(null);
        try {
            const data = await searchPersona(searchDoc);
            setSearchResult(data);

            // CASO A: EL USUARIO YA ESTÁ EN SEDE (Salida)
            if (data.registro_activo) {
                const serialesIngresados = data.registro_activo.seriales_equipos;
                setSelectedEquipos(serialesIngresados);
                
                // Feedback auditivo prioritario para salida
                leerEnVozAlta(`Usuario en sede: ${data.usuario.nombre}. Registrado con ${serialesIngresados.length} equipos.`);
                
                setLoading(false);
                return; // DETENER ejecución
            }

            // CASO B: EL USUARIO ESTÁ FUERA (Entrada)
            const predeterminados = data.equipos
                .filter(eq => eq.es_predeterminado)
                .map(eq => eq.serial);

            if (predeterminados.length > 0) {
                setSelectedEquipos(predeterminados);
            } else if (data.equipos.length === 1) {
                // Si solo tiene uno, lo marcamos por defecto aunque no sea "predeterminado"
                setSelectedEquipos([data.equipos[0].serial]);
            } else {
                setSelectedEquipos([]);
            }

            // Auditory feedback para entrada
            let mensajeVoz = `Usuario encontrado: ${data.usuario.nombre}. `;
            if (data.equipos && data.equipos.length > 0) {
                const seriales = data.equipos.map(e => formatTextForSpeech(e.serial)).join(", ");
                mensajeVoz += `serial ${seriales}.`;
            } else {
                mensajeVoz += "sin equipos registrados.";
            }
            leerEnVozAlta(mensajeVoz);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Usuario no encontrado');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEquipo = (serial: string) => {
        // Solo permitir toggle si no está adentro (en modo entrada)
        if (searchResult?.registro_activo) return;
        
        setSelectedEquipos(prev => 
            prev.includes(serial) 
                ? prev.filter(s => s !== serial) 
                : [...prev, serial]
        );
    };

    const handleRegisterAction = async (accion: 'entrada' | 'salida') => {
        if (!searchResult) return;
        setLoading(true);

        try {
            const result = await registrarActividad({
                doc: searchResult.usuario.doc,
                accion,
                seriales_equipos: selectedEquipos,
                id_registro: searchResult.registro_activo?.id
            });
            toast.success(result.message);
            
            // Voz
            const msg = searchResult.estaAdentro ? 'Salida' : 'Entrada';
            let extraVoz = '';
            if (selectedEquipos.length > 0) {
                extraVoz = ` con ${selectedEquipos.length} equipos.`;
            }
            leerEnVozAlta(`${msg} autorizada para ${searchResult.usuario.nombre}${extraVoz}`);

            setSearchResult(null);
            setSearchDoc('');
            setSelectedEquipos([]);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error al registrar actividad');
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
                        {searchResult.equipos.length > 0 && (!searchResult.registro_activo || (searchResult.registro_activo && searchResult.registro_activo.seriales_equipos.length > 0)) ? (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>💻 {searchResult.registro_activo ? 'Equipos Vinculados a la Entrada' : 'Seleccionar Equipos (Opcional)'}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {searchResult.equipos
                                        .filter(eq => !searchResult.registro_activo || searchResult.registro_activo.seriales_equipos.includes(eq.serial))
                                        .map(eq => {
                                            const isSelected = selectedEquipos.includes(eq.serial);
                                            return (
                                                <div
                                                    key={eq.serial}
                                                    onClick={() => !searchResult.estaAdentro && handleToggleEquipo(eq.serial)}
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
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        {eq.img_serial && (
                                                            <img 
                                                                src={`${STORAGE_URL}/${eq.img_serial.split('|')[0]}`} 
                                                                alt="Equipo" 
                                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }} 
                                                            />
                                                        )}
                                                        <div>
                                                            <p style={{ fontWeight: 'bold', margin: 0, paddingRight: '1.5rem' }}>{eq.marca} - {eq.modelo}</p>
                                                            <p style={{ fontSize: '0.85rem', color: isSelected ? '#1d4ed8' : '#374151', margin: '0.25rem 0' }}>SN: {eq.serial}</p>
                                                            <p style={{ fontSize: '0.85rem', color: '#374151', margin: 0 }}>{eq.tipo_equipo}</p>
                                                        </div>
                                                    </div>
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
                                    📥 Confirmar Entrada {selectedEquipos.length > 0 ? `(${selectedEquipos.length} Equipos)` : ''}
                                </button>
                            ) : (
                                <button onClick={() => handleRegisterAction('salida')} className={styles.exitBtn} disabled={loading}>
                                    📤 Confirmar Salida {selectedEquipos.length > 0 ? ` (${selectedEquipos.length} Equipos)` : ''}
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