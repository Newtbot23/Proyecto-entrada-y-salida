import { apiClient } from '../config/api';

export const AreasService = {
    /**
     * Get all areas with user counts.
     */
    getAreas: async (): Promise<any[]> => {
        const res = await apiClient.get<any[]>('/areas');
        return res || [];
    },

    /**
     * Create a new area.
     */
    createArea: async (data: { nombre: string; descripcion?: string }): Promise<any> => {
        return await apiClient.post('/areas', data);
    },

    /**
     * Get users of a specific area.
     */
    getUsuariosDeArea: async (id: number): Promise<any[]> => {
        const res = await apiClient.get<any[]>(`/areas/${id}/usuarios`);
        return res || [];
    },

    /**
     * Sync users to an area.
     */
    asignarUsuarios: async (id: number, usuarios: number[]): Promise<any> => {
        return await apiClient.post(`/areas/${id}/asignar`, { usuarios });
    },

    /**
     * Get a map of doc -> area_nombre for all admin users.
     * Used by FichasAssign to show the "Administrativo" badge.
     */
    getAdministrativos: async (): Promise<Record<number, { doc: number; area_nombre: string }>> => {
        const res = await apiClient.get<Record<number, { doc: number; area_nombre: string }>>('/areas/administrativos');
        return res || {};
    },
};
