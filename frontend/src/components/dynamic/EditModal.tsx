import React from 'react';
import DynamicForm from './DynamicForm';
import type { TableColumn } from '../../services/dynamicTableService';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    schema: TableColumn[];
    initialData: any;
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, schema, initialData, onSubmit, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                width: '100%',
                maxHeight: '90vh',
                maxWidth: '800px',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#6b7280',
                        zIndex: 10
                    }}
                >
                    &times;
                </button>

                <div style={{ padding: '0.5rem' }}>
                    <DynamicForm
                        schema={schema}
                        onSubmit={onSubmit}
                        isLoading={isLoading}
                        initialData={initialData}
                        title={`Editar Registro`}
                    />
                </div>

                <div style={{ padding: '0 2rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '-1rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
