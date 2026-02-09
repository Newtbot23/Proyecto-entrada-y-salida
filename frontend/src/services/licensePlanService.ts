import type { LicensePlan, PlanFormData } from '../types/licensePlan';

// Mock data for development - replace with actual API calls
const mockPlans: LicensePlan[] = [
    {
        id: '1',
        name: 'Basic Plan',
        price: 50,
        billingPeriod: 'monthly',
        duration: 12,
        description: 'Perfect for small institutions getting started',
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
    },
    {
        id: '2',
        name: 'Pro Plan',
        price: 250,
        billingPeriod: 'yearly',
        duration: 12,
        description: 'Ideal for growing institutions with advanced needs',
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
    }
];

let plans = [...mockPlans];

/**
 * Get all license plans
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: GET /api/superadmin/license-plans
 */
export const getLicensePlans = async (): Promise<LicensePlan[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Replace with actual fetch call
    // const response = await fetch('/api/superadmin/license-plans');
    // return response.json();

    return [...plans];
};

/**
 * Create a new license plan
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: POST /api/superadmin/license-plans
 */
export const createLicensePlan = async (data: PlanFormData): Promise<LicensePlan> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newPlan: LicensePlan = {
        id: Date.now().toString(),
        ...data,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    plans.push(newPlan);

    // TODO: Replace with actual fetch call
    // const response = await fetch('/api/superadmin/license-plans', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data)
    // });
    // return response.json();

    return newPlan;
};

/**
 * Update an existing license plan
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: PUT /api/superadmin/license-plans/{id}
 */
export const updateLicensePlan = async (id: string, data: PlanFormData): Promise<LicensePlan> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = plans.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Plan not found');

    const updatedPlan: LicensePlan = {
        ...plans[index],
        ...data,
        updatedAt: new Date().toISOString()
    };

    plans[index] = updatedPlan;

    // TODO: Replace with actual fetch call
    // const response = await fetch(`/api/superadmin/license-plans/${id}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data)
    // });
    // return response.json();

    return updatedPlan;
};

/**
 * Duplicate a license plan
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: POST /api/superadmin/license-plans/{id}/duplicate
 */
export const duplicateLicensePlan = async (id: string, data: PlanFormData): Promise<LicensePlan> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newPlan: LicensePlan = {
        id: Date.now().toString(),
        ...data,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    plans.push(newPlan);

    // TODO: Replace with actual fetch call
    // const response = await fetch(`/api/superadmin/license-plans/${id}/duplicate`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data)
    // });
    // return response.json();

    return newPlan;
};

/**
 * Disable a license plan
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: PATCH /api/superadmin/license-plans/{id}/disable
 */
export const disableLicensePlan = async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = plans.findIndex(p => p.id === id);
    if (index !== -1) {
        plans[index] = {
            ...plans[index],
            status: 'disabled',
            updatedAt: new Date().toISOString()
        };
    }

    // TODO: Replace with actual fetch call
    // await fetch(`/api/superadmin/license-plans/${id}/disable`, {
    //     method: 'PATCH'
    // });
};
