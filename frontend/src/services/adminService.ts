/**
 * Admin Service
 * Handles CRUD operations for SuperAdmin management.
 */
import { apiClient } from '../config/api';
import type { Admin, AdminFormData } from '../types/admin';

// ============================================================================
// FUNCIONES
// ============================================================================

/**
 * Obtener lista de admins
 */
export const getAdmins = async (): Promise<Admin[]> => {
    try {
        // La respuesta tiene la estructura paginada: { data: Admin[] }
        const response = await apiClient.get<any>('/admins');
        return response.data;
    } catch (error) {
        console.error('Error fetching admins:', error);
        throw error;
    }
};

/**
 * Crear un nuevo admin
 */
export const createAdmin = async (formData: AdminFormData): Promise<Admin> => {
    try {
        const response = await apiClient.post<Admin, AdminFormData>('/admins', formData);
        return response;
    } catch (error) {
        console.error('Error creating admin:', error);
        throw error;
    }
};

/**
 * Actualizar un admin existente
 */
export const updateAdmin = async (doc: string, formData: AdminFormData): Promise<Admin> => {
    try {
        const response = await apiClient.put<Admin, AdminFormData>(`/admins/${doc}`, formData);
        return response;
    } catch (error) {
        console.error('Error updating admin:', error);
        throw error;
    }
};

/**
 * Eliminar un admin
 */
export const deleteAdmin = async (doc: string): Promise<void> => {
    try {
        await apiClient.delete(`/admins/${doc}`);
    } catch (error) {
        console.error('Error deleting admin:', error);
        throw error;
    }
};
