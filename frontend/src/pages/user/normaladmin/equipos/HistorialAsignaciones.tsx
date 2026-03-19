import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AsignacionesService } from '../../../../services/asignacionesService';
import styles from './HistorialAsignaciones.module.css';

const HistorialAsignaciones: React.FC = () => {
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

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Historial de Asignaciones</h1>
                <p>Consulta las asignaciones masivas realizadas recientemente agrupadas por código.</p>
            </header>

            <div className={styles.accordionList}>
                {historial && historial.length > 0 ? (
                    historial.map((grupo: any) => (
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
                    <p>No se encontraron registros de asignaciones masivas.</p>
                )}
            </div>
        </div>
    );
};

export default HistorialAsignaciones;
