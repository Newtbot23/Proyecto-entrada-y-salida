import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { EquiposService } from '../../../../services/equiposService';
import styles from './GestionLotes.module.css';

const GestionLotes: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedLote, setSelectedLote] = useState<string>('');
    const [newName, setNewName] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [sinLoteList, setSinLoteList] = useState<any[]>([]);
    const [loteList, setLoteList] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // 1. Queries
    const { data: lotes, isLoading: loadingLotes } = useQuery({
        queryKey: ['lotes'],
        queryFn: () => EquiposService.getLotes()
    });

    const { data: equiposSinLote, isLoading: loadingSinLote } = useQuery({
        queryKey: ['equipos-sin-lote'],
        queryFn: () => EquiposService.getEquiposByLote('sin_lote')
    });

    const { data: equiposDelLote, isLoading: loadingLoteItems, refetch: refetchLote } = useQuery({
        queryKey: ['equipos-lote', selectedLote],
        queryFn: () => EquiposService.getEquiposByLote(selectedLote),
        enabled: !!selectedLote
    });

    // 2. Sync local state
    useEffect(() => {
        if (equiposSinLote) setSinLoteList(equiposSinLote);
    }, [equiposSinLote]);

    useEffect(() => {
        if (equiposDelLote) {
            setLoteList(equiposDelLote);
            setNewName(selectedLote);
        } else if (selectedLote) {
            setLoteList([]);
        }
    }, [equiposDelLote, selectedLote]);

    // 3. Mutations
    const moveMutation = useMutation({
        mutationFn: ({ id, lote }: { id: string, lote: string | null }) => EquiposService.moverEquipoLote(id, lote),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lotes'] });
            queryClient.invalidateQueries({ queryKey: ['equipos-sin-lote'] });
            if (selectedLote) {
                queryClient.invalidateQueries({ queryKey: ['equipos-lote', selectedLote] });
            }
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err.message || 'Error al mover el equipo' });
            refetchLote();
            queryClient.invalidateQueries({ queryKey: ['equipos-sin-lote'] });
            setTimeout(() => setMessage(null), 3000);
        }
    });

    const renameMutation = useMutation({
        mutationFn: () => EquiposService.renombrarLote(selectedLote, newName),
        onSuccess: () => {
            setMessage({ type: 'success', text: 'Nombre del lote actualizado correctamente' });
            const updatedName = newName;
            setSelectedLote(updatedName);
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['lotes'] });
            queryClient.invalidateQueries({ queryKey: ['equipos-lote'] });
            setTimeout(() => setMessage(null), 3000);
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error al renombrar el lote' });
            setTimeout(() => setMessage(null), 3000);
        }
    });

    // 4. Drag & Drop Logic
    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceList = source.droppableId === 'sin-lote' ? [...sinLoteList] : [...loteList];
        const destList = destination.droppableId === 'sin-lote' ? [...sinLoteList] : [...loteList];
        
        const [movedItem] = sourceList.splice(source.index, 1);

        if (source.droppableId === destination.droppableId) {
            sourceList.splice(destination.index, 0, movedItem);
            if (source.droppableId === 'sin-lote') setSinLoteList(sourceList);
            else setLoteList(sourceList);
        } else {
            destList.splice(destination.index, 0, movedItem);
            if (source.droppableId === 'sin-lote') {
                setSinLoteList(sourceList);
                setLoteList(destList);
            } else {
                setLoteList(sourceList);
                setSinLoteList(destList);
            }

            const targetLote = destination.droppableId === 'lote' ? selectedLote : null;
            moveMutation.mutate({ id: draggableId, lote: targetLote });
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Gestión de Lotes de Importación</h1>
                <p>Administra los equipos asignándolos a lotes específicos mediante arrastrar y soltar.</p>
            </header>

            {message && (
                <div className={message.type === 'success' ? styles.success : styles.error}>
                    {message.text}
                </div>
            )}

            <div className={styles.selectorCard}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Lote a gestionar {loadingLotes && <small>(Cargando...)</small>}
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <select 
                            className={styles.select}
                            value={selectedLote}
                            onChange={(e) => {
                                setSelectedLote(e.target.value);
                                setIsEditing(false);
                            }}
                            disabled={loadingLotes || isEditing}
                        >
                            <option value="">-- Selecciona un lote --</option>
                            {lotes?.map((l: any) => (
                                <option key={l.lote_importacion} value={l.lote_importacion}>
                                    {l.lote_importacion} ({l.total} equipos)
                                </option>
                            ))}
                        </select>

                        {selectedLote && !isEditing && (
                            <button 
                                className={styles.btnAction} 
                                onClick={() => setIsEditing(true)}
                                style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
                            >
                                Cambiar Nombre
                            </button>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className={styles.formGroup} style={{ borderLeft: '2px solid #e5e7eb', paddingLeft: '1.5rem' }}>
                        <label className={styles.label}>Nuevo nombre del lote</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                                type="text"
                                className={styles.select} // Reusing same style
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ej: Nueva Sala 101"
                            />
                            <button 
                                className={styles.btnAction}
                                onClick={() => renameMutation.mutate()}
                                disabled={renameMutation.isPending || !newName.trim() || newName === selectedLote}
                            >
                                {renameMutation.isPending ? '...' : 'Guardar'}
                            </button>
                            <button 
                                className={styles.btnAction}
                                onClick={() => {
                                    setIsEditing(false);
                                    setNewName(selectedLote);
                                }}
                                style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.dashboardWrapper}>
                {!selectedLote && (
                    <div className={styles.overlay}>
                        <div className={styles.overlayContent}>
                            <span>📦</span>
                            <p>Selecciona un lote en la parte superior para administrar sus equipos</p>
                        </div>
                    </div>
                )}

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className={styles.dashboard}>
                        {/* Columna IZQUIERDA: Equipos del Lote */}
                        <div className={styles.column}>
                            <h2>
                                Lote: {selectedLote || '...'}
                                <span className={styles.countBadge}>{loteList.length}</span>
                            </h2>
                            {loadingLoteItems ? (
                                <div className={styles.loading}>Cargando lote...</div>
                            ) : (
                                <Droppable droppableId="lote" isDropDisabled={!selectedLote}>
                                    {(provided, snapshot) => (
                                        <div 
                                            className={styles.listContainer}
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {loteList.map((equipo, index) => (
                                                <Draggable key={equipo.serial} draggableId={equipo.serial} index={index}>
                                                    {(providedDrag, snapshotDrag) => (
                                                        <div 
                                                            className={`${styles.equipoCard} ${snapshotDrag.isDragging ? styles.isDragging : ''}`}
                                                            ref={providedDrag.innerRef}
                                                            {...providedDrag.draggableProps}
                                                            {...providedDrag.dragHandleProps}
                                                        >
                                                            <span className={styles.categoria}>{equipo.categoria_equipo}</span>
                                                            <span className={styles.serial}>{equipo.serial}</span>
                                                            <span className={styles.modelo}>{equipo.marca} {equipo.modelo}</span>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {loteList.length === 0 && !snapshot.isDraggingOver && (
                                                <div className={styles.placeholder}>Arrastra equipos aquí para sumarlos al lote</div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            )}
                        </div>

                        {/* Columna DERECHA: Sin Lote */}
                        <div className={styles.column}>
                            <h2>
                                Equipos sin Lote
                                <span className={styles.countBadge}>{sinLoteList.length}</span>
                            </h2>
                            {loadingSinLote ? (
                                <div className={styles.loading}>Cargando equipos...</div>
                            ) : (
                                <Droppable droppableId="sin-lote">
                                    {(provided, snapshot) => (
                                        <div 
                                            className={styles.listContainer}
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {sinLoteList.map((equipo, index) => (
                                                <Draggable key={equipo.serial} draggableId={equipo.serial} index={index}>
                                                    {(providedDrag, snapshotDrag) => (
                                                        <div 
                                                            className={`${styles.equipoCard} ${snapshotDrag.isDragging ? styles.isDragging : ''}`}
                                                            ref={providedDrag.innerRef}
                                                            {...providedDrag.draggableProps}
                                                            {...providedDrag.dragHandleProps}
                                                        >
                                                            <span className={styles.categoria}>{equipo.categoria_equipo}</span>
                                                            <span className={styles.serial}>{equipo.serial}</span>
                                                            <span className={styles.modelo}>{equipo.marca} {equipo.modelo}</span>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {sinLoteList.length === 0 && !snapshot.isDraggingOver && (
                                                <div className={styles.placeholder}>No hay equipos sin lote</div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            )}
                        </div>
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
};

export default GestionLotes;
