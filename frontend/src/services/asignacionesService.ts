import { apiClient } from '../config/api';

export interface MasiveAssignmentResponse {
    success: boolean;
    message: string;
    codigo_lote?: string;
    total_asignaciones?: number;
    detalles?: any[];
}

export const AsignacionesService = {
    asignarMasivamente: async (idFicha: number | string, loteImportacion: string): Promise<MasiveAssignmentResponse> => {
        return await apiClient.post<MasiveAssignmentResponse>('/asignaciones/masivas', {
            id_ficha: idFicha,
            lote_importacion: loteImportacion
        });
    },
    getHistorialAsignaciones: async (): Promise<any[]> => {
        return await apiClient.get<any[]>('/asignaciones/historial');
    }
};
