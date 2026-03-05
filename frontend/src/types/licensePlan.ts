export interface LicensePlan {
    id: string;
    name: string;
    price: number;
    billingPeriod: 'mensual' | 'anual';
    duration: number; // in months
    description: string;
    caracteristicas: string;
    status: 'active' | 'disabled';
    createdAt?: string;
    updatedAt?: string;
}

export type PlanFormMode = 'create' | 'edit' | 'duplicate';

export interface PlanFormData {
    name: string;
    price: number;
    billingPeriod: 'mensual' | 'anual';
    duration: number;
    description: string;
    caracteristicas: string;
}
