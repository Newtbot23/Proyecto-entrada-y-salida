export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    errors?: Record<string, string[]>;
}

export interface Role {
    id: number;
    nombre_rol: string;
}

export interface TipoDoc {
    id_tip_doc: number;
    nombre: string;
}

export interface Entidad {
    nit: string;
    nombre_entidad: string;
    correo: string;
    direccion: string;
    nombre_titular: string;
    telefono: string;
    estado: 'activo' | 'inactivo';
}

export interface Usuario {
    doc: number;
    id_tip_doc: number;
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    telefono: string;
    correo: string;
    imagen?: string;
    codigo_qr?: string;
    estado: 'activo' | 'inactivo';
    id_rol: number;
    nit_entidad?: string;
    // Relations
    tipo_doc?: TipoDoc;
    rol?: Role;
    entidad?: Entidad;
}

export interface DetalleFichaUsuario {
    id: number;
    id_ficha: number;
    doc: number;
    tipo_participante: 'instructor' | 'aprendiz';
}

export interface TipoVehiculo {
    id: number;
    tipo_vehiculo: string;
}

export interface Vehiculo {
    id: number;
    placa: string;
    id_tipo_vehiculo: number;
    doc: number;
    marca: string;
    modelo: string;
    color: string;
    descripcion?: string;
    estado: 'activo' | 'inactivo' | 'pendiente';
    estado_aprobacion?: 'pendiente' | 'activo' | 'inactivo';
    principal: number; // 1 for true, 0 for false
    es_predeterminado?: boolean;
    img_asset?: string;
    img_vehiculo?: string;
    foto_general?: string;
    foto_detalle?: string;
    // Relations
    tipo_vehiculo?: TipoVehiculo;
    marca_vehiculo?: { id: number; nombre: string };
    usuario?: Usuario;
}

export interface MarcaEquipo {
    id: number;
    marca: string;
}

export interface SistemaOperativo {
    id: number;
    sistema_operativo: string;
}

export interface Equipo {
    id: number;
    serial: string;
    categoria_equipo?: string;
    tipo_equipo?: string;
    placa_sena?: string;
    id_marca: number;
    estado: 'activo' | 'inactivo' | 'pendiente';
    modelo: string;
    tipo_equipo_desc: string;
    caracteristicas?: string;
    id_sistema_operativo: number;
    img_serial?: string;
    img_asset?: string;
    doc?: number;
    lote_importacion?: string;
    estado_aprobacion?: 'pendiente' | 'activo' | 'inactivo';
    principal: number; // 1 for true, 0 for false
    es_predeterminado?: boolean;
    foto_general?: string;
    foto_detalle?: string;
    // Relations
    marca_equipo?: { id: number; nombre: string };
    marca?: MarcaEquipo;
    tipo_equipo_rel?: { id: number; nombre: string };
    sistema_operativo?: SistemaOperativo;
}

export interface Programa {
    id: string; // Changed to string in migration 2026_03_11_203753
    programa: string;
}

export interface Jornada {
    id: number;
    jornada: string;
}

export interface Nave {
    id: number;
    nave: string;
}

export interface Ambiente {
    numero_ambiente: string;
    ambiente: string;
    id_nave: number;
    nave?: Nave;
}

export interface Ficha {
    id: number;
    numero_ficha: string;
    id_programa: string;
    numero_ambiente: string;
    id_jornada: number;
    hora_limite_llegada?: string;
    estado: 'lectiva' | 'productiva' | 'finalizada';
    // Relations
    programa?: Programa;
    ambiente?: Ambiente;
    jornada?: Jornada;
    usuarios?: (Usuario & { pivot: DetalleFichaUsuario })[];
    usuarios_count?: number;
}

export interface FichaCatalogs {
    programas: Programa[];
    ambientes: Ambiente[];
    jornadas: Jornada[];
}

export interface Asignacion {
    id: number;
    doc: number;
    serial_equipo: string;
    numero_ambiente?: string;
    estado: 'activo' | 'inactivo';
    codigo_asignacion?: string;
    // Relations
    usuario?: Usuario;
    equipo?: Equipo;
}

export interface Registro {
    id: number;
    doc: number;
    placa_vehiculo?: string;
    fecha: string;
    hora_entrada: string;
    hora_salida?: string;
    observaciones?: string;
    tipo_registro: 'entrada' | 'salida';
    usuario?: Usuario;
    vehiculo?: Vehiculo;
}

