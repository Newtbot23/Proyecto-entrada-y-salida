import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FichasService } from '../../../../services/fichasService';
import { EquiposService } from '../../../../services/equiposService';
import { AsignacionesService } from '../../../../services/asignacionesService';
import styles from './AsignarEquipos.module.css';

const AsignarEquipos: React.FC = () => {
    const [selectedFicha, setSelectedFicha] = useState<string>('');
    const [selectedLote, setSelectedLote] = useState<string>('');
    const [resultados, setResultados] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Queries
    const { data: fichas, isLoading: loadingFichas } = useQuery({
        queryKey: ['fichas'],
        queryFn: () => FichasService.getFichas()
    });

    const { data: lotes, isLoading: loadingLotes } = useQuery({
        queryKey: ['lotes'],
        queryFn: () => EquiposService.getLotes()
    });

    // Mutation
    const assignmentMutation = useMutation({
        mutationFn: () => AsignacionesService.asignarMasivamente(selectedFicha, selectedLote),
        onSuccess: (data) => {
            setMessage({ 
                type: 'success', 
                text: `¡Éxito! Se realizaron ${data.total_asignaciones} asignaciones.` 
            });
            setResultados(data.detalles || []);
            setSelectedFicha('');
            setSelectedLote('');
            setTimeout(() => setMessage(null), 10000);
        },
        onError: (error: any) => {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Error al procesar la asignación masiva.' 
            });
            setTimeout(() => setMessage(null), 5000);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFicha || !selectedLote) return;
        
        if (window.confirm('¿Estás seguro de que deseas ejecutar la asignación masiva? Esta acción asignará automáticamente un equipo a cada integrante de la ficha seleccionada.')) {
            assignmentMutation.mutate();
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1>Asignación Masiva de Equipos</h1>
                    <p>Vincula automáticamente equipos de un lote a los integrantes de una ficha.</p>
                </div>
            </header>

            <div className={styles.filtersBar}>
                <form onSubmit={handleSubmit} className={styles.filtersForm}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Ficha Técnica</label>
                        <select 
                            className={styles.select}
                            value={selectedFicha}
                            onChange={(e) => setSelectedFicha(e.target.value)}
                            disabled={loadingFichas || assignmentMutation.isPending}
                        >
                            <option value="">-- Seleccionar Ficha --</option>
                            {fichas?.map((ficha: any) => (
                                <option key={ficha.id} value={ficha.id}>
                                    {ficha.numero_ficha} - {ficha.programa?.programa}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Lote de Importación</label>
                        <select 
                            className={styles.select}
                            value={selectedLote}
                            onChange={(e) => setSelectedLote(e.target.value)}
                            disabled={loadingLotes || assignmentMutation.isPending}
                        >
                            <option value="">-- Seleccionar Lote --</option>
                            {lotes?.map((lote: any) => (
                                <option key={lote.lote_importacion} value={lote.lote_importacion}>
                                    {lote.lote_importacion} ({lote.total} disponibles)
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className={styles.submitBtn}
                        disabled={!selectedFicha || !selectedLote || assignmentMutation.isPending}
                    >
                        {assignmentMutation.isPending ? 'Asignando...' : 'Ejecutar Asignación'}
                    </button>
                </form>
            </div>

            {message && (
                <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
                    {message.text}
                </div>
            )}

            {resultados.length > 0 && (
                <div className={styles.resultsSection}>
                    <h2 className={styles.sectionTitle}>Resultados de la última asignación</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Documento</th>
                                    <th>Nombre del Aprendiz</th>
                                    <th>Serial del Equipo</th>
                                    <th>Placa SENA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.map((res, index) => (
                                    <tr key={index}>
                                        <td>{res.documento}</td>
                                        <td>{res.nombre}</td>
                                        <td className={styles.serialText}>{res.serial_equipo}</td>
                                        <td>{res.placa_sena || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsignarEquipos;
