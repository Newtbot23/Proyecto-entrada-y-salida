const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Registration Service
 * Handles the multi-step registration flow: Entity -> (License + Admin User)
 */
export const registrationService = {
    /**
     * Step 1: Create an Entity
     * Returns the created entity data including its ID.
     */
    createEntity: async (entityData: any) => {
        try {
            const response = await fetch(`${API_URL}/registration/entidades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(entityData),
            });
            const data = await response.json();
            if (!response.ok) throw data;
            return data;
        } catch (error: any) {
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
            const response = await fetch(`${API_URL}/registration/complete-entity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw data;
            return data;
        } catch (error: any) {
            console.error('Error completing registration:', error);
            throw error;
        }
    },

    /**
     * Complete Registration Flow (Unified - Legacy)
     */
    fullRegistration: async (allData: any) => {
        try {
            const response = await fetch(`${API_URL}/registration/full`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(allData),
            });
            const result = await response.json();
            if (!response.ok) throw result;
            return result;
        } catch (error: any) {
            console.error('Error during full registration:', error);
            throw error;
        }
    },

    /**
     * Individual User Registration
     */
    registerUser: async (userData: any) => {
        try {
            const response = await fetch(`${API_URL}/registration/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) throw data;
            return data;
        } catch (error: any) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    /**
     * Get QR Code for Registration (Admin only)
     */
    getRegistrationQr: async (token: string) => {
        try {
            const response = await fetch(`${API_URL}/usuarios/qr-registro`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw data;
            return data;
        } catch (error: any) {
            console.error('Error getting QR code:', error);
            throw error;
        }
    },

    /**
     * Register User with QR Token
     */
    registerUserWithQr: async (userData: any, qrToken: string) => {
        try {
            const payload = { ...userData, qr_token: qrToken };
            const response = await fetch(`${API_URL}/usuarios/qr-register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw data;
            return data;
        } catch (error: any) {
            console.error('Error registering user with QR:', error);
            throw error;
        }
    }
};
