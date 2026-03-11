import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiClient } from '../../../config/api';

interface RegistroDiario {
    id: number;
    doc: string;
    usuario_nombre: string;
    fecha: string;
    hora_entrada: string;
    hora_salida: string | null;
    placa?: string;
    serial_equipo?: string;
}

const ReporteDiario: React.FC = () => {
    // Default to today
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [records, setRecords] = useState<RegistroDiario[]>([]);

    const handleSearch = async () => {
        if (!selectedDate) {
            setError('Por favor selecciona una fecha.');
            return;
        }

        setLoading(true);
        setError(null);
        setRecords([]);

        try {
            const response = await apiClient.get<RegistroDiario[]>(`/reports/daily?date=${selectedDate}`);
            if (response && Array.isArray(response)) {
                setRecords(response);
            } else {
                setError('No se encontraron registros para esta fecha.');
            }
        } catch (err: any) {
            console.error('Error fetching daily report:', err);
            setError(err.message || 'Ocurrió un error al cargar el reporte diario.');
        } finally {
            setLoading(false);
        }
    };

    // Load today's data automatically on mount
    useEffect(() => {
        handleSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExportPDF = () => {
        if (records.length === 0) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text('Reporte Diario de Entradas y Salidas', 14, 22);

        doc.setFontSize(11);
        doc.text(`Fecha del reporte: ${selectedDate}`, 14, 32);
        doc.text(`Total de movimientos: ${records.length}`, 14, 38);

        // Table Data
        const tableColumn = ["Documento", "Nombre", "Hora Ingreso", "Hora Salida"];

        const tableRows = records.map(record => [
            record.doc,
            record.usuario_nombre,
            record.hora_entrada,
            record.hora_salida || 'Aún adentro',
            record.placa || '-',
            record.serial_equipo || '-'
        ]);

        // If we want to include vehicles/equipments in the daily report PDF, we adjust columns
        const expandedColumns = [...tableColumn, "Placa Vehículo", "Serial Equipo"];

        autoTable(doc, {
            head: [expandedColumns],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [0, 143, 57] }, // Green color
            alternateRowStyles: { fillColor: [249, 250, 251] },
            styles: { fontSize: 9, cellPadding: 3 }
        });

        doc.save(`reporte_diario_${selectedDate}.pdf`);
    };

    return (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
                Movimientos por Día
            </h2>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '2rem', backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Seleccionar Fecha
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white' }}
                    />
                </div>

                <button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{ padding: '0.625rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Cargando...' : 'Buscar'}
                </button>

                {records.length > 0 && (
                    <button
                        onClick={handleExportPDF}
                        style={{ padding: '0.625rem 1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM1.6 11.85H0v3.999h.791v-1.342h.803c.287 0 .531-.057.732-.173.203-.117.358-.275.463-.474a1.42 1.42 0 0 0 .161-.677c0-.25-.053-.476-.158-.677a1.176 1.176 0 0 0-.46-.477c-.2-.12-.443-.179-.732-.179Zm.545 1.333a.795.795 0 0 1-.085.38.574.574 0 0 1-.238.241.794.794 0 0 1-.375.082H.788V12.48h.66c.218 0 .389.06.512.181.123.122.185.296.185.522Zm1.217-1.333v3.999h1.46c.401 0 .734-.08.998-.237a1.45 1.45 0 0 0 .595-.689c.13-.3.196-.662.196-1.084 0-.42-.065-.778-.196-1.075a1.426 1.426 0 0 0-.589-.68c-.264-.156-.599-.234-1.005-.234H3.362Zm.791.645h.563c.249 0 .45.05.603.151.154.1.265.236.334.408.068.173.102.383.102.63 0 .25-.034.463-.102.64-.069.176-.18.312-.334.413-.153.1-.354.152-.603.152h-.563v-2.394Zm2.592-.645v3.999h.791v-1.55h.885v-2.449H6.745Zm.791.645h.557c.21 0 .37.045.482.135.112.09.168.23.168.42 0 .193-.056.335-.168.428-.112.093-.272.139-.482.139h-.557v-1.122Z" />
                        </svg>
                        Exportar a PDF
                    </button>
                )}
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
                    {error}
                </div>
            )}

            {records.length > 0 ? (
                <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '0.75rem 1rem', color: '#4b5563', fontWeight: '600' }}>Documento</th>
                                <th style={{ padding: '0.75rem 1rem', color: '#4b5563', fontWeight: '600' }}>Nombre</th>
                                <th style={{ padding: '0.75rem 1rem', color: '#4b5563', fontWeight: '600' }}>Hora Ingreso</th>
                                <th style={{ padding: '0.75rem 1rem', color: '#4b5563', fontWeight: '600' }}>Hora Salida</th>
                                <th style={{ padding: '0.75rem 1rem', color: '#4b5563', fontWeight: '600' }}>Vehículo (Placa)</th>
                                <th style={{ padding: '0.75rem 1rem', color: '#4b5563', fontWeight: '600' }}>Equipo (Serial)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr key={record.id || index} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{record.doc}</td>
                                    <td style={{ padding: '1rem' }}>{record.usuario_nombre}</td>
                                    <td style={{ padding: '1rem', color: '#059669', fontWeight: '500' }}>{record.hora_entrada}</td>
                                    <td style={{ padding: '1rem', color: record.hora_salida ? '#dc2626' : '#d97706', fontWeight: '500' }}>
                                        {record.hora_salida || 'Adentro'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {record.placa ? (
                                            <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                                                {record.placa}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {record.serial_equipo ? (
                                            <span style={{ backgroundColor: '#fdf6e3', color: '#b45309', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                                                {record.serial_equipo}
                                            </span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '3rem 0', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px dashed #d1d5db' }}>
                        <svg style={{ margin: '0 auto', marginBottom: '1rem', color: '#9ca3af' }} width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p style={{ fontSize: '1.125rem' }}>No hay movimientos registrados para esta fecha.</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Intenta consultar un día diferente.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default ReporteDiario;
