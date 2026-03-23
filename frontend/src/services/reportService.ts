import { apiClient as api } from '../config/api';
import type { 
    ReportFilters, 
    ReportData, 
    ExportFormat, 
    DailyReportEntry,
    Entidad
} from '../types';

export const reportService = {
    downloadLicensesReport: async () => {
        try {
            const blob = await api.getBlob('/reports/licenses');
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'licencias.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading licenses report:', error);
            throw error;
        }
    },

    getLicensesPreview: async (): Promise<any[]> => {
        try {
            return await api.get<any[]>('/reports/licenses?format=json');
        } catch (error) {
            console.error('Error fetching licenses preview:', error);
            throw error;
        }
    },

    downloadEntitiesReport: async () => {
        try {
            const blob = await api.getBlob('/reports/entities');
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'entidades_general.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading entities report:', error);
            throw error;
        }
    },

    getEntitiesPreview: async (): Promise<Entidad[]> => {
        try {
            return await api.get<Entidad[]>('/reports/entities?format=json');
        } catch (error) {
            console.error('Error fetching entities preview:', error);
            throw error;
        }
    },

    downloadEntityFullReport: async (nit: string) => {
        try {
            const blob = await api.getBlob(`/reports/entities/${nit}`);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `entidad_${nit}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading entity report:', error);
            throw error;
        }
    },

    getEntityPreview: async (nit: string): Promise<Entidad> => {
        try {
            return await api.get<Entidad>(`/reports/entities/${nit}?format=json`);
        } catch (error) {
            console.error('Error fetching entity preview:', error);
            throw error;
        }
    },

    getDailyReport: async (date: string): Promise<DailyReportEntry[]> => {
        try {
            return await api.get<DailyReportEntry[]>(`/reports/daily?date=${date}`);
        } catch (error) {
            console.error('Error fetching daily report:', error);
            throw error;
        }
    }
};

/**
 * Fetch report data based on filters (Legacy support)
 */
export const getReportData = async (): Promise<ReportData> => {
    return { revenue: [], licenseSales: [], institutionGrowth: [] };
};

/**
 * Export report data in specified format (Legacy support)
 */
export const exportReport = async (filters: ReportFilters, format: ExportFormat): Promise<void> => {
    console.log('Exporting report:', { filters, format });
};

/**
 * Get list of institutions for filter dropdown (Legacy support)
 */
export const getInstitutionsForFilter = async (): Promise<Array<{ id: string; name: string }>> => {
    const entities = await reportService.getEntitiesPreview();
    return entities.map(e => ({ id: e.nit, name: e.nombre_entidad }));
};

/**
 * Get list of license types for filter dropdown (Legacy support)
 */
export const getLicenseTypesForFilter = async (): Promise<Array<{ id: string; name: string }>> => {
    return [
        { id: 'basic', name: 'Basic' },
        { id: 'premium', name: 'Premium' },
        { id: 'enterprise', name: 'Enterprise' }
    ];
};
