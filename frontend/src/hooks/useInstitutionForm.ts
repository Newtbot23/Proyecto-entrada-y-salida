import { useState, useRef } from 'react';
import { updateInstitution } from '../services/institutionService';

const REGEX = {
    NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

export const useInstitutionForm = (onSuccess: () => void) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({
        nombre_entidad: '',
        nit: '',
        correo: '',
        telefono: '',
        direccion: '',
        nombre_titular: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof typeof editFormData, string>>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const validateField = (field: keyof typeof editFormData, value: string) => {
        let error: string | undefined;
        switch (field) {
            case 'nombre_titular':
                if (!value.trim()) error = 'El nombre del representante es obligatorio';
                else if (!REGEX.NAME.test(value)) error = 'El nombre solo debe contener letras y espacios';
                else if (value.length > 100) error = 'El nombre no debe exceder los 100 caracteres';
                break;
            case 'correo':
                if (!value.trim()) error = 'El correo es obligatorio';
                else if (!REGEX.EMAIL.test(value)) error = 'Formato de correo inválido';
                else if (value.length > 255) error = 'El correo no debe exceder los 255 caracteres';
                break;
            case 'telefono':
                if (!value.trim()) error = 'El teléfono es obligatorio';
                else if (value.startsWith('+')) error = 'No incluya prefijos internacionales como +57';
                else if (!/^(3[0-9]{9}|60[0-9]{8})$/.test(value)) error = 'Debe ser un número válido en Colombia (10 dígitos, iniciar en 3 o 60)';
                break;
            case 'direccion':
                if (!value.trim()) error = 'La dirección es obligatoria';
                else if (value.length > 255) error = 'La dirección no debe exceder los 255 caracteres';
                break;
        }
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleChange = (field: keyof typeof editFormData, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => validateField(field, value), 500);
    };

    const validateAll = (): boolean => {
        const newErrors: Partial<Record<keyof typeof editFormData, string>> = {};
        if (!editFormData.nombre_titular.trim()) newErrors.nombre_titular = 'El nombre del representante es obligatorio';
        if (!editFormData.correo.trim()) newErrors.correo = 'El correo es obligatorio';
        if (!editFormData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
        if (!editFormData.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEditClick = (inst: any) => {
        setSelectedInstitution(inst);
        setEditFormData({
            nombre_entidad: inst.nombre_entidad || '',
            nit: inst.nit || '',
            correo: inst.correo || '',
            telefono: inst.telefono || '',
            direccion: inst.direccion || '',
            nombre_titular: inst.nombre_titular || ''
        });
        setErrors({});
        setServerError(null);
        setIsEditModalOpen(true);
    };

    const handleViewDetails = (inst: any) => {
        setSelectedInstitution(inst);
        setIsDetailsModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);
        if (!validateAll()) return;
        try {
            setIsSaving(true);
            const idToUpdate = editFormData.nit || selectedInstitution.id;
            await updateInstitution(idToUpdate, editFormData);
            alert('Institución actualizada exitosamente');
            setIsEditModalOpen(false);
            onSuccess();
        } catch (error: any) {
            setServerError(error.message || 'Error al actualizar la institución');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isEditModalOpen,
        setIsEditModalOpen,
        isDetailsModalOpen,
        setIsDetailsModalOpen,
        selectedInstitution,
        editFormData,
        errors,
        serverError,
        isSaving,
        handleChange,
        handleEditSubmit,
        handleEditClick,
        handleViewDetails
    };
};
