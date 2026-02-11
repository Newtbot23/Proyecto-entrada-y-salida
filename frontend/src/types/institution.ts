// Laravel database schema mapping
// Table: entidades
export interface Institution {
    id: string | number;
    nombre_entidad: string;      // max 200
    correo: string;               // max 200
    direccion: string;            // max 200
    nombre_titular: string;       // max 100
    telefono: string;             // max 15
    nit: string;                  // max 15, unique
    created_at?: string;
    updated_at?: string;
    // Computed/joined fields
    activeLicensesCount?: number;
    status?: 'active' | 'inactive';
}

export interface InstitutionFormData {
    nombre_entidad: string;
    correo: string;
    direccion: string;
    nombre_titular: string;
    telefono: string;
    nit: string;
}

export interface InstitutionFilters {
    search: string;
    statuses: ('active' | 'inactive')[];
    minLicenses?: number;
    maxLicenses?: number;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
