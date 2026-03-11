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
        const res: any = await apiClient.get<string[]>('/tablas-cortas');
        return Array.isArray(res) ? res : (res?.data || []);
    },

    getTableSchema: async (table: string): Promise<TableColumn[]> => {
        const res: any = await apiClient.get<TableColumn[]>(`/esquema/${table}`);
        return Array.isArray(res) ? res : (res?.data || []);
    },

    getTableData: async (table: string): Promise<any[]> => {
        const res: any = await apiClient.get<any[]>(`/datos/${table}`);
        // Handle pagination object if returned { data: [...], total: ... }
        if (res && res.data && Array.isArray(res.data)) {
            return res.data;
        }
        return Array.isArray(res) ? res : (res?.data || []);
    },

    createRecord: async (table: string, data: any): Promise<any> => {
        return await apiClient.post<any>(`/datos/${table}`, data);
    },

    updateRecord: async (table: string, id: any, data: any): Promise<any> => {
        return await apiClient.put<any>(`/datos/${table}/${id}`, data);
    }
};
