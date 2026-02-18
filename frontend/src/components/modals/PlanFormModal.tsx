import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import styles from './PlanFormModal.module.css';
import type { LicensePlan, PlanFormMode, PlanFormData } from '../../types/licensePlan';

interface PlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: PlanFormData) => void;
    mode: PlanFormMode;
    initialData?: LicensePlan | null;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    mode,
    initialData
}) => {
    const [formData, setFormData] = useState<PlanFormData>({
        name: '',
        price: 0,
        billingPeriod: 'monthly',
        duration: 12,
        description: '',
        caracteristicas: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof PlanFormData, string>>>({});

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: mode === 'duplicate' ? `${initialData.name || ''} (Copy)` : (initialData.name || ''),
                price: initialData.price || 0,
                billingPeriod: initialData.billingPeriod || 'monthly',
                duration: initialData.duration || 12,
                description: initialData.description || '',
                caracteristicas: initialData.caracteristicas || ''
            });
        } else if (isOpen && mode === 'create') {
            setFormData({
                name: '',
                price: 0,
                billingPeriod: 'monthly',
                duration: 12,
                description: '',
                caracteristicas: ''
            });
        }
        setErrors({});
    }, [isOpen, initialData, mode]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof PlanFormData, string>> = {};

        if (!(formData.name || '').trim()) {
            newErrors.name = 'El nombre del plan es obligatorio';
        } else if (formData.name.length > 50) {
            newErrors.name = 'El nombre del plan no debe exceder los 50 caracteres';
        }

        if (formData.price <= 0) {
            newErrors.price = 'El precio debe ser mayor que 0';
        }

        if (formData.duration <= 0) {
            newErrors.duration = 'La duración debe ser mayor que 0';
        }

        if (!(formData.description || '').trim()) {
            newErrors.description = 'La descripción es obligatoria';
        } else if (formData.description.length > 255) {
            newErrors.description = 'La descripción no debe exceder los 255 caracteres';
        }

        if (!(formData.caracteristicas || '').trim()) {
            newErrors.caracteristicas = 'Las características son obligatorias';
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

    const handleChange = (field: keyof PlanFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'create':
                return 'Crear Nuevo Plan de Licencia';
            case 'edit':
                return 'Editar Plan de Licencia';
            case 'duplicate':
                return 'Duplicar Plan de Licencia';
            default:
                return 'Plan de Licencia';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="planName" className={styles.label}>
                        Nombre del Plan <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="planName"
                        type="text"
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Ingrese el nombre del plan"
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="price" className={styles.label}>
                            Precio ($) <span className={styles.required}>*</span>
                        </label>
                        <input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                            value={formData.price}
                            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                        />
                        {errors.price && <span className={styles.errorText}>{errors.price}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="billingPeriod" className={styles.label}>
                            Periodo de Facturación <span className={styles.required}>*</span>
                        </label>
                        <select
                            id="billingPeriod"
                            className={styles.select}
                            value={formData.billingPeriod}
                            onChange={(e) => handleChange('billingPeriod', e.target.value)}
                        >
                            <option value="monthly">Mensual</option>
                            <option value="yearly">Anual</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="duration" className={styles.label}>
                        Duración (meses) <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="duration"
                        type="number"
                        min="1"
                        className={`${styles.input} ${errors.duration ? styles.inputError : ''}`}
                        value={formData.duration}
                        onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                        placeholder="12"
                    />
                    {errors.duration && <span className={styles.errorText}>{errors.duration}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description" className={styles.label}>
                        Descripción <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="description"
                        className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Ingrese la descripción del plan"
                        rows={4}
                    />
                    {errors.description && <span className={styles.errorText}>{errors.description}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="caracteristicas" className={styles.label}>
                        Características (separadas por coma) <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="caracteristicas"
                        className={`${styles.textarea} ${errors.caracteristicas ? styles.inputError : ''}`}
                        value={formData.caracteristicas}
                        onChange={(e) => handleChange('caracteristicas', e.target.value)}
                        placeholder="Característica 1, Característica 2, Característica 3"
                        rows={3}
                    />
                    <p className={styles.helperText}>Separa cada característica con una coma (,) para mostrarlas como una lista.</p>
                    {errors.caracteristicas && <span className={styles.errorText}>{errors.caracteristicas}</span>}
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={onClose} className={styles.cancelButton}>
                        Cancelar
                    </button>
                    <button type="submit" className={styles.saveButton}>
                        {mode === 'create' ? 'Crear Plan' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
