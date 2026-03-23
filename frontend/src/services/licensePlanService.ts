import { apiClient } from '../config/api';
import type { LicensePlan, PlanFormData, BackendPlan } from '../types';

/**
 * Map backend plan to frontend LicensePlan
 */
const mapToFrontend = (plan: BackendPlan): LicensePlan => ({
    id: plan.id.toString(),
    name: plan.nombre_plan,
    price: typeof plan.precio_plan === 'string' ? parseFloat(plan.precio_plan) : plan.precio_plan,
    billingPeriod: plan.periodo_facturacion || 'mensual',
    duration: plan.duracion_plan,
    description: plan.descripcion || '',
    caracteristicas: Array.isArray(plan.caracteristicas)
        ? plan.caracteristicas.map((item: any) =>
            typeof item === 'object' && item !== null ? item.text || JSON.stringify(item) : item
        ).join(', ')
        : (typeof plan.caracteristicas === 'string' ? plan.caracteristicas : ''),
    status: plan.estado,
    createdAt: plan.created_at,
    updatedAt: plan.updated_at
});

/**
 * Map frontend PlanFormData to backend format
 */
const mapToBackend = (data: PlanFormData) => ({
    nombre_plan: data.name,
    precio_plan: data.price,
    periodo_facturacion: data.billingPeriod,
    duracion_plan: data.duration,
    descripcion: data.description,
    caracteristicas: data.caracteristicas.split(',').map(f => f.trim()).filter(f => f !== '')
});

/**
 * Get all license plans from the backend
 */
export const getLicensePlans = async (): Promise<LicensePlan[]> => {
    try {
        const response = await apiClient.get<{ data: BackendPlan[] }>('/planes');
        return response.data.map(mapToFrontend);
    } catch (error) {
        console.error('Error fetching license plans:', error);
        throw error;
    }
};

/**
 * Create a new license plan
 */
export const createLicensePlan = async (data: PlanFormData): Promise<LicensePlan> => {
    try {
        const newPlan = await apiClient.post<BackendPlan, any>('/planes', mapToBackend(data));
        return mapToFrontend(newPlan);
    } catch (error) {
        console.error('Error creating license plan:', error);
        throw error;
    }
};

/**
 * Update an existing license plan
 */
export const updateLicensePlan = async (id: string, data: PlanFormData): Promise<LicensePlan> => {
    try {
        const updatedPlan = await apiClient.put<BackendPlan, any>(`/planes/${id}`, mapToBackend(data));
        return mapToFrontend(updatedPlan);
    } catch (error) {
        console.error(`Error updating license plan ${id}:`, error);
        throw error;
    }
};

/**
 * Duplicate a license plan
 */
export const duplicateLicensePlan = async (_id: string, data: PlanFormData): Promise<LicensePlan> => {
    try {
        const newPlan = await apiClient.post<BackendPlan, any>('/planes', mapToBackend(data));
        return mapToFrontend(newPlan);
    } catch (error) {
        console.error('Error duplicating license plan:', error);
        throw error;
    }
};

/**
 * Disable a license plan
 */
export const disableLicensePlan = async (id: string): Promise<void> => {
    try {
        await apiClient.put<void, { estado: string }>(`/planes/${id}`, { estado: 'disabled' });
    } catch (error) {
        console.error(`Error disabling license plan ${id}:`, error);
        throw error;
    }
};
