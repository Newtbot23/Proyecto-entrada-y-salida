import React, { useState, useEffect } from 'react';
import styles from './ReportsPage.module.css';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { reportService } from '../../services/reportService';
import { getInstitutions } from '../../services/institutionService';
import type { Institution } from '../../types/institution';

const ReportsPage: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Preview State
    const [previewData, setPreviewData] = useState<any | null>(null);
    const [previewTitle, setPreviewTitle] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [currentReportType, setCurrentReportType] = useState<string>('');

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            const response = await getInstitutions({ statuses: [], search: '' }, 1, 100);
            setInstitutions(response.data);
        } catch (error) {
            console.error('Error fetching institutions:', error);
        }
    };

    const handlePreviewLicenses = async () => {
        try {
            setLoading(true);
            const data = await reportService.getLicensesPreview();
            setPreviewData(data);
            setPreviewTitle('Vista Previa: Reporte de Licencias');
            setCurrentReportType('licenses');
            setShowPreview(true);
        } catch (error) {
            alert('Error al cargar la vista previa');
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewEntities = async () => {
        try {
            setLoading(true);
            const data = await reportService.getEntitiesPreview();
            setPreviewData(data);
            setPreviewTitle('Vista Previa: Reporte General de Entidades');
            setCurrentReportType('entities');
            setShowPreview(true);
        } catch (error) {
            alert('Error al cargar la vista previa');
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewEntityFull = async () => {
        if (!selectedInstitutionId) {
            alert('Por favor seleccione una entidad');
            return;
        }
        try {
            setLoading(true);
            const selectedInst = institutions.find(i => i.nit === selectedInstitutionId);
            if (selectedInst) {
                const data = await reportService.getEntityPreview(selectedInst.nit);
                setPreviewData(data);
                setPreviewTitle(`Vista Previa: Reporte de ${selectedInst.nombre_entidad}`);
                setCurrentReportType('entity_full');
                setShowPreview(true);
            }
        } catch (error) {
            alert('Error al cargar la vista previa');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDownload = async () => {
        try {
            setLoading(true);
            if (currentReportType === 'licenses') {
                await reportService.downloadLicensesReport();
            } else if (currentReportType === 'entities') {
                await reportService.downloadEntitiesReport();
            } else if (currentReportType === 'entity_full') {
                const institution = institutions.find(i => i.nit === selectedInstitutionId);
                if (institution) await reportService.downloadEntityFullReport(institution.nit);
            }
        } catch (error) {
            alert('Error al descargar el PDF');
        } finally {
            setLoading(false);
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setPreviewData(null);
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
                <Header />

                <div className={styles.contentWrapper}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>Panel de Reportes</h2>
                            <p className={styles.pageSubtitle}>Generar y descargar reportes del sistema</p>
                        </div>
                    </div>

                    <div className={styles.reportsGrid}>
                        {/* Reporte 1: Licencias */}
                        <div className={styles.reportCard}>
                            <h3>Reporte de Licencias</h3>
                            <p>Lista completa de todas las licencias del sistema.</p>
                            <button
                                className={styles.reportBtn}
                                onClick={handlePreviewLicenses}
                                disabled={loading}
                            >
                                {loading && currentReportType === 'licenses' && !showPreview ? 'Cargando...' : 'Vista Previa y Descargar'}
                            </button>
                        </div>

                        {/* Reporte 2: Entidades (General) */}
                        <div className={styles.reportCard}>
                            <h3>Reporte General de Entidades</h3>
                            <p>Listado general de entidades registradas.</p>
                            <button
                                className={styles.reportBtn}
                                onClick={handlePreviewEntities}
                                disabled={loading}
                            >
                                {loading && currentReportType === 'entities' && !showPreview ? 'Cargando...' : 'Vista Previa y Descargar'}
                            </button>
                        </div>

                        {/* Reporte 3: Entidad Completa */}
                        <div className={styles.reportCard}>
                            <h3>Reporte Detallado por Entidad</h3>
                            <p>Seleccione una entidad para ver su información completa.</p>

                            <select
                                className={styles.selectInput}
                                value={selectedInstitutionId}
                                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                            >
                                <option value="">Seleccione una entidad...</option>
                                {institutions.map((inst, idx) => (
                                    <option key={inst.nit || idx} value={inst.nit}>
                                        {inst.nombre_entidad} (NIT: {inst.nit})
                                    </option>
                                ))}
                            </select>

                            <button
                                className={styles.reportBtn}
                                onClick={handlePreviewEntityFull}
                                disabled={loading || !selectedInstitutionId}
                            >
                                {loading && currentReportType === 'entity_full' && !showPreview ? 'Cargando...' : 'Vista Previa y Descargar'}
                            </button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    {showPreview && previewData && (
                        <div className={styles.previewSection}>
                            <div className={styles.previewHeader}>
                                <h3>{previewTitle}</h3>
                                <button
                                    onClick={handleClosePreview}
                                    className={styles.closeBtn}
                                >
                                    Cerrar
                                </button>
                            </div>

                            <div className={styles.tableWrapper}>
                                <table className={styles.previewTable}>
                                    <thead>
                                        <tr>
                                            {(() => {
                                                const data = Array.isArray(previewData) ? previewData : (previewData.data || [previewData]);
                                                const firstItem = data[0];
                                                if (!firstItem) return <th>No data</th>;
                                                return Object.keys(firstItem).map(key => (
                                                    typeof firstItem[key] !== 'object' && (
                                                        <th key={key}>
                                                            {key.replace(/_/g, ' ')}
                                                        </th>
                                                    )
                                                ));
                                            })()}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const data = Array.isArray(previewData) ? previewData : (previewData.data || [previewData]);
                                            if (data.length === 0) return <tr><td colSpan={5} className={styles.emptyTd}>No hay datos disponibles</td></tr>;

                                            const firstItem = data[0];
                                            const headers = firstItem ? Object.keys(firstItem).filter(k => typeof firstItem[k] !== 'object') : [];

                                            return data.map((row: any, idx: number) => (
                                                <tr key={idx}>
                                                    {headers.map(header => (
                                                        <td key={`${idx}-${header}`}>
                                                            {row[header]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.downloadActions}>
                                <button
                                    onClick={handleConfirmDownload}
                                    disabled={loading}
                                    className={styles.downloadBtn}
                                >
                                    {loading ? 'Descargando...' : 'Descargar PDF'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ReportsPage;
