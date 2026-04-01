import React from 'react';
import type { Equipo } from '../../../../../types';
import styles from './Modal.module.css';

interface EquipmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipo: Equipo | null;
}

const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({ isOpen, onClose, equipo }) => {
    if (!isOpen || !equipo) return null;

    const esActivo = equipo.estado === 'activo';
    const esInstitucional = equipo.tipo_equipo === 'sena';

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                {/* ── Header ── */}
                <div className={styles.headerBlue}>
                    <h3 className={styles.headerTitle}>
                        <i className="fas fa-laptop"></i>
                        Detalles del Equipo
                    </h3>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* ── Body ── */}
                <div className={styles.body}>
                    <div className={styles.twoCol}>

                        {/* Foto / Placeholder */}
                        <div className={styles.avatarBox}>
                            {equipo.foto_general ? (
                                <img
                                    src={`/storage/${equipo.foto_general}`}
                                    alt="Foto del equipo"
                                    className={styles.avatarImg}
                                    style={{ borderRadius:'0.5rem', width:'100%', height:'130px', objectFit:'contain' }}
                                />
                            ) : (
                                <div className={styles.avatarPlaceholderBlue}>
                                    <i className="fas fa-microchip"></i>
                                </div>
                            )}
                            <div className={styles.tagRow}>
                                <span className={esActivo ? styles.tag : styles.tagRed}>
                                    {equipo.estado}
                                </span>
                                <span className={styles.tagBlue}>
                                    {esInstitucional ? 'Institucional' : 'Propio'}
                                </span>
                            </div>
                        </div>

                        {/* Identificación */}
                        <div className={styles.infoStack}>
                            <div>
                                <span className={styles.infoLabel}>Serial</span>
                                <p className={styles.infoValueMono}>{equipo.serial}</p>
                            </div>
                            <div>
                                <span className={styles.infoLabel}>Placa SENA</span>
                                <p className={styles.infoRow}>
                                    <i className="fas fa-tag" style={{ color:'#f97316' }}></i>
                                    {equipo.placa_sena ?? 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className={styles.infoLabel}>Marca / Modelo</span>
                                <p className={styles.infoValue}>
                                    {equipo.marca?.marca ?? 'Genérica'} — {equipo.modelo}
                                </p>
                            </div>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    <div className={styles.infoGrid}>
                        <div className={styles.infoBox}>
                            <span className={styles.infoLabel}>Sistema Operativo</span>
                            <p className={styles.infoRow}>
                                <i className="fas fa-desktop" style={{ color:'#3b82f6' }}></i>
                                {equipo.sistema_operativo?.sistema_operativo ?? 'No especificado'}
                            </p>
                        </div>
                        <div className={styles.infoBox}>
                            <span className={styles.infoLabel}>Tipo de Equipo</span>
                            <p className={styles.infoValue}>{equipo.tipo_equipo_desc ?? '—'}</p>
                        </div>
                    </div>

                    {equipo.caracteristicas && (
                        <div className={styles.noteBox}>
                            <span className={styles.infoLabel} style={{ fontStyle:'normal', color:'#92400e' }}>Características</span>
                            {equipo.caracteristicas}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className={styles.footer}>
                    <button className={styles.btnClose} onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetailModal;
