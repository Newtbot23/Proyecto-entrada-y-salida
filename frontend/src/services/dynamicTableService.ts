import { apiClient } from '../config/api';

export interface TableColumn {
    name: string;
    type: string;
    required: boolean;
    default: any;
    key: string;
}

export const DynamicTableService = {
    getShortTables: async (): Promise<string[]> => {
        return await apiClient.get<string[]>('/tablas-cortas');
    },

    getTableSchema: async (table: string): Promise<TableColumn[]> => {
        return await apiClient.get<TableColumn[]>(`/esquema/${table}`);
    },

    getTableData: async (table: string): Promise<any[]> => {
        return await apiClient.get<any[]>(`/datos/${table}`);
    },

    createRecord: async (table: string, data: any): Promise<any> => {
        return await apiClient.post<any>(`/datos/${table}`, data);
    },

    updateRecord: async (table: string, id: any, data: any): Promise<any> => {
        return await apiClient.put<any>(`/datos/${table}/${id}`, data);
    }
};
