/**
 * Utilidades para sanitización y formateo de inputs en tiempo real.
 * Estas funciones se utilizan en el evento onChange para filtrar caracteres inválidos.
 */

/**
 * Elimina cualquier carácter que no sea un dígito (0-9).
 */
export const onlyNumbers = (value: string): string => {
    return value.replace(/[^0-9]/g, '');
};

/**
 * Permite solo letras (incluyendo acentos y ñ) y espacios.
 */
export const onlyLetters = (value: string): string => {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
};

/**
 * Permite letras, números y espacios.
 */
export const alphanumeric = (value: string): string => {
    return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
};

/**
 * Permite solo letras y números, elimina espacios y convierte a mayúsculas.
 * Ideal para Placas de vehículos y Seriales de equipos.
 */
export const alphanumericNoSpaces = (value: string): string => {
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

/**
 * Permite caracteres válidos para una dirección (letras, números, espacios y algunos símbolos básicos).
 */
export const sanitizeAddress = (value: string): string => {
    return value.replace(/[^a-zA-Z0-9\s#\-\.]/g, '');
};
