import React from 'react';
import type { Usuario } from '../../../../../types';
import styles from './Modal.module.css';

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    usuario: Usuario | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, usuario }) => {
    if (!isOpen || !usuario) return null;

    const nombreCompleto = [
        usuario.primer_nombre,
        usuario.segundo_nombre,
        usuario.primer_apellido,
        usuario.segundo_apellido,
    ].filter(Boolean).join(' ');

    const rol = (usuario as any).pivot?.tipo_participante ?? 'usuario';

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                {/* ── Header ── */}
                <div className={styles.headerGreen}>
                    <h3 className={styles.headerTitle}>
                        <i className="fas fa-user-circle"></i>
                        Detalles del Usuario
                    </h3>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* ── Body ── */}
                <div className={styles.body}>
                    <div className={styles.twoCol}>

                        {/* Avatar / Foto */}
                        <div className={styles.avatarBox}>
                            {usuario.imagen ? (
                                <img
                                    src={`/storage/${usuario.imagen}`}
                                    alt="Foto de perfil"
                                    className={styles.avatarImg}
                                />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    <i className="fas fa-user"></i>
                                </div>
                            )}
                            <span className={styles.tag}>{rol}</span>
                        </div>

                        {/* Info básica */}
                        <div className={styles.infoStack}>
                            <div>
                                <span className={styles.infoLabel}>Nombre Completo</span>
                                <p className={styles.infoValue}>{nombreCompleto}</p>
                            </div>
                            <div>
                                <span className={styles.infoLabel}>Documento</span>
                                <p className={styles.infoRow}>
                                    <span style={{ background:'#f3f4f6', padding:'0.1rem 0.5rem', borderRadius:'0.25rem', fontSize:'0.75rem', fontWeight:700 }}>
                                        {(usuario as any).tipo_doc?.tipo_doc ?? 'DOC'}
                                    </span>
                                    {usuario.doc}
                                </p>
                            </div>
                            <div>
                                <span className={styles.infoLabel}>Correo Electrónico</span>
                                <p className={styles.infoRow}>
                                    <i className="fas fa-envelope" style={{ color:'#16a34a' }}></i>
                                    {(usuario as any).correo ?? 'No registrado'}
                                </p>
                            </div>
                            <div>
                                <span className={styles.infoLabel}>Teléfono</span>
                                <p className={styles.infoRow}>
                                    <i className="fas fa-phone" style={{ color:'#6b7280' }}></i>
                                    {(usuario as any).telefono ?? 'No registrado'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    <div className={styles.infoGrid}>
                        <div className={styles.infoBox}>
                            <span className={styles.infoLabel}>Entidad</span>
                            <p className={styles.infoRow}>
                                <i className="fas fa-building" style={{ color:'#3b82f6' }}></i>
                                {usuario.entidad?.nombre_entidad ?? 'SENA'}
                            </p>
                        </div>
                        <div className={styles.infoBox}>
                            <span className={styles.infoLabel}>NIT Entidad</span>
                            <p className={styles.infoValue}>{usuario.nit_entidad ?? 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className={styles.footer}>
                    <button className={styles.btnClose} onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
