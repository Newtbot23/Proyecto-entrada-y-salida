import { apiClient } from '../config/api';

export interface TableColumn {
    name: string;
    type: string;
    required: boolean;
    default: any;
    key: string;
    auto_increment?: boolean;
    foreign?: {
        table: string;
        options: { value: string | number; label: string }[];
    };
}

export const DynamicTableService = {
    getShortTables: async (): Promise<string[]> => {
        const res = await apiClient.get<string[] | { data: string[] }>('/tablas-cortas');
        if (Array.isArray(res)) return res;
        return res?.data || [];
    },

    getTableSchema: async (table: string): Promise<TableColumn[]> => {
        const res = await apiClient.get<TableColumn[] | { data: TableColumn[] }>(`/esquema/${table}`);
        if (Array.isArray(res)) return res;
        return res?.data || [];
    },

    getTableData: async <T = any>(table: string): Promise<T[]> => {
        const res = await apiClient.get<T[] | { data: T[] }>(`/datos/${table}`);
        // Handle both raw array and { data: ... } wrapper
        if (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)) {
            return res.data as T[];
        }
        return Array.isArray(res) ? res : [];
    },

    createRecord: async <T = any>(table: string, data: Partial<T>): Promise<T> => {
        return await apiClient.post<T, Partial<T>>(`/datos/${table}`, data);
    },

    updateRecord: async <T = any>(table: string, id: string | number, data: Partial<T>): Promise<T> => {
        return await apiClient.put<T, Partial<T>>(`/datos/${table}/${id}`, data);
    }
};
