import React, { useState } from 'react';
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
    const [form, setForm] = useState({
        placa: '',
        tipo_vehiculo_id: '',
        marca_vehiculo_id: '',
        modelo: '',
        color: '',
        foto: null as File | null
    });
    const [placaError, setPlacaError] = useState<string | null>(null);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setForm(prev => ({ ...prev, foto: file }));
            setPlacaError(null);

            const res = await onPerformOCR(file);
            if (res.success && res.plate) {
                setForm(prev => ({ ...prev, placa: res.plate! }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPlacaError(null);

        const formData = new FormData();
        formData.append('placa', form.placa);
        formData.append('id_tipo_vehiculo', form.tipo_vehiculo_id);
        formData.append('id_marca_vehiculo', form.marca_vehiculo_id);
        formData.append('modelo', form.modelo);
        formData.append('color', form.color);
        if (form.foto) formData.append('foto', form.foto);

        const res = await onCreate(formData);
        if (res.success) {
            setShowModal(false);
            setForm({ placa: '', tipo_vehiculo_id: '', marca_vehiculo_id: '', modelo: '', color: '', foto: null });
        } else if (res.error) {
            setPlacaError(res.error);
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
                                            {v.img_asset ? (
                                                <img 
                                                    src={`${STORAGE_URL}/${v.img_asset}`} 
                                                    alt="Vehiculo" 
                                                    className={styles.assetImage}
                                                    onClick={() => window.open(`${STORAGE_URL}/${v.img_asset}`, '_blank')}
                                                />
                                            ) : <span className={styles.noImage}>Sin foto</span>}
                                        </div>
                                    </td>
                                    <td className={`${styles.thTd} ${styles.boldCell}`}>{v.placa}</td>
                                    <td className={styles.thTd}>{v.marca_vehiculo?.nombre || v.marca}</td>
                                    <td className={styles.thTd}>{v.modelo}</td>
                                    <td className={styles.thTd}>{v.color}</td>
                                    <td className={styles.thTd}>{v.tipo_vehiculo?.tipo_vehiculo}</td>
                                    <td className={styles.thTd}>
                                        {v.estado === 'activo' && <span className={styles.badgeActivo}>Activo</span>}
                                        {v.estado === 'pendiente' && <span className={styles.badgePendiente}>Pendiente</span>}
                                        {v.estado === 'inactivo' && <span className={styles.badgeInactivo}>Inactivo</span>}
                                    </td>
                                    <td className={styles.thTd}>
                                        {v.estado === 'activo' ? (
                                            <button onClick={() => onToggleStatus(v.placa, 'activo', 'vehiculo')} className={styles.btnInhabilitar}>Inhabilitar</button>
                                        ) : v.estado === 'inactivo' ? (
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
                            
                            {/* FOTO OCR - Span full width */}
                            <div className={styles.formGroupFull}>
                                <label className={styles.label}>Foto del Vehículo (Opcional):</label>
                                <input type="file" accept="image/*" onChange={handleImageSelect} className={styles.input} />
                                {isOcrLoading && <p className={styles.ocrLoadingVehiculo}>Analizando placa...</p>}
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
                                    onChange={e => setForm(prev => ({ ...prev, tipo_vehiculo_id: e.target.value }))}
                                    required
                                >
                                    <option value="">Seleccione...</option>
                                    {(catalogos?.tipos_vehiculo || []).map(t => (
                                        <option key={String(t.id)} value={t.id}>{t.nombre?.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            {/* MARCA */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Marca:</label>
                                <select 
                                    className={styles.input}
                                    value={form.marca_vehiculo_id}
                                    onChange={e => setForm(prev => ({ ...prev, marca_vehiculo_id: e.target.value }))}
                                    required
                                >
                                    <option value="">Seleccione...</option>
                                    {(catalogos?.marcas_vehiculo || []).map(m => (
                                        <option key={String(m.id)} value={m.id}>{m.nombre?.toUpperCase()}</option>
                                    ))}
                                </select>
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
