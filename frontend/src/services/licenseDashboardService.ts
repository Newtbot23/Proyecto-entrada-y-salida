import { apiClient } from '../config/api';

export interface DashboardStats {
    active_institutions: number;
    expiring_licenses: number;
    total_revenue: number;
}

export interface LicenseData {
    id: number;
    fecha_inicio: string;
    fecha_vencimiento: string;
    estado: 'activa' | 'suspendida' | 'vencida' | 'pendiente';
    entidad: {
        id: number;
        nombre_entidad: string;
    };
    plan: {
        id: number;
        nombre_plan: string;
    };
}

export interface PaginatedLicenses {
    data: LicenseData[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
}

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await apiClient.get<DashboardStats>('/dashboard/stats');
        return response;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

/**
 * Get paginated licenses list
 */
export const getLicensesList = async (page = 1, perPage = 10): Promise<PaginatedLicenses> => {
    try {
        const response = await apiClient.get<any>(`/licencias?page=${page}&per_page=${perPage}`);
        return response;
    } catch (error) {
        console.error('Error fetching licenses list:', error);
        throw error;
    }
};

/**
 * Activate a license
 */
export const activateLicense = async (id: number): Promise<LicenseData> => {
    try {
        const response = await apiClient.put<LicenseData, any>(`/licencias/${id}/activate`, {});
        return response;
    } catch (error) {
        console.error(`Error activating license ${id}:`, error);
        throw error;
    }
};
