import type { Institution, InstitutionFormData, InstitutionFilters, PaginatedResponse } from '../types/institution';

// Mock data for development - replace with actual API calls
const mockInstitutions: Institution[] = [
    {
        id: '1',
        nombre_entidad: 'Universidad Nacional',
        correo: 'contact@unacional.edu.co',
        direccion: 'Calle 45 # 26-85, Bogotá, Colombia',
        nombre_titular: 'Dr. Juan Carlos Pérez',
        telefono: '+57 1 3165000',
        nit: '899999063-3',
        status: 'active',
        activeLicensesCount: 15,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        nombre_entidad: 'Colegio San José',
        correo: 'info@sanjose.edu.co',
        direccion: 'Carrera 7 # 12-34, Medellín, Colombia',
        nombre_titular: 'María Fernanda López',
        telefono: '+57 4 2345678',
        nit: '890900234-1',
        status: 'active',
        activeLicensesCount: 8,
        created_at: '2024-01-20T14:30:00Z',
        updated_at: '2024-01-20T14:30:00Z'
    },
    {
        id: '3',
        nombre_entidad: 'Instituto Técnico Industrial',
        correo: 'contacto@iti.edu.co',
        direccion: 'Avenida 68 # 49-125, Bogotá, Colombia',
        nombre_titular: 'Carlos Alberto Rodríguez',
        telefono: '+57 1 4567890',
        nit: '860012345-7',
        status: 'inactive',
        activeLicensesCount: 0,
        created_at: '2024-02-01T09:15:00Z',
        updated_at: '2024-02-01T09:15:00Z'
    }
];

let institutions = [...mockInstitutions];

/**
 * Get institutions with filters and pagination
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: GET /api/superadmin/entidades?page=1&search=...&status[]=active
 */
export const getInstitutions = async (
    filters: InstitutionFilters,
    page: number = 1,
    perPage: number = 10
): Promise<PaginatedResponse<Institution>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    let filtered = [...institutions];

    // Apply search filter
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(inst =>
            inst.nombre_entidad.toLowerCase().includes(searchLower) ||
            inst.correo.toLowerCase().includes(searchLower) ||
            inst.nit.toLowerCase().includes(searchLower)
        );
    }

    // Apply status filter
    if (filters.statuses.length > 0) {
        filtered = filtered.filter(inst => inst.status && filters.statuses.includes(inst.status));
    }

    // Apply license count filter
    if (filters.minLicenses !== undefined) {
        filtered = filtered.filter(inst => (inst.activeLicensesCount ?? 0) >= filters.minLicenses!);
    }
    if (filters.maxLicenses !== undefined) {
        filtered = filtered.filter(inst => (inst.activeLicensesCount ?? 0) <= filters.maxLicenses!);
    }

    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    // TODO: Replace with actual fetch call
    // const response = await fetch(`/api/superadmin/entidades?page=${page}&per_page=${perPage}&search=${filters.search}&status[]=${filters.statuses.join('&status[]=')}`);
    // return response.json();

    return {
        data: paginatedData,
        meta: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: perPage
        }
    };
};

/**
 * Get single institution by ID
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: GET /api/superadmin/entidades/{id}
 */
export const getInstitutionById = async (id: string | number): Promise<Institution | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const institution = institutions.find(inst => inst.id.toString() === id.toString());

    // TODO: Replace with actual fetch call
    // const response = await fetch(`/api/superadmin/entidades/${id}`);
    // return response.json();

    return institution || null;
};

/**
 * Create a new institution
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: POST /api/superadmin/entidades
 */
export const createInstitution = async (data: InstitutionFormData): Promise<Institution> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newInstitution: Institution = {
        id: Date.now().toString(),
        ...data,
        status: 'active',
        activeLicensesCount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    institutions.push(newInstitution);

    // TODO: Replace with actual fetch call
    // const response = await fetch('/api/superadmin/entidades', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data)
    // });
    // return response.json();

    return newInstitution;
};

/**
 * Update an existing institution
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: PUT /api/superadmin/entidades/{id}
 */
export const updateInstitution = async (id: string | number, data: InstitutionFormData): Promise<Institution> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = institutions.findIndex(inst => inst.id.toString() === id.toString());
    if (index === -1) throw new Error('Institution not found');

    const updatedInstitution: Institution = {
        ...institutions[index],
        ...data,
        updated_at: new Date().toISOString()
    };

    institutions[index] = updatedInstitution;

    // TODO: Replace with actual fetch call
    // const response = await fetch(`/api/superadmin/entidades/${id}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data)
    // });
    // return response.json();

    return updatedInstitution;
};

/**
 * Disable an institution
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: PATCH /api/superadmin/entidades/{id}/disable
 */
export const disableInstitution = async (id: string | number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = institutions.findIndex(inst => inst.id.toString() === id.toString());
    if (index !== -1) {
        institutions[index] = {
            ...institutions[index],
            status: 'inactive',
            updated_at: new Date().toISOString()
        };
    }

    // TODO: Replace with actual fetch call
    // await fetch(`/api/superadmin/entidades/${id}/disable`, {
    //     method: 'PATCH'
    // });
};
