import { apiClient as api } from '../config/api';

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

export const getAsistenciaBase = async (): Promise<AsistenciaBaseData> => {
    try {
        const data = await api.get<AsistenciaBaseData>('/instructor/asistencia-base');
        return data;
    } catch (error) {
        console.error('Error fetching asistencia base:', error);
        throw error;
    }
};

export const getAsistenciaMensual = async (mes: number, anio: number): Promise<AsistenciaMensualResponse> => {
    try {
        const data = await api.get<AsistenciaMensualResponse>(`/instructor/asistencia-mensual?mes=${mes}&anio=${anio}`);
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
