/**
 * Auth Service
 * Handles authentication for SuperAdmin and NormalAdmin.
 */
import { apiClient, ApiError } from '../config/api';

// ============================================================================
// TIPOS
// ============================================================================

export interface SuperAdminLoginPayload {
    correo: string;
    contrasena: string;
}

export interface SuperAdminLoginResponse {
    token: string;
    admin: {
        doc: string;
        nombre: string;
        correo: string;
        telefono: string;
    };
}

export interface NormalAdminLoginPayload {
    correo: string;
    contrasena: string;
}

export interface NormalAdminLoginResponse {
    token: string;
    user: {
        doc: string;
        nombre: string;
        correo: string;
        id_rol: number;
        nit_entidad: string;
        license_status?: string;
        license_expired?: boolean;
    };
}

export interface NormalAdminStats {
    active_users: number;
    daily_accesses: number;
    entity: {
        nombre: string;
        nit: string;
        direccion: string;
    };
    license: {
        estado: string;
        fecha_vencimiento: string;
        plan_nombre: string;
    };
}

// ============================================================================
// FUNCIONES
// ============================================================================

/**
 * Login de SuperAdmin
 */
export const loginSuperAdmin = async (payload: SuperAdminLoginPayload): Promise<SuperAdminLoginResponse> => {
    try {
        const response = await apiClient.post<SuperAdminLoginResponse, SuperAdminLoginPayload>('/admins/login', payload);
        return response;
    } catch (error) {
        console.error('Error en login SuperAdmin:', error);
        throw error;
    }
};

/**
 * Login de NormalAdmin / Usuario
 */
export const loginNormalAdmin = async (payload: NormalAdminLoginPayload): Promise<NormalAdminLoginResponse> => {
    try {
        const response = await apiClient.post<NormalAdminLoginResponse, NormalAdminLoginPayload>('/normaladmin/login', payload);
        return response;
    } catch (error) {
        console.error('Error en login NormalAdmin:', error);
        throw error;
    }
};

/**
 * Obtener estadísticas del panel NormalAdmin
 */
export const getNormalAdminStats = async (): Promise<NormalAdminStats> => {
    try {
        const response = await apiClient.get<NormalAdminStats>('/normal-admin/stats');
        return response;
    } catch (error) {
        console.error('Error fetching normal admin stats:', error);
        throw error;
    }
};

export { ApiError };
