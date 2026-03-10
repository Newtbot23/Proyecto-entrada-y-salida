import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { searchVehiculo, registrarActividad } from '../../services/puertasService';
import type { VehiculoSearchResult } from '../../services/puertasService';
import styles from './VehiculosDashboard.module.css';

interface User {
    doc: string;
    nombre: string;
}

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

        try {
            const data = await searchVehiculo(searchQuery);
            setSearchResult(data);
            if (data.vehiculos && data.vehiculos.length === 1) {
                setSelectedVehiculo(data.vehiculos[0].placa);
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
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 className={styles.sectionTitle}>🚗 Seleccionar Vehículo</h4>
                            <div className={styles.vehicleList}>
                                {searchResult.vehiculos.map(vehiculo => {
                                    const devInside = isVehiculoInside(vehiculo.placa);
                                    const isSelected = selectedVehiculo === vehiculo.placa;
                                    return (
                                        <div
                                            key={vehiculo.placa}
                                            onClick={() => setSelectedVehiculo(vehiculo.placa)}
                                            className={`${styles.vehicleItem} ${isSelected ? styles.vehicleActive : ''}`}
                                        >
                                            <div className={styles.vehicleInfo}>
                                                <h3>{vehiculo.placa}</h3>
                                                <p className={styles.details}>{vehiculo.tipo_vehiculo} | {vehiculo.marca} {vehiculo.modelo} | Color: {vehiculo.color}</p>
                                                <p className={styles.owner}>Propietario: {vehiculo.usuario_nombre}</p>
                                            </div>
                                            <div>
                                                <span className={`${styles.statusBadge} ${devInside ? styles.statusInside : styles.statusOutside}`}>
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
                                {!estaAdentro && searchResult.equipos.length > 0 && (
                                    <div className={styles.equipmentSelector}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={traeEquipo}
                                                onChange={(e) => setTraeEquipo(e.target.checked)}
                                            />
                                            <span>¿El conductor ingresa con equipo propio?</span>
                                        </label>

                                        {traeEquipo && (
                                            <div className={styles.equipmentGrid}>
                                                {searchResult.equipos.map(eq => {
                                                    const isEqSelected = selectedEquipo === eq.serial;
                                                    return (
                                                        <div
                                                            key={eq.serial}
                                                            onClick={() => setSelectedEquipo(isEqSelected ? null : eq.serial)}
                                                            className={`${styles.equipmentItem} ${isEqSelected ? styles.equipmentActive : ''}`}
                                                        >
                                                            {isEqSelected && (
                                                                <div className={styles.checkIcon}>
                                                                    <span>✓</span>
                                                                </div>
                                                            )}
                                                            <p className={styles.eqName}>{eq.marca}</p>
                                                            <p className={styles.eqSerial}>SN: {eq.serial}</p>
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
                                        <button onClick={() => handleRegisterAction('salida')} className={styles.exitBtn} disabled={loading}>
                                            📤 Registrar Salida de {selectedVehiculo}
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
