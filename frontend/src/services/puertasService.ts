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
        img_serial?: string;
        es_predeterminado?: boolean | number;
    }[];
    estaAdentro: boolean;
    registro_activo?: {
        id: number;
        seriales_equipos: string[];
        equipos_registrados: any[];
    } | null;
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
        img_vehiculo?: string;
        es_predeterminado?: boolean | number;
    }[];
    equipos: {
        serial: string;
        marca: string;
        modelo: string;
        tipo_equipo: string;
        img_serial?: string;
        es_predeterminado?: boolean | number;
    }[];
    registrosAbiertos: {
        id: number;
        doc: string;
        seriales_equipos: string[];
        equipos_adentro?: {
            serial: string;
            marca: string;
            modelo: string;
            tipo_equipo: string;
            img_serial?: string;
        }[];
        placa: string | null;
    }[];
    registro_activo?: {
        id: number;
        doc: string;
        seriales_equipos: string[];
        equipos_adentro?: any[];
        placa: string | null;
    } | null;
}

export interface RegistrarActividadPayload {
    doc: string;
    accion: 'entrada' | 'salida';
    seriales_equipos?: string[] | null;
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
