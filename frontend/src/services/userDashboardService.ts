/**
 * User Dashboard Service
 * Handles catalogs, vehicles, and equipment for regular users.
 */
import { apiClient } from '../config/api';

// ============================================================================
// TIPOS
// ============================================================================

export interface CatalogData {
    tipos_vehiculo: { id: number; tipo_vehiculo: string }[];
    marcas_equipo: { id: number; marca: string }[];
    sistemas_operativos: { id: number; sistema_operativo: string }[];
}

export interface Vehiculo {
    id?: number;
    placa: string;
    tipo?: string;
    tipo_vehiculo?: string;
    id_tipo_vehiculo?: string;
    marca: string;
    modelo: string;
    color: string;
    descripcion?: string;
}

export interface Equipo {
    id?: number;
    serial: string;
    marca?: string;
    id_marca?: string;
    modelo: string;
    tipo_equipo_desc?: string;
    caracteristicas?: string;
    so?: string;
    id_sistema_operativo?: string;
}

// ============================================================================
// FUNCIONES
// ============================================================================

/**
 * Obtener catálogos (tipos de vehículo, marcas de equipo, sistemas operativos)
 */
export const getCatalogs = async (): Promise<CatalogData> => {
    try {
        const response = await apiClient.get<CatalogData>('/user/catalogs');
        return response;
    } catch (error) {
        console.error('Error fetching catalogs:', error);
        throw error;
    }
};

/**
 * Obtener vehículos del usuario
 */
export const getUserVehiculos = async (): Promise<Vehiculo[]> => {
    try {
        const response = await apiClient.get<Vehiculo[]>('/user/vehiculos');
        return response;
    } catch (error) {
        console.error('Error fetching user vehiculos:', error);
        throw error;
    }
};

/**
 * Obtener equipos del usuario
 */
export const getUserEquipos = async (): Promise<Equipo[]> => {
    try {
        const response = await apiClient.get<Equipo[]>('/user/equipos');
        return response;
    } catch (error) {
        console.error('Error fetching user equipos:', error);
        throw error;
    }
};

/**
 * Registrar un vehículo
 */
export const storeVehiculo = async (data: Partial<Vehiculo>): Promise<Vehiculo> => {
    try {
        const response = await apiClient.post<Vehiculo, Partial<Vehiculo>>('/user/vehiculos', data);
        return response;
    } catch (error) {
        console.error('Error storing vehiculo:', error);
        throw error;
    }
};

/**
 * Registrar un equipo
 */
export const storeEquipo = async (data: Partial<Equipo>): Promise<Equipo> => {
    try {
        const response = await apiClient.post<Equipo, Partial<Equipo>>('/user/equipos', data);
        return response;
    } catch (error) {
        console.error('Error storing equipo:', error);
        throw error;
    }
};

/**
 * Obtener tipos de documento
 */
export const getTiposDoc = async (): Promise<any[]> => {
    try {
        const response = await apiClient.get<any[]>('/tipo-doc');
        return response;
    } catch (error) {
        console.error('Error fetching tipos doc:', error);
        throw error;
    }
};
