import React, { useState, useEffect } from 'react';
import styles from './ReportsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { ReportFilters } from '../../components/reports/ReportFilters';
import { ChartCard } from '../../components/reports/ChartCard';
import type { ReportFilters as ReportFiltersType, ReportData } from '../../types/report';
import { getReportData, exportReport } from '../../services/reportService';

const ReportsPage: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    // Default date range: last 6 months
    const getDefaultDateRange = () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 6);

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    };

    const [filters, setFilters] = useState<ReportFiltersType>({
        dateRange: getDefaultDateRange(),
        institutionId: undefined,
        licenseType: undefined
    });

    useEffect(() => {
        fetchReportData();
    }, [filters]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const data = await getReportData(filters);
            setReportData(data);
        } catch (error) {
            console.error('Failed to fetch report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleLogout = () => {
        console.log('Logging out...');
    };

    const handleExport = async () => {
        try {
            await exportReport(filters, 'pdf');
        } catch (error) {
            console.error('Failed to export report:', error);
        }
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
            />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header title="Reports" userName="Super Admin" onLogout={handleLogout} />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>Analytics & Reports</h2>
                            <p className={styles.pageSubtitle}>View comprehensive reports and analytics</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <ReportFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        onExport={handleExport}
                    />

                    {/* Charts Section */}
                    <div className={styles.chartsContainer}>
                        {/* Revenue Over Time - Full Width */}
                        <div className={styles.chartFullWidth}>
                            <ChartCard
                                title="Revenue Over Time"
                                loading={loading}
                                isEmpty={!reportData?.revenue || reportData.revenue.length === 0}
                            >
                                {reportData?.revenue && (
                                    <div className={styles.chartPlaceholder}>
                                        <p>Chart data available: {reportData.revenue.length} data points</p>
                                        <p className={styles.dataPreview}>
                                            {reportData.revenue.map(d => `${d.date}: $${d.revenue}`).join(', ')}
                                        </p>
                                    </div>
                                )}
                            </ChartCard>
                        </div>

                        {/* Licenses Sold & Institutions Growth - Half Width Each */}
                        <div className={styles.chartRow}>
                            <div className={styles.chartHalfWidth}>
                                <ChartCard
                                    title="Licenses Sold Per Month"
                                    loading={loading}
                                    isEmpty={!reportData?.licenseSales || reportData.licenseSales.length === 0}
                                >
                                    {reportData?.licenseSales && (
                                        <div className={styles.chartPlaceholder}>
                                            <p>Chart data available: {reportData.licenseSales.length} data points</p>
                                            <p className={styles.dataPreview}>
                                                {reportData.licenseSales.map(d => `${d.month}: ${d.count}`).join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </ChartCard>
                            </div>

                            <div className={styles.chartHalfWidth}>
                                <ChartCard
                                    title="Institutions Growth"
                                    loading={loading}
                                    isEmpty={!reportData?.institutionGrowth || reportData.institutionGrowth.length === 0}
                                >
                                    {reportData?.institutionGrowth && (
                                        <div className={styles.chartPlaceholder}>
                                            <p>Chart data available: {reportData.institutionGrowth.length} data points</p>
                                            <p className={styles.dataPreview}>
                                                {reportData.institutionGrowth.map(d => `${d.month}: ${d.count}`).join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </ChartCard>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReportsPage;
