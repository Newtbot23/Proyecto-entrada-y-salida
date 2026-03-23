import { apiClient } from '../config/api';

export interface Registro {
    id: number;
    fecha: string;
    hora_entrada: string;
    hora_salida?: string;
    placa?: string;
    seriales_equipos?: string;
    vehiculo_marca?: string;
    vehiculo_modelo?: string;
    vehiculo_color?: string;
    equipos?: {
        serial: string;
        marca: string;
        modelo: string;
    }[];
}

/**
 * Obtener el historial de entradas del usuario
 */
export const getUserEntradas = async (fecha?: string): Promise<Registro[]> => {
    try {
        let url = '/user/entradas';
        if (fecha) url += `?fecha=${fecha}`;
        
        const response = await apiClient.get<Registro[]>(url);
        return response;
    } catch (error) {
        console.error('Error fetching user entradas:', error);
        throw error;
    }
};

/**
 * Exportar el historial de entradas a PDF
 */
export const exportHistoryPdf = async (fecha?: string): Promise<Blob> => {
    try {
        let url = '/user/history/export-pdf';
        if (fecha) {
            url += `?date=${fecha}`;
        }
        
        // Usar el método getBlob específico del apiClient
        const response = await apiClient.getBlob(url);
        return response;
    } catch (error) {
        console.error('Error exporting history PDF:', error);
        throw error;
    }
};
