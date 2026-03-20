import React from 'react';
import { Modal } from '../common/Modal';
import { CheckIcon } from '../common/Icons';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    isSingleButton?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'warning',
    isSingleButton = false
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className={styles.content}>
                <div className={`${styles.iconContainer} ${styles[variant]}`}>
                    {variant === 'danger' && (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    )}
                    {variant === 'warning' && (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    )}
                    {variant === 'info' && (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    )}
                    {variant === 'success' && (
                        <CheckIcon width={48} height={48} />
                    )}
                </div>

                <p className={styles.message}>{message}</p>

                <div className={`${styles.actions} ${isSingleButton ? styles.centered : ''}`}>
                    {!isSingleButton && (
                        <button onClick={onClose} className={styles.cancelButton}>
                            {cancelText}
                        </button>
                    )}
                    <button onClick={handleConfirm} className={`${styles.confirmButton} ${styles[variant]} ${isSingleButton ? styles.fullWidth : ''}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
