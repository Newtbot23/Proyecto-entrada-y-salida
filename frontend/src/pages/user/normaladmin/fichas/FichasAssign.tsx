import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { FichasService } from '../../../../services/fichasService';
import styles from './FichasAssign.module.css';

interface Usuario {
    doc: number;
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
}

const FichasAssign: React.FC = () => {
    const queryClient = useQueryClient();

    const [selectedFichaId, setSelectedFichaId] = useState<string>('');
    const [availableUsers, setAvailableUsers] = useState<Usuario[]>([]);
    const [cartUsers, setCartUsers] = useState<Usuario[]>([]);
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // ── Queries ───────────────────────────────────────────────
    const {
        data: availableFichas,
        isLoading: isLoadingFichas,
        isError: isErrorFichas,
        error: errorFichas,
    } = useQuery({
        queryKey: ['fichasSinUsuarios'],
        queryFn: FichasService.getFichasSinUsuarios,
    });

    const {
        data: assignableUsersData,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: errorUsers,
    } = useQuery({
        queryKey: ['usuariosAsignables'],
        queryFn: FichasService.getUsuariosAsignables,
    });

    // ── Sincronizar datos con estado local ────────────────────
    useEffect(() => {
        if (assignableUsersData) {
            setAvailableUsers(assignableUsersData);
        }
    }, [assignableUsersData]);

    // ── Mutación de guardado ──────────────────────────────────
    const mutation = useMutation({
        mutationFn: ({ fichaId, usuarios }: { fichaId: number; usuarios: number[] }) =>
            FichasService.asignarUsuarios(fichaId, usuarios),
        onSuccess: () => {
            // Recargar lista de fichas (la guardada ya no debe aparecer)
            queryClient.invalidateQueries({ queryKey: ['fichasSinUsuarios'] });
            // Recargar usuarios disponibles (los asignados ya no deben aparecer)
            queryClient.invalidateQueries({ queryKey: ['usuariosAsignables'] });

            // Mensaje de éxito y reset del tablero
            setSuccessMsg('✅ ¡Usuarios asignados exitosamente a la ficha!');
            setSelectedFichaId('');
            setCartUsers([]);

            // Ocultar mensaje tras 4 segundos
            setTimeout(() => setSuccessMsg(''), 4000);
        },
    });

    // ── Handlers ─────────────────────────────────────────────
    const handleFichaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFichaId(e.target.value);
    };

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        // Identificar al usuario arrastrado usando la lista correcta
        // (filteredAvailableUsers para 'available', evita bugs de índice con búsqueda activa)
        const draggedUser =
            source.droppableId === 'available'
                ? filteredAvailableUsers[source.index]
                : cartUsers[source.index];

        if (!draggedUser) return;

        // CASO 1: Reordenar dentro de la misma lista
        if (source.droppableId === destination.droppableId) {
            if (source.droppableId === 'available') {
                // Reordenar sobre la lista COMPLETA usando el doc como ancla
                const newList = Array.from(availableUsers);
                const realIndex = newList.findIndex(
                    (u) => String(u.doc) === String(draggedUser.doc)
                );
                const [removed] = newList.splice(realIndex, 1);
                // Insertar en la posición visible destino dentro de la lista completa
                const destUser = filteredAvailableUsers[destination.index];
                const destRealIndex = destUser
                    ? newList.findIndex(
                          (u) => String(u.doc) === String(destUser.doc)
                      )
                    : newList.length;
                newList.splice(
                    destRealIndex === -1 ? newList.length : destRealIndex,
                    0,
                    removed
                );
                setAvailableUsers(newList);
            } else {
                const newCart = Array.from(cartUsers);
                const [removed] = newCart.splice(source.index, 1);
                newCart.splice(destination.index, 0, removed);
                setCartUsers(newCart);
            }
            return;
        }

        // CASO 2: Mover entre listas diferentes
        if (source.droppableId === 'available') {
            // available → cart
            // Remover por ID para que el filtro no cause desplazamiento de índice
            const newAvailable = availableUsers.filter(
                (u) => String(u.doc) !== String(draggedUser.doc)
            );
            const newCart = Array.from(cartUsers);
            newCart.splice(destination.index, 0, draggedUser);
            setAvailableUsers(newAvailable);
            setCartUsers(newCart);
        } else {
            // cart → available
            const newCart = Array.from(cartUsers);
            newCart.splice(source.index, 1);
            const newAvailable = Array.from(availableUsers);
            newAvailable.splice(destination.index, 0, draggedUser);
            setCartUsers(newCart);
            setAvailableUsers(newAvailable);
        }
    };

    const handleSave = () => {
        if (!selectedFichaId || cartUsers.length === 0) return;
        mutation.mutate({
            fichaId: Number(selectedFichaId),
            usuarios: cartUsers.map((u) => u.doc),
        });
    };

    // ── Derivados (sin early returns) ─────────────────────────
    const isLoading = isLoadingFichas || isLoadingUsers;
    const isError = isErrorFichas || isErrorUsers;
    const errorMsg =
        ((errorFichas || errorUsers) as any)?.message ?? 'Error desconocido';

    const canSave =
        selectedFichaId !== '' && cartUsers.length > 0 && !mutation.isPending;

    // Lista filtrada: la columna derecha la renderiza, handleDragEnd la usa para lookup
    const filteredAvailableUsers = availableUsers.filter(
        (u) =>
            String(u.doc).includes(searchTerm) ||
            `${u.primer_nombre} ${u.segundo_nombre ?? ''} ${u.primer_apellido} ${u.segundo_apellido ?? ''}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Asignar Usuarios a Ficha</h1>
                <p>
                    Mueve aprendices o instructores de la lista a la ficha
                    seleccionada usando arrastrar y soltar.
                </p>
            </header>

            {/* Estados inline: nunca return condicional antes de los hooks */}
            {isLoading && (
                <div className={styles.loading}>Cargando recursos...</div>
            )}
            {isError && (
                <div className={styles.error}>Error: {errorMsg}</div>
            )}
            {mutation.isError && (
                <div className={styles.error}>
                    Error al guardar:{' '}
                    {(mutation.error as any)?.message ?? 'Error desconocido'}
                </div>
            )}
            {successMsg && (
                <div className={styles.success}>{successMsg}</div>
            )}

            {!isLoading && !isError && (
                <>
                    {/* Selector de Ficha + Botón Guardar */}
                    <div className={styles.selectorCard}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Fichas disponibles (sin usuarios)
                            </label>
                            <select
                                className={styles.select}
                                value={selectedFichaId}
                                onChange={handleFichaChange}
                            >
                                <option value="">
                                    -- Selecciona una ficha --
                                </option>
                                {availableFichas?.map((ficha: any) => (
                                    <option key={ficha.id} value={ficha.id}>
                                        {ficha.numero_ficha} -{' '}
                                        {ficha.programa?.programa}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Botón Guardar — visible solo si hay ficha Y usuarios en el carrito */}
                        {selectedFichaId && cartUsers.length > 0 && (
                            <button
                                className={styles.btnSave}
                                onClick={handleSave}
                                disabled={!canSave}
                            >
                                {mutation.isPending
                                    ? 'Guardando...'
                                    : `Guardar Asignación (${cartUsers.length} usuarios)`}
                            </button>
                        )}
                    </div>

                    {/* Tablero Drag & Drop */}
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className={styles.dashboard}>

                            {/* ── IZQUIERDA: Configuración de la Ficha (SIEMPRE presente) ── */}
                            <div className={styles.column}>
                                <h2>
                                    Configuración de la Ficha ({cartUsers.length})
                                </h2>

                                {/*
                                  * OVERLAY PATTERN:
                                  * El Droppable siempre está montado → DND nunca pierde su ref.
                                  * El overlay flota encima con position:absolute y desaparece
                                  * con opacity cuando hay ficha seleccionada.
                                  */}
                                <div className={styles.droppableWrapper}>
                                    {/* Overlay: visible si !selectedFichaId */}
                                    <div
                                        className={styles.columnOverlay}
                                        style={{
                                            opacity: selectedFichaId ? 0 : 1,
                                            pointerEvents: selectedFichaId ? 'none' : 'auto',
                                        }}
                                    >
                                        <span>👆</span>
                                        <p>Selecciona una ficha arriba para comenzar a asignar usuarios</p>
                                    </div>

                                    {/* Droppable siempre montado */}
                                    <Droppable droppableId="cart">
                                        {(provided: any, snapshot: any) => (
                                            <div
                                                className={styles.listContainer}
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                {cartUsers.map((user, index) => (
                                                    <Draggable
                                                        key={String(user.doc)}
                                                        draggableId={String(user.doc)}
                                                        index={index}
                                                    >
                                                        {(
                                                            providedDrag: any,
                                                            snapshotDrag: any
                                                        ) => (
                                                            <div
                                                                className={`${styles.userCard} ${snapshotDrag.isDragging ? styles.isDragging : ''}`}
                                                                ref={providedDrag.innerRef}
                                                                {...providedDrag.draggableProps}
                                                                {...providedDrag.dragHandleProps}
                                                            >
                                                                <span className={styles.userName}>
                                                                    {user.primer_nombre}{' '}
                                                                    {user.primer_apellido}
                                                                </span>
                                                                <span className={styles.userDoc}>
                                                                    CC: {user.doc}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                                {cartUsers.length === 0 &&
                                                    !snapshot.isDraggingOver && (
                                                        <div className={styles.placeholder}>
                                                            Arrastra usuarios aquí
                                                            para asignarlos
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </div>

                            {/* ── DERECHA: Usuarios Disponibles (solo cuando hay ficha) ── */}
                            {selectedFichaId && (
                                <div className={`${styles.column} ${styles.fadeInRight}`}>
                                    <h2>
                                        Usuarios Disponibles ({filteredAvailableUsers.length}
                                        {searchTerm && availableUsers.length !== filteredAvailableUsers.length
                                            ? ` de ${availableUsers.length}`
                                            : ''})
                                    </h2>

                                    {/* ── Buscador local ── */}
                                    <div className={styles.searchWrapper}>
                                        <span className={styles.searchIcon}>🔍</span>
                                        <input
                                            type="text"
                                            className={styles.searchInput}
                                            placeholder="Buscar por nombre o documento..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <button
                                                className={styles.searchClear}
                                                onClick={() => setSearchTerm('')}
                                                title="Limpiar búsqueda"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    <Droppable droppableId="available">
                                        {(provided: any, snapshot: any) => (
                                            <div
                                                className={styles.listContainer}
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                {filteredAvailableUsers.map(
                                                    (user, index) => (
                                                        <Draggable
                                                            key={String(user.doc)}
                                                            draggableId={String(user.doc)}
                                                            index={index}
                                                        >
                                                            {(
                                                                providedDrag: any,
                                                                snapshotDrag: any
                                                            ) => (
                                                                <div
                                                                    className={`${styles.userCard} ${snapshotDrag.isDragging
                                                                            ? styles.isDragging
                                                                            : ''
                                                                        }`}
                                                                    ref={providedDrag.innerRef}
                                                                    {...providedDrag.draggableProps}
                                                                    {...providedDrag.dragHandleProps}
                                                                >
                                                                    <span className={styles.userName}>
                                                                        {user.primer_nombre}{' '}
                                                                        {user.primer_apellido}
                                                                    </span>
                                                                    <span className={styles.userDoc}>
                                                                        CC: {user.doc}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    )
                                                )}
                                                {provided.placeholder}
                                                {filteredAvailableUsers.length === 0 &&
                                                    !snapshot.isDraggingOver && (
                                                        <div className={styles.placeholder}>
                                                            {searchTerm
                                                                ? 'Sin resultados para tu búsqueda'
                                                                : 'No hay usuarios disponibles'}
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            )}

                        </div>
                    </DragDropContext>
                </>
            )}
        </div>
    );
};

export default FichasAssign;
