import React, { useState, useRef, useEffect } from 'react';
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

    const lastScanRef = useRef<{ doc: string, time: number } | null>(null);
    const [isWaitingConfirm, setIsWaitingConfirm] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<number | null>(null);
    const confirmBtnRef = useRef<HTMLButtonElement>(null);
    
    // NUEVA REFERENCIA: Validar doble escaneo
    const documentoEsperado = useRef<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                documentoEsperado.current = null;
                setSearchResult(null);
                setSearchDoc('');
                setSelectedEquipos([]);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                if (inputRef.current) {
                    inputRef.current.value = '';
                    inputRef.current.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (!loading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [loading, searchResult]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Capturar valor del DOM y aplicar trim para evitar espacios invisibles
        const rawValor = inputRef.current ? inputRef.current.value : '';
        const currentDoc = rawValor.trim();

        // 2. Limpieza Obligatoria post-escaneo (DOM y Estado)
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
        setSearchDoc('');

        if (!currentDoc) {
            return;
        }

        // VALIDACIÓN DE REFERENCIA TEMPORAL (Segundo Escaneo)
        if (documentoEsperado.current) {
            if (isWaitingConfirm) {
                toast.warning('Espere a que se habilite el botón de confirmación (4 segundos).');
                return;
            }
            
            const docGuardado = String(documentoEsperado.current).trim();
            const docEscaneado = String(currentDoc).trim();

            console.log('Validación -> Esperado:', docGuardado, '(', typeof docGuardado, ') | Escaneado:', docEscaneado, '(', typeof docEscaneado, ')');

            if (docGuardado === docEscaneado) {
                // Coincide exactamente: Confirmar
                const accion = searchResult?.estaAdentro ? 'salida' : 'entrada';
                handleRegisterAction(accion);
            } else {
                // NO coincide: Error fatal visual y reset de cero
                toast.error('El documento escaneado no coincide con el registro actual. Búsqueda cancelada.');
                documentoEsperado.current = null;
                setSearchResult(null);
                setSearchDoc('');
                setSelectedEquipos([]);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                if (inputRef.current) {
                    inputRef.current.value = '';
                    inputRef.current.focus();
                }
            }
            return; // DETIENE CUALQUIER OTRA BÚSQUEDA
        }

        const now = Date.now();

        lastScanRef.current = { doc: currentDoc, time: now };
        setIsWaitingConfirm(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            setIsWaitingConfirm(false);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 4000);

        setLoading(true);
        // NO hacemos setSearchResult(null)
        try {
            const data = await searchPersona(currentDoc);
            setSearchResult(data);
            
            // GUARDAMOS EL DOCUMENTO EXITOSO PARA LA PRÓXIMA COMPROBACIÓN
            documentoEsperado.current = data.usuario.doc;

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
            if (predeterminados.length > 0) {
                const seriales = predeterminados.map(s => formatTextForSpeech(s)).join(", ");
                mensajeVoz += `con equipo serial ${seriales}.`;
            } else if (data.equipos.length === 1) {
                mensajeVoz += `con equipo serial ${formatTextForSpeech(data.equipos[0].serial)}.`;
            } else {
                mensajeVoz += "sin equipos seleccionados.";
            }
            leerEnVozAlta(mensajeVoz);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Usuario no encontrado');
        } finally {
            setLoading(false);
            if (inputRef.current) {
                inputRef.current.value = '';
                inputRef.current.focus();
            }
            setSearchDoc('');
        }
    };

    const handleToggleEquipo = (serial: string) => {
        // Solo permitir toggle si no está adentro (en modo entrada)
        if (searchResult?.registro_activo) return;

        setSelectedEquipos(prev => {
            const isSelected = prev.includes(serial);
            if (isSelected) {
                leerEnVozAlta(`Equipo deseleccionado`);
            } else {
                leerEnVozAlta(`Equipo seleccionado. Serial ${formatTextForSpeech(serial)}`);
            }
            return isSelected ? prev.filter(s => s !== serial) : [...prev, serial];
        });
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
            documentoEsperado.current = null; // Limpieza post confirmación
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error al registrar actividad');
        } finally {
            setLoading(false);
            if (inputRef.current) {
                inputRef.current.value = '';
                inputRef.current.focus();
            }
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
                        disabled={loading && !searchResult}
                        ref={inputRef}
                    />
                    <button type="submit" className={styles.searchBtn} disabled={loading}>
                        {loading ? 'Buscando...' : 'Buscar'}
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
                                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>{searchResult.registro_activo ? 'Equipos Vinculados a la Entrada' : 'Seleccionar Equipos (Opcional)'}</h4>
                                <div className={styles.equipmentGrid}>
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
                                                            <p style={{ fontWeight: 'bold', margin: 0, paddingRight: '1.5rem' }}>{typeof eq.marca === 'object' ? (eq.marca as any)?.marca : eq.marca} - {eq.modelo}</p>
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
                                <button
                                    onClick={() => handleRegisterAction('entrada')}
                                    className={styles.entryBtn}
                                    disabled={loading || isWaitingConfirm}
                                    ref={confirmBtnRef}
                                    style={isWaitingConfirm ? { backgroundColor: '#fef08a', color: '#854d0e', borderColor: '#eab308', cursor: 'wait' } : {}}
                                >
                                    {isWaitingConfirm ? 'Espere 4 seg...' : `Confirmar Entrada ${selectedEquipos.length > 0 ? `(${selectedEquipos.length} Equipos)` : ''}`}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleRegisterAction('salida')}
                                    className={styles.exitBtn}
                                    disabled={loading || isWaitingConfirm}
                                    ref={confirmBtnRef}
                                    style={isWaitingConfirm ? { backgroundColor: '#fef08a', color: '#854d0e', borderColor: '#eab308', cursor: 'wait' } : {}}
                                >
                                    {isWaitingConfirm ? 'Espere 4 seg...' : `Confirmar Salida ${selectedEquipos.length > 0 ? ` (${selectedEquipos.length} Equipos)` : ''}`}
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