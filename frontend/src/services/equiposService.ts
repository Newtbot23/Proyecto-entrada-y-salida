import { apiClient } from '../config/api';

export interface IEquipo {
    serial?: string;
    categoria_equipo: 'Computo' | 'Electronica' | 'Herramientas' | 'Otros';
    tipo_equipo: 'sena' | 'propio';
    placa_sena?: string;
    id_marca?: number;
    estado: 'asignado' | 'no_asignado' | 'inhabilitado';
    modelo: string;
    tipo_equipo_desc: string;
    caracteristicas: string;
    id_sistema_operativo?: number;
    img_serial?: string;
}

export interface IMarca {
    id: number;
    marca: string;
}

export interface ISistemaOperativo {
    id: number;
    sistema_operativo: string;
}

export interface IEquiposCatalogs {
    marcas: IMarca[];
    sistemas_operativos: ISistemaOperativo[];
}

export const EquiposService = {
    /**
     * Get catalogs for equipment registration (Brands, OS).
     */
    getCatalogs: async (): Promise<IEquiposCatalogs> => {
        const response = await apiClient.get<IEquiposCatalogs>('/equipos/catalogs');
        return response;
    },

    /**
     * Register a new equipment.
     */
    create: async (data: IEquipo): Promise<{ message: string; equipo: IEquipo }> => {
        const response = await apiClient.post<{ message: string; equipo: IEquipo }>('/equipos', data);
        return response;
    },

    /**
     * Import equipment from CSV.
     */
    importCsv: async (file: File, batchName: string): Promise<{ success: boolean; message: string; data: { count: number } }> => {
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('lote_importacion', batchName);
        
        console.log('¿El FormData tiene el archivo justo antes de enviar?:', formData.get('archivo'));

        return await apiClient.post<{ success: boolean; message: string; data: { count: number } }>('/equipos/importar', formData, {
            headers: {
                'Accept': 'application/json'
            },
            transformRequest: [(data, headers) => {
                // Eliminamos cualquier Content-Type global que api.ts haya inyectado
                delete headers['Content-Type'];
                if (headers.common) {
                    delete headers.common['Content-Type'];
                }
                // Retornamos el FormData puro y sin tocar
                return data; 
            }]
        });
    },

    /**
     * Get unique batches with equipment counts.
     */
    getLotes: async (): Promise<any[]> => {
        return await apiClient.get<any[]>('/equipos/lotes');
    },

    /**
     * Rename an entire batch.
     */
    renombrarLote: async (nombreActual: string, nuevoNombre: string): Promise<any> => {
        return await apiClient.put('/equipos/lotes/renombrar', {
            nombre_actual: nombreActual,
            nuevo_nombre: nuevoNombre
        });
    },

    /**
     * Move a single equipment to another batch.
     */
    moverEquipoLote: async (equipoId: string, nuevoLote: string | null): Promise<any> => {
        return await apiClient.put(`/equipos/${equipoId}/mover-lote`, {
            nuevo_lote: nuevoLote
        });
    },

    /**
     * Get equipment filtered by batch name or those without batch.
     */
    getEquiposByLote: async (lote: string | 'sin_lote'): Promise<any[]> => {
        return await apiClient.get<any[]>(`/equipos/por-lote?lote=${lote}`);
    }
};
