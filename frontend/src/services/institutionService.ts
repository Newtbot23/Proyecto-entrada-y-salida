import { apiClient } from '../config/api';
import type {
    Entidad,
    CreateEntityDTO,
    InstitutionFilters,
    PaginatedResponse,
    ApiResponse
} from '../types';

// ============================================================================
// FUNCIONES DE SERVICIO - OPERACIONES CRUD
// ============================================================================

/**
 * Obtener lista de instituciones con filtros y paginación
 */
export const getInstitutions = async (
    filters: InstitutionFilters,
    page: number = 1,
    perPage: number = 10
): Promise<PaginatedResponse<Entidad>> => {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('per_page', perPage.toString());

        if (filters.search && filters.search.trim()) {
            params.append('search', filters.search.trim());
        }

        filters.statuses.forEach(status => {
            params.append('status[]', status);
        });

        if (filters.minLicenses !== undefined) {
            params.append('min_licenses', filters.minLicenses.toString());
        }
        if (filters.maxLicenses !== undefined) {
            params.append('max_licenses', filters.maxLicenses.toString());
        }

        const response = await apiClient.get<{
            data: Entidad[];
            total: number;
            current_page: number;
            per_page: number;
            last_page: number;
        }>(`/entidades?${params.toString()}`);

        return {
            data: response.data,
            meta: {
                currentPage: response.current_page,
                totalPages: response.last_page,
                totalItems: response.total,
                itemsPerPage: response.per_page
            }
        };
    } catch (error) {
        console.error('Error fetching institutions:', error);
        throw error;
    }
};

/**
 * Obtener una institución específica por ID (NIT)
 */
export const getInstitutionById = async (
    id: string | number
): Promise<Entidad | null> => {
    try {
        return await apiClient.get<Entidad>(`/entidades/${id}`);
    } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
            console.warn(`Institution with NIT ${id} not found`);
            return null;
        }
        console.error(`Error fetching institution ${id}:`, error);
        throw error;
    }
};

/**
 * Crear una nueva institución
 */
export const createInstitution = async (
    data: CreateEntityDTO
): Promise<Entidad> => {
    try {
        const newInstitution = await apiClient.post<Entidad, CreateEntityDTO>(
            '/entidades',
            data
        );
        console.log('Institution created successfully:', newInstitution.nit);
        return newInstitution;
    } catch (error) {
        console.error('Error creating institution:', error);
        throw error;
    }
};

/**
 * Actualizar una institución existente
 */
export const updateInstitution = async (
    id: string | number,
    data: Partial<CreateEntityDTO>
): Promise<Entidad> => {
    try {
        const updatedInstitution = await apiClient.put<Entidad, Partial<CreateEntityDTO>>(
            `/entidades/${id}`,
            data
        );
        console.log('Institution updated successfully:', id);
        return updatedInstitution;
    } catch (error) {
        console.error(`Error updating institution ${id}:`, error);
        throw error;
    }
};

/**
 * Eliminar una institución
 */
export const deleteInstitution = async (
    id: string | number
): Promise<void> => {
    try {
        await apiClient.delete(`/entidades/${id}`);
        console.log('Institution deleted successfully:', id);
    } catch (error) {
        console.error(`Error deleting institution ${id}:`, error);
        throw error;
    }
};

/**
 * Deshabilitar/desactivar una institución
 */
export const disableInstitution = async (
    id: string | number
): Promise<ApiResponse<any>> => {
    try {
        return await apiClient.put<ApiResponse<any>, { estado: string }>(`/entidades/${id}`, {
            estado: 'inactivo'
        });
    } catch (error) {
        console.error(`Error disabling institution ${id}:`, error);
        throw error;
    }
};

/**
 * Habilitar/activar una institución
 */
export const enableInstitution = async (
    id: string | number
): Promise<ApiResponse<any>> => {
    try {
        return await apiClient.put<ApiResponse<any>, { estado: string }>(`/entidades/${id}`, {
            estado: 'activo'
        });
    } catch (error) {
        console.error(`Error enabling institution ${id}:`, error);
        throw error;
    }
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Validar formato de NIT colombiano
 * 
 * Valida que el NIT tenga el formato correcto: 
 * - De 9 a 15 caracteres
 * - Solo números y guión
 * - Formato común: 123456789-0
 * 
 * @param nit - NIT a validar
 * @returns true si el formato es válido
 * 
 * @example
 * isValidNIT('899999063-3'); // true
 * isValidNIT('12345'); // false
 */
export const isValidNIT = (nit: string): boolean => {
    // Formato básico: números y un guión opcional seguido de dígito verificador
    const nitRegex = /^\d{6,14}-?\d$/;
    return nitRegex.test(nit);
};

/**
 * Formatear NIT con guión
 * 
 * Toma un NIT sin formato y lo formatea agregando el guión antes
 * del dígito verificador si no lo tiene.
 * 
 * @param nit - NIT sin formato
 * @returns NIT formateado
 * 
 * @example
 * formatNIT('8999990633'); // '899999063-3'
 * formatNIT('899999063-3'); // '899999063-3' (ya formateado)
 */
export const formatNIT = (nit: string): string => {
    // Remover espacios y guiones existentes
    const clean = nit.replace(/[\s-]/g, '');

    // Si ya tiene el formato correcto, retornar
    if (nit.includes('-')) return nit;

    // Agregar guión antes del último dígito
    if (clean.length >= 2) {
        return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
    }

    return clean;
};






