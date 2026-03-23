import React from 'react';
import styles from '../InstitutionsPage.module.css';
import { Modal } from '../../../components/common/Modal';

interface InstitutionEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        nombre_entidad: string;
        nit: string;
        correo: string;
        telefono: string;
        direccion: string;
        nombre_titular: string;
    };
    errors: Partial<Record<string, string>>;
    serverError: string | null;
    isSaving: boolean;
    onChange: (field: string, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const InstitutionEditModal: React.FC<InstitutionEditModalProps> = ({ 
    isOpen, onClose, formData, errors, serverError, isSaving, onChange, onSubmit 
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Institución"
        >
            <form className={styles.editForm} onSubmit={onSubmit}>
                {serverError && (
                    <div className={styles.serverErrorMessage}>
                        <strong>Error:</strong> {serverError}
                    </div>
                )}
                <div className={styles.formGroup}>
                    <label>NIT (Solo lectura)</label>
                    <input type="text" value={formData.nit} readOnly className={styles.readOnlyInput} />
                </div>
                <div className={styles.formGroup}>
                    <label>Nombre (Solo lectura)</label>
                    <input type="text" value={formData.nombre_entidad} readOnly className={styles.readOnlyInput} />
                </div>
                <div className={styles.formGroup}>
                    <label>Representante Legal <span className={styles.requiredStar}>*</span></label>
                    <input
                        type="text"
                        value={formData.nombre_titular}
                        onChange={(e) => onChange('nombre_titular', e.target.value)}
                        className={errors.nombre_titular ? styles.inputError : ''}
                    />
                    {errors.nombre_titular && (
                        <span className={styles.errorText}>
                            {errors.nombre_titular}
                        </span>
                    )}
                </div>
                <div className={styles.formGroup}>
                    <label>Correo <span className={styles.requiredStar}>*</span></label>
                    <input
                        type="email"
                        value={formData.correo}
                        onChange={(e) => onChange('correo', e.target.value)}
                        className={errors.correo ? styles.inputError : ''}
                    />
                    {errors.correo && (
                        <span className={styles.errorText}>
                            {errors.correo}
                        </span>
                    )}
                </div>
                <div className={styles.formGroup}>
                    <label>Teléfono <span className={styles.requiredStar}>*</span></label>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={formData.telefono}
                        onChange={(e) => onChange('telefono', e.target.value)}
                        className={errors.telefono ? styles.inputError : ''}
                    />
                    {errors.telefono && (
                        <span className={styles.errorText}>
                            {errors.telefono}
                        </span>
                    )}
                </div>
                <div className={styles.formGroup}>
                    <label>Dirección <span className={styles.requiredStar}>*</span></label>
                    <input
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => onChange('direccion', e.target.value)}
                        className={errors.direccion ? styles.inputError : ''}
                    />
                    {errors.direccion && (
                        <span className={styles.errorText}>
                            {errors.direccion}
                        </span>
                    )}
                </div>
                <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isSaving}>
                        Cancelar
                    </button>
                    <button type="submit" className={styles.submitButton} disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
