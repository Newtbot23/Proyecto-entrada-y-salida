import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { AreasService } from '../../../../services/areasService';
import { FichasService } from '../../../../services/fichasService';
import styles from './GestionAreas.module.css';

// ── Types ─────────────────────────────────────────────────────────
interface AreaUser {
    doc: number;
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
}

const GestionAreas: React.FC = () => {
    const queryClient = useQueryClient();

    // ── State ──────────────────────────────────────────────────────
    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
    const [areaUsers, setAreaUsers]           = useState<AreaUser[]>([]);
    const [availableUsers, setAvailableUsers] = useState<AreaUser[]>([]);
    const [search, setSearch]                 = useState('');
    const [newNombre, setNewNombre]           = useState('');
    const [newDesc, setNewDesc]               = useState('');
    const [message, setMessage]               = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // ── Queries ────────────────────────────────────────────────────
    const { data: areas = [], isLoading: loadingAreas } = useQuery({
        queryKey: ['areas'],
        queryFn:  AreasService.getAreas,
    });

    const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
        queryKey: ['usuariosAsignables'],
        queryFn:  FichasService.getUsuariosAsignables,
    });

    // ── Sync cuando cambia el área seleccionada ────────────────────
    useEffect(() => {
        if (!selectedAreaId) {
            setAreaUsers([]);
            if (allUsers.length) setAvailableUsers(allUsers as AreaUser[]);
            return;
        }
        AreasService.getUsuariosDeArea(selectedAreaId).then((members) => {
            setAreaUsers(members);
            const memberDocs = new Set(members.map((m) => m.doc));
            setAvailableUsers((allUsers as AreaUser[]).filter((u) => !memberDocs.has(u.doc)));
        });
    }, [selectedAreaId, allUsers]);

    // ── Mutations ──────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: () => AreasService.createArea({ nombre: newNombre.trim(), descripcion: newDesc.trim() || undefined }),
        onSuccess: () => {
            setMessage({ type: 'success', text: `Área "${newNombre}" creada correctamente.` });
            setNewNombre('');
            setNewDesc('');
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            setTimeout(() => setMessage(null), 3500);
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.message || 'Error al crear el área';
            setMessage({ type: 'error', text: msg });
            setTimeout(() => setMessage(null), 4000);
        },
    });

    const saveMutation = useMutation({
        mutationFn: () => AreasService.asignarUsuarios(selectedAreaId!, areaUsers.map((u) => u.doc)),
        onSuccess: () => {
            setMessage({ type: 'success', text: '¡Usuarios del área actualizados correctamente!' });
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            queryClient.invalidateQueries({ queryKey: ['administrativos'] });
            setTimeout(() => setMessage(null), 3500);
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err?.response?.data?.message || 'Error al guardar' });
            setTimeout(() => setMessage(null), 4000);
        },
    });

    // ── Drag & Drop ────────────────────────────────────────────────
    const filteredAvailable = availableUsers.filter((u) => {
        const fullName = `${u.primer_nombre} ${u.segundo_nombre ?? ''} ${u.primer_apellido} ${u.segundo_apellido ?? ''}`.toLowerCase();
        return fullName.includes(search.toLowerCase()) || String(u.doc).includes(search);
    });

    const handleDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        const id = Number(draggableId);

        if (source.droppableId === 'available') {
            const user = filteredAvailable.find((u) => u.doc === id) || availableUsers.find((u) => u.doc === id);
            if (!user) return;
            setAvailableUsers((prev) => prev.filter((u) => u.doc !== id));
            const newArea = [...areaUsers];
            newArea.splice(destination.index, 0, user);
            setAreaUsers(newArea);
        } else {
            const user = areaUsers[source.index];
            if (!user) return;
            const newArea = [...areaUsers];
            newArea.splice(source.index, 1);
            setAreaUsers(newArea);
            const newAvail = [...availableUsers];
            newAvail.splice(destination.index, 0, user);
            setAvailableUsers(newAvail);
        }
    };

    // ── Helpers ────────────────────────────────────────────────────
    const fullName = (u: AreaUser) =>
        `${u.primer_nombre} ${u.primer_apellido}`;



    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>
                    <i className="fas fa-building" style={{ color: '#6366f1', marginRight: '0.5rem' }}></i>
                    Gestión de Áreas Administrativas
                </h1>
                <p>Crea áreas (Coordinación, Portería, Bienestar…) y asigna personal no perteneciente a fichas.</p>
            </header>

            {/* ── Mensajes ── */}
            {message && (
                <div className={message.type === 'success' ? styles.success : styles.error}>
                    {message.text}
                </div>
            )}

            {/* ── Top Bar ── */}
            <div className={styles.topBar}>

                {/* Crear nueva área */}
                <div className={styles.card}>
                    <h3><i className="fas fa-plus-circle"></i> Nueva Área</h3>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nombre</label>
                            <input
                                className={styles.input}
                                placeholder="Ej: Coordinación Académica"
                                value={newNombre}
                                onChange={(e) => setNewNombre(e.target.value)}
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Descripción (opcional)</label>
                            <input
                                className={styles.input}
                                placeholder="Breve descripción…"
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <button
                            className={styles.btnCreate}
                            onClick={() => createMutation.mutate()}
                            disabled={!newNombre.trim() || createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Creando…' : 'Crear Área'}
                        </button>
                    </div>
                </div>

                {/* Seleccionar área */}
                <div className={styles.card} style={{ maxWidth: '340px' }}>
                    <h3><i className="fas fa-layer-group"></i> Áreas Existentes</h3>
                    {loadingAreas ? (
                        <div className={styles.loading}>Cargando…</div>
                    ) : areas.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Aún no hay áreas. Crea la primera.</p>
                    ) : (
                        <div className={styles.areaPills}>
                            {areas.map((a: any) => (
                                <button
                                    key={a.id}
                                    className={`${styles.areaPill} ${selectedAreaId === a.id ? styles.areaPillActive : ''}`}
                                    onClick={() => {
                                        setSelectedAreaId(a.id === selectedAreaId ? null : a.id);
                                        setSearch('');
                                    }}
                                >
                                    {a.nombre}
                                    <span className={styles.areaPillCount}>({a.usuarios_count ?? 0})</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Tablero DnD ── */}
            {selectedAreaId ? (
                <>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className={`${styles.dashboard} ${styles.fadeIn}`}>

                            {/* Columna izquierda — miembros del área */}
                            <div className={styles.column}>
                                <h2>
                                    <i className="fas fa-users" style={{ marginRight: '0.4rem', color: '#6366f1' }}></i>
                                    Miembros del Área — {areas.find((a: any) => a.id === selectedAreaId)?.nombre}
                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', fontWeight: 400, color: '#6b7280' }}>({areaUsers.length})</span>
                                </h2>
                                <Droppable droppableId="area">
                                    {(provided, snapshot) => (
                                        <div
                                            className={styles.listContainer}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            style={{ background: snapshot.isDraggingOver ? '#f0fdf4' : undefined, borderRadius: '0.5rem', transition: 'background 0.2s' }}
                                        >
                                            {areaUsers.map((user, index) => (
                                                <Draggable key={String(user.doc)} draggableId={String(user.doc)} index={index}>
                                                    {(dragged, snap) => (
                                                        <div
                                                            className={`${styles.userCard} ${snap.isDragging ? styles.isDragging : ''}`}
                                                            ref={dragged.innerRef}
                                                            {...dragged.draggableProps}
                                                            {...dragged.dragHandleProps}
                                                        >
                                                            <div className={styles.userInfo}>
                                                                <span className={styles.userName}>{fullName(user)}</span>
                                                                <span className={styles.userDoc}>CC: {user.doc}</span>
                                                            </div>
                                                            <span className={styles.badgeAdmin}>
                                                                <i className="fas fa-building" style={{ marginRight: '3px' }}></i>
                                                                Admin
                                                            </span>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {areaUsers.length === 0 && !snapshot.isDraggingOver && (
                                                <div className={styles.placeholder}>Arrastra usuarios aquí para asignarlos</div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>

                            {/* Columna derecha — usuarios disponibles */}
                            <div className={styles.column}>
                                <h2>
                                    <i className="fas fa-user-plus" style={{ marginRight: '0.4rem', color: '#10b981' }}></i>
                                    Usuarios Disponibles
                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', fontWeight: 400, color: '#6b7280' }}>
                                        ({filteredAvailable.length}{search && availableUsers.length !== filteredAvailable.length ? ` de ${availableUsers.length}` : ''})
                                    </span>
                                </h2>
                                <div className={styles.searchWrapper}>
                                    <input
                                        className={styles.searchInput}
                                        placeholder="Buscar por nombre o documento…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    {search && (
                                        <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
                                    )}
                                </div>
                                <Droppable droppableId="available">
                                    {(provided, snapshot) => (
                                        <div
                                            className={styles.listContainer}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            style={{ background: snapshot.isDraggingOver ? '#eff6ff' : undefined, borderRadius: '0.5rem', transition: 'background 0.2s' }}
                                        >
                                            {filteredAvailable.map((user, index) => (
                                                <Draggable key={String(user.doc)} draggableId={String(user.doc)} index={index}>
                                                    {(dragged, snap) => (
                                                        <div
                                                            className={`${styles.userCard} ${snap.isDragging ? styles.isDragging : ''}`}
                                                            ref={dragged.innerRef}
                                                            {...dragged.draggableProps}
                                                            {...dragged.dragHandleProps}
                                                        >
                                                            <div className={styles.userInfo}>
                                                                <span className={styles.userName}>{fullName(user)}</span>
                                                                <span className={styles.userDoc}>CC: {user.doc}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {filteredAvailable.length === 0 && !snapshot.isDraggingOver && (
                                                <div className={styles.placeholder}>
                                                    {search ? 'Sin resultados para tu búsqueda' : 'No hay usuarios disponibles'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        </div>
                    </DragDropContext>

                    {/* Botón guardar */}
                    <div className={styles.saveBar}>
                        <button
                            className={styles.btnSave}
                            onClick={() => saveMutation.mutate()}
                            disabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending
                                ? 'Guardando…'
                                : `Guardar Asignación (${areaUsers.length} usuarios)`}
                        </button>
                    </div>
                </>
            ) : (
                <div className={styles.emptyHint}>
                    <i className="fas fa-hand-point-up" style={{ fontSize: '2.5rem', color: '#d1d5db' }}></i>
                    <p>Selecciona un área arriba para gestionar su personal.</p>
                </div>
            )}
        </div>
    );
};

export default GestionAreas;
