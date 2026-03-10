/**
 * Payment Service
 * Handles Stripe payment and license operations.
 */
import { apiClient } from '../config/api';

// ============================================================================
// TIPOS
// ============================================================================

export interface LicenseStatus {
    id: number;
    estado: string;
    fecha_inicio?: string;
    fecha_vencimiento?: string;
}

export interface CheckoutSessionPayload {
    licencia_id: number;
    tipo_pago: string;
}

export interface CheckoutSessionResponse {
    url: string;
}

export interface PaymentConfirmPayload {
    session_id: string;
}

export interface PaymentConfirmResponse {
    message: string;
}

// ============================================================================
// FUNCIONES
// ============================================================================

/**
 * Obtener el estado actual de la licencia del usuario autenticado
 */
export const getCurrentLicense = async (): Promise<LicenseStatus> => {
    try {
        const response = await apiClient.get<LicenseStatus>('/licencia-actual');
        return response;
    } catch (error) {
        console.error('Error fetching current license:', error);
        throw error;
    }
};

/**
 * Crear sesión de checkout de Stripe
 */
export const createCheckoutSession = async (payload: CheckoutSessionPayload): Promise<CheckoutSessionResponse> => {
    try {
        const response = await apiClient.post<CheckoutSessionResponse, CheckoutSessionPayload>('/stripe/checkout-session', payload);
        return response;
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
};

/**
 * Confirmar pago exitoso de Stripe
 */
export const confirmPayment = async (payload: PaymentConfirmPayload): Promise<PaymentConfirmResponse> => {
    try {
        const response = await apiClient.post<PaymentConfirmResponse, PaymentConfirmPayload>('/stripe/payment-success', payload);
        return response;
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
};
