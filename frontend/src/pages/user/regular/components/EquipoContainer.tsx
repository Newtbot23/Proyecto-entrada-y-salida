import React, { useState } from 'react';
import styles from '../UserDashboard.module.css';
import type { Equipo, UserDashboardCatalog } from '../../../../types';
import { alphanumeric, alphanumericNoSpaces } from '../../../../utils/inputFormatters';

interface EquipoContainerProps {
    equipos: Equipo[];
    loading: boolean;
    catalogos: UserDashboardCatalog | null;
    isSubmitting: boolean;
    isOcrLoading: boolean;
    onToggleStatus: (id: string, currentStatus: string, tipo: 'equipo') => void;
    onSetDefault: (id: string, tipo: 'equipo') => void;
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
        tipo_equipo_desc: '',
        caracteristicas: '',
        tipo_equipo: 'propio', // Regla de Negocio: Usuario Normal siempre registra como Propio
        foto: null as File | null
    });

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setForm(prev => {
            const newState = { ...prev, tipo_equipo_id: val };
            // Si no es COMPUTO (id: 1), limpiamos campos de hardware y serial
            if (val !== '1') {
                newState.marca_equipo_id = '';
                newState.so_id = '';
                newState.serial = '';
                newState.ram = '';
                newState.procesador = '';
            }
            return newState;
        });
    };

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
        formData.append('serial', form.serial); // Forzado a "" si no es COMPUTO por la lógica de limpieza
        formData.append('id_marca', form.marca_equipo_id);
        formData.append('id_sistema_operativo', form.so_id);
        formData.append('modelo', form.modelo);
        formData.append('ram', form.ram);
        formData.append('procesador', form.procesador);
        formData.append('tipo_equipo_desc', form.tipo_equipo_desc);
        formData.append('caracteristicas', form.caracteristicas);
        
        // Inyección directa de valores fijos por seguridad
        formData.append('tipo_equipo', 'propio');
        formData.append('estado', 'asignado');
        
        if (form.foto) formData.append('foto_general', form.foto);

        const res = await onCreate(formData);
        if (res.success) {
            setShowModal(false);
            setForm({ serial: '', tipo_equipo_id: '', marca_equipo_id: '', modelo: '', so_id: '', ram: '', procesador: '', tipo_equipo_desc: '', caracteristicas: '', tipo_equipo: 'propio', foto: null });
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
                            {equipos.map((equipo) => (
                                <tr key={equipo.serial} className={styles.row}>
                                    <td className={styles.thTd}>
                                        <button 
                                            onClick={() => !equipo.es_predeterminado && onSetDefault(equipo.serial, 'equipo')}
                                            className={`${styles.starButton} ${equipo.es_predeterminado ? styles.starButtonEquipoActive : ''}`}
                                            title={equipo.es_predeterminado ? "Equipo principal" : "Marcar como principal"}
                                        >
                                            {equipo.es_predeterminado ? '★' : '☆'}
                                        </button>
                                    </td>
                                    <td className={styles.thTd}>
                                        <div className={styles.assetImageContainer}>
                                            {equipo.img_serial ? (
                                                <img 
                                                    src={`${STORAGE_URL}/${equipo.img_serial.split('|')[0]}`} 
                                                    alt="Equipo" 
                                                    className={styles.assetImage}
                                                    onClick={() => window.open(`${STORAGE_URL}/${equipo.img_serial!.split('|')[0]}`, '_blank')}
                                                />
                                            ) : <span className={styles.noImage}>Sin foto</span>}
                                        </div>
                                    </td>
                                    <td className={`${styles.thTd} ${styles.boldCell}`}>{equipo.serial}</td>
                                    <td className={styles.thTd}>{equipo.marca_equipo?.nombre || equipo.marca?.marca}</td>
                                    <td className={styles.thTd}>{equipo.modelo}</td>
                                    <td className={styles.thTd}>{equipo.tipo_equipo_desc}</td>
                                    <td className={styles.thTd}>
                                        {equipo.estado_aprobacion === 'activo' && <span className={styles.badgeActivo}>Activo</span>}
                                        {equipo.estado_aprobacion === 'pendiente' && <span className={styles.badgePendiente}>Pendiente</span>}
                                        {equipo.estado_aprobacion === 'inactivo' && <span className={styles.badgeInactivo}>Inactivo</span>}
                                    </td>
                                    <td className={styles.thTd}>
                                        {equipo.estado_aprobacion === 'activo' ? (
                                            <button onClick={() => onToggleStatus(equipo.serial, 'activo', 'equipo')} className={styles.btnInhabilitar}>Inhabilitar</button>
                                        ) : equipo.estado_aprobacion === 'inactivo' ? (
                                            <button onClick={() => onToggleStatus(equipo.serial, 'inactivo', 'equipo')} className={styles.btnReactivar}>Reactivar</button>
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
                        <form onSubmit={handleSubmit} className={styles.formGrid}>
                            
                            {/* CATEGORÍA (TIPO) */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Categoría de Equipo:</label>
                                <select 
                                    className={styles.input}
                                    value={form.tipo_equipo_id}
                                    onChange={handleCategoryChange}
                                    required
                                >
                                    <option value="">Seleccione...</option>
                                    {(catalogos?.tipos_equipo || []).map(t => (
                                        <option key={String(t.id)} value={t.id}>{t.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* MARCA, OS, RAM, PROCESADOR, SERIAL (Solo para COMPUTO id:1) */}
                            {form.tipo_equipo_id === '1' && (
                                <React.Fragment key="computo-fields">
                                    {/* MARCA */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Marca:</label>
                                        <select 
                                            className={styles.input}
                                            value={form.marca_equipo_id}
                                            onChange={e => setForm(prev => ({ ...prev, marca_equipo_id: e.target.value }))}
                                            required
                                        >
                                            <option value="">Seleccione...</option>
                                            {(catalogos?.marcas_equipo || []).map(m => (
                                                <option key={String(m.id)} value={m.id}>{m.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* SISTEMA OPERATIVO */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Sistema Operativo:</label>
                                        <select 
                                            className={styles.input}
                                            value={form.so_id}
                                            onChange={e => setForm(prev => ({ ...prev, so_id: e.target.value }))}
                                            required
                                        >
                                            <option value="">Seleccione...</option>
                                            {(catalogos?.sistemas_operativos || []).map(s => (
                                                <option key={String(s.id)} value={s.id}>{s.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* MEMORIA RAM */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Memoria RAM:</label>
                                        <input 
                                            type="text" 
                                            value={form.ram}
                                            onChange={e => setForm(prev => ({ ...prev, ram: alphanumeric(e.target.value) }))}
                                            className={styles.input}
                                            placeholder="Ej: 16GB"
                                            required 
                                        />
                                    </div>

                                    {/* PROCESADOR */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Procesador:</label>
                                        <input 
                                            type="text" 
                                            value={form.procesador}
                                            onChange={e => setForm(prev => ({ ...prev, procesador: alphanumeric(e.target.value) }))}
                                            className={styles.input}
                                            placeholder="Ej: Core i7 12va"
                                            required 
                                        />
                                    </div>

                                    {/* SERIAL / PLACA (Solo si es COMPUTO es obligatorio y visible) */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Serial / Placa:</label>
                                        <input 
                                            type="text" 
                                            value={form.serial}
                                            onChange={e => setForm(prev => ({ ...prev, serial: alphanumericNoSpaces(e.target.value) }))}
                                            className={styles.input}
                                            placeholder="Serial único"
                                            required 
                                        />
                                    </div>
                                </React.Fragment>
                            )}

                            {/* MODELO */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Modelo:</label>
                                <input 
                                    type="text" 
                                    className={styles.input} 
                                    value={form.modelo} 
                                    onChange={e => setForm(prev => ({ ...prev, modelo: alphanumeric(e.target.value) }))} 
                                    placeholder="Ej: Latitude 5420"
                                    required 
                                />
                            </div>

                            {/* DESCRIPCIÓN (Resumen) */}
                            <div className={styles.formGroupFull}>
                                <label className={styles.label}>Descripción del Tipo (Resumen):</label>
                                <input 
                                    type="text" 
                                    className={styles.input} 
                                    value={form.tipo_equipo_desc} 
                                    onChange={e => setForm(prev => ({ ...prev, tipo_equipo_desc: e.target.value }))}
                                    placeholder="Ej: Portátil de alto rendimiento"
                                    required 
                                />
                            </div>

                            {/* CARACTERÍSTICAS / OBSERVACIONES */}
                            <div className={styles.formGroupFull}>
                                <label className={styles.label}>Características / Observaciones Físicas:</label>
                                <textarea 
                                    className={`${styles.input} ${styles.textarea}`}
                                    value={form.caracteristicas}
                                    onChange={e => setForm(prev => ({ ...prev, caracteristicas: e.target.value }))}
                                    placeholder="Describe el estado físico o componentes..."
                                    required 
                                />
                            </div>

                            {/* FOTO OCR */}
                            <div className={styles.formGroupFull}>
                                <label className={styles.label}>Foto del Serial (Opcional):</label>
                                <input type="file" accept="image/*" onChange={handleImageSelect} className={styles.input} />
                                {isOcrLoading && <p className={styles.ocrLoadingEquipo}>Analizando serial...</p>}
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className={`${styles.modalFooter} ${styles.formGroupFull}`}>
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
