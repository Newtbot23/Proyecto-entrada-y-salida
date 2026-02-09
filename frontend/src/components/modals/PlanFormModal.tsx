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
        description: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof PlanFormData, string>>>({});

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: mode === 'duplicate' ? `${initialData.name} (Copy)` : initialData.name,
                price: initialData.price,
                billingPeriod: initialData.billingPeriod,
                duration: initialData.duration,
                description: initialData.description
            });
        } else if (isOpen && mode === 'create') {
            setFormData({
                name: '',
                price: 0,
                billingPeriod: 'monthly',
                duration: 12,
                description: ''
            });
        }
        setErrors({});
    }, [isOpen, initialData, mode]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof PlanFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Plan name is required';
        }

        if (formData.price <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        if (formData.duration <= 0) {
            newErrors.duration = 'Duration must be greater than 0';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
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
                return 'Create New License Plan';
            case 'edit':
                return 'Edit License Plan';
            case 'duplicate':
                return 'Duplicate License Plan';
            default:
                return 'License Plan';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="planName" className={styles.label}>
                        Plan Name <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="planName"
                        type="text"
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter plan name"
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="price" className={styles.label}>
                            Price ($) <span className={styles.required}>*</span>
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
                            Billing Period <span className={styles.required}>*</span>
                        </label>
                        <select
                            id="billingPeriod"
                            className={styles.select}
                            value={formData.billingPeriod}
                            onChange={(e) => handleChange('billingPeriod', e.target.value)}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="duration" className={styles.label}>
                        Duration (months) <span className={styles.required}>*</span>
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
                        Description <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="description"
                        className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Enter plan description"
                        rows={4}
                    />
                    {errors.description && <span className={styles.errorText}>{errors.description}</span>}
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={onClose} className={styles.cancelButton}>
                        Cancel
                    </button>
                    <button type="submit" className={styles.saveButton}>
                        {mode === 'create' ? 'Create Plan' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
