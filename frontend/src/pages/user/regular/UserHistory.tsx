import React, { useState, useEffect } from 'react';
import { getUserEntradas, exportHistoryPdf } from '../../../services/userHistoryService';
import type { Registro } from '../../../services/userHistoryService';
import styles from './UserHistory.module.css';

const UserHistory: React.FC = () => {
    const [entradas, setEntradas] = useState<Registro[]>([]);
    const [historyDateFilter, setHistoryDateFilter] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchEntradas = async (fecha?: string) => {
        try {
            const data = await getUserEntradas(fecha);
            setEntradas(data);
        } catch (error) {
            console.error("Error fetching entradas", error);
        }
    };

    useEffect(() => {
        fetchEntradas();
    }, []);

    const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setHistoryDateFilter(val);
        fetchEntradas(val);
    };

    const getMonthName = (dateStr: string) => {
        const date = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
        return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    };

    return (
        <div className={styles.root}>
            <h2 className={styles.title}>
                Historial de Entradas
            </h2>

            <div className={styles.card}>
                <div className={styles.tableResponsive}>
                    <div className={styles.controlsContainer}>
                        <div className={styles.filter}>
                            <label className={styles.label}>Filtro Vista:</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={historyDateFilter}
                                onChange={handleDateFilterChange}
                            />
                            {historyDateFilter && (
                            <button
                                onClick={() => handleDateFilterChange({ target: { value: '' } } as any)}
                                className={styles.cleanButton}
                            >
                                Limpiar
                            </button>
                        )}
                    </div>

                    <button
                        className={styles.pdfButton}
                        disabled={loading}
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const blob = await exportHistoryPdf(historyDateFilter);
                                    const downloadUrl = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = downloadUrl;

                                    const monthName = getMonthName(historyDateFilter).replace(/ /g, '_');
                                    link.setAttribute('download', `historial_${monthName}.pdf`);

                                    document.body.appendChild(link);
                                    link.click();
                                    link.parentNode?.removeChild(link);
                                    window.URL.revokeObjectURL(downloadUrl);
                                } catch (error) {
                                    alert('No se pudo descargar el PDF. Por favor intenta de nuevo.');
                                    console.error(error);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            title={`Exportar todo el mes de ${getMonthName(historyDateFilter)}`}
                        >
                            {loading ? 'Generando...' : `PDF: Mes de ${getMonthName(historyDateFilter)}`}
                        </button>
                    </div>
                    {entradas.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p className={styles.emptyIcon}></p>
                            <p className={styles.emptyText}>No hay registros de entradas</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr>
                                    <th className={styles.thTd}>Fecha</th>
                                    <th className={styles.thTd}>Hora Entrada</th>
                                    <th className={styles.thTd}>Hora Salida</th>
                                    <th className={styles.thTd}>Vehículo</th>
                                    <th className={styles.thTd}>Equipo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entradas.map((ent) => (
                                    <tr key={ent.id} className={styles.row}>
                                        <td className={`${styles.thTd} ${styles.dateCell}`}>{ent.fecha}</td>
                                        <td className={`${styles.thTd} ${styles.timeCell}`}>{ent.hora_entrada}</td>
                                        <td className={styles.thTd}>{ent.hora_salida || <span className={styles.statusText}>En instalación</span>}</td>
                                        <td className={styles.thTd}>
                                            {ent.placa ? (
                                                <div className={styles.vehicleContainer}>
                                                    <span className={styles.placa}>{ent.placa}</span>
                                                    <span className={styles.vehicleDetails}>{ent.vehiculo_marca} {ent.vehiculo_modelo} ({ent.vehiculo_color})</span>
                                                </div>
                                            ) : <span className={styles.noData}>-</span>}
                                        </td>
                                        <td className={styles.thTd}>
                                            {ent.equipos && ent.equipos.length > 0 ? (
                                                <div className={styles.equipmentsContainer}>
                                                    {ent.equipos.map((eq, eidx) => (
                                                        <div key={`${ent.id}-${eq.serial || eidx}`} className={`${styles.equipmentItem} ${eidx < ent.equipos!.length - 1 ? styles.equipmentItemBorder : ''}`}>
                                                            <span className={styles.serial}>{eq.serial}</span>
                                                            <span className={styles.equipmentDetails}>{eq.marca} {eq.modelo}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : ent.seriales_equipos ? (
                                                <span className={styles.serial}>{ent.seriales_equipos}</span>
                                            ) : (
                                                <span className={styles.noData}>-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserHistory;
