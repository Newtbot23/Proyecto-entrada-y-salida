/**
 * Institution Service
 * 
 * Servicio que maneja todas las operaciones CRUD para instituciones.
 * Se comunica con el backend Laravel a través del cliente HTTP centralizado.
 * 
 * Endpoints de Laravel:
 * - GET    /api/entidades           -> Listar todas las instituciones
 * - GET    /api/entidades/{id}      -> Obtener una institución específica
 * - POST   /api/entidades           -> Crear nueva institución
 * - PUT    /api/entidades/{id}      -> Actualizar institución completa
 * - DELETE /api/entidades/{id}      -> Eliminar institución
 * 
 * @author Tu nombre
 * @version 1.0.0
 */

import { apiClient } from '../config/api';
import type {
    Institution,
    InstitutionFormData,
    InstitutionFilters,
    PaginatedResponse
} from '../types/institution';

// ============================================================================
// FUNCIONES DE SERVICIO - OPERACIONES CRUD
// ============================================================================

/**
 * Obtener lista de instituciones con filtros y paginación
 * 
 * Esta función realiza una petición GET al backend Laravel para obtener
 * instituciones filtradas según los criterios especificados.
 * 
 * IMPORTANTE: Laravel devuelve los datos en formato:
 * {
 *   success: true,
 *   data: [...instituciones...],
 *   total: 100
 * }
 * 
 * @param filters - Objeto con criterios de filtrado (búsqueda, estados, licencias)
 * @param page - Número de página actual (default: 1)
 * @param perPage - Cantidad de items por página (default: 10)
 * @returns Promise con datos paginados de instituciones
 * 
 * @example
 * const filters = {
 *   search: 'Universidad',
 *   statuses: ['active'],
 *   minLicenses: 5
 * };
 * const result = await getInstitutions(filters, 1, 10);
 * console.log(result.data); // Array de instituciones
 * console.log(result.meta); // Información de paginación
 */
