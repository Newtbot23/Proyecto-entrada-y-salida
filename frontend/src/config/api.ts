/**
 * API Configuration and HTTP Client
 * 
 * Este archivo centraliza toda la configuración de comunicación con el backend Laravel.
 * Proporciona una interfaz consistente para realizar peticiones HTTP con manejo
 * automático de errores, headers y transformación de respuestas.
 * 
 * @author Tu nombre
 * @version 1.0.0
 */

// ============================================================================
// CONFIGURACIÓN BASE
// ============================================================================

/**
 * URL base del backend Laravel
 * Cambiar según el entorno (desarrollo, producción, etc.)
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
console.log('Mi URL de API es:', import.meta.env.VITE_API_URL);

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

/**
 * Estructura estándar de respuesta de la API Laravel
 * Todas las respuestas de Laravel siguen este formato
 */
/**
 * Estructura estándar de respuesta de la API Laravel
 * Todas las respuestas de Laravel siguen este formato
 */
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>; // Errores de validación Laravel
}

/**
 * Configuración de opciones para las peticiones HTTP
 */
interface RequestConfig {
    headers?: Record<string, string>;
    signal?: AbortSignal;
}

// ============================================================================
// CLASE DE ERROR PERSONALIZADA
// ============================================================================

/**
 * Error personalizado para respuestas de API
 * Permite acceder a los detalles del error, incluyendo errores de validación estructurados.
 */
export class ApiError extends Error {
    public status: number;
    public statusText: string;
    public data: any;
    public errors?: Record<string, string[]>;

    constructor(message: string, status: number, statusText: string, data: any, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.statusText = statusText;
        this.data = data;
        this.errors = errors;
    }
}

// ============================================================================
// CLASE PRINCIPAL DEL CLIENTE HTTP
// ============================================================================

/**
 * Cliente HTTP para comunicación con Laravel API
 * 
 * Proporciona métodos para GET, POST, PUT, DELETE con:
 * - Manejo automático de headers
 * - Transformación de respuestas
 * - Manejo centralizado de errores
 * - Soporte para cancelación de peticiones
 */
class ApiClient {
    private baseURL: string;
    private defaultHeaders: Record<string, string>;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    /**
     * Construye la URL completa combinando base URL y endpoint
     * @param endpoint - Ruta del endpoint (ej: '/entidades')
     * @returns URL completa
     */
    private buildUrl(endpoint: string): string {
        // Eliminar slash inicial si existe para evitar duplicados
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        return `${this.baseURL}/${cleanEndpoint}`;
    }

