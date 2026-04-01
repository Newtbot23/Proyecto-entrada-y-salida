import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { FichasService } from '../../../../services/fichasService';
import { EquiposService } from '../../../../services/equiposService';
import { AreasService } from '../../../../services/areasService';
import styles from './FichasAssign.module.css';

interface Usuario {
    doc: number;
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    tipo_participante?: 'aprendiz' | 'instructor'; // Rol en la ficha
    es_instructor_previo?: boolean;
}

const FichasAssign: React.FC = () => {
    const queryClient = useQueryClient();

    const [selectedFichaId, setSelectedFichaId] = useState<string>('');
    const [selectedFichaObj, setSelectedFichaObj] = useState<any | null>(null);
    const [editingAmbiente, setEditingAmbiente] = useState<string>('');
    const [savingAmbiente, setSavingAmbiente] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<Usuario[]>([]);
    const [cartUsers, setCartUsers] = useState<Usuario[]>([]);
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // ComboBox Fichas
    const [fichaSearch, setFichaSearch] = useState<string>('');
    const [isFichaDropdownOpen, setIsFichaDropdownOpen] = useState(false);

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

    const { data: catalogs } = useQuery({
        queryKey: ['fichas-catalogs'],
        queryFn: () => FichasService.getCatalogs()
    });
    const ambientes = catalogs?.ambientes ?? [];

    const {
        data: assignableUsersData,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: errorUsers,
    } = useQuery({
        queryKey: ['usuariosAsignables'],
        queryFn: FichasService.getUsuariosAsignables,
    });

    // ── Query: mapa de usuarios administrativos (doc -> area_nombre) ──
    // Used to show the 'Administrativo' badge and push them to the bottom.
    const { data: adminMap = {} } = useQuery({
        queryKey: ['administrativos'],
        queryFn: AreasService.getAdministrativos,
        staleTime: 60_000,
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
            setSuccessMsg('¡Usuarios asignados exitosamente a la ficha!');
            setSelectedFichaId('');
            setCartUsers([]);

            // Ocultar mensaje tras 4 segundos
            setTimeout(() => setSuccessMsg(''), 4000);
        },
    });

    // ── Handlers ─────────────────────────────────────────────
    const handleSelectFicha = async (ficha: any) => {
        setSelectedFichaId(String(ficha.id));
        setSelectedFichaObj(ficha);
        setEditingAmbiente(ficha.numero_ambiente ?? '');
        setFichaSearch(String(ficha.numero_ficha));
        setIsFichaDropdownOpen(false);
        setCartUsers([]); // Reset temporal

        try {
            // Cargar usuarios actuales de la ficha
            const currentUsers = await FichasService.getUsuariosDeFicha(ficha.id);
            setCartUsers(currentUsers);

            // Filtrar los usuarios disponibles para quitar los que ya están en la ficha
            if (assignableUsersData) {
                const currentDocs = new Set(currentUsers.map((u: any) => u.doc));
                setAvailableUsers(assignableUsersData.filter((u: any) => !currentDocs.has(u.doc)));
            }
        } catch (error) {
            console.error('Error al cargar integrantes de la ficha:', error);
        }
    };

    const handleClearFicha = () => {
        setSelectedFichaId('');
        setSelectedFichaObj(null);
        setEditingAmbiente('');
        setFichaSearch('');
        setCartUsers([]);
        if (assignableUsersData) setAvailableUsers(assignableUsersData);
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
        selectedFichaId !== '' && !mutation.isPending;

    // Lista filtrada y ORDENADA: admins al fondo para no estorbar al instructor.
    const filteredAvailableUsers = availableUsers
        .filter(
            (u) =>
                String(u.doc).includes(searchTerm) ||
                `${u.primer_nombre} ${u.segundo_nombre ?? ''} ${u.primer_apellido} ${u.segundo_apellido ?? ''}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const aIsAdmin = Boolean((adminMap as any)[a.doc]);
            const bIsAdmin = Boolean((adminMap as any)[b.doc]);
            if (aIsAdmin === bIsAdmin) return 0;
            return aIsAdmin ? 1 : -1; // admins van al final
        });

    // Filtrado de Fichas para el ComboBox (Búsqueda por número)
    const filteredFichas = availableFichas?.filter((f: any) => 
        String(f.numero_ficha).includes(fichaSearch)
    ) || [];

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
                                Buscar Ficha (Número)
                            </label>
                            
                            <div className={styles.comboBoxContainer}>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        className={styles.select}
                                        placeholder="Ej: 2711815..."
                                        value={fichaSearch}
                                        onChange={(e) => {
                                            setFichaSearch(e.target.value);
                                            setIsFichaDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsFichaDropdownOpen(true)}
                                    />
                                    {selectedFichaId && (
                                        <button className={styles.btnClear} onClick={handleClearFicha}>✕</button>
                                    )}
                                </div>

                                {isFichaDropdownOpen && (
                                    <div className={styles.dropdown}>
                                        {filteredFichas.length > 0 ? (
                                            filteredFichas.map((ficha: any) => (
                                                <div 
                                                    key={ficha.id} 
                                                    className={styles.dropdownItem}
                                                    onClick={() => handleSelectFicha(ficha)}
                                                >
                                                    <span className={styles.fichaNum}>Ficha: {ficha.numero_ficha}</span>
                                                    <span className={styles.fichaProg}>- {ficha.programa?.programa}</span>
                                                    <span className={styles.fichaCount}> (Usuarios: {ficha.usuarios_count ?? 0})</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.noResults}>No se encontraron fichas</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botón Guardar — visible solo si hay ficha seleccionada */}
                        {selectedFichaId && (
                                    <button
                                        className={styles.btnSave}
                                        onClick={handleSave}
                                        disabled={!canSave}
                                    >
                                        {mutation.isPending ? (
                                            <span>Guardando...</span>
                                        ) : (
                                            <>
                                                <span className={styles.btnTitle}>
                                                    {cartUsers.length > 0 ? 'Guardar Asignación' : 'Vaciar Ficha'}
                                                </span>
                                                <span className={styles.btnSubtitle}>
                                                    ({cartUsers.length} usuarios)
                                                </span>
                                            </>
                                        )}
                                    </button>
                        )}
                    </div>

                    {/* ── Info de la Ficha seleccionada ── */}
                    {selectedFichaObj && (
                        <div style={{
                            marginTop: '1rem',
                            background: 'linear-gradient(135deg, #16a34a10, #16a34a08)',
                            border: '1px solid #16a34a40',
                            borderLeft: '4px solid #16a34a',
                            borderRadius: '0.5rem',
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1.5rem',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '150px' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Programa</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>{selectedFichaObj.programa?.programa ?? '—'}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '150px' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jornada</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
                                    <i className="fas fa-clock" style={{ color: '#f59e0b', marginRight: '0.35rem' }}></i>
                                    {selectedFichaObj.jornada?.jornada ?? '—'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '200px' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ambiente Actual</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
                                    <i className="fas fa-map-marker-alt" style={{ color: '#3b82f6', marginRight: '0.35rem' }}></i>
                                    {selectedFichaObj.ambiente?.ambiente ?? selectedFichaObj.numero_ambiente ?? '—'}
                                </span>
                            </div>
                            {/* Selector de cambio de ambiente */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '220px' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cambiar Ambiente</span>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <select
                                        className={styles.select}
                                        value={editingAmbiente}
                                        onChange={(e) => setEditingAmbiente(e.target.value)}
                                        disabled={savingAmbiente}
                                        style={{ fontSize: '0.85rem' }}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {ambientes.map((a: any) => (
                                            <option key={a.numero_ambiente} value={a.numero_ambiente}>
                                                {a.ambiente} ({a.numero_ambiente})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        style={{
                                            padding: '0.4rem 0.9rem',
                                            fontSize: '0.82rem',
                                            fontWeight: 700,
                                            background: '#16a34a',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.4rem',
                                            cursor: 'pointer',
                                            opacity: (savingAmbiente || !editingAmbiente || editingAmbiente === selectedFichaObj.numero_ambiente) ? 0.5 : 1,
                                            whiteSpace: 'nowrap'
                                        }}
                                        disabled={savingAmbiente || !editingAmbiente || editingAmbiente === selectedFichaObj.numero_ambiente}
                                        onClick={async () => {
                                            setSavingAmbiente(true);
                                            try {
                                                await EquiposService.updateFichaAmbiente(Number(selectedFichaId), editingAmbiente);
                                                setSelectedFichaObj((prev: any) => ({
                                                    ...prev,
                                                    numero_ambiente: editingAmbiente,
                                                    ambiente: ambientes.find((a: any) => a.numero_ambiente === editingAmbiente)
                                                }));
                                                queryClient.invalidateQueries({ queryKey: ['fichasSinUsuarios'] });
                                            } catch {}
                                            setSavingAmbiente(false);
                                        }}
                                    >
                                        {savingAmbiente ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
                                        <span></span>
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
                                                        isDragDisabled={user.tipo_participante === 'instructor'}
                                                    >
                                                        {(
                                                            providedDrag: any,
                                                            snapshotDrag: any
                                                        ) => (
                                                            <div
                                                                className={`${styles.userCard} 
                                                                    ${snapshotDrag.isDragging ? styles.isDragging : ''} 
                                                                    ${user.tipo_participante === 'instructor' ? styles.isLocked : ''}`
                                                                }
                                                                ref={providedDrag.innerRef}
                                                                {...providedDrag.draggableProps}
                                                                {...providedDrag.dragHandleProps}
                                                            >
                                                                <div className={styles.userInfo}>
                                                                    <span className={styles.userName}>
                                                                        {user.tipo_participante === 'instructor' && ''}
                                                                        {user.primer_nombre}{' '}
                                                                        {user.primer_apellido}
                                                                    </span>
                                                                    <span className={styles.userDoc}>
                                                                        CC: {user.doc}
                                                                    </span>
                                                                </div>
                                                                {user.tipo_participante === 'instructor' && (
                                                                    <span className={styles.badgeInstructor}>Instructor</span>
                                                                )}
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
                                        <span className={styles.searchIcon}></span>
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
                                                                    <div className={styles.userInfo}>
                                                                        <span className={styles.userName}>
                                                                            {user.primer_nombre}{' '}
                                                                            {user.primer_apellido}
                                                                        </span>
                                                                        <span className={styles.userDoc}>
                                                                            CC: {user.doc}
                                                                        </span>
                                                                        {/* Badge Administrativo */}
                                                                        {(adminMap as any)[user.doc] && (
                                                                            <span
                                                                                className={styles.badgeInstructorPrevio}
                                                                                style={{ background: '#6366f1' }}
                                                                                title={`Área: ${(adminMap as any)[user.doc]?.area_nombre}`}
                                                                            >
                                                                                🏢 {(adminMap as any)[user.doc]?.area_nombre ?? 'Administrativo'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {user.es_instructor_previo && (
                                                                        <span className={styles.badgeInstructorPrevio} title="Este usuario ya es instructor en otras fichas">
                                                                            Instructor
                                                                        </span>
                                                                    )}
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
