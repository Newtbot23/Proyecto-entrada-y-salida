import React, { useState } from 'react';
import styles from '../UserDashboard.module.css';
import type { Equipo, UserDashboardCatalog } from '../../../../types';

interface EquipoContainerProps {
    equipos: Equipo[];
    loading: boolean;
    catalogos: UserDashboardCatalog | null;
    isSubmitting: boolean;
    isOcrLoading: boolean;
    onToggleStatus: (id: number, currentStatus: string, tipo: 'equipo') => void;
    onSetDefault: (id: number, tipo: 'equipo') => void;
    onCreate: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
    onPerformOCR: (file: File) => Promise<{ success: boolean; serial?: string }>;
}

const STORAGE_URL = import.meta.env.VITE_API_STORAGE || 'http://localhost:8000/storage';

export const EquipoContainer: React.FC<EquipoContainerProps> = ({ 
    equipos, loading, catalogos, isSubmitting, isOcrLoading,
    onToggleStatus, onSetDefault, onCreate, onPerformOCR 
}) => {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        serial: '',
        tipo_equipo_id: '',
        marca_equipo_id: '',
        modelo: '',
        so_id: '',
        ram: '',
        procesador: '',
        foto: null as File | null
    });

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setForm(prev => ({ ...prev, foto: file }));

            const res = await onPerformOCR(file);
            if (res.success && res.serial) {
                setForm(prev => ({ ...prev, serial: res.serial! }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('serial', form.serial);
        formData.append('id_tipo_equipo', form.tipo_equipo_id);
        formData.append('id_marca', form.marca_equipo_id);
        formData.append('modelo', form.modelo);
        formData.append('id_sistema_operativo', form.so_id);
        formData.append('ram', form.ram);
        formData.append('procesador', form.procesador);
        if (form.foto) formData.append('foto', form.foto);

        const res = await onCreate(formData);
        if (res.success) {
            setShowModal(false);
            setForm({ serial: '', tipo_equipo_id: '', marca_equipo_id: '', modelo: '', so_id: '', ram: '', procesador: '', foto: null });
        }
    };

    return (
        <>
            <div className={`${styles.card} ${styles.actionButtonsContainer}`}>
                <button onClick={() => setShowModal(true)} className={styles.btnEquipo}>
                    Registrar Equipo
                </button>
            </div>

            <div className={styles.tableResponsive}>
                {loading ? (
                    <div className={styles.emptyState}>Cargando equipos...</div>
                ) : equipos.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyIcon}>💻</p>
                        <p className={styles.emptyText}>No tienes equipos registrados.</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th className={styles.thTd}>Favorito</th>
                                <th className={styles.thTd}>Imagen</th>
                                <th className={styles.thTd}>Serial</th>
                                <th className={styles.thTd}>Marca</th>
                                <th className={styles.thTd}>Modelo</th>
                                <th className={styles.thTd}>Tipo</th>
                                <th className={styles.thTd}>Estado</th>
                                <th className={styles.thTd}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipos.map((e) => (
                                <tr key={e.id} className={styles.row}>
                                    <td className={styles.thTd}>
                                        <button 
                                            onClick={() => e.principal === 0 && onSetDefault(e.id, 'equipo')}
                                            className={`${styles.starButton} ${e.principal === 1 ? styles.starButtonEquipoActive : ''}`}
                                            title={e.principal === 1 ? "Equipo principal" : "Marcar como principal"}
                                        >
                                            {e.principal === 1 ? '★' : '☆'}
                                        </button>
                                    </td>
                                    <td className={styles.thTd}>
                                        <div className={styles.assetImageContainer}>
                                            {e.img_asset ? (
                                                <img 
                                                    src={`${STORAGE_URL}/${e.img_asset}`} 
                                                    alt="Equipo" 
                                                    className={styles.assetImage}
                                                    onClick={() => window.open(`${STORAGE_URL}/${e.img_asset}`, '_blank')}
                                                />
                                            ) : <span className={styles.noImage}>Sin foto</span>}
                                        </div>
                                    </td>
                                    <td className={`${styles.thTd} ${styles.boldCell}`}>{e.serial}</td>
                                    <td className={styles.thTd}>{e.marca_equipo?.nombre || e.marca?.marca}</td>
                                    <td className={styles.thTd}>{e.modelo}</td>
                                    <td className={styles.thTd}>{e.tipo_equipo_desc}</td>
                                    <td className={styles.thTd}>
                                        {e.estado === 'activo' && <span className={styles.badgeActivo}>Activo</span>}
                                        {e.estado === 'pendiente' && <span className={styles.badgePendiente}>Pendiente</span>}
                                        {e.estado === 'inactivo' && <span className={styles.badgeInactivo}>Inactivo</span>}
                                    </td>
                                    <td className={styles.thTd}>
                                        {e.estado === 'activo' ? (
                                            <button onClick={() => onToggleStatus(e.id, 'activo', 'equipo')} className={styles.btnInhabilitar}>Inhabilitar</button>
                                        ) : e.estado === 'inactivo' ? (
                                            <button onClick={() => onToggleStatus(e.id, 'inactivo', 'equipo')} className={styles.btnReactivar}>Reactivar</button>
                                        ) : (
                                            <span className={styles.reviewText}>En revisión</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>Registrar Nuevo Equipo</h3>
                        <form onSubmit={handleSubmit}>
                            <label className={styles.label}>Foto del Serial (Opcional):</label>
                            <input type="file" accept="image/*" onChange={handleImageSelect} className={styles.input} />
                            {isOcrLoading && <p className={styles.ocrLoadingEquipo}>Analizando serial...</p>}

                            <label className={styles.label}>Serial:</label>
                            <input 
                                type="text" 
                                value={form.serial}
                                onChange={e => setForm(prev => ({ ...prev, serial: e.target.value.toUpperCase() }))}
                                className={styles.input}
                                required 
                            />

                            <div className={styles.formRow}>
                                <div className={styles.flex1}>
                                    <label className={styles.label}>Tipo:</label>
                                    <select 
                                        className={styles.input}
                                        value={form.tipo_equipo_id}
                                        onChange={e => setForm(prev => ({ ...prev, tipo_equipo_id: e.target.value }))}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {catalogos?.tipos_equipo.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                    </select>
                                </div>
                                <div className={styles.flex1}>
                                    <label className={styles.label}>Marca:</label>
                                    <select 
                                        className={styles.input}
                                        value={form.marca_equipo_id}
                                        onChange={e => setForm(prev => ({ ...prev, marca_equipo_id: e.target.value }))}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {catalogos?.marcas_equipo.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            <label className={styles.label}>Modelo:</label>
                            <input type="text" className={styles.input} value={form.modelo} onChange={e => setForm(prev => ({ ...prev, modelo: e.target.value }))} required />

                            <div className={styles.formRow}>
                                <div className={styles.flex1}>
                                    <label className={styles.label}>Sist. Operativo:</label>
                                    <select 
                                        className={styles.input}
                                        value={form.so_id}
                                        onChange={e => setForm(prev => ({ ...prev, so_id: e.target.value }))}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {catalogos?.sistemas_operativos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                    </select>
                                </div>
                                <div className={styles.flex1}>
                                    <label className={styles.label}>RAM:</label>
                                    <input type="text" className={styles.input} value={form.ram} onChange={e => setForm(prev => ({ ...prev, ram: e.target.value }))} placeholder="Ej: 8GB" required />
                                </div>
                            </div>

                            <label className={styles.label}>Procesador:</label>
                            <input type="text" className={styles.input} value={form.procesador} onChange={e => setForm(prev => ({ ...prev, procesador: e.target.value }))} placeholder="Ej: Core i5" required />

                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.btnCancel} disabled={isSubmitting}>Cancelar</button>
                                <button type="submit" className={`${styles.btnSubmit} ${styles.btnSubmitEquipo}`} disabled={isSubmitting}>
                                    {isSubmitting ? 'Registrando...' : 'Registrar Equipo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
