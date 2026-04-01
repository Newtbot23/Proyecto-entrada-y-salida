import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '../../../services/reportService';
import type { DailyReportEntry } from '../../../types';
import { Modal } from '../../../components/common/Modal';

const ReporteDiario = () => {
    // Default to today
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedRecord, setSelectedRecord] = useState<DailyReportEntry | null>(null);

    const { data: records = [], isLoading: loading, error } = useQuery<DailyReportEntry[]>({
        queryKey: ['dailyReport', selectedDate],
        queryFn: () => reportService.getDailyReport(selectedDate),
        enabled: !!selectedDate,
    });

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

        const tableRows = records.map((record: DailyReportEntry) => [
            record.doc,
            record.usuario_nombre,
            record.hora_entrada,
            record.hora_salida || 'Aún adentro',
            record.placa || '-',
            record.seriales_equipos || '-'
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
                    disabled={loading}
                    style={{ padding: '0.625rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'default' }}
                >
                    {loading ? 'Cargando...' : 'Mostrando Resultados'}
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
                    {error instanceof Error ? error.message : 'Error al cargar el reporte.'}
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
                                <th style={{ padding: '0.75rem 1rem', color: '#4b5563', fontWeight: '600', textAlign: 'center' }}>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr 
                                    key={record.id || index} 
                                    style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}
                                >
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
                                        {record.seriales_equipos ? (
                                            <span style={{ backgroundColor: '#fdf6e3', color: '#b45309', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                                                {record.seriales_equipos}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button
                                            onClick={() => setSelectedRecord(record)}
                                            title="Ver detalle del ingreso"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '0.5rem',
                                                border: '1px solid #d1d5db',
                                                backgroundColor: '#ffffff',
                                                color: '#3b82f6',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}
                                            onMouseEnter={e => { 
                                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3b82f6'; 
                                                (e.currentTarget as HTMLButtonElement).style.color = 'white';
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#3b82f6';
                                            }}
                                            onMouseLeave={e => { 
                                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff'; 
                                                (e.currentTarget as HTMLButtonElement).style.color = '#3b82f6';
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>
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

            {selectedRecord && (
                <Modal
                    isOpen={!!selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                    title={`Detalles de Ingreso - ${selectedRecord.usuario_nombre}`}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {/* Usuario */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                            {selectedRecord.usuario_imagen ? (
                                <img 
                                    src={`http://localhost:8000/storage/${selectedRecord.usuario_imagen}`} 
                                    alt="Foto usuario" 
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }} 
                                />
                            ) : (
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '2px solid #d1d5db' }}>
                                    <svg width="40" height="40" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>{selectedRecord.usuario_nombre}</h4>
                                <p style={{ margin: 0, color: '#4b5563', fontSize: '0.875rem' }}>Documento: {selectedRecord.doc}</p>
                                <p style={{ margin: 0, color: '#4b5563', fontSize: '0.875rem' }}>
                                    Entrada: <span style={{ color: '#059669', fontWeight: '500' }}>{selectedRecord.hora_entrada}</span> | Salida: <span style={{ color: selectedRecord.hora_salida ? '#dc2626' : '#d97706', fontWeight: '500' }}>{selectedRecord.hora_salida || 'Aún adentro'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Fichas */}
                        {selectedRecord.fichas_detalle && selectedRecord.fichas_detalle.length > 0 && (
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>Información de Ficha</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {selectedRecord.fichas_detalle.map((ficha, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '0.25rem', backgroundColor: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontSize: '1.25rem' }}>
                                                🏢
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#14532d' }}>
                                                <p style={{ margin: 0 }}><strong>Ficha:</strong> {ficha.numero_ficha}</p>
                                                <p style={{ margin: 0 }}><strong>Ambiente:</strong> {ficha.ambiente || 'No asignado'}</p>
                                                <p style={{ margin: 0 }}><strong>Instructor:</strong> {ficha.instructor || 'No asignado'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vehiculo */}
                        {selectedRecord.vehiculo_detalle && (
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>Vehículo Ingresado</h4>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
                                    {selectedRecord.vehiculo_detalle.imagen ? (
                                        <img 
                                            src={`http://localhost:8000/storage/${selectedRecord.vehiculo_detalle.imagen}`} 
                                            alt="Foto vehiculo" 
                                            style={{ width: '80px', height: '80px', borderRadius: '0.25rem', objectFit: 'cover' }} 
                                        />
                                    ) : (
                                        <div style={{ width: '80px', height: '80px', borderRadius: '0.25rem', backgroundColor: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                            🚗
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>
                                        <p style={{ margin: 0 }}><strong>Placa:</strong> {selectedRecord.vehiculo_detalle.placa}</p>
                                        <p style={{ margin: 0 }}><strong>Marca:</strong> {selectedRecord.vehiculo_detalle.marca} - <strong>Modelo:</strong> {selectedRecord.vehiculo_detalle.modelo}</p>
                                        <p style={{ margin: 0 }}><strong>Color:</strong> {selectedRecord.vehiculo_detalle.color} {selectedRecord.vehiculo_detalle.tipo && ` - Tipo: ${selectedRecord.vehiculo_detalle.tipo}`}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Equipos */}
                        {selectedRecord.equipos_detalle && selectedRecord.equipos_detalle.length > 0 && (
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>Equipos Ingresados ({selectedRecord.equipos_detalle.length})</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {selectedRecord.equipos_detalle.map((equipo, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #fde68a' }}>
                                            {equipo.imagen ? (
                                                <img 
                                                    src={`http://localhost:8000/storage/${equipo.imagen}`} 
                                                    alt="Foto equipo" 
                                                    style={{ width: '60px', height: '60px', borderRadius: '0.25rem', objectFit: 'cover' }} 
                                                />
                                            ) : (
                                                <div style={{ width: '60px', height: '60px', borderRadius: '0.25rem', backgroundColor: '#fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
                                                    💻
                                                </div>
                                            )}
                                            <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                                                <p style={{ margin: 0 }}><strong>Serial:</strong> {equipo.serial}</p>
                                                <p style={{ margin: 0 }}><strong>Marca:</strong> {equipo.marca || '-'} - <strong>Modelo:</strong> {equipo.modelo || '-'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {!selectedRecord.vehiculo_detalle && (!selectedRecord.equipos_detalle || selectedRecord.equipos_detalle.length === 0) && (
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem', fontStyle: 'italic', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px dashed #d1d5db', textAlign: 'center' }}>
                                No se registraron vehículos ni equipos en este ingreso.
                            </p>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ReporteDiario;
