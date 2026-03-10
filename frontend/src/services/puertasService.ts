/**
 * Puertas Service
 * Handles access control operations (personas and vehicles).
 */
import { apiClient } from '../config/api';

// ============================================================================
// TIPOS
// ============================================================================

export interface PersonaSearchResult {
    usuario: {
        doc: string;
        nombre: string;
        rol?: string;
    };
    equipos: {
        serial: string;
        marca: string;
        modelo: string;
        tipo_equipo: string;
    }[];
    estaAdentro: boolean;
    id_registro: number | null;
}

export interface VehiculoSearchResult {
    vehiculos: {
        placa: string;
        tipo_vehiculo: string;
        marca: string;
        modelo: string;
        color: string;
        doc: string;
        usuario_nombre: string;
    }[];
    equipos: {
        serial: string;
        marca: string;
        modelo: string;
        tipo_equipo: string;
    }[];
    registrosAbiertos: {
        id: number;
        doc: string;
        serial_equipo: string | null;
        placa: string | null;
    }[];
}

export interface RegistrarActividadPayload {
    doc: string;
    accion: 'entrada' | 'salida';
    serial_equipo?: string | null;
    placa?: string;
    id_registro?: number | null;
}

export interface RegistrarActividadResponse {
    message: string;
}

// ============================================================================
// FUNCIONES
// ============================================================================

/**
 * Buscar persona por documento
 */
export const searchPersona = async (doc: string): Promise<PersonaSearchResult> => {
    try {
        const response = await apiClient.get<PersonaSearchResult>(`/puertas/search-persona?doc=${doc}`);
        return response;
    } catch (error) {
        console.error('Error searching persona:', error);
        throw error;
    }
};

/**
 * Buscar vehículo por placa o documento
 */
export const searchVehiculo = async (query: string): Promise<VehiculoSearchResult> => {
    try {
        const response = await apiClient.get<VehiculoSearchResult>(`/puertas/search-vehiculo?query=${query}`);
        return response;
    } catch (error) {
        console.error('Error searching vehiculo:', error);
        throw error;
    }
};

/**
 * Registrar actividad de entrada/salida
 */
export const registrarActividad = async (payload: RegistrarActividadPayload): Promise<RegistrarActividadResponse> => {
    try {
        const response = await apiClient.post<RegistrarActividadResponse, RegistrarActividadPayload>('/puertas/registrar-actividad', payload);
        return response;
    } catch (error) {
        console.error('Error registrando actividad:', error);
        throw error;
    }
};
