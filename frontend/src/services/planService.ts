import type { PricingPlan } from '../types/plans';

const API_URL = 'http://127.0.0.1:8000/api';

export const getPricingPlans = async (): Promise<PricingPlan[]> => {
    const response = await fetch(`${API_URL}/plans`);
    if (!response.ok) {
        throw new Error('Failed to fetch pricing plans');
    }
    return response.json();
};

export const sendSelectedPlan = async (planId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/plans/select`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ plan_id: planId }),
    });

    if (!response.ok) {
        throw new Error('Failed to select plan');
    }

    const data = await response.json();
    console.log('Plan selected successfully:', data);
};
