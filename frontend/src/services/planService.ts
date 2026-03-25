import { apiClient } from '../config/api';
import type { PricingPlan } from '../types';

export type { PricingPlan } from '../types';

/**
 * Obtener planes de precios
 */
export const getPricingPlans = async (): Promise<PricingPlan[]> => {
    try {
        const response = await apiClient.get<PricingPlan[]>('/plans');
        return response;
    } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
        throw error;
    }
};

/**
 * Seleccionar un plan
 */
export const sendSelectedPlan = async (planId: string): Promise<void> => {
    try {
        await apiClient.post<void, { plan_id: string }>('/plans/select', { 
            plan_id: planId 
        });
        console.log('Plan selected successfully');
    } catch (error) {
        console.error('Failed to select plan:', error);
        throw error;
    }
};
