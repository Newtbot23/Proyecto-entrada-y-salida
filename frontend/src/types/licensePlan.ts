export interface LicensePlan {
    id: string;
    name: string;
    price: number;
    billingPeriod: 'monthly' | 'yearly';
    duration: number; // in months
    description: string;
    status: 'active' | 'disabled';
    createdAt?: string;
    updatedAt?: string;
}

export type PlanFormMode = 'create' | 'edit' | 'duplicate';

export interface PlanFormData {
    name: string;
    price: number;
    billingPeriod: 'monthly' | 'yearly';
    duration: number;
    description: string;
}
