const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Registration Service
 * Handles the multi-step registration flow: Entity -> License -> Admin User
 */
export const registrationService = {
    /**
     * Step 1: Create an Entity
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
     * Step 2: Create a License for the entity and plan
     */
    createLicense: async (data: { id_plan_lic: string | number; id_entidad: number }) => {
        try {
            const response = await fetch(`${API_URL}/registration/licencias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw result;
            return result;
        } catch (error: any) {
            console.error('Error creating license:', error);
            throw error;
        }
    },

    /**
     * Complete Registration Flow (Unified)
     * Performs Entity, License, and Admin creation in a single transaction
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
    }
};
