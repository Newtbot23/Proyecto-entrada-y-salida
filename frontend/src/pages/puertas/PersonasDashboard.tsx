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

        try {
            const data = await searchPersona(searchDoc);
            setSearchResult(data);
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

                        <div className={styles.equipmentSection}>
                            <h4>💻 {searchResult.estaAdentro ? 'Equipo Ingresado' : 'Seleccionar Equipo (Opcional)'}</h4>
                            {searchResult.equipos.length > 0 ? (
                                <div className={styles.equipmentGrid}>
                                    {searchResult.equipos.map(eq => {
                                        const isSelected = selectedEquipo === eq.serial;
                                        return (
                                            <div
                                                key={eq.serial}
                                                onClick={() => !searchResult.estaAdentro && setSelectedEquipo(isSelected ? null : eq.serial)}
                                                className={`${styles.equipmentItem} ${isSelected ? styles.equipmentActive : ''}`}
                                                style={{ cursor: searchResult.estaAdentro ? 'default' : 'pointer' }}
                                            >
                                                {!searchResult.estaAdentro && (
                                                    <div className={`${styles.checkIcon} ${isSelected ? styles.checkIconActive : ''}`}>
                                                        {isSelected && '✓'}
                                                    </div>
                                                )}
                                                <div className={styles.equipmentInfo}>
                                                    <p className={styles.name}>{eq.marca} - {eq.modelo}</p>
                                                    <p className={styles.serial}>SN: {eq.serial}</p>
                                                    <p className={styles.type}>{eq.tipo_equipo}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className={styles.noEquipment}>Sin equipos propios registrados.</p>
                            )}
                        </div>

                        <div className={styles.actionButtons}>
                            {!searchResult.estaAdentro ? (
                                <button onClick={() => handleRegisterAction('entrada')} className={styles.entryBtn} disabled={loading}>
                                    📥 Confirmar Entrada {selectedEquipo ? '(Con Equipo)' : ''}
                                </button>
                            ) : (
                                <button onClick={() => handleRegisterAction('salida')} className={styles.exitBtn} disabled={loading}>
                                    📤 Confirmar Salida
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
