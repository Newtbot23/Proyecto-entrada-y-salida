import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import styles from './InstitutionFormModal.module.css';
import type { Institution, InstitutionFormData } from '../../types/institution';

interface InstitutionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: InstitutionFormData) => void;
    mode: 'create' | 'edit';
    initialData?: Institution | null;
}

export const InstitutionFormModal: React.FC<InstitutionFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    mode,
    initialData
}) => {
    const [formData, setFormData] = useState<InstitutionFormData>({
        nombre_entidad: '',
        correo: '',
        direccion: '',
        nombre_titular: '',
        telefono: '',
        nit: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof InstitutionFormData, string>>>({});

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                nombre_entidad: initialData.nombre_entidad,
                correo: initialData.correo,
                direccion: initialData.direccion,
                nombre_titular: initialData.nombre_titular,
                telefono: initialData.telefono,
                nit: initialData.nit
            });
        } else if (isOpen && mode === 'create') {
            setFormData({
                nombre_entidad: '',
                correo: '',
                direccion: '',
                nombre_titular: '',
                telefono: '',
                nit: ''
            });
        }
        setErrors({});
    }, [isOpen, initialData, mode]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof InstitutionFormData, string>> = {};

        // Required fields
        if (!formData.nombre_entidad.trim()) {
            newErrors.nombre_entidad = 'Institution name is required';
        } else if (formData.nombre_entidad.length > 200) {
            newErrors.nombre_entidad = 'Institution name must not exceed 200 characters';
        }

        if (!formData.correo.trim()) {
            newErrors.correo = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            newErrors.correo = 'Invalid email format';
        } else if (formData.correo.length > 200) {
            newErrors.correo = 'Email must not exceed 200 characters';
        }

        if (!formData.direccion.trim()) {
            newErrors.direccion = 'Address is required';
        } else if (formData.direccion.length > 200) {
            newErrors.direccion = 'Address must not exceed 200 characters';
        }

        if (!formData.nombre_titular.trim()) {
            newErrors.nombre_titular = 'Legal representative name is required';
        } else if (formData.nombre_titular.length > 100) {
            newErrors.nombre_titular = 'Legal representative name must not exceed 100 characters';
        }

        if (!formData.telefono.trim()) {
            newErrors.telefono = 'Phone is required';
        } else if (formData.telefono.length > 15) {
            newErrors.telefono = 'Phone must not exceed 15 characters';
        }

        if (!formData.nit.trim()) {
            newErrors.nit = 'NIT is required';
        } else if (formData.nit.length > 15) {
            newErrors.nit = 'NIT must not exceed 15 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validate()) {
            onSave(formData);
            onClose();
        }
    };

    const handleChange = (field: keyof InstitutionFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const getTitle = () => {
        return mode === 'create' ? 'Create New Institution' : 'Edit Institution';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* ID field - Read-only in edit mode */}
                {mode === 'edit' && initialData && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>ID</label>
                        <input
                            type="text"
                            className={`${styles.input} ${styles.readOnly}`}
                            value={initialData.id}
                            disabled
                            readOnly
                        />
                    </div>
                )}

                {/* Institution Name */}
                <div className={styles.formGroup}>
                    <label htmlFor="nombre_entidad" className={styles.label}>
                        Institution Name <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="nombre_entidad"
                        type="text"
                        className={`${styles.input} ${errors.nombre_entidad ? styles.inputError : ''}`}
                        value={formData.nombre_entidad}
                        onChange={(e) => handleChange('nombre_entidad', e.target.value)}
                        placeholder="Enter institution name"
                        maxLength={200}
                    />
                    {errors.nombre_entidad && <span className={styles.errorText}>{errors.nombre_entidad}</span>}
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                    <label htmlFor="correo" className={styles.label}>
                        Email <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="correo"
                        type="email"
                        className={`${styles.input} ${errors.correo ? styles.inputError : ''}`}
                        value={formData.correo}
                        onChange={(e) => handleChange('correo', e.target.value)}
                        placeholder="contact@example.com"
                        maxLength={200}
                    />
                    {errors.correo && <span className={styles.errorText}>{errors.correo}</span>}
                </div>

                {/* Address */}
                <div className={styles.formGroup}>
                    <label htmlFor="direccion" className={styles.label}>
                        Address <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="direccion"
                        className={`${styles.textarea} ${errors.direccion ? styles.inputError : ''}`}
                        value={formData.direccion}
                        onChange={(e) => handleChange('direccion', e.target.value)}
                        placeholder="Enter institution address"
                        rows={3}
                        maxLength={200}
                    />
                    {errors.direccion && <span className={styles.errorText}>{errors.direccion}</span>}
                </div>

                {/* Legal Representative Name */}
                <div className={styles.formGroup}>
                    <label htmlFor="nombre_titular" className={styles.label}>
                        Legal Representative Name <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="nombre_titular"
                        type="text"
                        className={`${styles.input} ${errors.nombre_titular ? styles.inputError : ''}`}
                        value={formData.nombre_titular}
                        onChange={(e) => handleChange('nombre_titular', e.target.value)}
                        placeholder="Enter legal representative name"
                        maxLength={100}
                    />
                    {errors.nombre_titular && <span className={styles.errorText}>{errors.nombre_titular}</span>}
                </div>

                {/* Phone */}
                <div className={styles.formGroup}>
                    <label htmlFor="telefono" className={styles.label}>
                        Phone <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="telefono"
                        type="tel"
                        className={`${styles.input} ${errors.telefono ? styles.inputError : ''}`}
                        value={formData.telefono}
                        onChange={(e) => handleChange('telefono', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        maxLength={15}
                    />
                    {errors.telefono && <span className={styles.errorText}>{errors.telefono}</span>}
                </div>

                {/* NIT - Read-only in edit mode (optional business rule) */}
                <div className={styles.formGroup}>
                    <label htmlFor="nit" className={styles.label}>
                        NIT <span className={styles.required}>*</span>
                        {mode === 'edit' && <span className={styles.immutableNote}> (Cannot be changed)</span>}
                    </label>
                    <input
                        id="nit"
                        type="text"
                        className={`${styles.input} ${errors.nit ? styles.inputError : ''} ${mode === 'edit' ? styles.readOnly : ''}`}
                        value={formData.nit}
                        onChange={(e) => mode === 'create' && handleChange('nit', e.target.value)}
                        placeholder="Enter NIT"
                        maxLength={15}
                        disabled={mode === 'edit'}
                        readOnly={mode === 'edit'}
                    />
                    {errors.nit && <span className={styles.errorText}>{errors.nit}</span>}
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={onClose} className={styles.cancelButton}>
                        Cancel
                    </button>
                    <button type="submit" className={styles.saveButton}>
                        {mode === 'create' ? 'Create Institution' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
