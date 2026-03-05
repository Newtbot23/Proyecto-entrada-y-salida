import { apiClient } from '../config/api';
import type { LicensePlan, PlanFormData } from '../types/licensePlan';

/**
 * Map backend plan to frontend LicensePlan
 * 
 * Traslada los nombres de campos de la base de datos (en español) 
 * a los nombres de propiedades esperados por el frontend (en inglés).
 */
const mapToFrontend = (plan: any): LicensePlan => ({
    id: plan.id.toString(),
    name: plan.nombre_plan,
    price: parseFloat(plan.precio_plan),
    billingPeriod: plan.periodo_facturacion || 'mensual',
    duration: plan.duracion_plan,
    description: plan.descripcion || '',
    // El backend puede devolver strings simples o objetos {text, included} (seeder)
    caracteristicas: Array.isArray(plan.caracteristicas)
        ? plan.caracteristicas.map((item: any) =>
            typeof item === 'object' && item !== null ? item.text : item
        ).join(', ')
        : (typeof plan.caracteristicas === 'string' ? plan.caracteristicas : ''),
    status: plan.estado as 'active' | 'disabled',
    createdAt: plan.created_at,
    updatedAt: plan.updated_at
});

/**
 * Map frontend PlanFormData to backend format
 * 
 * Traslada los datos del formulario (en inglés) a los nombres 
 * de campos esperados por la API Laravel (en español).
 */
const mapToBackend = (data: PlanFormData) => ({
    nombre_plan: data.name,
    precio_plan: data.price,
    periodo_facturacion: data.billingPeriod,
    duracion_plan: data.duration,
    descripcion: data.description,
    // El backend espera un array de strings
    caracteristicas: data.caracteristicas.split(',').map(f => f.trim()).filter(f => f !== '')
});

/**
 * Get all license plans from the backend
 */
export const getLicensePlans = async (): Promise<LicensePlan[]> => {
    try {
        // El controlador refactorizado devuelve un objeto paginado: { data: [...], total: ... }
        const response = await apiClient.get<{ data: any[] }>('/planes');
        return response.data.map(mapToFrontend);
    } catch (error) {
        throw error;
    }
};

/**
 * Create a new license plan
 */
export const createLicensePlan = async (data: PlanFormData): Promise<LicensePlan> => {
    try {
        const newPlan = await apiClient.post<any, any>('/planes', mapToBackend(data));
        return mapToFrontend(newPlan);
    } catch (error) {
        throw error;
    }
};

/**
 * Update an existing license plan
 */
export const updateLicensePlan = async (id: string, data: PlanFormData): Promise<LicensePlan> => {
    try {
        const updatedPlan = await apiClient.put<any, any>(`/planes/${id}`, mapToBackend(data));
        return mapToFrontend(updatedPlan);
    } catch (error) {
        throw error;
    }
};

/**
 * Duplicate a license plan
 * Realiza un POST con la data del plan a duplicar
 */
export const duplicateLicensePlan = async (_id: string, data: PlanFormData): Promise<LicensePlan> => {
    try {
        // En el backend es simplemente crear un nuevo registro
        const newPlan = await apiClient.post<any, any>('/planes', mapToBackend(data));
        return mapToFrontend(newPlan);
    } catch (error) {
        throw error;
    }
};

/**
 * Disable a license plan
 * Cambia el estado del plan a 'disabled'
 */
export const disableLicensePlan = async (id: string): Promise<void> => {
    try {
        await apiClient.put(`/planes/${id}`, { estado: 'disabled' });
    } catch (error) {
        throw error;
    }
};
