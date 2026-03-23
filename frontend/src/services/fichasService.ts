import { apiClient } from '../config/api';
import type { Ficha, FichaCatalogs, Usuario, ApiResponse } from '../types';

const api = apiClient;

export const updateDetalle = async (fichaId: number | string, usuarioDoc: string, tipo_participante: string): Promise<ApiResponse<any>> => {
    return await api.patch<ApiResponse<any>, { tipo_participante: string }>(`/fichas/${fichaId}/usuarios/${usuarioDoc}/rol`, {
        tipo_participante
    });
};

export const updateFichaEstado = async (fichaId: number | string, estado: string): Promise<ApiResponse<any>> => {
    return await api.patch<ApiResponse<any>, { estado: string }>(`/fichas/${fichaId}/estado`, { estado });
};

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

    getUsuariosAsignables: async (): Promise<Usuario[]> => {
        const response = await apiClient.get<Usuario[]>('/usuarios/asignables');
        return response || [];
    },

    createFicha: async (data: Partial<Ficha>): Promise<Ficha> => {
        return await apiClient.post<Ficha, Partial<Ficha>>('/fichas', data);
    },

    getFichaUsuarios: async (id: number): Promise<Usuario[]> => {
        const response = await apiClient.get<Usuario[]>(`/fichas/${id}/usuarios`);
        return response || [];
    },

    asignarUsuarios: async (id: number, usuarios: number[] | string[]): Promise<ApiResponse<any>> => {
        return await apiClient.post<ApiResponse<any>, { usuarios: (number | string)[] }>(`/fichas/${id}/asignar`, { usuarios });
    },

    buscarPorNumero: async (numero: string): Promise<Ficha> => {
        const response = await apiClient.get<Ficha>(`/fichas/buscar/${numero}`);
        return response;
    },

    getUsuariosDeFicha: async (id: number): Promise<Usuario[]> => {
        const response = await apiClient.get<Usuario[]>(`/fichas/${id}/usuarios-detallados`);
        return response || [];
    },

    actualizarRolParticipante: async (detalleId: number, tipoParticipante: string): Promise<ApiResponse<any>> => {
        return await apiClient.patch<ApiResponse<any>, { tipo_participante: string }>(`/fichas/detalle/${detalleId}`, { tipo_participante: tipoParticipante });
    }
};
