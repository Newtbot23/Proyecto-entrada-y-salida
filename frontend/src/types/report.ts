export interface ReportFilters {
    dateRange: {
        start: string;  // ISO date format
        end: string;    // ISO date format
    };
    institutionId?: string;
    licenseType?: string;
}

export interface RevenueDataPoint {
    date: string;       // ISO date or formatted date
    revenue: number;    // Revenue amount
}

export interface LicenseSalesDataPoint {
    month: string;      // e.g., "2024-01" or "Jan 2024"
    count: number;      // Number of licenses sold
}

export interface InstitutionGrowthDataPoint {
    month: string;      // e.g., "2024-01" or "Jan 2024"
    count: number;      // Total institutions count
}

export interface ReportData {
    revenue: RevenueDataPoint[];
    licenseSales: LicenseSalesDataPoint[];
    institutionGrowth: InstitutionGrowthDataPoint[];
}

export type ExportFormat = 'csv' | 'excel' | 'pdf';