export const getInstitutions = async (
    filters: InstitutionFilters,
    page: number = 1,
    perPage: number = 10
): Promise<PaginatedResponse<Institution>> => {
    try {
        // Construir parámetros de query string
        const params = new URLSearchParams();

        // Agregar paginación
        params.append('page', page.toString());
        params.append('per_page', perPage.toString());

        // Agregar búsqueda si existe
        if (filters.search && filters.search.trim()) {
            params.append('search', filters.search.trim());
        }

        // Agregar filtros de estado
        // Laravel espera: status[]=active&status[]=inactive
        filters.statuses.forEach(status => {
            params.append('status[]', status);
        });

        // Agregar filtros de licencias
        if (filters.minLicenses !== undefined) {
            params.append('min_licenses', filters.minLicenses.toString());
        }
        if (filters.maxLicenses !== undefined) {
            params.append('max_licenses', filters.maxLicenses.toString());
        }

        // Hacer la petición GET al backend
        // Laravel debe responder con estructura paginada
        const response = await apiClient.get<{
            data: Institution[];
            total: number;
            current_page: number;
            per_page: number;
            last_page: number;
        }>(`/entidades?${params.toString()}`);

        // Transformar respuesta de Laravel a formato esperado por el frontend
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
 * Obtener una institución específica por ID
 * 
 * Realiza petición GET a Laravel para obtener los detalles completos
 * de una institución incluyendo timestamps y conteo de licencias.
 * 
 * @param id - ID de la institución (puede ser string o number)
 * @returns Promise con datos de la institución o null si no existe
 * 
 * @example
 * const institution = await getInstitutionById(5);
 * if (institution) {
 *   console.log(institution.nombre_entidad);
 * } else {
 *   console.log('Institución no encontrada');
 * }
 */
export const getInstitutionById = async (
    id: string | number
): Promise<Institution | null> => {
    try {
        // GET /api/entidades/{id}
        const institution = await apiClient.get<Institution>(`/entidades/${id}`);
        return institution;
    } catch (error) {
        // Si Laravel devuelve 404, retornar null
        if (error instanceof Error && error.message.includes('404')) {
            console.warn(`Institution with ID ${id} not found`);
            return null;
        }
        console.error(`Error fetching institution ${id}:`, error);
        throw error;
    }
};

/**
 * Crear una nueva institución
 * 
 * Envía petición POST a Laravel con los datos del formulario.
 * Laravel validará los datos y creará el registro en la base de datos.
 * 
 * Validaciones que realiza Laravel:
 * - nombre_entidad: requerido, max 255 caracteres
 * - correo: requerido, email válido, único, max 255
 * - direccion: requerido, max 255
 * - nombre_titular: requerido, max 255
 * - telefono: requerido, max 20
 * - nit: requerido, único, max 50
 * 
 * @param data - Datos del formulario de institución
 * @returns Promise con la institución creada (incluye ID y timestamps)
 * @throws Error si la validación falla o hay duplicados
 * 
 * @example
 * const newInstitution = await createInstitution({
 *   nombre_entidad: 'Universidad Nacional',
 *   correo: 'contacto@unacional.edu.co',
 *   direccion: 'Calle 45 #26-85',
 *   nombre_titular: 'Dr. Juan Pérez',
 *   telefono: '+57 1 3165000',
 *   nit: '899999063-3'
 * });
 * console.log('ID asignado:', newInstitution.id);
 */
export const createInstitution = async (
    data: InstitutionFormData
): Promise<Institution> => {
    try {
        // POST /api/entidades
        // Laravel validará y creará el registro
        const newInstitution = await apiClient.post<Institution, InstitutionFormData>(
            '/entidades',
            data
        );

        console.log('Institution created successfully:', newInstitution.id);
        return newInstitution;
    } catch (error) {
        console.error('Error creating institution:', error);
        // El error ya viene formateado por apiClient con mensajes de validación
        throw error;
    }
};

/**
 * Actualizar una institución existente
 * 
 * Envía petición PUT a Laravel con los datos actualizados.
 * Solo se actualizan los campos proporcionados.
 * 
 * NOTA: El NIT no se puede modificar una vez creado (regla de negocio)
 * 
 * @param id - ID de la institución a actualizar
 * @param data - Datos a actualizar (pueden ser parciales)
 * @returns Promise con la institución actualizada
 * @throws Error si la institución no existe o validación falla
 * 
 * @example
 * const updated = await updateInstitution(5, {
 *   telefono: '+57 1 9999999'
 * });
 * console.log('Teléfono actualizado:', updated.telefono);
 */
export const updateInstitution = async (
    id: string | number,
    data: Partial<InstitutionFormData>
): Promise<Institution> => {
    try {
        // PUT /api/entidades/{id}
        // Laravel validará y actualizará solo campos enviados
        const updatedInstitution = await apiClient.put<Institution, Partial<InstitutionFormData>>(
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
 * 
 * Envía petición DELETE a Laravel para eliminar permanentemente
 * una institución de la base de datos.
 * 
 * ADVERTENCIA: Esta es una eliminación permanente (hard delete).
 * Si se requiere mantener historial, considerar implementar soft delete
 * agregando campo 'deleted_at' en Laravel.
 * 
 * @param id - ID de la institución a eliminar
 * @returns Promise que se resuelve cuando la eliminación es exitosa
 * @throws Error si la institución no existe o tiene dependencias
 * 
 * @example
 * try {
 *   await deleteInstitution(5);
 *   console.log('Institución eliminada exitosamente');
 * } catch (error) {
 *   console.error('No se pudo eliminar:', error.message);
 * }
 */
export const deleteInstitution = async (
    id: string | number
): Promise<void> => {
    try {
        // DELETE /api/entidades/{id}
        await apiClient.delete(`/entidades/${id}`);
        console.log('Institution deleted successfully:', id);
    } catch (error) {
        console.error(`Error deleting institution ${id}:`, error);
        throw error;
    }
};

/**
 * Deshabilitar/desactivar una institución
 * 
 * Cambia el estado de la institución a 'inactive' sin eliminarla.
 * Esto es un soft disable que mantiene los datos pero marca la institución
 * como inactiva.
 * 
 * NOTA: Esta función usa PATCH para actualización parcial del estado
 * 
 * @param id - ID de la institución a deshabilitar
 * @returns Promise que se resuelve cuando se completa la actualización
 * 
 * @example
 * await disableInstitution(5);
 * console.log('Institución deshabilitada');
 */
export const disableInstitution = async (
    id: string | number
): Promise<void> => {
    try {
        // Actualizar solo el campo status a 'inactive'
        // Usando PUT ya que Laravel maneja PUT y PATCH de forma similar
        await apiClient.put(`/entidades/${id}`, {
            status: 'inactive'
        });

        console.log('Institution disabled successfully:', id);
    } catch (error) {
        console.error(`Error disabling institution ${id}:`, error);
        throw error;
    }
};

/**
 * Habilitar/activar una institución
 * 
 * Cambia el estado de la institución a 'active'.
 * Útil para reactivar instituciones que fueron deshabilitadas previamente.
 * 
 * @param id - ID de la institución a habilitar
 * @returns Promise que se resuelve cuando se completa la actualización
 * 
 * @example
 * await enableInstitution(5);
 * console.log('Institución habilitada');
 */
export const enableInstitution = async (
    id: string | number
): Promise<void> => {
    try {
        await apiClient.put(`/entidades/${id}`, {
            status: 'active'
        });

        console.log('Institution enabled successfully:', id);
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






