import { apiClient } from '../config/api';
import type { 
    ApiResponse, 
    Entidad, 
    CreateEntityDTO, 
    CompleteRegistrationDTO, 
    Usuario, 
    QrRegistrationResponse 
} from '../types';

export const registrationService = {
    /**
     * Step 1: Create an Entity
     * Returns the created entity data including its ID.
     */
    createEntity: async (entityData: CreateEntityDTO): Promise<Entidad> => {
        try {
            // apiClient returns response.data directly if it exists
            return await apiClient.post<Entidad, CreateEntityDTO>('/registration/entidades', entityData);
        } catch (error) {
            console.error('Error creating entity:', error);
            throw error;
        }
    },

    /**
     * Step 2: Complete registration for an existing entity
     * Creates the License and Admin User in one transaction.
     */
    completeEntityRegistration: async (payload: CompleteRegistrationDTO): Promise<ApiResponse<any>> => {
        try {
            return await apiClient.post<ApiResponse<any>, CompleteRegistrationDTO>('/registration/complete-entity', payload);
        } catch (error) {
            console.error('Error completing registration:', error);
            throw error;
        }
    },

    /**
     * Complete Registration Flow (Unified - Legacy)
     */
    fullRegistration: async (allData: any): Promise<ApiResponse<any>> => {
        try {
            return await apiClient.post<ApiResponse<any>, any>('/registration/full', allData);
        } catch (error) {
            console.error('Error during full registration:', error);
            throw error;
        }
    },

    /**
     * Individual User Registration
     */
    registerUser: async (userData: FormData | any): Promise<Usuario> => {
        try {
            return await apiClient.post<Usuario, FormData | any>('/registration/usuarios', userData);
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    /**
     * Get QR Code for Registration (Admin only)
     */
    getRegistrationQr: async (): Promise<QrRegistrationResponse> => {
        try {
            return await apiClient.get<QrRegistrationResponse>('/usuarios/qr-registro');
        } catch (error) {
            console.error('Error getting QR code:', error);
            throw error;
        }
    },

    /**
     * Register User with QR Token
     */
    registerUserWithQr: async (userData: FormData | any, qrToken: string): Promise<Usuario> => {
        try {
            let payload: FormData | any;

            if (userData instanceof FormData) {
                payload = userData;
                if (!payload.has('token')) {
                    payload.append('token', qrToken);
                }
            } else {
                payload = { ...userData, token: qrToken };
            }

            return await apiClient.post<Usuario, FormData | any>('/usuarios/qr-register', payload);
        } catch (error) {
            console.error('Error registering user with QR:', error);
            throw error;
        }
    }
};
