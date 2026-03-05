export interface Admin {
    doc: number;      // Document number
    nombre: string;   // Name
    telefono: string; // Phone
    correo: string;   // Email
    created_at?: string;
    updated_at?: string;
}

export interface AdminFormData {
    doc: string;
    nombre: string;
    telefono: string;
    correo: string;
    contrasena?: string; // Optional for edit
}
