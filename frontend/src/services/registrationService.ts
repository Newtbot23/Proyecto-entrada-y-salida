/**
 * Registration Service
 * Handles the multi-step registration flow: Entity -> (License + Admin User)
 * Uses the centralized apiClient for all HTTP requests.
 */
import { apiClient } from '../config/api';

// ============================================================================
// FUNCIONES
// ============================================================================

export const registrationService = {
    /**
     * Step 1: Create an Entity
     * Returns the created entity data including its ID.
     */
    createEntity: async (entityData: any) => {
        try {
            const response = await apiClient.post<any, any>('/registration/entidades', entityData);
            return response;
        } catch (error) {
            console.error('Error creating entity:', error);
            throw error;
        }
    },

    /**
     * Step 2: Complete registration for an existing entity
     * Creates the License and Admin User in one transaction.
     */
    completeEntityRegistration: async (payload: any) => {
        try {
            const response = await apiClient.post<any, any>('/registration/complete-entity', payload);
            return response;
        } catch (error) {
            console.error('Error completing registration:', error);
            throw error;
        }
    },

    /**
     * Complete Registration Flow (Unified - Legacy)
     */
    fullRegistration: async (allData: any) => {
        try {
            const response = await apiClient.post<any, any>('/registration/full', allData);
            return response;
        } catch (error) {
            console.error('Error during full registration:', error);
            throw error;
        }
    },

    /**
     * Individual User Registration
     */
    registerUser: async (userData: any) => {
        try {
            const response = await apiClient.post<any, any>('/registration/usuarios', userData);
            return response;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    /**
     * Get QR Code for Registration (Admin only)
     */
    getRegistrationQr: async () => {
        try {
            const response = await apiClient.get<any>('/usuarios/qr-registro');
            return response;
        } catch (error) {
            console.error('Error getting QR code:', error);
            throw error;
        }
    },

    /**
     * Register User with QR Token
     */
    registerUserWithQr: async (userData: any, qrToken: string) => {
        try {
            const payload = { ...userData, token: qrToken };
            const response = await apiClient.post<any, any>('/usuarios/qr-register', payload);
            return response;
        } catch (error) {
            console.error('Error registering user with QR:', error);
            throw error;
        }
    }
};
