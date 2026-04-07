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
    token?: string; // Optional because initially it may not be provided if 2FA is needed
    admin?: {
        doc: string;
        nombre: string;
        correo: string;
        telefono: string;
    };
    requires_2fa?: boolean;
    email?: string; // Pre-auth email tracking
}

export interface Verify2FAPayload {
    email: string;
    code: string;
}

export interface Verify2FAResponse {
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

export interface NormalUser {
    id: string; // doc mapped to id
    nombre: string;
    correo: string;
    id_rol: number;
    nit_entidad: string;
    codigo_qr?: string;
    license_id?: number | null;
    license_status?: string | null;
    license_expired?: boolean;
    es_instructor: boolean;
}

export interface NormalAdminLoginResponse {
    token: string;
    user: NormalUser;
    requires_2fa?: boolean;
    email?: string;
}

export interface VerifyNormalAdmin2FAResponse {
    token: string;
    user: NormalUser;
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
 * Validar 2FA de SuperAdmin
 */
export const verifySuperAdmin2FA = async (payload: Verify2FAPayload): Promise<Verify2FAResponse> => {
    try {
        const response = await apiClient.post<Verify2FAResponse, Verify2FAPayload>('/superadmin/verify-2fa', payload);
        return response;
    } catch (error) {
        console.error('Error en verify 2FA SuperAdmin:', error);
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
 * Verify 2FA code for normal administrators (id_rol = 1)
 */
export const verifyNormalAdmin2FA = async (payload: Verify2FAPayload): Promise<VerifyNormalAdmin2FAResponse> => {
    try {
        const response = await apiClient.post<VerifyNormalAdmin2FAResponse, Verify2FAPayload>('/normaladmin/verify-2fa', payload);
        return response;
    } catch (error) {
        console.error('Error en verify 2FA NormalAdmin:', error);
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
