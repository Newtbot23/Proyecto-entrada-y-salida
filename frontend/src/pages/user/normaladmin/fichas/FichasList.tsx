import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FichasService, updateDetalle, updateFichaEstado } from '../../../../services/fichasService';
import type { Ficha } from '../../../../services/fichasService';
import { Modal } from '../../../../components/common/Modal';
import styles from './FichasList.module.css';

const FichasList: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeFicha, setActiveFicha] = useState<Ficha | null>(null);
    const [selectedUserModal, setSelectedUserModal] = useState<any | null>(null);
    const comboboxRef = useRef<HTMLDivElement>(null);

    // ── Mutation ──────────────────────────────────────────────
    const roleMutation = useMutation({
        mutationFn: ({ fichaId, usuarioDoc, rol }: { fichaId: number | string, usuarioDoc: string, rol: string }) =>
            updateDetalle(fichaId, usuarioDoc, rol),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fichaUsuarios', activeFicha?.id] });
        },
        onError: (error: any) => {
            console.error("Error al actualizar rol:", error);
            toast.error(error.message || 'Error al actualizar el rol');
        }
    });

    const estadoMutation = useMutation({
        mutationFn: ({ fichaId, estado }: { fichaId: number | string, estado: string }) =>
            updateFichaEstado(fichaId, estado),
        onSuccess: (_data, variables) => {
            // 1. ACTUALIZACIÓN VISUAL INMEDIATA (Fix del Select)
            setActiveFicha(prevFicha =>
                prevFicha ? { ...prevFicha, estado: variables.estado } : prevFicha
            );

            // 2. Sincronizar con el backend en segundo plano
            queryClient.invalidateQueries({ queryKey: ['allFichas'] });
            queryClient.invalidateQueries({ queryKey: ['fichaUsuarios', activeFicha?.id] });
            toast.success('Estado de la ficha actualizado');
        },
        onError: (error: any) => {
            console.error("Error al actualizar estado:", error);
            const errorMsg = error.response?.data?.message || error.message || 'Error al actualizar el estado';
            toast.error(errorMsg);
        }
    });

    // ── Queries ───────────────────────────────────────────────

    // Cargamos todas las fichas al inicio
    const { data: allFichas = [], isLoading: isLoadingFichas } = useQuery({
        queryKey: ['allFichas'],
        queryFn: FichasService.getFichas,
    });

    // Obtenemos los usuarios de la ficha activa
    const {
        data: assignedUsers = [],
        isLoading: isLoadingUsers
    } = useQuery({
        queryKey: ['fichaUsuarios', activeFicha?.id],
        queryFn: () => FichasService.getUsuariosDeFicha(activeFicha!.id),
        enabled: !!activeFicha,
    });

    // ── Efectos ─────────────────────────────────────────────

    // Cerrar el dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Handlers ─────────────────────────────────────────────

    const handleSelectFicha = (ficha: Ficha) => {
        setActiveFicha(ficha);
        setSearchTerm(`${ficha.numero_ficha} - ${ficha.programa?.programa || 'N/A'}`);
        setIsOpen(false);
    };

    const handleRoleChange = async (usuarioDoc: string, newRole: string) => {
        if (!activeFicha) return;

        roleMutation.mutate({
            fichaId: activeFicha.id,
            usuarioDoc,
            rol: newRole
        });
    };


    // ── Estado Derivado ───────────────────────────────────────
    const instructorActual = assignedUsers.find((u: any) => u.pivot?.tipo_participante === 'instructor');

    // ── Filtrado ─────────────────────────────────────────────
    const filteredFichas = allFichas.filter(f =>
        String(f.numero_ficha).includes(searchTerm) ||
        f.programa?.programa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Gestión de Usuarios por Ficha</h1>
                <p>Busca y selecciona una ficha para gestionar sus aprendices e instructores.</p>
            </header>

            {/* Combobox de Ficha */}
            <div className={styles.searchContainer}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Seleccionar Ficha</label>
                    <div className={styles.comboboxWrapper} ref={comboboxRef}>
                        <div className={styles.comboboxInputWrapper}>
                            <span className={styles.inputIcon}>🔍</span>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Escribe número de ficha o programa..."
                                value={searchTerm}
                                onFocus={() => setIsOpen(true)}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setIsOpen(true);
                                }}
                            />
                        </div>

                        {isOpen && (
                            <div className={styles.comboboxList}>
                                {isLoadingFichas ? (
                                    <div className={styles.comboboxNoResults}>Cargando fichas...</div>
                                ) : filteredFichas.length > 0 ? (
                                    filteredFichas.map(ficha => (
                                        <div
                                            key={ficha.id}
                                            className={styles.comboboxItem}
                                            onClick={() => handleSelectFicha(ficha)}
                                        >
                                            <span className={styles.comboboxItemTitle}>{ficha.numero_ficha}</span>
                                            <span className={styles.comboboxItemSubtitle}>{ficha.programa?.programa}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.comboboxNoResults}>No se encontraron coincidencias</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Información de la Ficha Activa */}
            {activeFicha && (
                <div className={styles.fichaInfo}>
                    <div className={styles.fichaBadge}>
                        <strong>Ficha: {activeFicha.numero_ficha}</strong>
                        <span>Programa: {activeFicha.programa?.programa || 'N/A'}</span>
                        <span style={{ marginTop: '0.25rem', fontWeight: 'bold', color: '#166534' }}>
                            Instructor Titular: {instructorActual
                                ? `${instructorActual.primer_nombre} ${instructorActual.primer_apellido}`
                                : 'Sin asignar'}
                        </span>

                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Estado:</label>
                            <select
                                value={activeFicha.estado}
                                disabled={estadoMutation.isPending}
                                onChange={(e) => estadoMutation.mutate({ fichaId: activeFicha.id, estado: e.target.value })}
                                style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.375rem',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem',
                                    background: 'white'
                                }}
                            >
                                <option value="lectiva">Lectiva</option>
                                <option value="productiva">Productiva</option>
                                <option value="finalizada">Finalizada</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.fichaStats}>
                        <span>Asignados: {assignedUsers.length}</span>
                    </div>
                </div>
            )}

            {/* Tabla de Usuarios */}
            {activeFicha && (
                <div className={styles.tableContainer}>
                    {isLoadingUsers ? (
                        <div className={styles.loading}>Cargando usuarios...</div>
                    ) : assignedUsers.length > 0 ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Identificación</th>
                                    <th>Rol / Tipo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedUsers.map((user: any) => {
                                    const isInstructor = user.pivot?.tipo_participante === 'instructor';
                                    return (
                                        <tr key={user.doc} className={isInstructor ? styles.filaInstructor : ''}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <span className={styles.userName}>
                                                        {user.primer_nombre} {user.primer_apellido}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.userDoc}>CC: {user.doc}</span>
                                            </td>
                                            <td>
                                                <select
                                                    className={styles.roleSelect}
                                                    value={user.pivot?.tipo_participante || 'aprendiz'}
                                                    disabled={roleMutation.isPending}
                                                    onChange={(e) => handleRoleChange(user.doc, e.target.value)}
                                                >
                                                    <option value="aprendiz">Aprendiz</option>
                                                    <option value="instructor">Instructor</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    className={styles.btnDetalles}
                                                    onClick={() => setSelectedUserModal(user)}
                                                >
                                                    Ver Detalles
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.noResults}>
                            <span>📂</span>
                            <p>Esta ficha aún no tiene usuarios asignados.</p>
                        </div>
                    )}
                </div>
            )}

            {!activeFicha && (
                <div className={styles.noResults}>
                    <span>🔎</span>
                    <p>Busca y selecciona una ficha para comenzar la gestión.</p>
                </div>
            )}

            <Modal 
                isOpen={!!selectedUserModal} 
                onClose={() => setSelectedUserModal(null)} 
                title="Detalles del Usuario"
            >
                {selectedUserModal && (
                    <div className={styles.modalBody}>
                        <div className={styles.modalGrid}>
                            {/* Columna Izquierda: Perfil */}
                            <div className={styles.profileSection}>
                                <img 
                                    src={selectedUserModal.foto_perfil || 'https://ui-avatars.com/api/?name=' + selectedUserModal.primer_nombre} 
                                    alt="Perfil" 
                                    className={styles.profilePic} 
                                />
                                <h3 className={styles.modalName}>
                                    {selectedUserModal.primer_nombre} {selectedUserModal.primer_apellido}
                                </h3>
                                <p className={styles.modalDoc}>{selectedUserModal.doc}</p>
                            </div>

                            {/* Columna Derecha: Información */}
                            <div className={styles.infoSection}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Nombre de la entidad</span>
                                    <span className={styles.infoValue}>{selectedUserModal.entidad?.nombre || 'SENA'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Programa de formación</span>
                                    <span className={styles.infoValue}>{activeFicha?.programa?.programa || 'No disponible'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Ficha actual</span>
                                    <span className={styles.infoValue}>{activeFicha?.numero_ficha || 'No disponible'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Ambiente de formación</span>
                                    <span className={styles.infoValue}>{activeFicha?.ambiente?.numero_ambiente || 'No disponible'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Equipo asignado</span>
                                    <span className={styles.infoValue}>{selectedUserModal.equipo_info || 'Sin equipo asignado'}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button onClick={() => setSelectedUserModal(null)} className={styles.acceptButton}>
                                Aceptar
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FichasList;