    /**
     * Combina headers por defecto con headers personalizados
     * @param customHeaders - Headers adicionales para la petición
     * @returns Headers combinados
     */
    private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
        return { ...this.defaultHeaders, ...customHeaders };
    }

    /**
     * Maneja errores HTTP y los transforma en objetos ApiError detallados
     * @param response - Respuesta HTTP de fetch
     * @throws ApiError con detalles completos
     */
    private async handleErrorResponse(response: Response): Promise<never> {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData: any = {};
        let validationErrors: Record<string, string[]> | undefined = undefined;

        try {
            // Intentar parsear el error de Laravel
            errorData = await response.json();

            if (errorData.errors) {
                // Errores de validación de Laravel (422)
                validationErrors = errorData.errors;
                // Crear un mensaje resumen con el primer error encontrado
                const allErrors = validationErrors ? Object.values(validationErrors).flat() : [];
                errorMessage = allErrors.length > 0 ? allErrors[0] : (errorData.message || 'Error de validación');
            } else if (errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData.error) {
                errorMessage = errorData.error;
            }
        } catch (e) {
            // Si no se puede parsear el error, usar el mensaje HTTP estándar
            console.error('Error parsing error response:', e);
        }

        throw new ApiError(errorMessage, response.status, response.statusText, errorData, validationErrors);
    }

    /**
     * Petición GET - Obtener datos
     * @param endpoint - Ruta del endpoint
     * @param config - Configuración adicional de la petición
     * @returns Datos de la respuesta
     */
    async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        try {
            const response = await fetch(this.buildUrl(endpoint), {
                method: 'GET',
                headers: this.getHeaders(config?.headers),
                signal: config?.signal,
            });

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            const data: ApiResponse<T> = await response.json();

            // Laravel devuelve { success: true, data: {...} }
            // Extraemos solo la data
            return data.data as T;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`GET ${endpoint} failed:`, error.message);
            }
            throw error;
        }
    }

    /**
     * Petición GET - Obtener archivo (Blob)
     * @param endpoint - Ruta del endpoint
     * @param config - Configuración adicional de la petición
     * @returns Blob del archivo
     */
    async getBlob(endpoint: string, config?: RequestConfig): Promise<Blob> {
        try {
            const response = await fetch(this.buildUrl(endpoint), {
                method: 'GET',
                headers: this.getHeaders(config?.headers),
                signal: config?.signal,
            });

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            return await response.blob();
        } catch (error) {
            if (error instanceof Error) {
                console.error(`GET Blob ${endpoint} failed:`, error.message);
            }
            throw error;
        }
    }

    /**
     * Petición POST - Crear datos
     * @param endpoint - Ruta del endpoint
     * @param body - Datos a enviar
     * @param config - Configuración adicional de la petición
     * @returns Datos de la respuesta
     */
    async post<T, B = any>(endpoint: string, body: B, config?: RequestConfig): Promise<T> {
        try {
            const response = await fetch(this.buildUrl(endpoint), {
                method: 'POST',
                headers: this.getHeaders(config?.headers),
                body: JSON.stringify(body),
                signal: config?.signal,
            });

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            const data: ApiResponse<T> = await response.json();
            return data.data as T;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`POST ${endpoint} failed:`, error.message);
            }
            throw error;
        }
    }

    /**
     * Petición PUT - Actualizar datos completos
     * @param endpoint - Ruta del endpoint
     * @param body - Datos a actualizar
     * @param config - Configuración adicional de la petición
     * @returns Datos actualizados
     */
    async put<T, B = any>(endpoint: string, body: B, config?: RequestConfig): Promise<T> {
        try {
            const response = await fetch(this.buildUrl(endpoint), {
                method: 'PUT',
                headers: this.getHeaders(config?.headers),
                body: JSON.stringify(body),
                signal: config?.signal,
            });

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            const data: ApiResponse<T> = await response.json();
            return data.data as T;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`PUT ${endpoint} failed:`, error.message);
            }
            throw error;
        }
    }

    /**
     * Petición PATCH - Actualizar datos parciales
     * @param endpoint - Ruta del endpoint
     * @param body - Datos a actualizar
     * @param config - Configuración adicional de la petición
     * @returns Datos actualizados
     */
    async patch<T, B = any>(endpoint: string, body: B, config?: RequestConfig): Promise<T> {
        try {
            const response = await fetch(this.buildUrl(endpoint), {
                method: 'PATCH',
                headers: this.getHeaders(config?.headers),
                body: JSON.stringify(body),
                signal: config?.signal,
            });

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            const data: ApiResponse<T> = await response.json();
            return data.data as T;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`PATCH ${endpoint} failed:`, error.message);
            }
            throw error;
        }
    }

    /**
     * Petición DELETE - Eliminar datos
     * @param endpoint - Ruta del endpoint
     * @param config - Configuración adicional de la petición
     * @returns Respuesta de eliminación
     */
    async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        try {
            const response = await fetch(this.buildUrl(endpoint), {
                method: 'DELETE',
                headers: this.getHeaders(config?.headers),
                signal: config?.signal,
            });

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            const data: ApiResponse<T> = await response.json();
            return data.data as T;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`DELETE ${endpoint} failed:`, error.message);
            }
            throw error;
        }
    }
}

// ============================================================================
// INSTANCIA SINGLETON DEL CLIENTE
// ============================================================================

/**
 * Instancia única del cliente API
 * Usar esta instancia en todos los servicios para mantener configuración consistente
 */
export const apiClient = new ApiClient(API_BASE_URL);

/**
 * URL base de la API - Exportada para referencia
 */
export { API_BASE_URL };
