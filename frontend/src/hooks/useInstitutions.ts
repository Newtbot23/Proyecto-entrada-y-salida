import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { getInstitutions, disableInstitution, enableInstitution } from '../services/institutionService';

export const useInstitutions = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const {
        data: response,
        isLoading: loading,
        refetch
    } = useQuery({
        queryKey: ['institutions', debouncedSearch, currentPage],
        queryFn: () => getInstitutions({
            search: debouncedSearch,
            statuses: []
        }, currentPage, 10),
    });

    const institutions = response?.data || [];
    const totalPages = response?.meta?.totalPages || 1;

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleDisable = async (inst: any) => {
        if (window.confirm(`¿Estás seguro de que deseas desactivar la institución "${inst.nombre_entidad}"? No se podrá editar mientras esté inactiva.`)) {
            try {
                const idToDisable = inst.nit || inst.id;
                await disableInstitution(idToDisable);
                toast.success('Institución desactivada exitosamente');
                refetch();
            } catch (error: any) {
                console.error('Failed to disable institution:', error);
                toast.error(error.response?.data?.message || 'Error al desactivar la institución');
            }
        }
    };

    const handleEnable = async (inst: any) => {
        if (window.confirm(`¿Estás seguro de que deseas reactivar la institución "${inst.nombre_entidad}"?`)) {
            try {
                const idToEnable = inst.nit || inst.id;
                await enableInstitution(idToEnable);
                toast.success('Institución reactivada exitosamente');
                refetch();
            } catch (error: any) {
                console.error('Failed to enable institution:', error);
                toast.error(error.response?.data?.message || 'Error al reactivar la institución');
            }
        }
    };

    return {
        institutions,
        loading,
        currentPage,
        searchQuery,
        totalPages,
        handleSearchChange,
        handlePageChange,
        handleDisable,
        handleEnable,
        refetch
    };
};
