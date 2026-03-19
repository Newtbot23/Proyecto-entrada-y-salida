import { apiClient } from '../config/api';

const api = apiClient;

export const updateDetalle = async (fichaId: number | string, usuarioDoc: string, tipo_participante: string) => {
    const response = await api.patch<any>(`/fichas/${fichaId}/usuarios/${usuarioDoc}/rol`, {
        tipo_participante
    });
    return response.data;
};

export const updateFichaEstado = async (fichaId: number | string, estado: string) => {
    const response = await api.patch<any>(`/fichas/${fichaId}/estado`, { estado });
    return response.data;
};

export interface Ficha {
    id: number;
    numero_ficha: number;
    id_programa: string;
    numero_ambiente: string;
    id_jornada: number;
    estado: string;
    programa?: { programa: string };
    ambiente?: { numero_ambiente: string; ambiente: string };
    jornada?: { jornada: string };
    usuarios_count?: number;
}

export interface FichaCatalogs {
    programas: { id: string; programa: string }[];
    ambientes: { numero_ambiente: string; ambiente: string }[];
    jornadas: { id: number; jornada: string }[];
}

export const FichasService = {
    getCatalogs: async (): Promise<FichaCatalogs> => {
        const response = await apiClient.get<FichaCatalogs>('/fichas/catalogs');
        return response || { programas: [], ambientes: [], jornadas: [] };
    },

    getFichas: async (): Promise<Ficha[]> => {
        const response = await apiClient.get<Ficha[]>('/fichas');
        return response || [];
    },

    getFichasSinUsuarios: async (): Promise<Ficha[]> => {
        const response = await apiClient.get<Ficha[]>('/fichas/sin-usuarios');
        return response || [];
    },

    getUsuariosAsignables: async (): Promise<any[]> => {
        const response = await apiClient.get<any[]>('/usuarios/asignables');
        return response || [];
    },

    createFicha: async (data: any): Promise<any> => {
        // apiClient.post already returns response.data (or response)
        // We return it directly to the mutation
        return await apiClient.post('/fichas', data);
    },

    getFichaUsuarios: async (id: number): Promise<any> => {
        const response = await apiClient.get<any>(`/fichas/${id}/usuarios`);
        return response || [];
    },

    asignarUsuarios: async (id: number, usuarios: number[]): Promise<any> => {
        return await apiClient.post(`/fichas/${id}/asignar`, { usuarios });
    },

    buscarPorNumero: async (numero: string): Promise<Ficha> => {
        const response = await apiClient.get<Ficha>(`/fichas/buscar/${numero}`);
        return response;
    },

    getUsuariosDeFicha: async (id: number): Promise<any[]> => {
        const response = await apiClient.get<any[]>(`/fichas/${id}/usuarios-detallados`);
        return response || [];
    },

    actualizarRolParticipante: async (detalleId: number, tipoParticipante: string): Promise<any> => {
        return await apiClient.patch(`/fichas/detalle/${detalleId}`, { tipo_participante: tipoParticipante });
    }
};
