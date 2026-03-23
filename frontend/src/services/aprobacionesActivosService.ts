import { apiClient } from '../config/api';

export interface ActivoPendiente {
    id: string; // placa o serial
    placa: string;
    tipo_activo: 'vehiculo' | 'equipo';
    descripcion_tipo: string;
    marca: string;
    usuario_nombres: string;
    usuario_apellidos: string;
    usuario_doc: number;
    foto_usuario?: string;
    imagen?: string;
    created_at: string;
}

/**
 * Obtener la lista de activos pendientes de aprobación
 */
export const getActivosPendientes = async (): Promise<ActivoPendiente[]> => {
    try {
        const response = await apiClient.get<ActivoPendiente[]>('/admin/activos-pendientes');
        return response;
    } catch (error) {
        console.error('Error fetching activos pendientes:', error);
        throw error;
    }
};

/**
 * Actualizar el estado de un activo (aprobar o rechazar)
 */
export const updateActivoEstado = async (
    tipo: string, 
    id: string, 
    estado: 'activo' | 'inactivo'
): Promise<any> => {
    try {
        const response = await apiClient.patch<any, any>(`/admin/activos/${tipo}/${id}/estado`, {
            estado_aprobacion: estado
        });
        return response;
    } catch (error) {
        console.error(`Error updating asset status for ${tipo} ${id}:`, error);
        throw error;
    }
};
