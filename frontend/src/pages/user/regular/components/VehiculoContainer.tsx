import React, { useState, useMemo } from 'react';
import styles from '../UserDashboard.module.css';
import type { Vehiculo, UserDashboardCatalog } from '../../../../types';
import { alphanumeric, alphanumericNoSpaces } from '../../../../utils/inputFormatters';

interface VehiculoContainerProps {
    vehiculos: Vehiculo[];
    loading: boolean;
    catalogos: UserDashboardCatalog | null;
    isSubmitting: boolean;
    isOcrLoading: boolean;
    onToggleStatus: (id: string, currentStatus: string, tipo: 'vehiculo') => void;
    onSetDefault: (id: string, tipo: 'vehiculo') => void;
    onCreate: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
    onPerformOCR: (file: File) => Promise<{ success: boolean; plate?: string }>;
}

const STORAGE_URL = import.meta.env.VITE_API_STORAGE || 'http://localhost:8000/storage';

export const VehiculoContainer: React.FC<VehiculoContainerProps> = ({
    vehiculos, loading, catalogos, isSubmitting, isOcrLoading,
    onToggleStatus, onSetDefault, onCreate, onPerformOCR
}) => {
    const [showModal, setShowModal] = useState(false);
    const [placaError, setPlacaError] = useState<string | null>(null);
    const [marcaError, setMarcaError] = useState<string | null>(null);
    const [form, setForm] = useState({
        placa: '',
        tipo_vehiculo_id: '',
        marca_vehiculo_id: '',
        modelo: '',
        color: '',
        foto: null as File | null,
        foto_placa: null as File | null
    });

    // ── Selects dependientes ─────────────────────────────────────────────────
    // Solo muestra las marcas que pertenecen al tipo de vehículo seleccionado.
    // Se recalcula automáticamente cada vez que cambia tipo_vehiculo_id o el catálogo.
    const marcasFiltradas = useMemo(() => {
        if (!form.tipo_vehiculo_id || !catalogos?.marcas_vehiculo) return [];
        return catalogos.marcas_vehiculo.filter(
            (m) => String(m.id_tipo_vehiculo) === String(form.tipo_vehiculo_id)
        );
    }, [form.tipo_vehiculo_id, catalogos?.marcas_vehiculo]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setForm(prev => ({ ...prev, foto: e.target.files![0] }));
        }
    };

    const handlePlateImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setForm(prev => ({ ...prev, foto_placa: file }));
            setPlacaError(null);

            const res = await onPerformOCR(file);
            if (res.success && res.plate) {
                if (form.placa) {
                    if (form.placa !== res.plate) {
                        alert(`¡Atención! La placa detectada en la imagen (${res.plate}) no coincide con la placa que ingresaste (${form.placa}).`);
                    }
                } else {
                    setForm(prev => ({ ...prev, placa: res.plate! }));
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPlacaError(null);
        setMarcaError(null);

        const formData = new FormData();
        formData.append('placa', form.placa);
        formData.append('id_tipo_vehiculo', form.tipo_vehiculo_id);
        formData.append('id_marca', form.marca_vehiculo_id);
        formData.append('modelo', form.modelo);
        formData.append('color', form.color);
        if (form.foto) formData.append('foto_general', form.foto);
        if (form.foto_placa) formData.append('foto_detalle', form.foto_placa);

        const res = await onCreate(formData);
        if (res.success) {
            setShowModal(false);
            setForm({ placa: '', tipo_vehiculo_id: '', marca_vehiculo_id: '', modelo: '', color: '', foto: null, foto_placa: null });
        } else if (res.error) {
            // Si el error menciona "marca", lo asignamos a su estado correspondiente
            if (res.error.toLowerCase().includes('marca')) {
                setMarcaError(res.error);
            } else {
                setPlacaError(res.error);
            }
        }
    };

    return (
        <>
            <div className={`${styles.card} ${styles.actionButtonsContainer}`}>
                <button onClick={() => setShowModal(true)} className={styles.btnVehiculo}>
                    Registrar Vehículo
                </button>
            </div>

            <div className={styles.tableResponsive}>
                {loading ? (
                    <div className={styles.emptyState}>Cargando vehículos...</div>
                ) : vehiculos.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyIcon}>🚗</p>
                        <p className={styles.emptyText}>No tienes vehículos registrados.</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th className={styles.thTd}>Favorito</th>
                                <th className={styles.thTd}>Imagen</th>
                                <th className={styles.thTd}>Placa</th>
                                <th className={styles.thTd}>Marca</th>
                                <th className={styles.thTd}>Modelo</th>
                                <th className={styles.thTd}>Color</th>
                                <th className={styles.thTd}>Tipo</th>
                                <th className={styles.thTd}>Estado</th>
                                <th className={styles.thTd}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehiculos.map((v) => (
                                <tr key={v.placa} className={styles.row}>
                                    <td className={styles.thTd}>
                                        <button
                                            onClick={() => !v.es_predeterminado && onSetDefault(v.placa, 'vehiculo')}
                                            className={`${styles.starButton} ${v.es_predeterminado ? styles.starButtonVehiculoActive : ''}`}
                                            title={v.es_predeterminado ? "Vehículo principal" : "Marcar como principal"}
                                        >
                                            {v.es_predeterminado ? '★' : '☆'}
                                        </button>
                                    </td>
                                    <td className={styles.thTd}>
                                        <div className={styles.assetImageContainer}>
                                            {v.img_vehiculo ? (
                                                <img
                                                    src={`${STORAGE_URL}/${v.img_vehiculo.split(/[,|]/)[0]}`}
                                                    alt="Vehiculo"
                                                    className={styles.assetImage}
                                                    onClick={() => window.open(`${STORAGE_URL}/${v.img_vehiculo!.split(/[,|]/)[0]}`, '_blank')}
                                                />
                                            ) : <span className={styles.noImage}>Sin foto</span>}
                                        </div>
                                    </td>
                                    <td className={`${styles.thTd} ${styles.boldCell}`}>{v.placa}</td>
                                    <td className={styles.thTd}>{v.marca?.nombre ?? '—'}</td>
                                    <td className={styles.thTd}>{v.modelo}</td>
                                    <td className={styles.thTd}>{v.color}</td>
                                    <td className={styles.thTd}>{v.tipo_vehiculo?.tipo_vehiculo}</td>
                                    <td className={styles.thTd}>
                                        {v.estado_aprobacion === 'activo' && <span className={styles.badgeActivo}>Activo</span>}
                                        {v.estado_aprobacion === 'pendiente' && <span className={styles.badgePendiente}>Pendiente</span>}
                                        {v.estado_aprobacion === 'inactivo' && <span className={styles.badgeInactivo}>Inactivo</span>}
                                    </td>
                                    <td className={styles.thTd}>
                                        {v.estado_aprobacion === 'activo' ? (
                                            <button onClick={() => onToggleStatus(v.placa, 'activo', 'vehiculo')} className={styles.btnInhabilitar}>Inhabilitar</button>
                                        ) : v.estado_aprobacion === 'inactivo' ? (
                                            <button onClick={() => onToggleStatus(v.placa, 'inactivo', 'vehiculo')} className={styles.btnReactivar}>Reactivar</button>
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
                        <h3 className={styles.modalTitle}>Registrar Nuevo Vehículo</h3>
                        <form onSubmit={handleSubmit} className={styles.formGrid}>

                            {/* FOTO VEHICULO Y FOTO PLACA OCR */}
                            <div className={styles.formGroupFull} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className={styles.label}>Foto del Vehículo:</label>
                                    <input type="file" accept="image/*" onChange={handleImageSelect} className={styles.input} />
                                </div>
                                <div>
                                    <label className={styles.label}>Foto de la Placa:</label>
                                    <input type="file" accept="image/*" onChange={handlePlateImageSelect} className={styles.input} />
                                    {isOcrLoading && <p className={styles.ocrLoadingVehiculo}>Analizando placa...</p>}
                                </div>
                            </div>

                            {/* PLACA */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Placa:</label>
                                <input
                                    type="text"
                                    value={form.placa}
                                    onChange={e => setForm(prev => ({ ...prev, placa: alphanumericNoSpaces(e.target.value) }))}
                                    placeholder="Ej: ABC123"
                                    className={`${styles.input} ${placaError ? styles.inputError : ''}`}
                                    required
                                />
                                {placaError && <p className={styles.errorText}>{placaError}</p>}
                            </div>

                            {/* TIPO VEHICULO */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tipo de Vehículo:</label>
                                <select
                                    className={styles.input}
                                    value={form.tipo_vehiculo_id}
                                    onChange={e => setForm(prev => ({
                                        ...prev,
                                        tipo_vehiculo_id: e.target.value,
                                        marca_vehiculo_id: '', // ← reset al cambiar tipo
                                    }))}
                                    required
                                >
                                    <option value="">Seleccione...</option>
                                    {(catalogos?.tipos_vehiculo || []).map(t => (
                                        <option key={String(t.id)} value={t.id}>
                                            {t.nombre?.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* MARCA — dependiente del tipo seleccionado */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Marca:</label>
                                <select
                                    className={`${styles.input} ${marcaError ? styles.inputError : ''}`}
                                    value={form.marca_vehiculo_id}
                                    onChange={e => {
                                        setForm(prev => ({ ...prev, marca_vehiculo_id: e.target.value }));
                                        setMarcaError(null);
                                    }}
                                    disabled={!form.tipo_vehiculo_id}
                                    required
                                >
                                    <option value="">
                                        {form.tipo_vehiculo_id
                                            ? marcasFiltradas.length === 0
                                                ? 'Sin marcas disponibles'
                                                : 'Seleccione una marca...'
                                            : 'Primero seleccione el tipo'}
                                    </option>
                                    {marcasFiltradas.map(m => (
                                        <option key={String(m.id)} value={m.id}>
                                            {m.nombre?.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                                {marcaError && <p className={styles.errorText}>{marcaError}</p>}
                            </div>

                            {/* MODELO */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Modelo:</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={form.modelo}
                                    onChange={e => setForm(prev => ({ ...prev, modelo: alphanumeric(e.target.value) }))}
                                    required
                                />
                            </div>

                            {/* COLOR */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Color:</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={form.color}
                                    onChange={e => setForm(prev => ({ ...prev, color: alphanumeric(e.target.value) }))}
                                    required
                                />
                            </div>

                            {/* FOOTER ACTIONS - Span full width */}
                            <div className={`${styles.modalFooter} ${styles.formGroupFull}`}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.btnCancel} disabled={isSubmitting}>Cancelar</button>
                                <button type="submit" className={styles.btnSubmit} disabled={isSubmitting || !!placaError}>
                                    {isSubmitting ? 'Registrando...' : 'Registrar Vehículo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
