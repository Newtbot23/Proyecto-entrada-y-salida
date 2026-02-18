import type { ReportFilters, ReportData, ExportFormat } from '../types/report';
import { apiClient as api } from '../config/api';

// Mock data for development - replace with actual API calls
const mockReportData: ReportData = {
    revenue: [
        { date: '2024-01', revenue: 5000 },
        { date: '2024-02', revenue: 7500 },
        { date: '2024-03', revenue: 6200 },
        { date: '2024-04', revenue: 8900 },
        { date: '2024-05', revenue: 9500 },
        { date: '2024-06', revenue: 11200 }
    ],
    licenseSales: [
        { month: '2024-01', count: 15 },
        { month: '2024-02', count: 22 },
        { month: '2024-03', count: 18 },
        { month: '2024-04', count: 28 },
        { month: '2024-05', count: 31 },
        { month: '2024-06', count: 35 }
    ],
    institutionGrowth: [
        { month: '2024-01', count: 45 },
        { month: '2024-02', count: 52 },
        { month: '2024-03', count: 58 },
        { month: '2024-04', count: 65 },
        { month: '2024-05', count: 71 },
        { month: '2024-06', count: 78 }
    ]
};

/**
 * Fetch report data based on filters
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: GET /api/superadmin/reports?start_date=...&end_date=...&institution_id=...&license_type=...
 */
export const getReportData = async (): Promise<ReportData> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // TODO: Replace with actual fetch call
    // const response = await fetch(`/api/superadmin/reports?start_date=${filters.dateRange.start}&end_date=${filters.dateRange.end}&institution_id=${filters.institutionId || ''}&license_type=${filters.licenseType || ''}`);
    // return response.json();

    // For now, return mock data
    // In production, filter the data based on the filters parameter
    return mockReportData;
};

/**
 * Export report data in specified format
 * TODO: Replace with actual API call to Laravel backend
 * Endpoint: POST /api/superadmin/reports/export
 * Body: { filters, format }
 * Response: File download (CSV/Excel/PDF)
 */
export const exportReport = async (filters: ReportFilters, format: ExportFormat): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: Replace with actual fetch call
    // const response = await fetch('/api/superadmin/reports/export', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ filters, format })
    // });
    // const blob = await response.blob();
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `report_${Date.now()}.${format}`;
    // a.click();

    console.log('Exporting report:', { filters, format });
    alert(`Report export initiated (${format.toUpperCase()} format). This will trigger a backend download in production.`);
};

/**
 * Get list of institutions for filter dropdown
 * TODO: Replace with actual API call or reuse existing institutionService
 */
export const getInstitutionsForFilter = async (): Promise<Array<{ id: string; name: string }>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
        { id: '1', name: 'Universidad Nacional' },
        { id: '2', name: 'Colegio San José' },
        { id: '3', name: 'Instituto Técnico Industrial' }
    ];
};

/**
 * Get list of license types for filter dropdown
 * TODO: Replace with actual API call or reuse existing license service
 */
export const getLicenseTypesForFilter = async (): Promise<Array<{ id: string; name: string }>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
        { id: 'basic', name: 'Basic' },
        { id: 'premium', name: 'Premium' },
        { id: 'enterprise', name: 'Enterprise' }
    ];
};

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

    getLicensesPreview: async () => {
        try {
            return await api.get<any>('/reports/licenses?format=json');
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

    getEntitiesPreview: async () => {
        try {
            return await api.get<any>('/reports/entities?format=json');
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

    getEntityPreview: async (nit: string) => {
        try {
            return await api.get<any>(`/reports/entities/${nit}?format=json`);
        } catch (error) {
            console.error('Error fetching entity preview:', error);
            throw error;
        }
    },
};
