import React, { useState } from 'react';
import { searchVehiculo, registrarActividad } from '../../services/puertasService';
import { toast } from 'sonner';
import { useSpeech } from '../../hooks/useSpeech';
import type { VehiculoSearchResult } from '../../services/puertasService';
import styles from './VehiculosDashboard.module.css';

// Unused types removed

const STORAGE_URL = import.meta.env.VITE_API_STORAGE || 'http://localhost:8000/storage';

const VehiculosDashboard: React.FC = () => {
    const { leerEnVozAlta, formatTextForSpeech } = useSpeech();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<VehiculoSearchResult | null>(null);
    const [traeEquipo, setTraeEquipo] = useState(false);
    const [selectedVehiculo, setSelectedVehiculo] = useState<string | null>(null);
    const [selectedEquipos, setSelectedEquipos] = useState<string[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        setLoading(true);
        setSearchResult(null);
        setTraeEquipo(false);
        setSelectedVehiculo(null);
        setSelectedEquipos([]);

        try {
            const data = await searchVehiculo(searchQuery);
            setSearchResult(data);
            
            // CASO A: EL USUARIO YA ESTÁ EN SEDE (Salida)
            // Priorizamos si hay un registro activo (especialmente si es búsqueda por placa)
            if (data.registro_activo) {
                setTraeEquipo(true);
                setSelectedVehiculo(data.registro_activo.placa);
                
                const serialesIngresados = data.registro_activo.seriales_equipos;
                setSelectedEquipos(serialesIngresados);

                // Feedback auditivo prioritario para salida
                leerEnVozAlta(`Vehículo en sede placa ${formatTextForSpeech(data.registro_activo.placa || '')}. Registrado con ${serialesIngresados.length} equipos.`);

                setLoading(false);
                return; // DETENER ejecución
            }

            // CASO B: EL USUARIO ESTÁ FUERA (Entrada)
            let defaultVeh = null;
            // 1. Selección de Vehículo
            if (data.vehiculos && data.vehiculos.length > 0) {
                defaultVeh = data.vehiculos.find(v => v.es_predeterminado);
                if (defaultVeh) {
                    setSelectedVehiculo(defaultVeh.placa);
                } else if (data.vehiculos.length === 1) {
                    setSelectedVehiculo(data.vehiculos[0].placa);
                }
            }

            // 2. Selección de Equipos
            const predeterminados = data.equipos
                .filter(eq => eq.es_predeterminado)
                .map(eq => eq.serial);

            if (predeterminados.length > 0) {
                setTraeEquipo(true);
                setSelectedEquipos(predeterminados);
            } else if (data.equipos.length === 1) {
                setTraeEquipo(true);
                setSelectedEquipos([data.equipos[0].serial]);
            } else {
                setTraeEquipo(false);
                setSelectedEquipos([]);
            }

            // Auditory feedback para entrada
            let mensajeVoz = "Usuario encontrado. ";
            const selectedPlaca = defaultVeh ? defaultVeh.placa : (data.vehiculos.length === 1 ? data.vehiculos[0].placa : null);
            
            if (selectedPlaca) {
                mensajeVoz += `Vehículo seleccionado placa ${formatTextForSpeech(selectedPlaca)}. `;
            } else if (data.vehiculos && data.vehiculos.length > 0) {
                mensajeVoz += `Tiene ${data.vehiculos.length} vehículos autorizados. Seleccione uno. `;
            } else {
                mensajeVoz = "El usuario no tiene vehículos registrados o activos.";
            }

            if (predeterminados.length > 0) {
                const seriales = predeterminados.map(s => formatTextForSpeech(s)).join(", ");
                mensajeVoz += `con equipo serial ${seriales}.`;
            } else if (data.equipos.length === 1) {
                mensajeVoz += `con equipo serial ${formatTextForSpeech(data.equipos[0].serial)}.`;
            }

            leerEnVozAlta(mensajeVoz);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Vehículo o usuario no encontrado');
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

    const handleSelectVehiculo = (vehiculo: any) => {
        setSelectedVehiculo(vehiculo.placa);
        leerEnVozAlta(`Vehículo seleccionado. Placa ${formatTextForSpeech(vehiculo.placa)}`);
    };

    const handleToggleEquipo = (serial: string) => {
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
        if (!searchResult || !selectedVehiculo) return;
        const vehiculo = searchResult.vehiculos.find(v => v.placa === selectedVehiculo);
        if (!vehiculo) return;

        setLoading(true);
        try {
            const result = await registrarActividad({
                doc: vehiculo.doc,
                placa: vehiculo.placa,
                accion,
                seriales_equipos: traeEquipo ? selectedEquipos : [],
                id_registro: accion === 'salida' ? getRegistroId(selectedVehiculo) : null
            });
            toast.success(result.message);

            // Voz
            const msg = accion === 'entrada' ? 'Entrada' : 'Salida';
            let extraVoz = ` del vehículo con placa ${formatTextForSpeech(vehiculo.placa)}`;
            if (traeEquipo && selectedEquipos.length > 0) {
                extraVoz += ` con ${selectedEquipos.length} equipos.`;
            }
            leerEnVozAlta(`${msg} autorizada ${extraVoz}`);

            setSearchResult(null);
            setSearchQuery('');
            setSelectedVehiculo(null);
            setSelectedEquipos([]);
            setTraeEquipo(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error al registrar actividad');
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
                    <button type="submit" className={styles.searchBtn} disabled={loading}>
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>
            </div>

            {searchResult && (
                <div className={styles.resultSection}>
                    <div className={styles.card}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>{estaAdentro ? 'Vehículo Ingresado' : 'Seleccionar Vehículo'}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {searchResult.vehiculos
                                    .filter(vehiculo => !estaAdentro || (searchResult.registrosAbiertos.some(r => r.placa === vehiculo.placa)))
                                    .map(vehiculo => {
                                        const devInside = isVehiculoInside(vehiculo.placa);
                                        const isSelected = selectedVehiculo === vehiculo.placa;
                                        return (
                                            <div
                                                key={vehiculo.placa}
                                                className={styles.vehicleItem}
                                                onClick={() => !devInside && handleSelectVehiculo(vehiculo)}
                                                style={{
                                                    border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
                                                    backgroundColor: isSelected ? '#eff6ff' : 'white',
                                                    cursor: devInside ? 'default' : 'pointer'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    {vehiculo.img_vehiculo && (
                                                        <img 
                                                            src={`${STORAGE_URL}/${vehiculo.img_vehiculo.split('|')[0]}`} 
                                                            alt="Vehículo" 
                                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }} 
                                                        />
                                                    )}
                                                    <div>
                                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{vehiculo.placa}</h3>
                                                        <p style={{ fontSize: '0.9rem', color: '#374151', margin: '0.25rem 0' }}>{typeof vehiculo.tipo_vehiculo === 'object' ? (vehiculo.tipo_vehiculo as any)?.tipo_vehiculo : vehiculo.tipo_vehiculo as React.ReactNode} | {typeof vehiculo.marca === 'object' ? ((vehiculo.marca as any)?.nombre || (vehiculo.marca as any)?.marca) : vehiculo.marca as React.ReactNode} {vehiculo.modelo} | Color: {vehiculo.color}</p>
                                                        <p style={{ fontSize: '0.85rem', color: '#1f2937', margin: 0 }}>Propietario: {vehiculo.usuario_nombre}</p>
                                                    </div>
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
                                {searchResult.equipos.length > 0 && (!estaAdentro || (estaAdentro && selectedEquipos.length > 0)) && (
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
                                                {estaAdentro ? 'Equipos vinculados a la entrada:' : '¿El conductor ingresa con equipo propio?'}
                                            </span>
                                        </label>
                                        
                                        {traeEquipo && (
                                            <div className={styles.equipmentGrid}>
                                                {(searchResult.registro_activo ? (searchResult.registro_activo.equipos_adentro || []) : searchResult.equipos).map(eq => {
                                                        const isSelected = selectedEquipos.includes(eq.serial);
                                                        return (
                                                            <div
                                                                key={eq.serial}
                                                                onClick={() => !estaAdentro && handleToggleEquipo(eq.serial)}
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
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                    {eq.img_serial && (
                                                                        <img 
                                                                            src={`${STORAGE_URL}/${eq.img_serial.split('|')[0]}`} 
                                                                            alt="Equipo" 
                                                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }} 
                                                                        />
                                                                    )}
                                                                    <div>
                                                                        <p style={{ fontWeight: 'bold', margin: 0, fontSize: '0.9rem', color: '#111827' }}>{eq.marca}</p>
                                                                        <p style={{ fontSize: '0.8rem', color: '#374151', margin: '0.25rem 0' }}>SN: {eq.serial}</p>
                                                                    </div>
                                                                </div>
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
                                            Registrar Ingreso de {selectedVehiculo} {traeEquipo && selectedEquipos.length > 0 ? `(Con ${selectedEquipos.length} equipos)` : ''}
                                        </button>
                                    ) : (
                                        <button onClick={() => handleRegisterAction('salida')} className={styles.exitBtn} disabled={loading}>
                                            Registrar Salida de {selectedVehiculo} {traeEquipo && selectedEquipos.length > 0 ? `(Con ${selectedEquipos.length} equipos)` : ''}
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
