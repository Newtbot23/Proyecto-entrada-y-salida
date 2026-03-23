import { apiClient } from '../config/api';
import type { 
    UserDashboardCatalog, 
    Vehiculo, 
    Equipo, 
    OCRPlateResponse, 
    OCRSerialResponse, 
    TipoDoc, 
    SessionCheckResponse,
    ApiResponse
} from '../types';

/**
 * Obtener catálogos (tipos de vehículo, marcas de equipo, sistemas operativos)
 */
export const getCatalogs = async (): Promise<UserDashboardCatalog> => {
    try {
        return await apiClient.get<UserDashboardCatalog>('/user/catalogs');
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
        return await apiClient.get<Vehiculo[]>('/user/vehiculos');
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
        return await apiClient.get<Equipo[]>('/user/equipos');
    } catch (error) {
        console.error('Error fetching user equipos:', error);
        throw error;
    }
};

/**
 * Registrar un vehículo (soporta FormData para imágenes)
 */
export const storeVehiculo = async (data: FormData | Partial<Vehiculo>): Promise<Vehiculo> => {
    try {
        return await apiClient.post<Vehiculo, FormData | Partial<Vehiculo>>('/user/vehiculos', data);
    } catch (error) {
        console.error('Error storing vehiculo:', error);
        throw error;
    }
};

/**
 * Registrar un equipo (soporta FormData para imágenes)
 */
export const storeEquipo = async (data: FormData | Partial<Equipo>): Promise<Equipo> => {
    try {
        return await apiClient.post<Equipo, FormData | Partial<Equipo>>('/user/equipos', data);
    } catch (error) {
        console.error('Error storing equipo:', error);
        throw error;
    }
};

/**
 * Leer placa desde imagen (OCR)
 */
export const readPlate = async (formData: FormData): Promise<OCRPlateResponse> => {
    try {
        return await apiClient.post<OCRPlateResponse, FormData>('/ocr/read-plate', formData);
    } catch (error) {
        console.error('Error reading plate OCR:', error);
        throw error;
    }
};

/**
 * Leer serial desde imagen (OCR)
 */
export const readSerial = async (formData: FormData): Promise<OCRSerialResponse> => {
    try {
        return await apiClient.post<OCRSerialResponse, FormData>('/ocr/read-serial', formData);
    } catch (error) {
        console.error('Error reading serial OCR:', error);
        throw error;
    }
};

/**
 * Obtener tipos de documento
 */
export const getTiposDoc = async (): Promise<TipoDoc[]> => {
    try {
        return await apiClient.get<TipoDoc[]>('/tipo-doc');
    } catch (error) {
        console.error('Error fetching tipos doc:', error);
        throw error;
    }
};

/**
 * Establecer un activo como predeterminado
 */
export const setDefaultAsset = async (tipo: 'vehiculo' | 'equipo', id: string): Promise<ApiResponse<any>> => {
    try {
        return await apiClient.patch<ApiResponse<any>, Record<string, never>>(`/user/activos/${tipo}/${id}/set-default`, {});
    } catch (error) {
        console.error(`Error setting default for ${tipo}:`, error);
        throw error;
    }
};

/**
 * Cambiar el estado de un activo (vehículo o equipo)
 */
export const toggleAssetStatus = async (tipo: 'vehiculo' | 'equipo', id: string): Promise<ApiResponse<any>> => {
    try {
        return await apiClient.patch<ApiResponse<any>, Record<string, never>>(`/user/activos/${tipo}/${id}/toggle-estado`, {});
    } catch (error) {
        console.error(`Error toggling status for ${tipo}:`, error);
        throw error;
    }
};

/**
 * Verificar si el usuario tiene una sesión activa prolongada (> 6.5h)
 */
export const checkActiveSession = async (): Promise<SessionCheckResponse> => {
    try {
        const response = await apiClient.get<SessionCheckResponse>('/user/check-active-session');
        return response;
    } catch (error) {
        console.error('Error checking active session:', error);
        return { warning: false };
    }
};
