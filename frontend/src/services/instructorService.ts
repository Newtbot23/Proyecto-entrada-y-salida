import { apiClient as api } from '../config/api';

export interface InstructorFicha {
    id: number;
    numero_ficha: number;
    nombre_programa: string | null;
}

export interface RegistroAsistencia {
    fecha: string;
    hora_entrada: string;
    hora_salida?: string | null;
}

export interface AprendizAsistencia {
    doc: string;
    nombres: string;
    apellidos: string;
    foto_perfil: string | null;
    registros_del_mes: RegistroAsistencia[];
}

export interface AsistenciaMensualResponse {
    success: boolean;
    ficha: {
        id: number;
        numero_ficha: number;
        hora_limite_llegada: string;
    };
    aprendices: AprendizAsistencia[];
}

export interface AsistenciaBaseData {
    id_ficha: number;
    numero_ficha: number;
    hora_limite_llegada: string;
    nombre_programa: string | null;
}

export const getInstructorFichas = async (): Promise<InstructorFicha[]> => {
    try {
        const data = await api.get<InstructorFicha[]>('/instructor/mis-fichas');
        return data || [];
    } catch (error) {
        console.error('Error fetching instructor fichas:', error);
        throw error;
    }
};

export const getAsistenciaBase = async (fichaId?: number): Promise<AsistenciaBaseData> => {
    try {
        const params = fichaId ? `?ficha_id=${fichaId}` : '';
        const data = await api.get<AsistenciaBaseData>(`/instructor/asistencia-base${params}`);
        return data;
    } catch (error) {
        console.error('Error fetching asistencia base:', error);
        throw error;
    }
};

export const getAsistenciaMensual = async (mes: number, anio: number, fichaId?: number): Promise<AsistenciaMensualResponse> => {
    try {
        let url = `/instructor/asistencia-mensual?mes=${mes}&anio=${anio}`;
        if (fichaId) url += `&ficha_id=${fichaId}`;
        const data = await api.get<AsistenciaMensualResponse>(url);
        return data;
    } catch (error) {
        console.error('Error fetching asistencia mensual:', error);
        throw error;
    }
};

export const updateHoraLimite = async (idFicha: number, hora: string): Promise<{ success: boolean }> => {
    try {
        return await api.patch<{ success: boolean }>(`/fichas/${idFicha}/hora-limite`, { 
            hora_limite_llegada: hora 
        });
    } catch (error) {
        console.error('Error updating hora limite:', error);
        throw error;
    }
};

export const getInstructorEquiposAsignados = async (fichaId?: number) => {
    const params = fichaId ? `?ficha_id=${fichaId}` : '';
    return await api.get<{ ficha: { id: number; numero_ficha: number }; equipos: any[] }>(`/instructor/equipos-asignados${params}`);
};
