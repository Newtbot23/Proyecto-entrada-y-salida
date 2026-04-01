import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FichasService } from '../../../../services/fichasService';
import { EquiposService } from '../../../../services/equiposService';
import { AsignacionesService } from '../../../../services/asignacionesService';
import type { Usuario, Equipo } from '../../../../types';
import UserDetailModal from './components/UserDetailModal';
import EquipmentDetailModal from './components/EquipmentDetailModal';
import styles from './AsignarEquipos.module.css';

const AsignarEquipos: React.FC = () => {
    // Basic Selection States
    const [selectedFicha, setSelectedFicha] = useState<string>('');
    const [selectedLote, setSelectedLote] = useState<string>('');
    
    // UI/Result States
    const [resultados, setResultados] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Modal Interaction States
    const [userModal, setUserModal] = useState<{ open: boolean; data: Usuario | null }>({ open: false, data: null });
    const [equipModal, setEquipModal] = useState<{ open: boolean; data: Equipo | null }>({ open: false, data: null });

    // --- Base Queries ---
    const { data: fichas, isLoading: loadingFichas } = useQuery({
        queryKey: ['fichas'],
        queryFn: () => FichasService.getFichas()
    });

    const { data: lotes, isLoading: loadingLotes } = useQuery({
        queryKey: ['lotes'],
        queryFn: () => EquiposService.getLotes()
    });

    // --- Detail Queries (Conditional) ---
    const { data: members, isLoading: loadingMembers } = useQuery({
        queryKey: ['fichas', selectedFicha, 'members'],
        queryFn: () => FichasService.getUsuariosDeFicha(Number(selectedFicha)),
        enabled: !!selectedFicha
    });

    const { data: loteEquipos, isLoading: loadingLoteEquipos } = useQuery({
        queryKey: ['lotes', selectedLote, 'equipos'],
        queryFn: () => EquiposService.getEquiposByLote(Number(selectedLote)),
        enabled: !!selectedLote
    });

    // Mutation
    const assignmentMutation = useMutation({
        mutationFn: () => AsignacionesService.asignarMasivamente(Number(selectedFicha), Number(selectedLote)),
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
        
        if (window.confirm('¿Estás seguro de que deseas ejecutar la asignación masiva? Esta acción procesará todos los aprendices pendientes de la ficha.')) {
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
                                <option key={lote.id} value={lote.id}>
                                    {lote.codigo_lote} - {lote.descripcion || 'Sin descripción'} ({lote.equipos_count || 0} disponibles)
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

            {/* ─── Sección de Resumen (Cards) ─── */}
            {(selectedFicha || selectedLote) && (
                <div className={styles.summaryGrid}>

                    {/* Card Izquierdo: Integrantes de la Ficha */}
                    {selectedFicha && (
                        <div className={styles.summaryCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardHeaderLeft}>
                                    <i className="fas fa-users" style={{ color: 'var(--color-primary)' }}></i>
                                    <h3>Integrantes de la Ficha</h3>
                                </div>
                                <span className={styles.badgeGreen}>
                                    {members?.length || 0} integrantes
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                {loadingMembers ? (
                                    <div className={styles.loadingState}>Cargando integrantes...</div>
                                ) : members && members.length > 0 ? (
                                    <table className={styles.summaryTable}>
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Apellido</th>
                                                <th>Documento</th>
                                                <th>Rol</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {members.map((member: Usuario) => (
                                                <tr key={member.doc}>
                                                    <td>{member.primer_nombre}</td>
                                                    <td>{member.primer_apellido}</td>
                                                    <td className={styles.monoText}>{member.doc}</td>
                                                    <td>
                                                        <span className={`${styles.rolBadge} ${
                                                            (member as any).pivot?.tipo_participante === 'instructor'
                                                                ? styles.rolInstructor : styles.rolAprendiz
                                                        }`}>
                                                            {(member as any).pivot?.tipo_participante ?? 'aprendiz'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className={styles.btnEye}
                                                            title="Ver detalle"
                                                            onClick={() => setUserModal({ open: true, data: member })}
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className={styles.emptyState}>Sin integrantes en esta ficha.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Card Derecho: Equipos del Lote */}
                    {selectedLote && (
                        <div className={styles.summaryCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardHeaderLeft}>
                                    <i className="fas fa-laptop" style={{ color: '#3b82f6' }}></i>
                                    <h3>Equipos del Lote</h3>
                                </div>
                                <span className={styles.badgeBlue}>
                                    {loteEquipos?.length || 0} unidades
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                {loadingLoteEquipos ? (
                                    <div className={styles.loadingState}>Cargando equipos...</div>
                                ) : loteEquipos && loteEquipos.length > 0 ? (
                                    <table className={styles.summaryTable}>
                                        <thead>
                                            <tr>
                                                <th>Marca</th>
                                                <th>Modelo</th>
                                                <th>Serial</th>
                                                <th>Placa SENA</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loteEquipos.map((equip: Equipo) => (
                                                <tr key={equip.serial}>
                                                    <td>{equip.marca?.marca ?? '—'}</td>
                                                    <td>{equip.modelo}</td>
                                                    <td className={styles.monoText}>{equip.serial}</td>
                                                    <td className={styles.monoText}>{equip.placa_sena ?? '—'}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className={styles.btnEyeBlue}
                                                            title="Ver detalle"
                                                            onClick={() => setEquipModal({ open: true, data: equip })}
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className={styles.emptyState}>Sin equipos en este lote.</div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            )}

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

            {/* Modals */}
            <UserDetailModal 
                isOpen={userModal.open} 
                onClose={() => setUserModal({ open: false, data: null })} 
                usuario={userModal.data}
            />
            <EquipmentDetailModal
                isOpen={equipModal.open}
                onClose={() => setEquipModal({ open: false, data: null })}
                equipo={equipModal.data}
            />
        </div>
    );
};

export default AsignarEquipos;