export interface RegistroEquipo {
    id: number;
    id_registro: number;
    serial_equipo: string;
    equipo?: Equipo;
}

export interface FichaCatalogs {
    programas: Programa[];
    ambientes: Ambiente[];
    jornadas: Jornada[];
}

// DTOs for Services
export interface CreateEntityDTO {
    nombre_entidad: string;
    correo: string;
    direccion: string;
    nombre_titular: string;
    telefono: string;
    nit: string;
}

export interface CompleteRegistrationDTO {
    nit: string;
    id_plan: number;
    admin_user: {
        doc: number;
        primer_nombre: string;
        segundo_nombre?: string;
        primer_apellido: string;
        segundo_apellido?: string;
        telefono: string;
        correo: string;
        contrasena: string;
    };
}

export interface QrRegistrationResponse {
    qr_code: string;
    content_type: string;
    message?: string;
}

export interface UserDashboardCatalog {
    tipos_vehiculo: { id: number; nombre: string }[];
    marcas_vehiculo: { id: number; nombre: string }[];
    tipos_equipo: { id: number; nombre: string }[];
    marcas_equipo: { id: number; nombre: string }[];
    sistemas_operativos: { id: number; nombre: string }[];
}

export interface OCRPlateResponse {
    success: boolean;
    plate: string;
    placa: string;
}

export interface OCRSerialResponse {
    success: boolean;
    serial: string;
    raw_text: string;
    extracted_serial: string;
}

export interface EquiposCatalogs {
    marcas: MarcaEquipo[];
    sistemas_operativos: SistemaOperativo[];
}

export interface MarcaLote {
    lote_importacion: string | null;
    total_equipos: number;
    fecha_creacion?: string;
}

export interface ImportCsvResponse {
    success: boolean;
    message: string;
    data: {
        count: number;
    };
}

export interface SessionCheckResponse {
    warning: boolean;
    horas_transcurridas?: number;
}

// Reports
export interface ReportFilters {
    dateRange: {
        start: string;
        end: string;
    };
    institutionId?: string;
    licenseType?: string;
}

export interface RevenueDataPoint {
    date: string;
    revenue: number;
}

export interface LicenseSalesDataPoint {
    month: string;
    count: number;
}

export interface InstitutionGrowthDataPoint {
    month: string;
    count: number;
}

export interface ReportData {
    revenue: RevenueDataPoint[];
    licenseSales: LicenseSalesDataPoint[];
    institutionGrowth: InstitutionGrowthDataPoint[];
}

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface DailyReportEntry {
    id: number;
    doc: number;
    usuario_nombre: string;
    fecha: string;
    hora_entrada: string;
    hora_salida?: string;
    placa?: string;
    seriales_equipos?: string;
}

// Licenses and Plans
export interface LicensePlan {
    id: number | string;
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

export interface LicenciaSistema {
    id: number;
    nit_entidad: string;
    id_plan: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: 'activa' | 'vencida' | 'suspendida';
    plan?: LicensePlan;
    entidad?: Entidad;
}

export interface BackendPlan {
    id: number;
    nombre_plan: string;
    precio_plan: string | number;
    periodo_facturacion?: 'mensual' | 'anual';
    duracion_plan: number;
    descripcion?: string;
    caracteristicas: string | any[];
    estado: 'active' | 'disabled';
    created_at: string;
    updated_at: string;
}

export interface InstitutionFilters {
    search: string;
    statuses: ('activo' | 'inactivo' | 'active' | 'inactive')[];
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

// Admins
export interface Admin {
    doc: number;
    nombre: string;
    telefono: string;
    correo: string;
    created_at?: string;
    updated_at?: string;
}

export interface AdminFormData {
    doc: string;
    nombre: string;
    telefono: string;
    correo: string;
    contrasena?: string;
}

export interface PricingPlan {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    caracteristicas?: string;
    is_popular?: boolean;
    button_text?: string;
}

// Aliases for backward compatibility with old type file imports
export type Institution = Entidad & {
    id?: number | string;
    status?: string;
    activeLicensesCount?: number;
    created_at?: string;
    updated_at?: string;
};
export type InstitutionFormData = CreateEntityDTO;

export interface PlanFeature {
    text: string;
    included: boolean;
}
