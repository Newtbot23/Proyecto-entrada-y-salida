import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AsignacionesService } from '../../../../services/asignacionesService';
import styles from './HistorialAsignaciones.module.css';

const HistorialAsignaciones: React.FC = () => {
    const [searchFicha, setSearchFicha] = useState('');

    const { data: historial, isLoading, isError } = useQuery({
        queryKey: ['historialAsignaciones'],
        queryFn:AsignacionesService.getHistorialAsignaciones,
        refetchOnWindowFocus: false
    });

    if (isLoading) {
        return <div className={styles.container}><p>Cargando historial...</p></div>;
    }

    if (isError) {
        return <div className={styles.container}><p>Error al cargar el historial de asignaciones.</p></div>;
    }

    const filteredHistorial = historial
        ? historial.filter((grupo: any) =>
            String(grupo.ficha).toLowerCase().includes(searchFicha.toLowerCase())
          )
        : [];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Historial de Asignaciones</h1>
                <p>Consulta las asignaciones masivas realizadas recientemente agrupadas por código.</p>
            </header>

            <div className={styles.searchBar}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="Buscar por número de ficha..."
                    value={searchFicha}
                    onChange={(e) => setSearchFicha(e.target.value)}
                    className={styles.searchInput}
                />
                {searchFicha && (
                    <button className={styles.clearBtn} onClick={() => setSearchFicha('')} title="Limpiar búsqueda">✕</button>
                )}
            </div>

            <div className={styles.accordionList}>
                {filteredHistorial.length > 0 ? (
                    filteredHistorial.map((grupo: any) => (
                        <details key={grupo.codigo_asignacion} className={styles.accordionItem}>
                            <summary className={styles.summary}>
                                <div className={styles.summaryContent}>
                                    <span className={styles.batchCode}>{grupo.codigo_asignacion}</span>
                                    <div className={styles.infoGroup}>
                                        <div className={styles.infoItem}>
                                            <strong>Ficha:</strong> {grupo.ficha}
                                        </div>
                                        <div className={styles.infoItem}>
                                            <strong>Fecha:</strong> {new Date(grupo.fecha).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className={styles.badge}>Total Equipos: {grupo.total_equipos}</span>
                                </div>
                                <svg 
                                    className={styles.chevron} 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <div className={styles.content}>
                                <div className={styles.tableWrapper}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Documento</th>
                                                <th>Aprendiz</th>
                                                <th>Serial Equipo</th>
                                                <th>Placa SENA</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {grupo.detalles.map((detalle: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td>{detalle.documento}</td>
                                                    <td>{detalle.nombre}</td>
                                                    <td className={styles.serialText}>{detalle.serial}</td>
                                                    <td>{detalle.placa || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </details>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <p>
                            {searchFicha
                                ? `No se encontraron asignaciones para la ficha "${searchFicha}".`
                                : 'No se encontraron registros de asignaciones masivas.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialAsignaciones;
